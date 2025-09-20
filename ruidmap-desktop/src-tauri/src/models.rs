use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct Task {
    pub id: u32,
    pub project_id: u32,
    pub title: String,
    pub description: String,
    pub status: TaskStatus,
    pub priority: TaskPriority,
    pub created_at: String,
    pub updated_at: String,
    pub due_date: Option<String>,
    pub tags: Vec<String>,
    pub subtasks: Vec<Subtask>,
    pub comments: Vec<Comment>,
    pub time_spent: u32, // minutes
    pub estimated_time: Option<u32>, // minutes
    pub attachments: Vec<Attachment>,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "kebab-case")]
pub enum TaskStatus {
    Todo,
    InProgress,
    Done,
}

impl fmt::Display for TaskStatus {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            TaskStatus::Todo => write!(f, "todo"),
            TaskStatus::InProgress => write!(f, "in-progress"),
            TaskStatus::Done => write!(f, "done"),
        }
    }
}

impl From<&str> for TaskStatus {
    fn from(s: &str) -> Self {
        match s {
            "in-progress" => TaskStatus::InProgress,
            "done" => TaskStatus::Done,
            _ => TaskStatus::Todo,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum TaskPriority {
    Low,
    Medium,
    High,
}

impl fmt::Display for TaskPriority {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            TaskPriority::Low => write!(f, "low"),
            TaskPriority::Medium => write!(f, "medium"),
            TaskPriority::High => write!(f, "high"),
        }
    }
}

impl From<&str> for TaskPriority {
    fn from(s: &str) -> Self {
        match s {
            "medium" => TaskPriority::Medium,
            "high" => TaskPriority::High,
            _ => TaskPriority::Low,
        }
    }
}

impl Task {
    pub fn new(id: u32, project_id: u32, title: String, description: String) -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Task {
            id,
            project_id,
            title,
            description,
            status: TaskStatus::Todo,
            priority: TaskPriority::Medium,
            created_at: now.clone(),
            updated_at: now,
            due_date: None,
            tags: Vec::new(),
            subtasks: Vec::new(),
            comments: Vec::new(),
            time_spent: 0,
            estimated_time: None,
            attachments: Vec::new(),
        }
    }

    pub fn update_status(&mut self, status: TaskStatus) {
        self.status = status;
        self.updated_at = chrono::Utc::now().to_rfc3339();
    }

    pub fn update_priority(&mut self, priority: TaskPriority) {
        self.priority = priority;
        self.updated_at = chrono::Utc::now().to_rfc3339();
    }

    pub fn update_content(&mut self, title: String, description: String) {
        self.title = title;
        self.description = description;
        self.updated_at = chrono::Utc::now().to_rfc3339();
    }

    pub fn set_due_date(&mut self, due_date: Option<String>) {
        self.due_date = due_date;
        self.updated_at = chrono::Utc::now().to_rfc3339();
    }

    pub fn add_tag(&mut self, tag: String) {
        if !self.tags.contains(&tag) {
            self.tags.push(tag);
            self.updated_at = chrono::Utc::now().to_rfc3339();
        }
    }

    pub fn remove_tag(&mut self, tag: &str) {
        self.tags.retain(|t| t != tag);
        self.updated_at = chrono::Utc::now().to_rfc3339();
    }

    pub fn add_subtask(&mut self, id: u32, title: String) {
        let subtask = Subtask {
            id,
            title,
            completed: false,
            created_at: chrono::Utc::now().to_rfc3339(),
        };
        self.subtasks.push(subtask);
        self.updated_at = chrono::Utc::now().to_rfc3339();
    }

    pub fn toggle_subtask(&mut self, subtask_id: u32) {
        if let Some(subtask) = self.subtasks.iter_mut().find(|s| s.id == subtask_id) {
            subtask.completed = !subtask.completed;
            self.updated_at = chrono::Utc::now().to_rfc3339();
        }
    }

    pub fn add_comment(&mut self, id: u32, text: String, author: String) {
        let comment = Comment {
            id,
            text,
            author,
            created_at: chrono::Utc::now().to_rfc3339(),
        };
        self.comments.push(comment);
        self.updated_at = chrono::Utc::now().to_rfc3339();
    }

    pub fn add_time(&mut self, minutes: u32) {
        self.time_spent += minutes;
        self.updated_at = chrono::Utc::now().to_rfc3339();
    }

    pub fn set_estimated_time(&mut self, minutes: Option<u32>) {
        self.estimated_time = minutes;
        self.updated_at = chrono::Utc::now().to_rfc3339();
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct Project {
    pub id: u32,
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>, // Hex color for UI
    pub icon: Option<String>, // Emoji or icon identifier
    pub created_at: String,
    pub updated_at: String,
    pub is_active: bool,
    pub task_count: u32,
    pub settings: ProjectSettings,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct ProjectSettings {
    pub task_template: Option<TaskTemplate>,
    pub default_priority: TaskPriority,
    pub auto_archive_done: bool,
    pub show_completed_tasks: bool,
    pub default_tags: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct TaskTemplate {
    pub title_prefix: Option<String>,
    pub default_description: Option<String>,
    pub default_tags: Vec<String>,
    pub default_estimated_time: Option<u32>, // minutes
}

impl Project {
    pub fn new(id: u32, name: String) -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Project {
            id,
            name,
            description: None,
            color: None,
            icon: None,
            created_at: now.clone(),
            updated_at: now,
            is_active: true,
            task_count: 0,
            settings: ProjectSettings::default(),
        }
    }

    pub fn new_with_details(id: u32, name: String, description: String, color: Option<String>, icon: Option<String>) -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Project {
            id,
            name,
            description: if description.is_empty() { None } else { Some(description) },
            color,
            icon,
            created_at: now.clone(),
            updated_at: now,
            is_active: true,
            task_count: 0,
            settings: ProjectSettings::default(),
        }
    }

    pub fn update_info(&mut self, name: Option<String>, description: Option<String>, color: Option<String>, icon: Option<String>) {
        if let Some(name) = name {
            self.name = name;
        }
        if let Some(description) = description {
            self.description = Some(description);
        }
        if let Some(color) = color {
            self.color = Some(color);
        }
        if let Some(icon) = icon {
            self.icon = Some(icon);
        }
        self.updated_at = chrono::Utc::now().to_rfc3339();
    }

    pub fn update_task_count(&mut self, count: u32) {
        self.task_count = count;
        self.updated_at = chrono::Utc::now().to_rfc3339();
    }

    pub fn toggle_active(&mut self) {
        self.is_active = !self.is_active;
        self.updated_at = chrono::Utc::now().to_rfc3339();
    }
}

impl Default for ProjectSettings {
    fn default() -> Self {
        ProjectSettings {
            task_template: None,
            default_priority: TaskPriority::Medium,
            auto_archive_done: false,
            show_completed_tasks: true,
            default_tags: Vec::new(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RoadmapData {
    pub tasks: Vec<Task>,
    pub projects: Vec<Project>,
    pub current_project_id: Option<u32>,
    pub theme: Option<String>,
    pub version: String,
}

impl Default for RoadmapData {
    fn default() -> Self {
        // Create default project
        let default_project = Project::new(1, "Default Project".to_string());
        
        RoadmapData {
            tasks: Vec::new(),
            projects: vec![default_project],
            current_project_id: Some(1),
            theme: Some("light".to_string()),
            version: "1.0.0".to_string(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TaskCreateRequest {
    pub title: String,
    pub description: String,
    pub project_id: Option<u32>, // If None, use current project
    pub priority: Option<TaskPriority>,
    pub due_date: Option<String>,
    pub tags: Option<Vec<String>>,
    pub estimated_time: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TaskUpdateRequest {
    pub id: u32,
    pub title: Option<String>,
    pub description: Option<String>,
    pub status: Option<TaskStatus>,
    pub priority: Option<TaskPriority>,
    pub due_date: Option<Option<String>>,
    pub tags: Option<Vec<String>>,
    pub estimated_time: Option<Option<u32>>,
}

// New structs for advanced features
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct Subtask {
    pub id: u32,
    pub title: String,
    pub completed: bool,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct Comment {
    pub id: u32,
    pub text: String,
    pub author: String, // For future user system
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct Attachment {
    pub id: u32,
    pub filename: String,
    pub file_path: String,
    pub file_size: u64,
    pub mime_type: String,
    pub created_at: String,
}

// Project Request Models
#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectCreateRequest {
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub icon: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectUpdateRequest {
    pub id: u32,
    pub name: Option<String>,
    pub description: Option<String>,
    pub color: Option<String>,
    pub icon: Option<String>,
    pub settings: Option<ProjectSettings>,
}