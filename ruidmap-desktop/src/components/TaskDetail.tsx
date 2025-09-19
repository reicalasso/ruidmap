import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';

interface TaskDetailProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Partial<Task>) => void;
  onDelete: (id: number) => void;
}

export const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setPriority(task.priority);
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
    }
  }, [task]);

  const handleSave = () => {
    if (!title.trim()) return;

    const updatedTask = {
      ...(task ? { id: task.id } : {}),
      title: title.trim(),
      description: description.trim(),
      status,
      priority
    };

    onSave(updatedTask);
    onClose();
  };

  const handleDelete = () => {
    if (task && window.confirm('Are you sure you want to delete this task?')) {
      onDelete(task.id);
      onClose();
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return '📋';
      case 'in-progress': return '⚡';
      case 'done': return '✅';
    }
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⚠️';
      case 'low': return '🔵';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-mono font-bold flex items-center gap-2">
                  {task ? '📝 Edit Task' : '➕ New Task'}
                </h2>
                <motion.button
                  className="text-white/80 hover:text-white text-2xl"
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>
              {task && (
                <div className="mt-2 text-sm font-mono opacity-80">
                  Created: {new Date(task.created_at).toLocaleString()}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
              {/* Title */}
              <div>
                <label className="block text-sm font-mono font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📌 Task Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title..."
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-mono font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📄 Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Enter task description..."
                />
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-mono font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📊 Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="todo">{getStatusIcon('todo')} To Do</option>
                    <option value="in-progress">{getStatusIcon('in-progress')} In Progress</option>
                    <option value="done">{getStatusIcon('done')} Done</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-mono font-medium text-gray-700 dark:text-gray-300 mb-2">
                    🏃 Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">{getPriorityIcon('low')} Low</option>
                    <option value="medium">{getPriorityIcon('medium')} Medium</option>
                    <option value="high">{getPriorityIcon('high')} High</option>
                  </select>
                </div>
              </div>

              {/* ASCII Art Separator */}
              <div className="text-center text-gray-400 dark:text-gray-600 font-mono text-xs py-2">
                ────────────────────────────────────────
              </div>

              {/* Metadata (for existing tasks) */}
              {task && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono text-gray-600 dark:text-gray-400">
                  <div>
                    <span className="font-medium">📅 Created:</span>
                    <br />
                    {new Date(task.created_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">🔄 Updated:</span>
                    <br />
                    {new Date(task.updated_at).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {task && (
                    <motion.button
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-800 dark:text-red-200 rounded-lg font-mono text-sm transition-colors flex items-center gap-2"
                      onClick={handleDelete}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🗑️ Delete
                    </motion.button>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <motion.button
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-mono text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    onClick={onClose}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-mono text-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSave}
                    disabled={!title.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    💾 {task ? 'Update' : 'Create'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskDetail;