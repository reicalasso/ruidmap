import { motion } from 'framer-motion';
import { TaskStats, Theme } from '../types';

interface StatusBarProps {
  stats: TaskStats;
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  onAddTask: () => void;
  className?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  stats,
  currentTheme,
  onThemeChange,
  onAddTask,
  className = ""
}) => {
  const themes: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'custom', label: 'Custom', icon: '🎨' }
  ];

  const getThemeIcon = (theme: Theme) => {
    const themeObj = themes.find(t => t.value === theme);
    return themeObj ? themeObj.icon : '🎨';
  };

  const cycleTheme = () => {
    const currentIndex = themes.findIndex(t => t.value === currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    onThemeChange(themes[nextIndex].value);
  };

  return (
    <motion.footer 
      className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="flex items-center justify-between">
        {/* Stats Section */}
        <div className="flex items-center gap-6">
          {/* ASCII Art Stats */}
          <div className="hidden md:block font-mono text-xs text-gray-600 dark:text-gray-400">
            <pre className="leading-none">
{`╭─ STATS ─╮
│ Total: ${String(stats.total).padStart(2, ' ')} │
╰─────────╯`}
            </pre>
          </div>

          {/* Task Counts */}
          <div className="flex items-center gap-4 font-mono text-sm">
            <motion.div 
              className="flex items-center gap-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <span>📋</span>
              <span>{stats.todo} Todo</span>
            </motion.div>

            <motion.div 
              className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <span>⚡</span>
              <span>{stats.in_progress} In Progress</span>
            </motion.div>

            <motion.div 
              className="flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <span>✅</span>
              <span>{stats.done} Done</span>
            </motion.div>
          </div>

          {/* Progress Bar */}
          <div className="hidden lg:flex items-center gap-3">
            <span className="font-mono text-sm text-gray-600 dark:text-gray-400">Progress:</span>
            <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                initial={{ width: 0 }}
                animate={{ width: `${stats.progress_percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
            <span className="font-mono text-sm text-gray-600 dark:text-gray-400 min-w-[3rem]">
              {Math.round(stats.progress_percentage)}%
            </span>
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher */}
          <motion.button
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-mono text-sm transition-colors"
            onClick={cycleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Switch theme"
          >
            <span>{getThemeIcon(currentTheme)}</span>
            <span className="hidden sm:inline">
              {themes.find(t => t.value === currentTheme)?.label}
            </span>
          </motion.button>

          {/* Add Task Button */}
          <motion.button
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-mono text-sm transition-colors shadow-lg"
            onClick={onAddTask}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>➕</span>
            <span className="hidden sm:inline">Add Task</span>
          </motion.button>

          {/* ASCII Art Corner */}
          <div className="hidden xl:block font-mono text-xs text-gray-400 dark:text-gray-600 ml-4">
            <pre className="leading-none">
{`  ╭─╮
  │${getThemeIcon(currentTheme)}│
  ╰─╯`}
            </pre>
          </div>
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <div className="lg:hidden mt-3 flex items-center gap-3">
        <span className="font-mono text-sm text-gray-600 dark:text-gray-400">Progress:</span>
        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500"
            initial={{ width: 0 }}
            animate={{ width: `${stats.progress_percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <span className="font-mono text-sm text-gray-600 dark:text-gray-400 min-w-[3rem]">
          {Math.round(stats.progress_percentage)}%
        </span>
      </div>

      {/* Footer ASCII Art */}
      <div className="hidden md:block mt-4 text-center">
        <div className="font-mono text-xs text-gray-400 dark:text-gray-600">
          ────────────────── RuidMap v0.2.0 ──────────────────
        </div>
      </div>
    </motion.footer>
  );
};

export default StatusBar;