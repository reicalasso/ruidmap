use crate::models::{Task, TaskCreateRequest, TaskUpdateRequest, TaskStatus, Project, ProjectCreateRequest, ProjectUpdateRequest};
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

// Advanced Task Feature Commands

#[tauri::command]
pub async fn add_task_tag(
    task_id: u32,
    tag: String,
    state: State<'_, AppState>
) -> Result<Task, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    
    let mut data = storage.load_data().map_err(|e| format!("Failed to load data: {}", e))?;
    
    let task = data.tasks.iter_mut()
        .find(|t| t.id == task_id)
        .ok_or_else(|| format!("Task with id {} not found", task_id))?;
    
    task.add_tag(tag);
    let updated_task = task.clone();
    
    storage.save_data(&data).map_err(|e| format!("Failed to save: {}", e))?;
    
    Ok(updated_task)
}

#[tauri::command]
pub async fn remove_task_tag(
    task_id: u32,
    tag: String,
    state: State<'_, AppState>
) -> Result<Task, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    
    let mut data = storage.load_data().map_err(|e| format!("Failed to load data: {}", e))?;
    
    let task = data.tasks.iter_mut()
        .find(|t| t.id == task_id)
        .ok_or_else(|| format!("Task with id {} not found", task_id))?;
    
    task.remove_tag(&tag);
    let updated_task = task.clone();
    
    storage.save_data(&data).map_err(|e| format!("Failed to save: {}", e))?;
    
    Ok(updated_task)
}

#[tauri::command]
pub async fn set_task_due_date(
    task_id: u32,
    due_date: Option<String>,
    state: State<'_, AppState>
) -> Result<Task, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    
    let mut data = storage.load_data().map_err(|e| format!("Failed to load data: {}", e))?;
    
    let task = data.tasks.iter_mut()
        .find(|t| t.id == task_id)
        .ok_or_else(|| format!("Task with id {} not found", task_id))?;
    
    task.set_due_date(due_date);
    let updated_task = task.clone();
    
    storage.save_data(&data).map_err(|e| format!("Failed to save: {}", e))?;
    
    Ok(updated_task)
}

#[tauri::command]
pub async fn add_task_subtask(
    task_id: u32,
    subtask_title: String,
    state: State<'_, AppState>
) -> Result<Task, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    
    let mut data = storage.load_data().map_err(|e| format!("Failed to load data: {}", e))?;
    
    let task = data.tasks.iter_mut()
        .find(|t| t.id == task_id)
        .ok_or_else(|| format!("Task with id {} not found", task_id))?;
    
    // Generate new subtask ID
    let subtask_id = task.subtasks.iter().map(|s| s.id).max().unwrap_or(0) + 1;
    task.add_subtask(subtask_id, subtask_title);
    let updated_task = task.clone();
    
    storage.save_data(&data).map_err(|e| format!("Failed to save: {}", e))?;
    
    Ok(updated_task)
}

#[tauri::command]
pub async fn toggle_task_subtask(
    task_id: u32,
    subtask_id: u32,
    state: State<'_, AppState>
) -> Result<Task, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    
    let mut data = storage.load_data().map_err(|e| format!("Failed to load data: {}", e))?;
    
    let task = data.tasks.iter_mut()
        .find(|t| t.id == task_id)
        .ok_or_else(|| format!("Task with id {} not found", task_id))?;
    
    task.toggle_subtask(subtask_id);
    let updated_task = task.clone();
    
    storage.save_data(&data).map_err(|e| format!("Failed to save: {}", e))?;
    
    Ok(updated_task)
}

#[tauri::command]
pub async fn add_task_comment(
    task_id: u32,
    comment_text: String,
    author: String,
    state: State<'_, AppState>
) -> Result<Task, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    
    let mut data = storage.load_data().map_err(|e| format!("Failed to load data: {}", e))?;
    
    let task = data.tasks.iter_mut()
        .find(|t| t.id == task_id)
        .ok_or_else(|| format!("Task with id {} not found", task_id))?;
    
    // Generate new comment ID
    let comment_id = task.comments.iter().map(|c| c.id).max().unwrap_or(0) + 1;
    task.add_comment(comment_id, comment_text, author);
    let updated_task = task.clone();
    
    storage.save_data(&data).map_err(|e| format!("Failed to save: {}", e))?;
    
    Ok(updated_task)
}

#[tauri::command]
pub async fn add_task_time(
    task_id: u32,
    minutes: u32,
    state: State<'_, AppState>
) -> Result<Task, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    
    let mut data = storage.load_data().map_err(|e| format!("Failed to load data: {}", e))?;
    
    let task = data.tasks.iter_mut()
        .find(|t| t.id == task_id)
        .ok_or_else(|| format!("Task with id {} not found", task_id))?;
    
    task.add_time(minutes);
    let updated_task = task.clone();
    
    storage.save_data(&data).map_err(|e| format!("Failed to save: {}", e))?;
    
    Ok(updated_task)
}

#[tauri::command]
pub async fn set_task_estimated_time(
    task_id: u32,
    estimated_minutes: Option<u32>,
    state: State<'_, AppState>
) -> Result<Task, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    
    let mut data = storage.load_data().map_err(|e| format!("Failed to load data: {}", e))?;
    
    let task = data.tasks.iter_mut()
        .find(|t| t.id == task_id)
        .ok_or_else(|| format!("Task with id {} not found", task_id))?;
    
    task.set_estimated_time(estimated_minutes);
    let updated_task = task.clone();
    
    storage.save_data(&data).map_err(|e| format!("Failed to save: {}", e))?;
    
    Ok(updated_task)
}

#[tauri::command]
pub async fn get_tasks_by_tag(
    tag: String,
    state: State<'_, AppState>
) -> Result<Vec<Task>, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    let tasks = storage.get_tasks().map_err(|e| format!("Failed to get tasks: {}", e))?;
    
    let filtered_tasks: Vec<Task> = tasks.into_iter()
        .filter(|t| t.tags.contains(&tag))
        .collect();
    
    Ok(filtered_tasks)
}

#[tauri::command]
pub async fn get_tasks_by_due_date(
    due_date: String,
    state: State<'_, AppState>
) -> Result<Vec<Task>, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    let tasks = storage.get_tasks().map_err(|e| format!("Failed to get tasks: {}", e))?;
    
    let filtered_tasks: Vec<Task> = tasks.into_iter()
        .filter(|t| t.due_date == Some(due_date.clone()))
        .collect();
    
    Ok(filtered_tasks)
}

#[tauri::command]
pub async fn get_overdue_tasks(state: State<'_, AppState>) -> Result<Vec<Task>, String> {
    use chrono::{DateTime, Utc};
    
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    let tasks = storage.get_tasks().map_err(|e| format!("Failed to get tasks: {}", e))?;
    
    let now = Utc::now();
    let filtered_tasks: Vec<Task> = tasks.into_iter()
        .filter(|t| {
            if let Some(due_date_str) = &t.due_date {
                if let Ok(due_date) = DateTime::parse_from_rfc3339(due_date_str) {
                    return due_date.with_timezone(&Utc) < now && t.status != TaskStatus::Done;
                }
            }
            false
        })
        .collect();
    
    Ok(filtered_tasks)
}

#[tauri::command]
pub async fn get_all_tags(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    let tasks = storage.get_tasks().map_err(|e| format!("Failed to get tasks: {}", e))?;
    
    let mut all_tags: Vec<String> = tasks.iter()
        .flat_map(|t| t.tags.iter())
        .cloned()
        .collect();
    
    all_tags.sort();
    all_tags.dedup();
    
    Ok(all_tags)
}

// Project Management Commands

#[tauri::command]
pub async fn create_project(
    request: ProjectCreateRequest,
    state: State<'_, AppState>
) -> Result<Project, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    
    let mut data = storage.load_data().map_err(|e| format!("Failed to load data: {}", e))?;
    
    // Generate new project ID
    let new_id = data.projects.iter()
        .map(|p| p.id)
        .max()
        .unwrap_or(0) + 1;
    
    let project = Project::new_with_details(
        new_id,
        request.name,
        request.description.unwrap_or_default(),
        request.color,
        request.icon,
    );
    
    data.projects.push(project.clone());
    
    // Set as current project if it's the first one
    if data.current_project_id.is_none() {
        data.current_project_id = Some(new_id);
    }
    
    storage.save_data(&data).map_err(|e| format!("Failed to save data: {}", e))?;
    
    Ok(project)
}

#[tauri::command]
pub async fn get_projects(state: State<'_, AppState>) -> Result<Vec<Project>, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    let data = storage.load_data().map_err(|e| format!("Failed to load data: {}", e))?;
    
    Ok(data.projects)
}

#[tauri::command]
pub async fn get_current_project(state: State<'_, AppState>) -> Result<Option<Project>, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    let data = storage.load_data().map_err(|e| format!("Failed to load data: {}", e))?;
    
    if let Some(current_id) = data.current_project_id {
        let project = data.projects.iter()
            .find(|p| p.id == current_id)
            .cloned();
        Ok(project)
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub async fn switch_project(
    project_id: u32,
    state: State<'_, AppState>
) -> Result<Project, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    
    let mut data = storage.load_data().map_err(|e| format!("Failed to load data: {}", e))?;
    
    // Verify project exists
    let project = data.projects.iter()
        .find(|p| p.id == project_id)
        .ok_or_else(|| format!("Project with id {} not found", project_id))?
        .clone();
    
    data.current_project_id = Some(project_id);
    storage.save_data(&data).map_err(|e| format!("Failed to save data: {}", e))?;
    
    Ok(project)
}

#[tauri::command]
pub async fn update_project(
    request: ProjectUpdateRequest,
    state: State<'_, AppState>
) -> Result<Project, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    
    let mut data = storage.load_data().map_err(|e| format!("Failed to load data: {}", e))?;
    
    let project = data.projects.iter_mut()
        .find(|p| p.id == request.id)
        .ok_or_else(|| format!("Project with id {} not found", request.id))?;
    
    project.update_info(request.name, request.description, request.color, request.icon);
    let updated_project = project.clone();
    
    storage.save_data(&data).map_err(|e| format!("Failed to save data: {}", e))?;
    
    Ok(updated_project)
}

#[tauri::command]
pub async fn delete_project(
    project_id: u32,
    state: State<'_, AppState>
) -> Result<(), String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    
    let mut data = storage.load_data().map_err(|e| format!("Failed to load data: {}", e))?;
    
    // Don't allow deleting if it's the only project
    if data.projects.len() <= 1 {
        return Err("Cannot delete the last project".to_string());
    }
    
    // Remove project
    data.projects.retain(|p| p.id != project_id);
    
    // Remove all tasks from this project
    data.tasks.retain(|t| t.project_id != project_id);
    
    // If current project was deleted, switch to first available
    if data.current_project_id == Some(project_id) {
        data.current_project_id = data.projects.first().map(|p| p.id);
    }
    
    storage.save_data(&data).map_err(|e| format!("Failed to save data: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub async fn get_tasks_by_project(
    project_id: u32,
    state: State<'_, AppState>
) -> Result<Vec<Task>, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    let data = storage.load_data().map_err(|e| format!("Failed to load data: {}", e))?;
    
    let filtered_tasks: Vec<Task> = data.tasks.into_iter()
        .filter(|t| t.project_id == project_id)
        .collect();
    
    Ok(filtered_tasks)
}

#[tauri::command]
pub async fn get_project_stats(
    project_id: u32,
    state: State<'_, AppState>
) -> Result<ProjectStats, String> {
    let tasks = get_tasks_by_project(project_id, state).await?;
    
    let todo_count = tasks.iter().filter(|t| t.status == TaskStatus::Todo).count();
    let in_progress_count = tasks.iter().filter(|t| t.status == TaskStatus::InProgress).count();
    let done_count = tasks.iter().filter(|t| t.status == TaskStatus::Done).count();
    let total_count = tasks.len();
    
    let progress_percentage = if total_count > 0 {
        (done_count as f64 / total_count as f64) * 100.0
    } else {
        0.0
    };
    
    Ok(ProjectStats {
        project_id,
        total_tasks: total_count,
        todo_tasks: todo_count,
        in_progress_tasks: in_progress_count,
        done_tasks: done_count,
        progress_percentage,
    })
}

#[derive(serde::Serialize)]
pub struct ProjectStats {
    pub project_id: u32,
    pub total_tasks: usize,
    pub todo_tasks: usize,
    pub in_progress_tasks: usize,
    pub done_tasks: usize,
    pub progress_percentage: f64,
}

// Enhanced Data Export/Import Commands

#[tauri::command]
pub async fn export_data_dialog(
    state: State<'_, AppState>
) -> Result<String, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    let data = storage.load_data().map_err(|e| format!("Failed to load data: {}", e))?;
    
    // Create export data with metadata
    let export_data = ExportData {
        version: "0.2.1".to_string(),
        export_date: chrono::Utc::now().to_rfc3339(),
        data,
    };
    
    let json_content = serde_json::to_string_pretty(&export_data)
        .map_err(|e| format!("Failed to serialize data: {}", e))?;
    
    // Return the JSON content - frontend will handle file saving with dialog
    Ok(json_content)
}

#[tauri::command]
pub async fn export_data_to_file(
    file_path: String,
    state: State<'_, AppState>
) -> Result<(), String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    let data = storage.load_data().map_err(|e| format!("Failed to load data: {}", e))?;
    
    // Create export data with metadata
    let export_data = ExportData {
        version: "0.2.1".to_string(),
        export_date: chrono::Utc::now().to_rfc3339(),
        data,
    };
    
    let json_content = serde_json::to_string_pretty(&export_data)
        .map_err(|e| format!("Failed to serialize data: {}", e))?;
    
    std::fs::write(file_path, json_content)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub async fn import_data_from_content(
    json_content: String,
    merge_mode: bool,
    state: State<'_, AppState>
) -> Result<ImportResult, String> {
    let storage = state.0.lock().map_err(|e| format!("Failed to acquire lock: {}", e))?;
    
    // Try to parse as export data first
    let import_result = if let Ok(export_data) = serde_json::from_str::<ExportData>(&json_content) {
        if merge_mode {
            // Merge with existing data
            let mut current_data = storage.load_data().map_err(|e| format!("Failed to load current data: {}", e))?;
            
            // Generate new IDs for imported items to avoid conflicts
            let mut max_task_id = current_data.tasks.iter().map(|t| t.id).max().unwrap_or(0);
            let mut max_project_id = current_data.projects.iter().map(|p| p.id).max().unwrap_or(0);
            
            let mut imported_tasks = 0;
            let mut imported_projects = 0;
            
            // Import projects
            for mut project in export_data.data.projects {
                max_project_id += 1;
                let old_id = project.id;
                project.id = max_project_id;
                
                // Update task references to new project ID
                for task in &mut export_data.data.tasks.clone() {
                    if task.project_id == old_id {
                        // This task belongs to the imported project
                        max_task_id += 1;
                        let mut new_task = task.clone();
                        new_task.id = max_task_id;
                        new_task.project_id = max_project_id;
                        current_data.tasks.push(new_task);
                        imported_tasks += 1;
                    }
                }
                
                current_data.projects.push(project);
                imported_projects += 1;
            }
            
            storage.save_data(&current_data).map_err(|e| format!("Failed to save merged data: {}", e))?;
            
            ImportResult {
                success: true,
                imported_tasks,
                imported_projects,
                message: format!("Successfully merged {} tasks and {} projects", imported_tasks, imported_projects),
                export_version: export_data.version,
                export_date: Some(export_data.export_date),
            }
        } else {
            // Replace all data
            storage.save_data(&export_data.data).map_err(|e| format!("Failed to save imported data: {}", e))?;
            
            ImportResult {
                success: true,
                imported_tasks: export_data.data.tasks.len(),
                imported_projects: export_data.data.projects.len(),
                message: format!("Successfully imported {} tasks and {} projects", 
                    export_data.data.tasks.len(), export_data.data.projects.len()),
                export_version: export_data.version,
                export_date: Some(export_data.export_date),
            }
        }
    } else if let Ok(legacy_data) = serde_json::from_str::<crate::models::RoadmapData>(&json_content) {
        // Direct RoadmapData import
        if merge_mode {
            return Err("Merge mode not supported for legacy data format".to_string());
        }
        
        storage.save_data(&legacy_data).map_err(|e| format!("Failed to save legacy data: {}", e))?;
        
        ImportResult {
            success: true,
            imported_tasks: legacy_data.tasks.len(),
            imported_projects: legacy_data.projects.len(),
            message: format!("Successfully imported legacy data: {} tasks and {} projects", 
                legacy_data.tasks.len(), legacy_data.projects.len()),
            export_version: "legacy".to_string(),
            export_date: None,
        }
    } else {
        return Err("Invalid data format. File does not contain valid RuidMap data.".to_string());
    };
    
    Ok(import_result)
}

#[tauri::command]
pub async fn validate_import_data(
    json_content: String
) -> Result<ImportValidation, String> {
    // Try to parse as export data
    if let Ok(export_data) = serde_json::from_str::<ExportData>(&json_content) {
        Ok(ImportValidation {
            valid: true,
            version: export_data.version,
            export_date: Some(export_data.export_date),
            task_count: export_data.data.tasks.len(),
            project_count: export_data.data.projects.len(),
            format_type: "export".to_string(),
            warnings: vec![],
            errors: vec![],
        })
    } else if let Ok(legacy_data) = serde_json::from_str::<crate::models::RoadmapData>(&json_content) {
        let mut warnings = vec![];
        if legacy_data.version != "0.2.1" {
            warnings.push("Legacy data format detected. Some features may not be available.".to_string());
        }
        
        Ok(ImportValidation {
            valid: true,
            version: legacy_data.version,
            export_date: None,
            task_count: legacy_data.tasks.len(),
            project_count: legacy_data.projects.len(),
            format_type: "legacy".to_string(),
            warnings,
            errors: vec![],
        })
    } else {
        Ok(ImportValidation {
            valid: false,
            version: "unknown".to_string(),
            export_date: None,
            task_count: 0,
            project_count: 0,
            format_type: "invalid".to_string(),
            warnings: vec![],
            errors: vec!["Invalid JSON format or unrecognized data structure".to_string()],
        })
    }
}

// Data structures for export/import

#[derive(serde::Serialize, serde::Deserialize)]
pub struct ExportData {
    pub version: String,
    pub export_date: String,
    pub data: crate::models::RoadmapData,
}

#[derive(serde::Serialize)]
pub struct ImportResult {
    pub success: bool,
    pub imported_tasks: usize,
    pub imported_projects: usize,
    pub message: String,
    pub export_version: String,
    pub export_date: Option<String>,
}

#[derive(serde::Serialize)]
pub struct ImportValidation {
    pub valid: bool,
    pub version: String,
    pub export_date: Option<String>,
    pub task_count: usize,
    pub project_count: usize,
    pub format_type: String,
    pub warnings: Vec<String>,
    pub errors: Vec<String>,
}