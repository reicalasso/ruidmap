import { motion, AnimatePresence } from 'framer-motion';
import { TaskStats } from '../types';
import { useState, useRef, useEffect } from 'react';

interface StatusBarProps {
  stats: TaskStats;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  className?: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  stats,
  currentTheme,
  onThemeChange,
  className = ""
}) => {
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsThemeDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <motion.footer 
      className={`bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Main Footer Content - Better organized layout */}
      <div className="px-6 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Left Section - Stats with better spacing */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Compact Stats Display */}
            <div className="flex items-center gap-3 text-sm font-mono">
              <motion.div 
                className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-800"
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-xs">📋</span>
                <span className="font-semibold">{stats.todo}</span>
                <span className="text-xs opacity-75">Todo</span>
              </motion.div>

              <motion.div 
                className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 px-2.5 py-1.5 rounded-lg border border-yellow-200 dark:border-yellow-800"
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-xs">⚡</span>
                <span className="font-semibold">{stats.in_progress}</span>
                <span className="text-xs opacity-75">Active</span>
              </motion.div>

              <motion.div 
                className="flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2.5 py-1.5 rounded-lg border border-green-200 dark:border-green-800"
                whileHover={{ scale: 1.02 }}
              >
                <span className="text-xs">✅</span>
                <span className="font-semibold">{stats.done}</span>
                <span className="text-xs opacity-75">Done</span>
              </motion.div>
            </div>

            {/* Progress Section */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                Progress:
              </span>
              <div className="flex-1 max-w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.progress_percentage}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </div>
              <span className="font-mono text-xs text-gray-600 dark:text-gray-400 min-w-[2.5rem] text-right">
                {Math.round(stats.progress_percentage)}%
              </span>
            </div>
          </div>

          {/* Right Section - Theme Selector and Info */}
          <div className="flex items-center justify-between lg:justify-end gap-4">
            {/* Theme Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <motion.button
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-mono text-sm transition-all border border-gray-200 dark:border-gray-600"
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-lg">{getThemeIcon(currentTheme)}</span>
                <span className="hidden sm:inline">{getCurrentTheme().label}</span>
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
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-0 mb-2 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                  >
                    <div className="p-1">
                      {themes.map((theme, index) => (
                        <motion.button
                          key={theme.value}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => {
                            onThemeChange(theme.value);
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

            {/* App Version Info */}
            <div className="hidden lg:flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 font-mono">
              <span>🚀</span>
              <span>RuidMap v0.2.2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Divider Line */}
      <div className="px-6 pb-2">
        <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
          <div className="flex items-center justify-center">
            <div className="font-mono text-xs text-gray-400 dark:text-gray-600 text-center">
              ────── Task Management Made Simple ──────
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default StatusBar;