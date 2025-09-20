import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../../utils/animations';

interface KeyboardShortcut {
  id: string;
  keys: string[];
  description: string;
  category: string;
  action?: () => void;
}

interface KeyboardShortcutsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: KeyboardShortcut[];
}

const defaultShortcuts: KeyboardShortcut[] = [
  // General
  { id: 'help', keys: ['?'], description: 'Show keyboard shortcuts', category: 'General' },
  { id: 'search', keys: ['Ctrl', 'K'], description: 'Open search', category: 'General' },
  { id: 'settings', keys: ['Ctrl', ','], description: 'Open settings', category: 'General' },
  { id: 'theme', keys: ['Ctrl', 'Shift', 'T'], description: 'Toggle theme', category: 'General' },
  { id: 'fullscreen', keys: ['F11'], description: 'Toggle fullscreen', category: 'General' },
  
  // Navigation
  { id: 'dashboard', keys: ['Ctrl', '1'], description: 'Go to dashboard', category: 'Navigation' },
  { id: 'roadmaps', keys: ['Ctrl', '2'], description: 'Go to roadmaps', category: 'Navigation' },
  { id: 'analytics', keys: ['Ctrl', '3'], description: 'Go to analytics', category: 'Navigation' },
  { id: 'back', keys: ['Alt', '←'], description: 'Go back', category: 'Navigation' },
  { id: 'forward', keys: ['Alt', '→'], description: 'Go forward', category: 'Navigation' },
  
  // Roadmap
  { id: 'new-roadmap', keys: ['Ctrl', 'N'], description: 'Create new roadmap', category: 'Roadmap' },
  { id: 'save', keys: ['Ctrl', 'S'], description: 'Save roadmap', category: 'Roadmap' },
  { id: 'export', keys: ['Ctrl', 'E'], description: 'Export roadmap', category: 'Roadmap' },
  { id: 'import', keys: ['Ctrl', 'I'], description: 'Import roadmap', category: 'Roadmap' },
  { id: 'delete', keys: ['Del'], description: 'Delete selected item', category: 'Roadmap' },
  { id: 'duplicate', keys: ['Ctrl', 'D'], description: 'Duplicate selected item', category: 'Roadmap' },
  
  // Editing
  { id: 'undo', keys: ['Ctrl', 'Z'], description: 'Undo last action', category: 'Editing' },
  { id: 'redo', keys: ['Ctrl', 'Y'], description: 'Redo last action', category: 'Editing' },
  { id: 'copy', keys: ['Ctrl', 'C'], description: 'Copy selected item', category: 'Editing' },
  { id: 'paste', keys: ['Ctrl', 'V'], description: 'Paste item', category: 'Editing' },
  { id: 'select-all', keys: ['Ctrl', 'A'], description: 'Select all items', category: 'Editing' },
];

export const KeyboardShortcutsOverlay: React.FC<KeyboardShortcutsOverlayProps> = ({
  isOpen,
  onClose,
  shortcuts = defaultShortcuts,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const filteredShortcuts = shortcuts.filter(
    (shortcut) =>
      shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shortcut.keys.some((key) => key.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  const formatKey = (key: string) => {
    const keyMap: Record<string, string> = {
      'Ctrl': '⌘',
      'Alt': '⌥',
      'Shift': '⇧',
      '←': '←',
      '→': '→',
      '↑': '↑',
      '↓': '↓',
      'Del': '⌫',
      'Backspace': '⌫',
      'Enter': '↵',
      'Tab': '⇥',
      'Space': '␣',
    };
    
    return keyMap[key] || key;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          variants={modalVariants}
          initial="closed"
          animate="open"
          exit="closed"
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search shortcuts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <svg
                  className="absolute right-3 top-2.5 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
              {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
                <div key={category} className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryShortcuts.map((shortcut) => (
                      <motion.div
                        key={shortcut.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center space-x-1">
                          {shortcut.keys.map((key, index) => (
                            <React.Fragment key={index}>
                              {index > 0 && (
                                <span className="text-gray-400 text-xs mx-1">+</span>
                              )}
                              <kbd className="px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-700 dark:text-gray-300 shadow-sm">
                                {formatKey(key)}
                              </kbd>
                            </React.Fragment>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
              
              {Object.keys(groupedShortcuts).length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-2">No shortcuts found</div>
                  <div className="text-gray-500 text-sm">Try a different search term</div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hook for keyboard shortcuts
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKeys: string[] = [];
      
      if (event.ctrlKey || event.metaKey) pressedKeys.push('Ctrl');
      if (event.altKey) pressedKeys.push('Alt');
      if (event.shiftKey) pressedKeys.push('Shift');
      
      // Add the main key
      const key = event.key;
      if (key !== 'Control' && key !== 'Alt' && key !== 'Shift' && key !== 'Meta') {
        pressedKeys.push(key);
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find((shortcut) => {
        return (
          shortcut.keys.length === pressedKeys.length &&
          shortcut.keys.every((key) => pressedKeys.includes(key))
        );
      });

      if (matchingShortcut && matchingShortcut.action) {
        event.preventDefault();
        matchingShortcut.action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};