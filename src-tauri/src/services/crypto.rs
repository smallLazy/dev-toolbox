use crate::models::{AesCryptRequest, AesCryptResponse};
use aes::cipher::{block_padding::Pkcs7, BlockDecryptMut, BlockEncryptMut, KeyIvInit};
use aes::Aes256;
use base64::Engine as _;

type Aes256CbcEnc = cbc::Encryptor<Aes256>;
type Aes256CbcDec = cbc::Decryptor<Aes256>;

/// Decode a string according to the specified encoding.
fn decode_bytes(encoded: &str, encoding: &str) -> Result<Vec<u8>, String> {
    match encoding {
        "utf8" => Ok(encoded.as_bytes().to_vec()),
        "hex" => hex::decode(encoded).map_err(|e| format!("Hex 解码失败: {}", e)),
        "base64" => base64::Engine::decode(
            &base64::engine::general_purpose::STANDARD,
            encoded,
        )
        .map_err(|e| format!("Base64 解码失败: {}", e)),
        _ => Err(format!("不支持的编码格式: {}", encoding)),
    }
}

/// Encode bytes according to the specified encoding.
fn encode_bytes(data: &[u8], encoding: &str) -> Result<String, String> {
    match encoding {
        "hex" => Ok(hex::encode(data)),
        "base64" => Ok(base64::engine::general_purpose::STANDARD.encode(data)),
        _ => Err(format!("不支持的输出编码: {}", encoding)),
    }
}

/// Validate key length: AES-256 requires exactly 32 bytes.
fn validate_key(bytes: &[u8]) -> Result<(), String> {
    if bytes.len() != 32 {
        Err(format!(
            "密钥长度不正确: 需要 32 字节，当前 {} 字节。请检查 keyEncoding 设置。",
            bytes.len()
        ))
    } else {
        Ok(())
    }
}

/// Validate IV length: CBC requires exactly 16 bytes.
fn validate_iv(bytes: &[u8]) -> Result<(), String> {
    if bytes.len() != 16 {
        Err(format!(
            "IV 长度不正确: 需要 16 字节，当前 {} 字节。请检查 ivEncoding 设置。",
            bytes.len()
        ))
    } else {
        Ok(())
    }
}

// ---------------------------------------------------------------------------
// AES-256-CBC
// ---------------------------------------------------------------------------

fn aes256_cbc_encrypt(
    key_bytes: &[u8],
    iv_bytes: &[u8],
    input_bytes: &[u8],
) -> Result<Vec<u8>, String> {
    validate_key(key_bytes)?;
    validate_iv(iv_bytes)?;

    let mut buf = vec![0u8; input_bytes.len() + 16];
    buf[..input_bytes.len()].copy_from_slice(input_bytes);

    let ct = Aes256CbcEnc::new(key_bytes.into(), iv_bytes.into())
        .encrypt_padded_mut::<Pkcs7>(&mut buf, input_bytes.len())
        .map_err(|e| format!("CBC 加密失败: {}", e))?;

    Ok(ct.to_vec())
}

fn aes256_cbc_decrypt(
    key_bytes: &[u8],
    iv_bytes: &[u8],
    input_bytes: &[u8],
) -> Result<Vec<u8>, String> {
    validate_key(key_bytes)?;
    validate_iv(iv_bytes)?;

    if input_bytes.is_empty() {
        return Err("密文为空".to_string());
    }
    if !input_bytes.len().is_multiple_of(16) {
        return Err("CBC 密文长度必须是 16 的倍数".to_string());
    }

    let mut buf = input_bytes.to_vec();

    let pt = Aes256CbcDec::new(key_bytes.into(), iv_bytes.into())
        .decrypt_padded_mut::<Pkcs7>(&mut buf)
        .map_err(|e| format!("CBC 解密失败: {}", e))?;

    Ok(pt.to_vec())
}

// ---------------------------------------------------------------------------
// AES-256-ECB  (manual block-by-block, no external ecb crate)
// ---------------------------------------------------------------------------

fn aes256_ecb_encrypt(key_bytes: &[u8], input_bytes: &[u8]) -> Result<Vec<u8>, String> {
    use aes::cipher::{BlockEncrypt, KeyInit};

    validate_key(key_bytes)?;

    let cipher = Aes256::new(key_bytes.into());

    // PKCS7 padding
    const BLOCK: usize = 16;
    let pad_len = BLOCK - (input_bytes.len() % BLOCK);
    let mut padded = input_bytes.to_vec();
    padded.resize(input_bytes.len() + pad_len, pad_len as u8);

    let mut result = vec![0u8; padded.len()];
    for (chunk, out_chunk) in padded.chunks(BLOCK).zip(result.chunks_mut(BLOCK)) {
        let mut block = aes::Block::default();
        block.as_mut_slice().copy_from_slice(chunk);
        cipher.encrypt_block(&mut block);
        out_chunk.copy_from_slice(block.as_slice());
    }

    Ok(result)
}

fn aes256_ecb_decrypt(key_bytes: &[u8], input_bytes: &[u8]) -> Result<Vec<u8>, String> {
    use aes::cipher::{BlockDecrypt, KeyInit};

    validate_key(key_bytes)?;

    if input_bytes.is_empty() {
        return Err("密文为空".to_string());
    }
    if !input_bytes.len().is_multiple_of(16) {
        return Err("ECB 密文长度必须是 16 的倍数".to_string());
    }

    let cipher = Aes256::new(key_bytes.into());
    const BLOCK: usize = 16;

    let mut result = vec![0u8; input_bytes.len()];
    for (chunk, out_chunk) in input_bytes.chunks(BLOCK).zip(result.chunks_mut(BLOCK)) {
        let mut block = aes::Block::default();
        block.as_mut_slice().copy_from_slice(chunk);
        cipher.decrypt_block(&mut block);
        out_chunk.copy_from_slice(block.as_slice());
    }

    // Remove PKCS7 padding with strict validation
    let pad_len = match result.last() {
        Some(&p) if p >= 1 && p <= BLOCK as u8 => p as usize,
        _ => {
            return Err("ECB 解密失败: 无效的 PKCS7 padding".to_string());
        }
    };

    if pad_len > result.len() {
        return Err("ECB 解密失败: padding 长度超过密文长度".to_string());
    }

    let expected = &result[result.len() - pad_len..];
    if !expected.iter().all(|&b| b == pad_len as u8) {
        return Err("ECB 解密失败: PKCS7 padding 校验不匹配".to_string());
    }

    result.truncate(result.len() - pad_len);

    Ok(result)
}

// ---------------------------------------------------------------------------
// Public handler
// ---------------------------------------------------------------------------

pub fn handle_aes_crypt(req: AesCryptRequest) -> AesCryptResponse {
    // Decode key
    let key_bytes = match decode_bytes(&req.key, &req.key_encoding) {
        Ok(b) => b,
        Err(e) => return AesCryptResponse { success: false, data: None, error: Some(e) },
    };

    // Decode input
    let input_bytes = match decode_bytes(&req.input, &req.input_encoding) {
        Ok(b) => b,
        Err(e) => return AesCryptResponse { success: false, data: None, error: Some(e) },
    };

    let result = match req.mode.as_str() {
        "encrypt" => match req.algorithm.as_str() {
            "aes-256-cbc" => {
                let iv_bytes = match decode_bytes(&req.iv, &req.iv_encoding) {
                    Ok(b) => b,
                    Err(e) => return AesCryptResponse { success: false, data: None, error: Some(e) },
                };
                aes256_cbc_encrypt(&key_bytes, &iv_bytes, &input_bytes)
            }
            "aes-256-ecb" => aes256_ecb_encrypt(&key_bytes, &input_bytes),
            _ => Err(format!("不支持的算法: {}", req.algorithm)),
        },
        "decrypt" => match req.algorithm.as_str() {
            "aes-256-cbc" => {
                let iv_bytes = match decode_bytes(&req.iv, &req.iv_encoding) {
                    Ok(b) => b,
                    Err(e) => return AesCryptResponse { success: false, data: None, error: Some(e) },
                };
                aes256_cbc_decrypt(&key_bytes, &iv_bytes, &input_bytes)
            }
            "aes-256-ecb" => aes256_ecb_decrypt(&key_bytes, &input_bytes),
            _ => Err(format!("不支持的算法: {}", req.algorithm)),
        },
        _ => Err(format!("不支持的模式: {}", req.mode)),
    };

    match result {
        Ok(data) => match encode_bytes(&data, &req.output_encoding) {
            Ok(encoded) => AesCryptResponse { success: true, data: Some(encoded), error: None },
            Err(e) => AesCryptResponse { success: false, data: None, error: Some(e) },
        },
        Err(e) => AesCryptResponse { success: false, data: None, error: Some(e) },
    }
}

// ---------------------------------------------------------------------------
// Unit tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    /// Helper: 32-byte key from a short utf8 string repeated.
    fn key32() -> Vec<u8> {
        b"abcdefghijklmnopqrstuvwxyz123456".to_vec() // exactly 32 bytes
    }

    /// Helper: 16-byte IV.
    fn iv16() -> Vec<u8> {
        b"1234567890abcdef".to_vec() // exactly 16 bytes
    }

    const PLAINTEXT: &[u8] = b"Hello, Tauri v2 AES test! Roundtrip verification 12345";

    // ---- CBC roundtrip ----
    #[test]
    fn cbc_encrypt_decrypt_roundtrip() {
        let key = key32();
        let iv = iv16();

        let ct = aes256_cbc_encrypt(&key, &iv, PLAINTEXT).expect("CBC encrypt");
        let pt = aes256_cbc_decrypt(&key, &iv, &ct).expect("CBC decrypt");

        assert_eq!(pt, PLAINTEXT, "CBC roundtrip mismatch");
    }

    // ---- ECB roundtrip ----
    #[test]
    fn ecb_encrypt_decrypt_roundtrip() {
        let key = key32();

        let ct = aes256_ecb_encrypt(&key, PLAINTEXT).expect("ECB encrypt");
        let pt = aes256_ecb_decrypt(&key, &ct).expect("ECB decrypt");

        assert_eq!(pt, PLAINTEXT, "ECB roundtrip mismatch");
    }

    // ---- Wrong key length ----
    #[test]
    fn wrong_key_length_is_rejected() {
        let short_key = b"tooshort";       // 8 bytes
        let long_key = [0u8; 64];          // 64 bytes
        let iv = iv16();

        assert!(aes256_cbc_encrypt(short_key, &iv, PLAINTEXT).is_err());
        assert!(aes256_cbc_encrypt(&long_key, &iv, PLAINTEXT).is_err());
        assert!(aes256_ecb_encrypt(short_key, PLAINTEXT).is_err());
        assert!(aes256_ecb_encrypt(&long_key, PLAINTEXT).is_err());
    }

    // ---- Wrong IV length ----
    #[test]
    fn wrong_iv_length_is_rejected() {
        let key = key32();
        let short_iv = b"short";           // 5 bytes
        let long_iv = [0u8; 32];           // 32 bytes

        assert!(aes256_cbc_encrypt(&key, short_iv, PLAINTEXT).is_err());
        assert!(aes256_cbc_encrypt(&key, &long_iv, PLAINTEXT).is_err());
    }

    // ---- Empty plaintext ----
    #[test]
    fn empty_plaintext_roundtrip() {
        let key = key32();
        let iv = iv16();
        let empty: &[u8] = b"";

        let ct = aes256_cbc_encrypt(&key, &iv, empty).expect("CBC encrypt empty");
        let pt = aes256_cbc_decrypt(&key, &iv, &ct).expect("CBC decrypt empty");
        assert_eq!(pt, empty);

        let ct = aes256_ecb_encrypt(&key, empty).expect("ECB encrypt empty");
        let pt = aes256_ecb_decrypt(&key, &ct).expect("ECB decrypt empty");
        assert_eq!(pt, empty);
    }

    // ---- Empty ciphertext is rejected ----
    #[test]
    fn empty_ciphertext_is_rejected() {
        let key = key32();
        let iv = iv16();
        let empty: &[u8] = b"";

        assert!(aes256_cbc_decrypt(&key, &iv, empty).is_err());
        assert!(aes256_ecb_decrypt(&key, empty).is_err());
    }

    // ---- Tampered ciphertext (last block) should fail to decrypt ----
    #[test]
    fn tampered_last_block_is_rejected() {
        let key = key32();
        let iv = iv16();

        let mut ct = aes256_cbc_encrypt(&key, &iv, PLAINTEXT).expect("CBC encrypt");
        // Corrupt the last byte → PKCS7 padding will be invalid with high probability
        let last = ct.len() - 1;
        ct[last] ^= 0xff;

        assert!(
            aes256_cbc_decrypt(&key, &iv, &ct).is_err(),
            "Decrypting ciphertext with corrupted last block should fail padding check"
        );
    }

    // ---- ECB tampered last byte should fail padding check ----
    #[test]
    fn ecb_tampered_last_byte_is_rejected() {
        let key = key32();

        let mut ct = aes256_ecb_encrypt(&key, PLAINTEXT).expect("ECB encrypt");
        // Corrupt the last byte → PKCS7 padding will be invalid with high probability
        let last = ct.len() - 1;
        ct[last] ^= 0xff;

        assert!(
            aes256_ecb_decrypt(&key, &ct).is_err(),
            "ECB decrypt with corrupted last byte should fail padding check"
        );
    }

    // ---- ECB valid ciphertext decrypts correctly with strict padding check ----
    #[test]
    fn ecb_valid_ciphertext_passes_strict_padding_check() {
        let key = key32();
        let ct = aes256_ecb_encrypt(&key, PLAINTEXT).expect("ECB encrypt");
        let pt = aes256_ecb_decrypt(&key, &ct).expect("ECB decrypt with strict padding");
        assert_eq!(pt, PLAINTEXT, "Strict padding validation must not reject valid ciphertext");
    }

    // ---- ECB non-multiple-of-16 ciphertext rejected ----
    #[test]
    fn ecb_non_multiple_of_16_ciphertext_rejected() {
        let key = key32();
        let bad_ct: Vec<u8> = vec![0u8; 17]; // 17 bytes, not multiple of 16
        assert!(aes256_ecb_decrypt(&key, &bad_ct).is_err());

        let bad_ct2: Vec<u8> = vec![0u8; 15]; // 15 bytes
        assert!(aes256_ecb_decrypt(&key, &bad_ct2).is_err());
    }

    // ---- CBC non-multiple-of-16 ciphertext rejected ----
    #[test]
    fn cbc_non_multiple_of_16_ciphertext_rejected() {
        let key = key32();
        let iv = iv16();
        let bad_ct: Vec<u8> = vec![0u8; 17];
        assert!(aes256_cbc_decrypt(&key, &iv, &bad_ct).is_err());
        let bad_ct2: Vec<u8> = vec![0u8; 15];
        assert!(aes256_cbc_decrypt(&key, &iv, &bad_ct2).is_err());
    }

    // ---- Handle full handler path ----

    #[test]
    fn handler_cbc_roundtrip_utf8_to_base64() {
        let key_utf8 = String::from_utf8(key32()).unwrap();
        let iv_utf8 = String::from_utf8(iv16()).unwrap();
        let plain_utf8 = String::from_utf8(PLAINTEXT.to_vec()).unwrap();

        let req_enc = AesCryptRequest {
            mode: "encrypt".into(),
            algorithm: "aes-256-cbc".into(),
            key: key_utf8.clone(),
            iv: iv_utf8.clone(),
            input: plain_utf8.clone(),
            key_encoding: "utf8".into(),
            iv_encoding: "utf8".into(),
            input_encoding: "utf8".into(),
            output_encoding: "base64".into(),
        };

        let resp = handle_aes_crypt(req_enc);
        assert!(resp.success, "encrypt failed: {:?}", resp.error);
        let ct_b64 = resp.data.unwrap();

        let req_dec = AesCryptRequest {
            mode: "decrypt".into(),
            algorithm: "aes-256-cbc".into(),
            key: key_utf8,
            iv: iv_utf8,
            input: ct_b64,
            key_encoding: "utf8".into(),
            iv_encoding: "utf8".into(),
            input_encoding: "base64".into(),
            output_encoding: "hex".into(),
        };

        let resp = handle_aes_crypt(req_dec);
        assert!(resp.success, "decrypt failed: {:?}", resp.error);
        let pt_hex = resp.data.unwrap();
        assert_eq!(pt_hex, hex::encode(&PLAINTEXT));
    }

    #[test]
    fn handler_cbc_roundtrip_hex() {
        let key_hex = hex::encode(&key32());
        let iv_hex = hex::encode(&iv16());
        let plain_hex = hex::encode(PLAINTEXT);

        let req_enc = AesCryptRequest {
            mode: "encrypt".into(),
            algorithm: "aes-256-cbc".into(),
            key: key_hex.clone(),
            iv: iv_hex.clone(),
            input: plain_hex.clone(),
            key_encoding: "hex".into(),
            iv_encoding: "hex".into(),
            input_encoding: "hex".into(),
            output_encoding: "hex".into(),
        };

        let resp = handle_aes_crypt(req_enc);
        assert!(resp.success, "encrypt failed: {:?}", resp.error);
        let ct_hex = resp.data.unwrap();

        let req_dec = AesCryptRequest {
            mode: "decrypt".into(),
            algorithm: "aes-256-cbc".into(),
            key: key_hex,
            iv: iv_hex,
            input: ct_hex,
            key_encoding: "hex".into(),
            iv_encoding: "hex".into(),
            input_encoding: "hex".into(),
            output_encoding: "hex".into(),
        };

        let resp = handle_aes_crypt(req_dec);
        assert!(resp.success, "decrypt failed: {:?}", resp.error);
        assert_eq!(resp.data.unwrap(), plain_hex);
    }

    #[test]
    fn handler_ecb_roundtrip_base64() {
        let key_b64 = base64::engine::general_purpose::STANDARD.encode(&key32());
        let plain_b64 = base64::engine::general_purpose::STANDARD.encode(PLAINTEXT);

        let req_enc = AesCryptRequest {
            mode: "encrypt".into(),
            algorithm: "aes-256-ecb".into(),
            key: key_b64.clone(),
            iv: String::new(),
            input: plain_b64.clone(),
            key_encoding: "base64".into(),
            iv_encoding: "utf8".into(),
            input_encoding: "base64".into(),
            output_encoding: "base64".into(),
        };

        let resp = handle_aes_crypt(req_enc);
        assert!(resp.success, "encrypt failed: {:?}", resp.error);
        let ct_b64 = resp.data.unwrap();

        let req_dec = AesCryptRequest {
            mode: "decrypt".into(),
            algorithm: "aes-256-ecb".into(),
            key: key_b64,
            iv: String::new(),
            input: ct_b64,
            key_encoding: "base64".into(),
            iv_encoding: "utf8".into(),
            input_encoding: "base64".into(),
            output_encoding: "base64".into(),
        };

        let resp = handle_aes_crypt(req_dec);
        assert!(resp.success, "decrypt failed: {:?}", resp.error);
        assert_eq!(resp.data.unwrap(), plain_b64);
    }

    #[test]
    fn handler_wrong_key_length_error() {
        let req = AesCryptRequest {
            mode: "encrypt".into(),
            algorithm: "aes-256-cbc".into(),
            key: "short".into(),
            iv: String::from_utf8(iv16()).unwrap(),
            input: "hello".into(),
            key_encoding: "utf8".into(),
            iv_encoding: "utf8".into(),
            input_encoding: "utf8".into(),
            output_encoding: "hex".into(),
        };

        let resp = handle_aes_crypt(req);
        assert!(!resp.success);
        assert!(resp.error.unwrap().contains("密钥长度不正确"));
    }

    #[test]
    fn handler_wrong_iv_length_error() {
        let req = AesCryptRequest {
            mode: "encrypt".into(),
            algorithm: "aes-256-cbc".into(),
            key: String::from_utf8(key32()).unwrap(),
            iv: "badiv".into(),
            input: "hello".into(),
            key_encoding: "utf8".into(),
            iv_encoding: "utf8".into(),
            input_encoding: "utf8".into(),
            output_encoding: "hex".into(),
        };

        let resp = handle_aes_crypt(req);
        assert!(!resp.success);
        assert!(resp.error.unwrap().contains("IV 长度不正确"));
    }

    #[test]
    fn handler_unsupported_algorithm() {
        let req = AesCryptRequest {
            mode: "encrypt".into(),
            algorithm: "aes-128-gcm".into(),
            key: String::from_utf8(key32()).unwrap(),
            iv: String::from_utf8(iv16()).unwrap(),
            input: "test".into(),
            key_encoding: "utf8".into(),
            iv_encoding: "utf8".into(),
            input_encoding: "utf8".into(),
            output_encoding: "hex".into(),
        };

        let resp = handle_aes_crypt(req);
        assert!(!resp.success);
    }

    #[test]
    fn handler_unsupported_mode() {
        let req = AesCryptRequest {
            mode: "sign".into(),
            algorithm: "aes-256-cbc".into(),
            key: String::from_utf8(key32()).unwrap(),
            iv: String::from_utf8(iv16()).unwrap(),
            input: "test".into(),
            key_encoding: "utf8".into(),
            iv_encoding: "utf8".into(),
            input_encoding: "utf8".into(),
            output_encoding: "hex".into(),
        };

        let resp = handle_aes_crypt(req);
        assert!(!resp.success);
    }
}
