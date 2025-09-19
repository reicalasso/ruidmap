use crate::models::{Task, TaskCreateRequest, TaskUpdateRequest, TaskStatus, TaskPriority};
use crate::storage::Storage;
use std::sync::Mutex;
use tauri::State;

pub struct AppState(pub Mutex<Storage>);

#[tauri::command]
pub async fn get_tasks(state: State<'_, AppState>) -> Result<Vec<Task>, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    storage.get_tasks().map_err(|e| format!("Failed to get tasks: {}", e))
}

#[tauri::command]
pub async fn add_task(
    request: TaskCreateRequest,
    state: State<'_, AppState>
) -> Result<Task, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    storage.add_task(
        request.title,
        request.description,
        request.priority
    ).map_err(|e| format!("Failed to add task: {}", e))
}

#[tauri::command]
pub async fn update_task(
    request: TaskUpdateRequest,
    state: State<'_, AppState>
) -> Result<Task, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    storage.update_task(
        request.id,
        request.title,
        request.description,
        request.status,
        request.priority
    ).map_err(|e| format!("Failed to update task: {}", e))
}

#[tauri::command]
pub async fn delete_task(id: u32, state: State<'_, AppState>) -> Result<(), String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    storage.delete_task(id).map_err(|e| format!("Failed to delete task: {}", e))
}

#[tauri::command]
pub async fn get_task_by_id(id: u32, state: State<'_, AppState>) -> Result<Task, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    storage.get_task_by_id(id).map_err(|e| format!("Failed to get task: {}", e))
}

#[tauri::command]
pub async fn get_tasks_by_status(
    status: String,
    state: State<'_, AppState>
) -> Result<Vec<Task>, String> {
    let task_status: TaskStatus = status.as_str().into();
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    storage.get_tasks_by_status(task_status).map_err(|e| format!("Failed to get tasks by status: {}", e))
}

#[tauri::command]
pub async fn get_theme(state: State<'_, AppState>) -> Result<String, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    storage.get_theme().map_err(|e| format!("Failed to get theme: {}", e))
}

#[tauri::command]
pub async fn set_theme(theme: String, state: State<'_, AppState>) -> Result<(), String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    storage.set_theme(theme).map_err(|e| format!("Failed to set theme: {}", e))
}

#[tauri::command]
pub async fn backup_data(backup_path: String, state: State<'_, AppState>) -> Result<(), String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    storage.backup_data(backup_path.into()).map_err(|e| format!("Failed to backup data: {}", e))
}

#[tauri::command]
pub async fn restore_data(backup_path: String, state: State<'_, AppState>) -> Result<(), String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    storage.restore_data(backup_path.into()).map_err(|e| format!("Failed to restore data: {}", e))
}

// Additional utility commands for better UX

#[tauri::command]
pub async fn toggle_task_status(id: u32, state: State<'_, AppState>) -> Result<Task, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    
    // Get current task
    let current_task = storage.get_task_by_id(id)
        .map_err(|e| format!("Failed to get task: {}", e))?;
    
    // Toggle status
    let new_status = match current_task.status {
        TaskStatus::Todo => TaskStatus::InProgress,
        TaskStatus::InProgress => TaskStatus::Done,
        TaskStatus::Done => TaskStatus::Todo,
    };
    
    storage.update_task(id, None, None, Some(new_status), None)
        .map_err(|e| format!("Failed to toggle task status: {}", e))
}

#[tauri::command]
pub async fn get_task_stats(state: State<'_, AppState>) -> Result<TaskStats, String> {
    let tasks = get_tasks(state).await?;
    
    let todo_count = tasks.iter().filter(|t| t.status == TaskStatus::Todo).count();
    let in_progress_count = tasks.iter().filter(|t| t.status == TaskStatus::InProgress).count();
    let done_count = tasks.iter().filter(|t| t.status == TaskStatus::Done).count();
    let total_count = tasks.len();
    
    let progress_percentage = if total_count > 0 {
        (done_count as f64 / total_count as f64) * 100.0
    } else {
        0.0
    };
    
    Ok(TaskStats {
        total: total_count,
        todo: todo_count,
        in_progress: in_progress_count,
        done: done_count,
        progress_percentage,
    })
}

#[derive(serde::Serialize)]
pub struct TaskStats {
    pub total: usize,
    pub todo: usize,
    pub in_progress: usize,
    pub done: usize,
    pub progress_percentage: f64,
}