export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskCreateRequest {
  title: string;
  description: string;
  priority?: TaskPriority;
}

export interface TaskUpdateRequest {
  id: number;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
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