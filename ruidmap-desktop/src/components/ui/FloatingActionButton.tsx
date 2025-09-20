import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { fabVariants } from '../../utils/animations';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'danger';
  tooltip?: string;
  className?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon,
  position = 'bottom-right',
  size = 'md',
  color = 'primary',
  tooltip,
  className = '',
}) => {
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  const colorClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-gray-500/25',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/25',
  };

  const combinedClasses = `
    fixed ${positionClasses[position]} ${sizeClasses[size]} ${colorClasses[color]}
    rounded-full shadow-lg flex items-center justify-center
    focus:outline-none focus:ring-4 focus:ring-blue-300
    transition-colors z-50 ${className}
  `;

  return (
    <motion.button
      className={combinedClasses}
      onClick={onClick}
      variants={fabVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      title={tooltip}
    >
      <span className={iconSizeClasses[size]}>
        {icon}
      </span>
    </motion.button>
  );
};