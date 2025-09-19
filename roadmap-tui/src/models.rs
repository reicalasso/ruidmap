use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum Priority {
    Low,
    Medium,
    High,
    Critical,
}

impl Priority {
    pub fn as_str(&self) -> &str {
        match self {
            Priority::Low => "Low",
            Priority::Medium => "Medium", 
            Priority::High => "High",
            Priority::Critical => "Critical",
        }
    }

    pub fn color(&self) -> ratatui::style::Color {
        match self {
            Priority::Low => ratatui::style::Color::Green,
            Priority::Medium => ratatui::style::Color::Yellow,
            Priority::High => ratatui::style::Color::Red,
            Priority::Critical => ratatui::style::Color::Magenta,
        }
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum Status {
    NotStarted,
    InProgress,
    Completed,
    Blocked,
}

impl Status {
    pub fn as_str(&self) -> &str {
        match self {
            Status::NotStarted => "Not Started",
            Status::InProgress => "In Progress",
            Status::Completed => "Completed",
            Status::Blocked => "Blocked",
        }
    }

    pub fn icon(&self) -> &str {
        match self {
            Status::NotStarted => "⭕",
            Status::InProgress => "🔄",
            Status::Completed => "✅",
            Status::Blocked => "🚫",
        }
    }

    pub fn color(&self) -> ratatui::style::Color {
        match self {
            Status::NotStarted => ratatui::style::Color::White,
            Status::InProgress => ratatui::style::Color::Blue,
            Status::Completed => ratatui::style::Color::Green,
            Status::Blocked => ratatui::style::Color::Red,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Folder {
    pub id: Uuid,
    pub name: String,
    pub description: String,
    pub expanded: bool,
    pub milestone_ids: Vec<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Folder {
    pub fn new(name: String, description: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            name,
            description,
            expanded: true,
            milestone_ids: Vec::new(),
            created_at: now,
            updated_at: now,
        }
    }

    pub fn add_milestone(&mut self, milestone_id: Uuid) {
        if !self.milestone_ids.contains(&milestone_id) {
            self.milestone_ids.push(milestone_id);
            self.updated_at = Utc::now();
        }
    }

    pub fn remove_milestone(&mut self, milestone_id: Uuid) {
        self.milestone_ids.retain(|&id| id != milestone_id);
        self.updated_at = Utc::now();
    }

    pub fn toggle_expanded(&mut self) {
        self.expanded = !self.expanded;
        self.updated_at = Utc::now();
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Milestone {
    pub id: Uuid,
    pub title: String,
    pub description: String,
    pub priority: Priority,
    pub status: Status,
    pub estimated_hours: Option<u32>,
    pub actual_hours: Option<u32>,
    pub resources: Vec<String>,
    pub tags: Vec<String>,
    pub folder_id: Option<Uuid>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
    pub due_date: Option<DateTime<Utc>>,
    pub completed_at: Option<DateTime<Utc>>,
}

impl Milestone {
    pub fn new(title: String, description: String) -> Self {
        let now = Utc::now();
        Self {
            id: Uuid::new_v4(),
            title,
            description,
            priority: Priority::Medium,
            status: Status::NotStarted,
            estimated_hours: None,
            actual_hours: None,
            resources: Vec::new(),
            tags: Vec::new(),
            folder_id: None,
            created_at: now,
            updated_at: now,
            due_date: None,
            completed_at: None,
        }
    }

    pub fn progress_percentage(&self) -> f64 {
        match self.status {
            Status::NotStarted => 0.0,
            Status::InProgress => 50.0,
            Status::Completed => 100.0,
            Status::Blocked => 25.0,
        }
    }

    pub fn mark_completed(&mut self) {
        self.status = Status::Completed;
        self.completed_at = Some(Utc::now());
        self.updated_at = Utc::now();
    }

    pub fn update_status(&mut self, status: Status) {
        self.status = status;
        self.updated_at = Utc::now();
        
        if matches!(status, Status::Completed) {
            self.completed_at = Some(Utc::now());
        } else {
            self.completed_at = None;
        }
    }

    pub fn assign_to_folder(&mut self, folder_id: Option<Uuid>) {
        self.folder_id = folder_id;
        self.updated_at = Utc::now();
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Roadmap {
    pub title: String,
    pub description: String,
    pub milestones: Vec<Milestone>,
    pub folders: Vec<Folder>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl Roadmap {
    pub fn new(title: String, description: String) -> Self {
        let now = Utc::now();
        Self {
            title,
            description,
            milestones: Vec::new(),
            folders: Vec::new(),
            created_at: now,
            updated_at: now,
        }
    }

    pub fn add_milestone(&mut self, milestone: Milestone) {
        self.milestones.push(milestone);
        self.updated_at = Utc::now();
    }

    pub fn remove_milestone(&mut self, id: Uuid) {
        // Remove from folders first
        for folder in &mut self.folders {
            folder.remove_milestone(id);
        }
        
        self.milestones.retain(|m| m.id != id);
        self.updated_at = Utc::now();
    }

    pub fn get_milestone_mut(&mut self, id: Uuid) -> Option<&mut Milestone> {
        self.milestones.iter_mut().find(|m| m.id == id)
    }

    pub fn add_folder(&mut self, folder: Folder) {
        self.folders.push(folder);
        self.updated_at = Utc::now();
    }

    pub fn remove_folder(&mut self, id: Uuid) {
        // First collect the milestone IDs to avoid borrowing issues
        let milestone_ids: Vec<Uuid> = self.folders
            .iter()
            .find(|f| f.id == id)
            .map(|f| f.milestone_ids.clone())
            .unwrap_or_default();
        
        // Move milestones out of folder
        for milestone_id in milestone_ids {
            if let Some(milestone) = self.get_milestone_mut(milestone_id) {
                milestone.assign_to_folder(None);
            }
        }
        
        self.folders.retain(|f| f.id != id);
        self.updated_at = Utc::now();
    }

    pub fn get_folder_mut(&mut self, id: Uuid) -> Option<&mut Folder> {
        self.folders.iter_mut().find(|f| f.id == id)
    }

    pub fn get_milestones_in_folder(&self, folder_id: Option<Uuid>) -> Vec<&Milestone> {
        self.milestones
            .iter()
            .filter(|m| m.folder_id == folder_id)
            .collect()
    }

    pub fn get_unorganized_milestones(&self) -> Vec<&Milestone> {
        self.get_milestones_in_folder(None)
    }

    pub fn overall_progress(&self) -> f64 {
        if self.milestones.is_empty() {
            return 0.0;
        }

        let total_progress: f64 = self.milestones
            .iter()
            .map(|m| m.progress_percentage())
            .sum();

        total_progress / self.milestones.len() as f64
    }

    pub fn completed_count(&self) -> usize {
        self.milestones
            .iter()
            .filter(|m| matches!(m.status, Status::Completed))
            .count()
    }

    pub fn in_progress_count(&self) -> usize {
        self.milestones
            .iter()
            .filter(|m| matches!(m.status, Status::InProgress))
            .count()
    }

    pub fn pending_count(&self) -> usize {
        self.milestones
            .iter()
            .filter(|m| matches!(m.status, Status::NotStarted))
            .count()
    }

    pub fn blocked_count(&self) -> usize {
        self.milestones
            .iter()
            .filter(|m| matches!(m.status, Status::Blocked))
            .count()
    }
}