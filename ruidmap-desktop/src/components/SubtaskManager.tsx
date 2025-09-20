import { motion } from 'framer-motion';
import { useState } from 'react';
import { Subtask } from '../types';

interface SubtaskManagerProps {
  subtasks: Subtask[];
  onAddSubtask: (title: string) => void;
  onToggleSubtask: (subtaskId: number) => void;
}

export const SubtaskManager: React.FC<SubtaskManagerProps> = ({
  subtasks,
  onAddSubtask,
  onToggleSubtask
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleAddSubtask = () => {
    const title = newSubtaskTitle.trim();
    if (title) {
      onAddSubtask(title);
      setNewSubtaskTitle('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubtask();
    }
  };

  const completedCount = subtasks.filter(s => s.completed).length;
  const progressPercentage = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-mono font-medium text-gray-700 dark:text-gray-300">
          📝 Subtasks
        </label>
        {subtasks.length > 0 && (
          <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
            {completedCount}/{subtasks.length} completed
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {subtasks.length > 0 && (
        <div className="mb-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className="bg-green-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Subtasks List */}
      <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
        {subtasks.map((subtask) => (
          <motion.div
            key={subtask.id}
            className="flex items-center gap-3 p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            layout
          >
            <button
              onClick={() => onToggleSubtask(subtask.id)}
              className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs transition-colors ${
                subtask.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
              }`}
            >
              {subtask.completed && '✓'}
            </button>
            <span
              className={`flex-1 text-sm font-mono transition-all ${
                subtask.completed
                  ? 'line-through text-gray-500 dark:text-gray-400'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {subtask.title}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Add New Subtask */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Add subtask..."
        />
        <motion.button
          onClick={handleAddSubtask}
          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-mono"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!newSubtaskTitle.trim()}
        >
          ➕
        </motion.button>
      </div>
    </div>
  );
};

export default SubtaskManager;