use crate::models::AesCryptRequest;
use crate::services::crypto;

#[tauri::command]
pub fn aes_crypt(request: AesCryptRequest) -> Result<String, String> {
    let response = crypto::handle_aes_crypt(request);
    if response.success {
        Ok(response.data.unwrap_or_default())
    } else {
        Err(response.error.unwrap_or_else(|| "未知错误".to_string()))
    }
}
