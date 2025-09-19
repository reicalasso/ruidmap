use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct Task {
    pub id: u32,
    pub title: String,
    pub description: String,
    pub status: TaskStatus,
    pub priority: TaskPriority,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "lowercase")]
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
    pub fn new(id: u32, title: String, description: String) -> Self {
        let now = chrono::Utc::now().to_rfc3339();
        Task {
            id,
            title,
            description,
            status: TaskStatus::Todo,
            priority: TaskPriority::Medium,
            created_at: now.clone(),
            updated_at: now,
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
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RoadmapData {
    pub tasks: Vec<Task>,
    pub theme: Option<String>,
    pub version: String,
}

impl Default for RoadmapData {
    fn default() -> Self {
        RoadmapData {
            tasks: Vec::new(),
            theme: Some("light".to_string()),
            version: "1.0.0".to_string(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TaskCreateRequest {
    pub title: String,
    pub description: String,
    pub priority: Option<TaskPriority>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TaskUpdateRequest {
    pub id: u32,
    pub title: Option<String>,
    pub description: Option<String>,
    pub status: Option<TaskStatus>,
    pub priority: Option<TaskPriority>,
}