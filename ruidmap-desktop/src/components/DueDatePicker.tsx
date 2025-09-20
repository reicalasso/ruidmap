import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface DueDatePickerProps {
  dueDate?: string;
  onSetDueDate: (dueDate: string | undefined) => void;
}

export const DueDatePicker: React.FC<DueDatePickerProps> = ({
  dueDate,
  onSetDueDate
}) => {
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');

  useEffect(() => {
    if (dueDate) {
      const date = new Date(dueDate);
      if (!isNaN(date.getTime())) {
        // Format date as YYYY-MM-DD
        setDateInput(date.toISOString().split('T')[0]);
        // Format time as HH:MM
        setTimeInput(date.toTimeString().slice(0, 5));
      }
    } else {
      setDateInput('');
      setTimeInput('');
    }
  }, [dueDate]);

  const updateDueDate = () => {
    if (dateInput) {
      const dateTimeString = timeInput 
        ? `${dateInput}T${timeInput}:00.000Z`
        : `${dateInput}T23:59:59.000Z`;
      onSetDueDate(dateTimeString);
    } else {
      onSetDueDate(undefined);
    }
  };

  const clearDueDate = () => {
    setDateInput('');
    setTimeInput('');
    onSetDueDate(undefined);
  };

  const getDateStatus = () => {
    if (!dueDate) return null;
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMs < 0) {
      return { status: 'overdue', text: 'Overdue!', color: 'text-red-600 dark:text-red-400' };
    } else if (diffDays === 0) {
      return { status: 'today', text: 'Due today', color: 'text-orange-600 dark:text-orange-400' };
    } else if (diffDays === 1) {
      return { status: 'tomorrow', text: 'Due tomorrow', color: 'text-yellow-600 dark:text-yellow-400' };
    } else if (diffDays <= 7) {
      return { status: 'week', text: `Due in ${diffDays} days`, color: 'text-blue-600 dark:text-blue-400' };
    } else {
      return { status: 'future', text: `Due in ${diffDays} days`, color: 'text-green-600 dark:text-green-400' };
    }
  };

  const formatDisplayDate = () => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    if (isNaN(date.getTime())) return null;
    
    return date.toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuickDatePresets = () => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(23, 59, 59, 999);
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(23, 59, 59, 999);
    
    return [
      { label: 'Today', date: today },
      { label: 'Tomorrow', date: tomorrow },
      { label: 'Next Week', date: nextWeek }
    ];
  };

  const dateStatus = getDateStatus();

  return (
    <div>
      <label className="block text-sm font-mono font-medium text-gray-700 dark:text-gray-300 mb-2">
        📅 Due Date
      </label>

      {/* Current Due Date Display */}
      {dueDate && (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-sm text-gray-700 dark:text-gray-300">
                {formatDisplayDate()}
              </div>
              {dateStatus && (
                <div className={`text-xs font-mono font-medium ${dateStatus.color}`}>
                  {dateStatus.status === 'overdue' && '⚠️'} {dateStatus.text}
                </div>
              )}
            </div>
            <motion.button
              onClick={clearDueDate}
              className="text-gray-400 hover:text-red-500 text-sm"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </motion.button>
          </div>
        </div>
      )}

      {/* Quick Presets */}
      <div className="mb-3">
        <div className="text-xs font-mono text-gray-600 dark:text-gray-400 mb-2">Quick Select:</div>
        <div className="flex gap-2 flex-wrap">
          {getQuickDatePresets().map((preset) => (
            <motion.button
              key={preset.label}
              onClick={() => onSetDueDate(preset.date.toISOString())}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded font-mono"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {preset.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Manual Date/Time Selection */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-mono text-gray-600 dark:text-gray-400 mb-1">
              Date
            </label>
            <input
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-gray-600 dark:text-gray-400 mb-1">
              Time (optional)
            </label>
            <input
              type="time"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <motion.button
            onClick={updateDueDate}
            className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-mono"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!dateInput}
          >
            📅 Set Due Date
          </motion.button>
          {dueDate && (
            <motion.button
              onClick={clearDueDate}
              className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-mono"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🗑️
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DueDatePicker;