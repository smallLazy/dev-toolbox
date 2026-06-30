use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AesCryptRequest {
    pub mode: String,           // "encrypt" | "decrypt"
    pub algorithm: String,      // "aes-256-cbc" | "aes-256-ecb"
    pub key: String,
    pub iv: String,
    pub input: String,
    pub key_encoding: String,   // "utf8" | "hex" | "base64"
    pub iv_encoding: String,    // "utf8" | "hex" | "base64"
    pub input_encoding: String, // "utf8" | "hex" | "base64"
    pub output_encoding: String,// "hex" | "base64"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AesCryptResponse {
    pub success: bool,
    pub data: Option<String>,
    pub error: Option<String>,
}
