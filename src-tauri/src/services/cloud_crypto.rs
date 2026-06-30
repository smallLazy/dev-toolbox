/// PHP 兼容的 base_encryption / filter 编解码管道
///
/// 对应 PHP:
///   base_encryption: json_encode -> urlencode -> base64_encode -> strip '='
///   filter:         append '==' -> replace ' ' with '+' -> base64_decode -> urldecode -> json_decode
use base64::Engine as _;

// ---------------------------------------------------------------------------
// URL encode/decode (PHP-compatible: space -> '+')
// ---------------------------------------------------------------------------

fn url_encode(input: &str) -> String {
    let mut result = String::with_capacity(input.len() * 3);
    for byte in input.bytes() {
        match byte {
            b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9'
            | b'-' | b'_' | b'.' | b'~' => result.push(byte as char),
            b' ' => result.push('+'),
            _ => result.push_str(&format!("%{:02X}", byte)),
        }
    }
    result
}

fn url_decode(input: &str) -> String {
    let bytes = input.as_bytes();
    let mut result = Vec::with_capacity(bytes.len());
    let mut i = 0;
    while i < bytes.len() {
        match bytes[i] {
            b'+' => {
                result.push(b' ');
                i += 1;
            }
            b'%' if i + 2 < bytes.len() => {
                if let Ok(hex) = u8::from_str_radix(&input[i + 1..i + 3], 16) {
                    result.push(hex);
                    i += 3;
                } else {
                    result.push(b'%');
                    i += 1;
                }
            }
            _ => {
                result.push(bytes[i]);
                i += 1;
            }
        }
    }
    String::from_utf8_lossy(&result).to_string()
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/// Encode: equivalent to PHP `base_encryption()`
///
/// Pipeline: input -> urlencode -> base64 -> strip '='
pub fn encode_payload(input: &str) -> String {
    let url_encoded = url_encode(input);
    let b64 = base64::engine::general_purpose::STANDARD.encode(&url_encoded);
    b64.trim_end_matches('=').to_string()
}

/// Decode: equivalent to PHP `filter()`
///
/// Pipeline: input -> re-pad '=' -> fix spaces -> base64 decode -> urldecode
pub fn decode_payload(input: &str) -> Result<String, String> {
    if input.trim().is_empty() {
        return Err("输入为空".to_string());
    }

    // Re-add base64 padding (PHP frontend strips trailing '=')
    let mut padded = input.trim().to_string();
    // Fix URL-encoded spaces (' ' -> '+')
    padded = padded.replace(' ', "+");
    while !padded.len().is_multiple_of(4) {
        padded.push('=');
    }

    let decoded = base64::engine::general_purpose::STANDARD
        .decode(&padded)
        .map_err(|e| format!("Base64 解码失败: {}", e))?;

    let decoded_str =
        String::from_utf8(decoded).map_err(|e| format!("UTF-8 解码失败: {}", e))?;

    let result = url_decode(&decoded_str);

    Ok(result)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn url_encode_basic() {
        let input = "hello world";
        let encoded = url_encode(input);
        assert_eq!(encoded, "hello+world");
    }

    #[test]
    fn url_encode_chinese() {
        let input = "测试";
        let encoded = url_encode(input);
        // UTF-8 bytes: E6 B5 8B E8 AF 95
        assert!(encoded.contains("%E6") || encoded.contains("%e6"));
    }

    #[test]
    fn url_decode_basic() {
        let input = "hello+world";
        let decoded = url_decode(input);
        assert_eq!(decoded, "hello world");
    }

    #[test]
    fn url_decode_percent() {
        let input = "%E4%BD%A0%E5%A5%BD";
        let decoded = url_decode(input);
        assert_eq!(decoded, "你好");
    }

    #[test]
    fn url_roundtrip() {
        let inputs = vec![
            "hello world",
            "测试中文",
            "hello+world=test",
            "special chars: !@#$%^&*()",
            r#"{"key":"value"}"#,
        ];
        for input in inputs {
            let encoded = url_encode(input);
            let decoded = url_decode(&encoded);
            assert_eq!(decoded, input, "roundtrip failed for: {}", input);
        }
    }

    #[test]
    fn encode_decode_roundtrip() {
        let inputs = vec![
            "hello world",
            "测试中文",
            r#"{"code":"set_password","type":1}"#,
            "simple_ascii",
            "key=value&foo=bar",
        ];
        for input in inputs {
            let encoded = encode_payload(input);
            let decoded = decode_payload(&encoded).expect("decode failed");
            assert_eq!(decoded, input, "roundtrip failed for: {}", input);
        }
    }

    #[test]
    fn decode_empty_is_rejected() {
        assert!(decode_payload("").is_err());
        assert!(decode_payload("   ").is_err());
    }

    #[test]
    fn decode_invalid_base64_is_rejected() {
        assert!(decode_payload("!!!not-valid!!!").is_err());
    }

    #[test]
    fn decode_padded_input() {
        // Input with spaces (as from URL query string)
        let encoded = encode_payload(r#"{"code":"test"}"#);
        // Simulate: spaces instead of '+' in URL
        let with_spaces = encoded.replace('+', " ");
        let decoded = decode_payload(&with_spaces).expect("decode failed");
        assert_eq!(decoded, r#"{"code":"test"}"#);
    }

    #[test]
    fn decode_without_padding() {
        // PHP frontend strips '=', test that we can decode without padding
        let input = r#"{"key":"value"}"#;
        let encoded = encode_payload(input);
        // Verify no '=' in output
        assert!(!encoded.contains('='), "encoded should not contain '='");
        let decoded = decode_payload(&encoded).expect("decode failed");
        assert_eq!(decoded, input);
    }
}
