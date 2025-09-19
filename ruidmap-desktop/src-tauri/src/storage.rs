use crate::models::{RoadmapData, Task, TaskStatus, TaskPriority};
use anyhow::{anyhow, Result};
use serde_json;
use std::fs;
use std::path::{Path, PathBuf};

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
        let data: RoadmapData = serde_json::from_str(&contents)
            .map_err(|e| anyhow!("Failed to parse JSON: {}", e))?;
        
        Ok(data)
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
        
        // Generate new ID (simple incrementing)
        let new_id = data.tasks.iter()
            .map(|t| t.id)
            .max()
            .unwrap_or(0) + 1;
        
        let mut task = Task::new(new_id, title, description);
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
}