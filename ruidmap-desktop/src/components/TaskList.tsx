import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Task, TaskStatus } from '../types';
import { SearchFilter } from './ui/SearchFilter';
import { useTaskSearch } from '../hooks/useSearch';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskDelete: (id: number) => void;
  onTaskStatusChange: (id: number, status: TaskStatus) => void;
  className?: string;
  showSearch?: boolean;
  availableTags?: string[];
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskClick,
  onTaskDelete,
  onTaskStatusChange,
  className = "",
  showSearch = true,
  availableTags = []
}) => {
  const { 
    filteredItems: filteredTasks, 
    updateFilters, 
    hasActiveFilters, 
    resultCount 
  } = useTaskSearch(tasks);
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return '📋';
      case 'in-progress': return '⚡';
      case 'done': return '✅';
      default: return '📋';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⚠️';
      case 'low': return '🔵';
      default: return '⚠️';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'todo': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'done': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const groupedTasks = {
    todo: filteredTasks.filter(task => task.status === 'todo'),
    'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
    done: filteredTasks.filter(task => task.status === 'done')
  };

  const renderTaskColumn = (status: TaskStatus, tasks: Task[], title: string) => (
    <motion.div
      className="flex-1 min-w-0"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 h-full">
        {/* Column Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              {getStatusIcon(status)}
              {title}
            </h3>
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-sm font-mono">
              {tasks.length}
            </span>
          </div>
        </div>

        {/* Tasks */}
        <div className="p-2 space-y-2 overflow-y-auto" style={{ height: 'calc(100vh - 300px)' }}>
          <AnimatePresence>
            {tasks.map((task, index) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.1
                }}
                className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 cursor-pointer hover:shadow-md transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => onTaskClick(task)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Task Header */}
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-mono font-medium text-gray-900 dark:text-white text-sm truncate flex-1">
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-1 ml-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-mono ${getPriorityColor(task.priority)}`}>
                      {getPriorityIcon(task.priority)} {task.priority}
                    </span>
                  </div>
                </div>

                {/* Task Description */}
                {task.description && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-mono mb-3 line-clamp-2">
                    {task.description}
                  </p>
                )}

                {/* Task Actions */}
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-mono ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)} {task.status.replace('-', ' ')}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    {/* Status Change Button */}
                    <motion.button
                      className="text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded font-mono transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        const nextStatus: TaskStatus = 
                          task.status === 'todo' ? 'in-progress' :
                          task.status === 'in-progress' ? 'done' : 'todo';
                        onTaskStatusChange(task.id, nextStatus);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {task.status === 'todo' ? '▶️' : task.status === 'in-progress' ? '✅' : '🔄'}
                    </motion.button>

                    {/* Delete Button */}
                    <motion.button
                      className="text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-800 dark:text-red-200 px-2 py-1 rounded font-mono transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskDelete(task.id);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      🗑️
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500 dark:text-gray-400 font-mono text-sm"
            >
              <div className="text-4xl mb-2">📭</div>
              No tasks here yet
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`task-list ${className}`}>
      {/* Search and Filter Section */}
      {showSearch && (
        <div className="mb-6">
          <SearchFilter
            onFilterChange={updateFilters}
            availableTags={availableTags}
            placeholder="Search tasks by title, description, or tags..."
          />
          
          {/* Results Summary */}
          {hasActiveFilters && (
            <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Showing {resultCount} of {tasks.length} tasks
            </div>
          )}
        </div>
      )}

      {/* Task Columns */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 h-full overflow-auto`}>
        {renderTaskColumn('todo', groupedTasks.todo, 'To Do')}
        {renderTaskColumn('in-progress', groupedTasks['in-progress'], 'In Progress')}
        {renderTaskColumn('done', groupedTasks.done, 'Done')}
      </div>
    </div>
  );
};

export default TaskList;