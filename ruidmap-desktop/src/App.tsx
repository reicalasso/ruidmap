import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "./App.css";

// Components
import AsciiArtBanner from "./components/AsciiArtBanner";
import TaskList from "./components/TaskList";
import TaskDetail from "./components/TaskDetail";
import StatusBar from "./components/StatusBar";
import { ProjectSelector } from "./components/ProjectSelector";
import { ProjectManagementDialog } from "./components/ProjectManagementDialog";

// Hooks
import { useTasks, useTheme, useKeyboardShortcuts } from "./hooks/useTasks";
import { useProjectManagement } from "./hooks/useProjectManagement";

// Types
import { Task } from "./types";

function App() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [isProjectManagementOpen, setIsProjectManagementOpen] = useState(false);
  
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
      } else {
        // Create new task
        await addTask({
          title: taskData.title!,
          description: taskData.description || '',
          priority: taskData.priority,
          project_id: currentProject?.id
        });
      }
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteTask(id);
    } catch (err) {
      console.error('Error deleting task:', err);
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

  const handleProjectChange = async (project: any) => {
    await switchProject(project.id);
  };

  const handleOpenProjectManagement = () => {
    setIsProjectManagementOpen(true);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onAddTask: handleAddTask,
    // We could add more shortcuts here for selected tasks
  });

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 grid grid-rows-[auto_1fr_auto]">
      {/* Header with ASCII Art */}
      <motion.header 
        className="p-6 bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <AsciiArtBanner />
          <div className="flex items-center space-x-4">
            <ProjectSelector
              currentProject={currentProject}
              onProjectChange={handleProjectChange}
            />
            <button
              onClick={handleOpenProjectManagement}
              className="px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              title="Manage Projects"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
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

      {/* Status Bar - Footer */}
      <StatusBar
        stats={stats}
        currentTheme={currentTheme}
        onThemeChange={setTheme}
        onAddTask={handleAddTask}
      />

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
    </div>
  );
}

export default App;