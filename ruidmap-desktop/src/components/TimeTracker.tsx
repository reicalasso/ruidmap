import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface TimeTrackerProps {
  timeSpent: number; // in minutes
  estimatedTime?: number; // in minutes
  onAddTime: (minutes: number) => void;
  onSetEstimatedTime: (minutes: number | undefined) => void;
}

export const TimeTracker: React.FC<TimeTrackerProps> = ({
  timeSpent,
  estimatedTime,
  onAddTime,
  onSetEstimatedTime
}) => {
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [currentSession, setCurrentSession] = useState(0);
  const [manualTime, setManualTime] = useState('');
  const [estimatedTimeInput, setEstimatedTimeInput] = useState(estimatedTime ? (estimatedTime / 60).toString() : '');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTracking && startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diffMs = now.getTime() - startTime.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        setCurrentSession(diffMinutes);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTracking, startTime]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const startTracking = () => {
    setIsTracking(true);
    setStartTime(new Date());
    setCurrentSession(0);
  };

  const stopTracking = () => {
    if (currentSession > 0) {
      onAddTime(currentSession);
    }
    setIsTracking(false);
    setStartTime(null);
    setCurrentSession(0);
  };

  const addManualTime = () => {
    const minutes = parseInt(manualTime);
    if (!isNaN(minutes) && minutes > 0) {
      onAddTime(minutes);
      setManualTime('');
    }
  };

  const updateEstimatedTime = () => {
    const hours = parseFloat(estimatedTimeInput);
    if (!isNaN(hours) && hours > 0) {
      onSetEstimatedTime(Math.round(hours * 60));
    } else {
      onSetEstimatedTime(undefined);
    }
  };

  const progressPercentage = estimatedTime && estimatedTime > 0 ? Math.min((timeSpent / estimatedTime) * 100, 100) : 0;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-mono font-medium text-gray-700 dark:text-gray-300">
        ⏱️ Time Tracking
      </label>

      {/* Time Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-xs font-mono text-blue-600 dark:text-blue-400 mb-1">Time Spent</div>
          <div className="text-lg font-mono font-bold text-blue-800 dark:text-blue-200">
            {formatTime(timeSpent + currentSession)}
          </div>
        </div>
        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-xs font-mono text-green-600 dark:text-green-400 mb-1">Estimated</div>
          <div className="text-lg font-mono font-bold text-green-800 dark:text-green-200">
            {estimatedTime ? formatTime(estimatedTime) : 'Not set'}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {estimatedTime && estimatedTime > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-mono text-gray-600 dark:text-gray-400">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${
                progressPercentage > 100 ? 'bg-red-500' : 'bg-green-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          {progressPercentage > 100 && (
            <div className="text-xs font-mono text-red-600 dark:text-red-400 text-center">
              Over estimated time!
            </div>
          )}
        </div>
      )}

      {/* Active Tracking */}
      <div className="p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        {isTracking ? (
          <div className="text-center space-y-2">
            <div className="text-sm font-mono text-gray-600 dark:text-gray-400">
              🔴 Currently tracking
            </div>
            <div className="text-xl font-mono font-bold text-red-600 dark:text-red-400">
              {formatTime(currentSession)}
            </div>
            <motion.button
              onClick={stopTracking}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-mono"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ⏹️ Stop Tracking
            </motion.button>
          </div>
        ) : (
          <div className="text-center">
            <motion.button
              onClick={startTracking}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-mono"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ▶️ Start Tracking
            </motion.button>
          </div>
        )}
      </div>

      {/* Manual Time Entry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono text-gray-600 dark:text-gray-400 mb-1">
            Add Time Manually
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={manualTime}
              onChange={(e) => setManualTime(e.target.value)}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
              placeholder="Minutes"
              min="1"
            />
            <motion.button
              onClick={addManualTime}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-mono"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!manualTime || isNaN(parseInt(manualTime))}
            >
              ➕
            </motion.button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-gray-600 dark:text-gray-400 mb-1">
            Set Estimated Time
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={estimatedTimeInput}
              onChange={(e) => setEstimatedTimeInput(e.target.value)}
              step="0.5"
              className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
              placeholder="Hours"
              min="0"
            />
            <motion.button
              onClick={updateEstimatedTime}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm font-mono"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              💾
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTracker;