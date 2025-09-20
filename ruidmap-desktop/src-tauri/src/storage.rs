use crate::models::{RoadmapData, Task, TaskStatus, TaskPriority, Project};
use anyhow::{anyhow, Result};
use serde::{Deserialize, Serialize};
use serde_json;
use std::fs;
use std::path::{Path, PathBuf};

// Legacy data structures for migration
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LegacyTask {
    pub id: u32,
    pub title: String,
    pub description: String,
    pub status: TaskStatus,
    pub priority: TaskPriority,
    pub created_at: String,
    pub updated_at: String,
    pub due_date: Option<String>,
    pub tags: Vec<String>,
    pub subtasks: Vec<crate::models::Subtask>,
    pub comments: Vec<crate::models::Comment>,
    pub time_spent: u32,
    pub estimated_time: Option<u32>,
    pub attachments: Vec<crate::models::Attachment>,
    // Missing project_id
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LegacyRoadmapData {
    pub tasks: Vec<LegacyTask>,
    pub theme: Option<String>,
    pub version: Option<String>,
}

pub struct Storage {
    data_file_path: PathBuf,
}

impl Storage {
    pub fn new() -> Result<Self> {
        // For now, use current directory. In a real app, we'd use the proper app data directory
        let data_file_path = PathBuf::from("roadmap.json");
        
        Ok(Storage { data_file_path })
    }

    pub fn new_with_path(file_path: PathBuf) -> Self {
        Storage {
            data_file_path: file_path,
        }
    }

    pub fn load_data(&self) -> Result<RoadmapData> {
        if !self.data_file_path.exists() {
            // Create default file if it doesn't exist
            let default_data = RoadmapData::default();
            self.save_data(&default_data)?;
            return Ok(default_data);
        }

        let contents = fs::read_to_string(&self.data_file_path)?;
        
        // Try to parse as current format first
        match serde_json::from_str::<RoadmapData>(&contents) {
            Ok(mut data) => {
                // Migrate data if needed
                self.migrate_data(&mut data)?;
                Ok(data)
            }
            Err(_) => {
                // Try to parse as legacy format (without projects)
                match serde_json::from_str::<LegacyRoadmapData>(&contents) {
                    Ok(legacy_data) => {
                        let migrated_data = self.migrate_from_legacy(legacy_data)?;
                        self.save_data(&migrated_data)?;
                        Ok(migrated_data)
                    }
                    Err(e) => Err(anyhow!("Failed to parse JSON: {}", e))
                }
            }
        }
    }

    pub fn save_data(&self, data: &RoadmapData) -> Result<()> {
        let json_content = serde_json::to_string_pretty(data)
            .map_err(|e| anyhow!("Failed to serialize data: {}", e))?;
        
        fs::write(&self.data_file_path, json_content)?;
        Ok(())
    }

    pub fn get_tasks(&self) -> Result<Vec<Task>> {
        let data = self.load_data()?;
        Ok(data.tasks)
    }

    pub fn add_task(&self, title: String, description: String, priority: Option<TaskPriority>) -> Result<Task> {
        let mut data = self.load_data()?;
        
        // Get current project ID or use default
        let project_id = data.current_project_id.unwrap_or(1);
        
        // Generate new ID (simple incrementing)
        let new_id = data.tasks.iter()
            .map(|t| t.id)
            .max()
            .unwrap_or(0) + 1;
        
        let mut task = Task::new(new_id, project_id, title, description);
        if let Some(priority) = priority {
            task.update_priority(priority);
        }
        
        data.tasks.push(task.clone());
        self.save_data(&data)?;
        
        Ok(task)
    }

    pub fn update_task(&self, id: u32, title: Option<String>, description: Option<String>, 
                      status: Option<TaskStatus>, priority: Option<TaskPriority>) -> Result<Task> {
        let mut data = self.load_data()?;
        
        let task_index = data.tasks.iter()
            .position(|t| t.id == id)
            .ok_or_else(|| anyhow!("Task with id {} not found", id))?;
        
        let task = &mut data.tasks[task_index];
        
        if let (Some(title), Some(description)) = (title, description) {
            task.update_content(title, description);
        }
        
        if let Some(status) = status {
            task.update_status(status);
        }
        
        if let Some(priority) = priority {
            task.update_priority(priority);
        }
        
        let updated_task = task.clone();
        self.save_data(&data)?;
        
        Ok(updated_task)
    }

    pub fn delete_task(&self, id: u32) -> Result<()> {
        let mut data = self.load_data()?;
        
        let initial_len = data.tasks.len();
        data.tasks.retain(|t| t.id != id);
        
        if data.tasks.len() == initial_len {
            return Err(anyhow!("Task with id {} not found", id));
        }
        
        self.save_data(&data)?;
        Ok(())
    }

    pub fn get_task_by_id(&self, id: u32) -> Result<Task> {
        let data = self.load_data()?;
        data.tasks.into_iter()
            .find(|t| t.id == id)
            .ok_or_else(|| anyhow!("Task with id {} not found", id))
    }

    pub fn get_tasks_by_status(&self, status: TaskStatus) -> Result<Vec<Task>> {
        let data = self.load_data()?;
        Ok(data.tasks.into_iter()
            .filter(|t| t.status == status)
            .collect())
    }

    pub fn get_theme(&self) -> Result<String> {
        let data = self.load_data()?;
        Ok(data.theme.unwrap_or_else(|| "light".to_string()))
    }

    pub fn set_theme(&self, theme: String) -> Result<()> {
        let mut data = self.load_data()?;
        data.theme = Some(theme);
        self.save_data(&data)?;
        Ok(())
    }

    pub fn get_data_file_path(&self) -> &Path {
        &self.data_file_path
    }

    pub fn backup_data(&self, backup_path: PathBuf) -> Result<()> {
        let data = self.load_data()?;
        let json_content = serde_json::to_string_pretty(&data)?;
        fs::write(backup_path, json_content)?;
        Ok(())
    }

    pub fn restore_data(&self, backup_path: PathBuf) -> Result<()> {
        let contents = fs::read_to_string(backup_path)?;
        let data: RoadmapData = serde_json::from_str(&contents)?;
        self.save_data(&data)?;
        Ok(())
    }

    // Project management methods
    pub fn create_project(&self, name: String, description: String, color: Option<String>, icon: Option<String>) -> Result<crate::models::Project> {
        let mut data = self.load_data()?;
        
        let new_id = data.projects.iter()
            .map(|p| p.id)
            .max()
            .unwrap_or(0) + 1;
        
        let project = crate::models::Project::new_with_details(new_id, name, description, color, icon);
        data.projects.push(project.clone());
        
        // Set as current project if it's the first one
        if data.current_project_id.is_none() {
            data.current_project_id = Some(new_id);
        }
        
        self.save_data(&data)?;
        Ok(project)
    }

    pub fn get_projects(&self) -> Result<Vec<crate::models::Project>> {
        let data = self.load_data()?;
        Ok(data.projects)
    }

    pub fn get_current_project(&self) -> Result<Option<crate::models::Project>> {
        let data = self.load_data()?;
        
        if let Some(current_id) = data.current_project_id {
            let project = data.projects.iter()
                .find(|p| p.id == current_id)
                .cloned();
            Ok(project)
        } else {
            Ok(None)
        }
    }

    pub fn switch_project(&self, project_id: u32) -> Result<crate::models::Project> {
        let mut data = self.load_data()?;
        
        let project = data.projects.iter()
            .find(|p| p.id == project_id)
            .ok_or_else(|| anyhow!("Project with id {} not found", project_id))?
            .clone();
        
        data.current_project_id = Some(project_id);
        self.save_data(&data)?;
        
        Ok(project)
    }

    pub fn delete_project(&self, project_id: u32) -> Result<()> {
        let mut data = self.load_data()?;
        
        // Don't allow deleting if it's the only project
        if data.projects.len() <= 1 {
            return Err(anyhow!("Cannot delete the last project"));
        }
        
        // Remove project
        data.projects.retain(|p| p.id != project_id);
        
        // Remove all tasks from this project
        data.tasks.retain(|t| t.project_id != project_id);
        
        // If current project was deleted, switch to first available
        if data.current_project_id == Some(project_id) {
            data.current_project_id = data.projects.first().map(|p| p.id);
        }
        
        self.save_data(&data)?;
        Ok(())
    }

    pub fn get_tasks_by_project(&self, project_id: u32) -> Result<Vec<Task>> {
        let data = self.load_data()?;
        
        let filtered_tasks: Vec<Task> = data.tasks.into_iter()
            .filter(|t| t.project_id == project_id)
            .collect();
        
        Ok(filtered_tasks)
    }

    // Migration methods
    fn migrate_data(&self, data: &mut RoadmapData) -> Result<()> {
        // Check if data needs migration based on version
        let current_version = "1.0.0";
        
        if data.version != current_version {
            // Add project_id to tasks that don't have it
            for task in &mut data.tasks {
                if task.project_id == 0 {
                    task.project_id = data.current_project_id.unwrap_or(1);
                }
            }

            // Ensure at least one project exists
            if data.projects.is_empty() {
                let default_project = Project::new(1, "Default Project".to_string());
                data.projects.push(default_project);
                data.current_project_id = Some(1);
            }

            data.version = current_version.to_string();
        }

        Ok(())
    }

    fn migrate_from_legacy(&self, legacy_data: LegacyRoadmapData) -> Result<RoadmapData> {
        // Create default project
        let default_project = Project::new(1, "Default Project".to_string());
        
        // Convert legacy tasks to new format
        let tasks: Vec<Task> = legacy_data.tasks.into_iter().map(|legacy_task| {
            Task {
                id: legacy_task.id,
                project_id: 1, // Assign to default project
                title: legacy_task.title,
                description: legacy_task.description,
                status: legacy_task.status,
                priority: legacy_task.priority,
                created_at: legacy_task.created_at,
                updated_at: legacy_task.updated_at,
                due_date: legacy_task.due_date,
                tags: legacy_task.tags,
                subtasks: legacy_task.subtasks,
                comments: legacy_task.comments,
                time_spent: legacy_task.time_spent,
                estimated_time: legacy_task.estimated_time,
                attachments: legacy_task.attachments,
            }
        }).collect();

        Ok(RoadmapData {
            tasks,
            projects: vec![default_project],
            current_project_id: Some(1),
            theme: legacy_data.theme,
            version: "1.0.0".to_string(),
        })
    }
}