use crate::services::cloud_crypto;

#[tauri::command]
pub fn cloud_encrypt(mode: String, input: String) -> Result<String, String> {
    match mode.as_str() {
        "encode" => Ok(cloud_crypto::encode_payload(&input)),
        "decode" => cloud_crypto::decode_payload(&input),
        _ => Err(format!("不支持的模式: {}", mode)),
    }
}
