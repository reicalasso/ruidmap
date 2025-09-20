import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../../utils/animations';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  divider?: boolean;
  shortcut?: string;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  items,
  isOpen,
  position,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        className="fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-48"
        style={{
          left: position.x,
          top: position.y,
        }}
        variants={modalVariants}
        initial="closed"
        animate="open"
        exit="closed"
      >
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            {item.divider && index > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
            )}
            <motion.button
              className={`
                w-full text-left px-3 py-2 text-sm flex items-center justify-between
                ${item.disabled
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
              onClick={() => {
                if (!item.disabled) {
                  item.onClick();
                  onClose();
                }
              }}
              disabled={item.disabled}
              whileHover={!item.disabled ? { backgroundColor: 'rgba(0, 0, 0, 0.05)' } : {}}
              whileTap={!item.disabled ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center space-x-2">
                {item.icon && <span className="text-gray-500">{item.icon}</span>}
                <span>{item.label}</span>
              </div>
              {item.shortcut && (
                <span className="text-xs text-gray-400 font-mono">
                  {item.shortcut}
                </span>
              )}
            </motion.button>
          </React.Fragment>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

// Hook for using context menu
export const useContextMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const openContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setPosition({ x: event.clientX, y: event.clientY });
    setIsOpen(true);
  };

  const closeContextMenu = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    position,
    openContextMenu,
    closeContextMenu,
  };
};