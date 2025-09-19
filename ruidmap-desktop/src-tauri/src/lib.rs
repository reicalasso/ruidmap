// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

mod models;
mod storage;
mod commands;

use commands::{
    AppState, get_tasks, add_task, update_task, delete_task, get_task_by_id,
    get_tasks_by_status, get_theme, set_theme, backup_data, restore_data,
    toggle_task_status, get_task_stats
};
use storage::Storage;
use std::sync::Mutex;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize storage
    let storage = Storage::new().expect("Failed to initialize storage");
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState(Mutex::new(storage)))
        .invoke_handler(tauri::generate_handler![
            greet,
            get_tasks,
            add_task,
            update_task,
            delete_task,
            get_task_by_id,
            get_tasks_by_status,
            get_theme,
            set_theme,
            backup_data,
            restore_data,
            toggle_task_status,
            get_task_stats
        ])
        .run(tauri::generate_context!())
        .expect("error while running RuidMap application");
}
