import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./App.css";

// Components

import TaskList from "./components/TaskList";
import TaskDetail from "./components/TaskDetail";

import { ProjectSelector } from "./components/ProjectSelector";
import { ProjectManagementDialog } from "./components/ProjectManagementDialog";
import { DataManagement } from "./components/DataManagement";

// UI Components
import { FloatingActionButton } from "./components/ui/FloatingActionButton";
import { KeyboardShortcutsOverlay } from "./components/ui/KeyboardShortcuts";
import { NotificationContainer } from "./components/ui";
import { AnimatedButton } from "./components/ui/AnimatedButton";

// Hooks
import { useTasks, useTheme, useKeyboardShortcuts } from "./hooks/useTasks";
import { useProjectManagement } from "./hooks/useProjectManagement";
import { useResponsive } from "./providers/ResponsiveProvider";
import { useNotifications } from "./providers/NotificationProvider";
import { useAccessibility } from "./providers/AccessibilityProvider";

// Types
import { Task, Project } from "./types";

function App() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isProjectManagementOpen, setIsProjectManagementOpen] = useState(false);
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  
  // New UI/UX hooks
  const { isMobile } = useResponsive();
  const { addNotification } = useNotifications();
  const { settings } = useAccessibility();
  
  // Project management hook
  const { currentProject, switchProject } = useProjectManagement();
  
  // Custom hooks - pass current project ID to filter tasks
  const { 
    tasks, 
    stats, 
    loading, 
    error, 
    addTask, 
    updateTask, 
    deleteTask, 
    changeTaskStatus,
    refresh: refreshTasks,
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
  } = useTasks(currentProject?.id);
  
  const { currentTheme, setTheme } = useTheme();

  // Theme management
  const themes: { value: string; label: string; icon: string; description: string; gradient: string }[] = [
    { 
      value: 'light', 
      label: 'Light Mode', 
      icon: '☀️', 
      description: 'Clean & bright',
      gradient: 'from-yellow-200 to-orange-200'
    },
    { 
      value: 'dark', 
      label: 'Dark Mode', 
      icon: '🌙', 
      description: 'Easy on eyes',
      gradient: 'from-gray-700 to-blue-900'
    },
    { 
      value: 'custom', 
      label: 'Custom Theme', 
      icon: '🎨', 
      description: 'Your style',
      gradient: 'from-purple-400 to-pink-400'
    }
  ];

  const getThemeIcon = (theme: string) => {
    const themeObj = themes.find(t => t.value === theme);
    return themeObj ? themeObj.icon : '🎨';
  };

  const getCurrentTheme = () => {
    return themes.find(t => t.value === currentTheme) || themes[0];
  };

  // Close theme dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Refresh tasks when project changes
  useEffect(() => {
    if (currentProject) {
      refreshTasks();
    }
  }, [currentProject, refreshTasks]);

  // Handlers
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsTaskDetailOpen(true);
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (selectedTask) {
        // Update existing task
        await updateTask({
          id: selectedTask.id,
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority
        });
        addNotification({
          title: 'Task Updated',
          message: `"${taskData.title}" has been updated successfully`,
          type: 'success'
        });
      } else {
        // Create new task
        await addTask({
          title: taskData.title!,
          description: taskData.description || '',
          priority: taskData.priority,
          project_id: currentProject?.id
        });
        addNotification({
          title: 'Task Created',
          message: `"${taskData.title}" has been created successfully`,
          type: 'success'
        });
      }
    } catch (err) {
      console.error('Error saving task:', err);
      addNotification({
        title: 'Error',
        message: 'Failed to save task. Please try again.',
        type: 'error'
      });
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);
      addNotification({
        title: 'Task Deleted',
        message: 'Task has been deleted successfully',
        type: 'success'
      });
    } catch (err) {
      console.error('Error deleting task:', err);
      addNotification({
        title: 'Error',
        message: 'Failed to delete task. Please try again.',
        type: 'error'
      });
    }
  };

  const handleStatusChange = async (id: number, status: any) => {
    try {
      await changeTaskStatus(id, status);
    } catch (err) {
      console.error('Error changing task status:', err);
    }
  };

  const handleCloseTaskDetail = () => {
    setIsTaskDetailOpen(false);
    setSelectedTask(null);
  };

    const handleThemeChange = (theme: string) => {
    setTheme(theme);
  };

  const handleProjectChange = async (project: Project) => {
    await switchProject(project.id);
  };

  const handleOpenProjectManagement = () => {
    setIsProjectManagementOpen(true);
  };

  const handleDataChanged = () => {
    refreshTasks();
    setIsDataManagementOpen(false);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onAddTask: handleAddTask,
    // We could add more shortcuts here for selected tasks
  });

  // Define keyboard shortcuts for overlay
  const shortcuts = [
    { id: 'add-task', keys: ['Ctrl', 'N'], description: 'Add new task', category: 'Tasks', action: handleAddTask },
    { id: 'save-task', keys: ['Ctrl', 'S'], description: 'Save current task', category: 'Tasks', action: () => {} },
    { id: 'close-dialog', keys: ['Escape'], description: 'Close dialog', category: 'General', action: () => setIsTaskDetailOpen(false) },
    { id: 'show-shortcuts', keys: ['Ctrl', '?'], description: 'Show shortcuts', category: 'General', action: () => setIsKeyboardShortcutsOpen(true) },
  ];

  // Theme mapping to CSS classes
  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'cyberpunk':
        return 'bg-gray-900 text-cyan-400 border-cyan-500';
      case 'nature':
        return 'bg-green-50 text-green-900 border-green-300';
      case 'sunset':
        return 'bg-orange-50 text-orange-900 border-orange-300';
      case 'custom':
        return 'bg-purple-50 text-purple-900 border-purple-300';
      case 'dark':
        return 'dark bg-gray-900 text-white border-gray-700';
      default: // light
        return 'bg-gray-50 text-gray-900 border-gray-200';
    }
  };

  return (
    <div 
      className={`
        h-screen transition-all duration-500 grid grid-rows-[auto_1fr_auto]
        ${getThemeClasses(currentTheme)}
        ${settings.contrast === 'high' ? 'contrast-more' : ''}
        ${settings.reducedMotion ? 'motion-reduce' : ''}
      `}
      style={{ 
        fontSize: settings.fontSize === 'large' ? '1.1em' : 
                 settings.fontSize === 'extra-large' ? '1.2em' : '1em'
      }}
    >
      {/* Enhanced Header with Better Layout */}
      <motion.header 
        className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Main Header Content */}
        <div className="px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Left Section - Branding & Project */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Logo/Branding Area */}
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-white font-bold text-lg">R</span>
                </motion.div>
                <div className="hidden md:block">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    RuidMap
                  </h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    Task Management v0.2.2
                  </p>
                </div>
              </div>

              {/* Project Selector with Enhanced Design */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  Project:
                </span>
                <ProjectSelector
                  currentProject={currentProject}
                  onProjectChange={handleProjectChange}
                />
              </div>
            </div>

            {/* Right Section - Action Buttons & Theme */}
            <div className="flex items-center justify-end gap-2">
              {/* Quick Stats Preview */}
              <div className="hidden xl:flex items-center gap-2 mr-4 px-3 py-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  <span className="text-gray-600 dark:text-gray-300 font-mono">{stats.todo}</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                  <span className="text-gray-600 dark:text-gray-300 font-mono">{stats.in_progress}</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span className="text-gray-600 dark:text-gray-300 font-mono">{stats.done}</span>
                </div>
              </div>

              {/* Theme Dropdown */}
              <div className="relative mr-2" ref={themeDropdownRef}>
                <motion.button
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm transition-all border border-gray-200 dark:border-gray-600"
                  onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-base">{getThemeIcon(currentTheme)}</span>
                  <span className="hidden sm:inline font-medium">{getCurrentTheme().label}</span>
                  <motion.span
                    className="text-xs text-gray-400"
                    animate={{ rotate: isThemeDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    ▼
                  </motion.span>
                </motion.button>

                {/* Theme Dropdown Menu */}
                <AnimatePresence>
                  {isThemeDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                    >
                      <div className="p-1">
                        {themes.map((theme, index) => (
                          <motion.button
                            key={theme.value}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => {
                              handleThemeChange(theme.value);
                              setIsThemeDropdownOpen(false);
                            }}
                            className={`
                              w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all text-left
                              ${currentTheme === theme.value 
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                                : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }
                            `}
                            whileHover={{ x: 2 }}
                          >
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${theme.gradient} flex items-center justify-center text-xs`}>
                              {theme.icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{theme.label}</div>
                              <div className="text-xs opacity-70">{theme.description}</div>
                            </div>
                            {currentTheme === theme.value && (
                              <span className="text-blue-500 text-sm">✓</span>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons with Tooltips */}
              <div className="flex items-center gap-1">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <AnimatedButton
                    onClick={handleOpenProjectManagement}
                    variant="ghost"
                    size="sm"
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </AnimatedButton>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <AnimatedButton
                    onClick={() => setIsDataManagementOpen(true)}
                    variant="ghost"
                    size="sm"
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                  </AnimatedButton>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <AnimatedButton
                    onClick={() => setIsKeyboardShortcutsOpen(true)}
                    variant="ghost"
                    size="sm"
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </AnimatedButton>
                </motion.div>

                {/* Add Task Button - Mobile Visible */}
                {isMobile && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <AnimatedButton
                      onClick={handleAddTask}
                      variant="primary"
                      size="sm"
                      className="ml-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="hidden sm:inline ml-1">Add</span>
                    </AnimatedButton>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>

       
      </motion.header>

      {/* Main Task Area */}
      <main className="overflow-hidden">
        <motion.div 
          className="h-full p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
            {/* Error Display */}
            {error && (
              <motion.div 
                className="mb-4 p-4 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded-lg font-mono text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                ⚠️ Error: {error}
              </motion.div>
            )}

            {/* Loading State */}
            {loading && (
              <motion.div 
                className="mb-4 p-4 bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 rounded-lg font-mono text-sm text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    ⚙️
                  </motion.div>
                  Loading tasks...
                </div>
              </motion.div>
            )}

            {/* Task List */}
            <TaskList
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onTaskDelete={handleDeleteTask}
              onTaskStatusChange={handleStatusChange}
              className="h-full"
            />
        </motion.div>
      </main>

      {/* Task Detail Modal */}
      <TaskDetail
        task={selectedTask}
        isOpen={isTaskDetailOpen}
        onClose={handleCloseTaskDetail}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        onAddTag={addTaskTag}
        onRemoveTag={removeTaskTag}
        onSetDueDate={setTaskDueDate}
        onAddSubtask={addTaskSubtask}
        onToggleSubtask={toggleTaskSubtask}
        onAddComment={addTaskComment}
        onAddTime={addTaskTime}
        onSetEstimatedTime={setTaskEstimatedTime}
        getAllTags={getAllTags}
      />

      {/* Project Management Modal */}
      <ProjectManagementDialog
        isOpen={isProjectManagementOpen}
        onClose={() => setIsProjectManagementOpen(false)}
        currentProject={currentProject}
        onProjectChange={handleProjectChange}
      />

      {/* Data Management Modal */}
      {isDataManagementOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Data Management
              </h2>
              <button
                onClick={() => setIsDataManagementOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <DataManagement onDataChanged={handleDataChanged} />
          </div>
        </div>
      )}

      {/* Modern UI Components */}
      {!isMobile && (
        <FloatingActionButton
          icon="+"
          onClick={handleAddTask}
          position="bottom-right"
          tooltip="Add New Task (Ctrl+N)"
        />
      )}

      <KeyboardShortcutsOverlay
        isOpen={isKeyboardShortcutsOpen}
        onClose={() => setIsKeyboardShortcutsOpen(false)}
        shortcuts={shortcuts}
      />

      <NotificationContainer />
    </div>
  );
}

export default App;