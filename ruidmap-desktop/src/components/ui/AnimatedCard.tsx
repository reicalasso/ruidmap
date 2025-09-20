import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cardVariants } from '../../utils/animations';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  delay?: number;
  padding?: 'sm' | 'md' | 'lg';
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = true,
  delay = 0,
  padding = 'md',
}) => {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm';
  
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const combinedClasses = `${baseClasses} ${paddingClasses[padding]} ${className}`;

  return (
    <motion.div
      className={combinedClasses}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={hoverable ? "hover" : undefined}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
      }}
      transition={{
        delay,
      }}
    >
      {children}
    </motion.div>
  );
};