use crate::models::{Roadmap, Milestone};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

// Old roadmap format for backward compatibility
#[derive(Debug, Clone, Serialize, Deserialize)]
struct OldRoadmap {
    pub title: String,
    pub description: String,
    pub milestones: Vec<Milestone>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub struct Storage {
    file_path: String,
}

impl Storage {
    pub fn new(file_path: String) -> Self {
        Self { file_path }
    }

    pub fn save_roadmap(&self, roadmap: &Roadmap) -> Result<(), Box<dyn std::error::Error>> {
        let json = serde_json::to_string_pretty(roadmap)?;
        
        // Create directory if it doesn't exist
        if let Some(parent) = Path::new(&self.file_path).parent() {
            fs::create_dir_all(parent)?;
        }
        
        fs::write(&self.file_path, json)?;
        Ok(())
    }

    pub fn load_roadmap(&self) -> Result<Roadmap, Box<dyn std::error::Error>> {
        if !Path::new(&self.file_path).exists() {
            // Create a default roadmap if file doesn't exist
            let roadmap = Roadmap::new(
                "My Learning Roadmap".to_string(),
                "A journey of continuous learning and growth".to_string(),
            );
            self.save_roadmap(&roadmap)?;
            return Ok(roadmap);
        }

        let content = fs::read_to_string(&self.file_path)?;
        
        // Try to parse as the new format first
        match serde_json::from_str::<Roadmap>(&content) {
            Ok(roadmap) => Ok(roadmap),
            Err(_) => {
                // If that fails, try to parse as old format and migrate
                match serde_json::from_str::<OldRoadmap>(&content) {
                    Ok(old_roadmap) => {
                        let migrated = Roadmap {
                            title: old_roadmap.title,
                            description: old_roadmap.description,
                            milestones: old_roadmap.milestones.into_iter().map(|mut m| {
                                m.folder_id = None; // Old milestones don't have folder assignments
                                m
                            }).collect(),
                            folders: Vec::new(), // No folders in old format
                            created_at: old_roadmap.created_at,
                            updated_at: old_roadmap.updated_at,
                        };
                        // Save the migrated version
                        self.save_roadmap(&migrated)?;
                        Ok(migrated)
                    }
                    Err(e) => Err(format!("Failed to parse roadmap file: {}", e).into()),
                }
            }
        }
    }

    pub fn backup_roadmap(&self) -> Result<(), Box<dyn std::error::Error>> {
        let backup_path = format!("{}.backup", self.file_path);
        if Path::new(&self.file_path).exists() {
            fs::copy(&self.file_path, backup_path)?;
        }
        Ok(())
    }
}