mod commands;
mod models;
mod services;

use commands::aes_cmd;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    match tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            aes_cmd::aes_crypt,
        ])
        .run(tauri::generate_context!())
    {
        Ok(_) => {}
        Err(e) => {
            eprintln!("Failed to start application: {}", e);
            std::process::exit(1);
        }
    }
}
