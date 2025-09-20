export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
  due_date?: string;
  tags: string[];
  subtasks: Subtask[];
  comments: Comment[];
  time_spent: number; // minutes
  estimated_time?: number; // minutes
  attachments: Attachment[];
}

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskCreateRequest {
  title: string;
  description: string;
  priority?: TaskPriority;
  project_id?: number;
  due_date?: string;
  tags?: string[];
  estimated_time?: number;
}

export interface TaskUpdateRequest {
  id: number;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  tags?: string[];
  estimated_time?: number | null;
}

// New interfaces for advanced features
export interface Subtask {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface Comment {
  id: number;
  text: string;
  author: string;
  created_at: string;
}

export interface Attachment {
  id: number;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface TaskStats {
  total: number;
  todo: number;
  in_progress: number;
  done: number;
  progress_percentage: number;
}

export type Theme = 'light' | 'dark' | 'custom';

export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
  };
}

// Project Management Types

export interface Project {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  task_count: number;
  settings: ProjectSettings;
}

export interface ProjectSettings {
  task_templates: TaskTemplate[];
  default_priority: TaskPriority;
  auto_archive_completed: boolean;
  default_description?: string;
  default_tags: string[];
  default_estimated_time?: number; // minutes
}

export interface TaskTemplate {
  id: number;
  name: string;
  title_template: string;
  description_template: string;
  default_priority: TaskPriority;
  default_tags: string[];
  default_estimated_time?: number; // minutes
}

export interface ProjectCreateRequest {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface ProjectUpdateRequest {
  id: number;
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface ProjectStats {
  project_id: number;
  total_tasks: number;
  todo_tasks: number;
  in_progress_tasks: number;
  done_tasks: number;
  progress_percentage: number;
}