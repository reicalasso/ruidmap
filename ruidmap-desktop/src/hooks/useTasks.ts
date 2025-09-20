import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Task, TaskCreateRequest, TaskUpdateRequest, TaskStats, TaskStatus, Theme, ProjectStats } from '../types';

export const useTasks = (projectId?: number) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    todo: 0,
    in_progress: 0,
    done: 0,
    progress_percentage: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load tasks from backend - filtered by project if provided
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let tasksData: Task[];
      if (projectId) {
        tasksData = await invoke<Task[]>('get_tasks_by_project', { projectId });
      } else {
        tasksData = await invoke<Task[]>('get_tasks');
      }
      
      setTasks(tasksData);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(err as string);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  // Load task statistics - use project stats if projectId provided
  const loadStats = useCallback(async () => {
    try {
      if (projectId) {
        const statsData = await invoke<ProjectStats>('get_project_stats', { projectId });
        setStats({
          total: statsData.total_tasks,
          todo: statsData.todo_tasks,
          in_progress: statsData.in_progress_tasks,
          done: statsData.done_tasks,
          progress_percentage: statsData.progress_percentage
        });
      } else {
        const statsData = await invoke<TaskStats>('get_task_stats');
        setStats(statsData);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, [projectId]);

  // Add new task
  const addTask = useCallback(async (request: TaskCreateRequest) => {
    try {
      setLoading(true);
      setError(null);
      const newTask = await invoke<Task>('add_task', { request });
      setTasks(prev => [...prev, newTask]);
      await loadStats();
    } catch (err) {
      console.error('Error adding task:', err);
      setError(err as string);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  // Update existing task
  const updateTask = useCallback(async (request: TaskUpdateRequest) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await invoke<Task>('update_task', { request });
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
      await loadStats();
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err as string);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  // Delete task
  const deleteTask = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await invoke('delete_task', { id });
      setTasks(prev => prev.filter(task => task.id !== id));
      await loadStats();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err as string);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  // Toggle task status (quick action)
  const toggleTaskStatus = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await invoke<Task>('toggle_task_status', { id });
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
      await loadStats();
    } catch (err) {
      console.error('Error toggling task status:', err);
      setError(err as string);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadStats]);

  // Change task status to specific value
  const changeTaskStatus = useCallback(async (id: number, status: TaskStatus) => {
    const request: TaskUpdateRequest = { id, status };
    await updateTask(request);
  }, [updateTask]);

  // Advanced Task Features
  const addTaskTag = useCallback(async (taskId: number, tag: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await invoke<Task>('add_task_tag', { taskId, tag });
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
    } catch (err) {
      console.error('Error adding task tag:', err);
      setError(err as string);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeTaskTag = useCallback(async (taskId: number, tag: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await invoke<Task>('remove_task_tag', { taskId, tag });
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
    } catch (err) {
      console.error('Error removing task tag:', err);
      setError(err as string);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const setTaskDueDate = useCallback(async (taskId: number, dueDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await invoke<Task>('set_task_due_date', { taskId, dueDate });
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
    } catch (err) {
      console.error('Error setting task due date:', err);
      setError(err as string);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addTaskSubtask = useCallback(async (taskId: number, subtaskTitle: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await invoke<Task>('add_task_subtask', { taskId, subtaskTitle });
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
    } catch (err) {
      console.error('Error adding task subtask:', err);
      setError(err as string);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleTaskSubtask = useCallback(async (taskId: number, subtaskId: number) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await invoke<Task>('toggle_task_subtask', { taskId, subtaskId });
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
    } catch (err) {
      console.error('Error toggling task subtask:', err);
      setError(err as string);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addTaskComment = useCallback(async (taskId: number, commentText: string, author: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await invoke<Task>('add_task_comment', { taskId, commentText, author });
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
    } catch (err) {
      console.error('Error adding task comment:', err);
      setError(err as string);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addTaskTime = useCallback(async (taskId: number, minutes: number) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await invoke<Task>('add_task_time', { taskId, minutes });
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
    } catch (err) {
      console.error('Error adding task time:', err);
      setError(err as string);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const setTaskEstimatedTime = useCallback(async (taskId: number, estimatedMinutes?: number) => {
    try {
      setLoading(true);
      setError(null);
      const updatedTask = await invoke<Task>('set_task_estimated_time', { taskId, estimatedMinutes });
      setTasks(prev => prev.map(task => 
        task.id === updatedTask.id ? updatedTask : task
      ));
    } catch (err) {
      console.error('Error setting task estimated time:', err);
      setError(err as string);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllTags = useCallback(async () => {
    try {
      const tags = await invoke<string[]>('get_all_tags');
      return tags;
    } catch (err) {
      console.error('Error getting all tags:', err);
      return [];
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    loadTasks();
    loadStats();
  }, [loadTasks, loadStats]);

  return {
    tasks,
    stats,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    changeTaskStatus,
    refresh: loadTasks,
    // Advanced features
    addTaskTag,
    removeTaskTag,
    setTaskDueDate,
    addTaskSubtask,
    toggleTaskSubtask,
    addTaskComment,
    addTaskTime,
    setTaskEstimatedTime,
    getAllTags
  };
};

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>('light');
  const [loading, setLoading] = useState(false);

  // Load theme from backend
  const loadTheme = useCallback(async () => {
    try {
      setLoading(true);
      const theme = await invoke<string>('get_theme');
      setCurrentTheme(theme as Theme);
    } catch (err) {
      console.error('Error loading theme:', err);
      // Fallback to localStorage
      const saved = localStorage.getItem('ruidmap-theme') as Theme;
      if (saved && ['light', 'dark', 'custom'].includes(saved)) {
        setCurrentTheme(saved);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Save theme to backend and localStorage
  const saveTheme = useCallback(async (theme: Theme) => {
    try {
      setLoading(true);
      await invoke('set_theme', { theme });
      localStorage.setItem('ruidmap-theme', theme);
      setCurrentTheme(theme);
      
      // Apply theme to document
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } catch (err) {
      console.error('Error saving theme:', err);
      // Still save locally even if backend fails
      localStorage.setItem('ruidmap-theme', theme);
      setCurrentTheme(theme);
      
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    loadTheme();
  }, [loadTheme]);

  // Apply theme changes to document
  useEffect(() => {
    const root = document.documentElement;
    if (currentTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [currentTheme]);

  return {
    currentTheme,
    loading,
    setTheme: saveTheme
  };
};

export const useKeyboardShortcuts = (callbacks: {
  onAddTask: () => void;
  onDeleteTask?: () => void;
  onToggleStatus?: () => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if not typing in an input
      if (event.target instanceof HTMLInputElement || 
          event.target instanceof HTMLTextAreaElement ||
          event.target instanceof HTMLSelectElement) {
        return;
      }

      switch (event.key) {
        case 'Enter':
          event.preventDefault();
          callbacks.onAddTask();
          break;
        case 'Delete':
          if (callbacks.onDeleteTask) {
            event.preventDefault();
            callbacks.onDeleteTask();
          }
          break;
        case ' ': // Space
          if (callbacks.onToggleStatus) {
            event.preventDefault();
            callbacks.onToggleStatus();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [callbacks]);
};