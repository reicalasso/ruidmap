import { useState } from "react";
import { motion } from "framer-motion";
import "./App.css";

// Components
import AsciiArtBanner from "./components/AsciiArtBanner";
import TaskList from "./components/TaskList";
import TaskDetail from "./components/TaskDetail";
import StatusBar from "./components/StatusBar";

// Hooks
import { useTasks, useTheme, useKeyboardShortcuts } from "./hooks/useTasks-mock";

// Types
import { Task } from "./types";

function App() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  
  // Custom hooks
  const { 
    tasks, 
    stats, 
    loading, 
    error, 
    addTask, 
    updateTask, 
    deleteTask, 
    changeTaskStatus 
  } = useTasks();
  
  const { currentTheme, setTheme } = useTheme();

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
          priority: taskData.priority
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
        <AsciiArtBanner />
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
      />
    </div>
  );
}

export default App;