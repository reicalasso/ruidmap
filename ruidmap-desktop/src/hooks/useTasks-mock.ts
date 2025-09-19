import { useState, useEffect, useCallback } from 'react';
import { Task, TaskCreateRequest, TaskUpdateRequest, TaskStats, TaskStatus, Theme } from '../types';

// Mock data for demonstration
const mockTasks: Task[] = [
  {
    id: 1,
    title: "Setup Project Architecture",
    description: "Create the basic structure for RuidMap with React + Tauri setup, including component organization and build configuration.",
    status: "done",
    priority: "high",
    created_at: "2025-09-20T01:00:00.000Z",
    updated_at: "2025-09-20T01:30:00.000Z"
  },
  {
    id: 2,
    title: "Implement ASCII Art Banner",
    description: "Design and implement the animated ASCII art banner with typing effects and sparkle animations using Framer Motion.",
    status: "done",
    priority: "medium",
    created_at: "2025-09-20T01:15:00.000Z",
    updated_at: "2025-09-20T01:45:00.000Z"
  },
  {
    id: 3,
    title: "Build Task Management System",
    description: "Create the core task CRUD operations with status tracking (todo/in-progress/done) and priority levels.",
    status: "in-progress",
    priority: "high",
    created_at: "2025-09-20T01:30:00.000Z",
    updated_at: "2025-09-20T02:00:00.000Z"
  },
  {
    id: 4,
    title: "Add Theme Support",
    description: "Implement light/dark/custom theme switching with persistent storage and smooth transitions.",
    status: "in-progress",
    priority: "medium",
    created_at: "2025-09-20T01:45:00.000Z",
    updated_at: "2025-09-20T02:15:00.000Z"
  },
  {
    id: 5,
    title: "Create Kanban Board Layout",
    description: "Design and implement the three-column kanban layout with drag-and-drop functionality for task organization.",
    status: "todo",
    priority: "medium",
    created_at: "2025-09-20T02:00:00.000Z",
    updated_at: "2025-09-20T02:00:00.000Z"
  },
  {
    id: 6,
    title: "Add Keyboard Shortcuts",
    description: "Implement keyboard shortcuts: Enter (add task), Del (delete task), Space (toggle status) for improved productivity.",
    status: "todo",
    priority: "low",
    created_at: "2025-09-20T02:15:00.000Z",
    updated_at: "2025-09-20T02:15:00.000Z"
  }
];

export const useTasks = () => {
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
  const [nextId, setNextId] = useState(7);

  // Calculate stats from tasks
  const calculateStats = useCallback((tasks: Task[]): TaskStats => {
    const total = tasks.length;
    const todo = tasks.filter(t => t.status === 'todo').length;
    const in_progress = tasks.filter(t => t.status === 'in-progress').length;
    const done = tasks.filter(t => t.status === 'done').length;
    const progress_percentage = total > 0 ? (done / total) * 100 : 0;

    return { total, todo, in_progress, done, progress_percentage };
  }, []);

  // Load initial mock data
  useEffect(() => {
    // Simulate loading delay
    setLoading(true);
    setTimeout(() => {
      setTasks(mockTasks);
      setStats(calculateStats(mockTasks));
      setLoading(false);
    }, 1000);
  }, [calculateStats]);

  // Update stats when tasks change
  useEffect(() => {
    setStats(calculateStats(tasks));
  }, [tasks, calculateStats]);

  // Add new task
  const addTask = useCallback(async (request: TaskCreateRequest) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const newTask: Task = {
        id: nextId,
        title: request.title,
        description: request.description,
        status: 'todo',
        priority: request.priority || 'medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setTasks(prev => [...prev, newTask]);
      setNextId(prev => prev + 1);
    } catch (err) {
      console.error('Error adding task:', err);
      setError(err as string);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [nextId]);

  // Update existing task
  const updateTask = useCallback(async (request: TaskUpdateRequest) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      setTasks(prev => prev.map(task => 
        task.id === request.id 
          ? { 
              ...task, 
              ...(request.title && { title: request.title }),
              ...(request.description !== undefined && { description: request.description }),
              ...(request.status && { status: request.status }),
              ...(request.priority && { priority: request.priority }),
              updated_at: new Date().toISOString()
            }
          : task
      ));
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err as string);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete task
  const deleteTask = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err as string);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle task status (quick action)
  const toggleTaskStatus = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200));

      setTasks(prev => prev.map(task => {
        if (task.id === id) {
          let newStatus: TaskStatus;
          switch (task.status) {
            case 'todo':
              newStatus = 'in-progress';
              break;
            case 'in-progress':
              newStatus = 'done';
              break;
            case 'done':
              newStatus = 'todo';
              break;
            default:
              newStatus = 'todo';
          }

          return {
            ...task,
            status: newStatus,
            updated_at: new Date().toISOString()
          };
        }
        return task;
      }));
    } catch (err) {
      console.error('Error toggling task status:', err);
      setError(err as string);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Change task status to specific value
  const changeTaskStatus = useCallback(async (id: number, status: TaskStatus) => {
    const request: TaskUpdateRequest = { id, status };
    await updateTask(request);
  }, [updateTask]);

  // Refresh/reload tasks
  const refresh = useCallback(async () => {
    setLoading(true);
    // Simulate reload
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

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
    refresh
  };
};

export const useTheme = () => {
  const [currentTheme, setCurrentTheme] = useState<Theme>('light');
  const [loading, setLoading] = useState(false);

  // Load theme from localStorage
  const loadTheme = useCallback(async () => {
    try {
      setLoading(true);
      const saved = localStorage.getItem('ruidmap-theme') as Theme;
      if (saved && ['light', 'dark', 'custom'].includes(saved)) {
        setCurrentTheme(saved);
      }
    } catch (err) {
      console.error('Error loading theme:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save theme to localStorage
  const saveTheme = useCallback(async (theme: Theme) => {
    try {
      setLoading(true);
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