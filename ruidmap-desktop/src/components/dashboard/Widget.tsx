import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cardVariants } from '../../utils/animations';

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'list' | 'progress' | 'custom';
  size: 'small' | 'medium' | 'large' | 'full';
  position: { x: number; y: number };
  data?: any;
  config?: any;
}

interface WidgetProps {
  widget: DashboardWidget;
  children: ReactNode;
  className?: string;
  onEdit?: (widget: DashboardWidget) => void;
  onRemove?: (widgetId: string) => void;
  isEditing?: boolean;
}

export const Widget: React.FC<WidgetProps> = ({
  widget,
  children,
  className = '',
  onEdit,
  onRemove,
  isEditing = false,
}) => {
  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-2 row-span-1',
    large: 'col-span-2 row-span-2',
    full: 'col-span-full row-span-2',
  };

  return (
    <motion.div
      className={`
        relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6
        ${sizeClasses[widget.size]}
        ${isEditing ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
        ${className}
      `}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      layout
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {widget.title}
        </h3>
        
        {(onEdit || onRemove) && (
          <div className="flex items-center space-x-2">
            {onEdit && (
              <motion.button
                onClick={() => onEdit(widget)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </motion.button>
            )}
            
            {onRemove && (
              <motion.button
                onClick={() => onRemove(widget.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Widget Content */}
      <div className="flex-1">
        {children}
      </div>
    </motion.div>
  );
};

// Metric Widget
interface MetricWidgetProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

export const MetricWidget: React.FC<MetricWidgetProps> = ({
  title,
  value,
  change,
  icon,
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    green: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    red: 'text-red-600 bg-red-50 dark:bg-red-900/20',
    yellow: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        {icon && (
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
        
        {change && (
          <div className="flex items-center text-sm">
            <span
              className={`flex items-center ${
                change.type === 'increase'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {change.type === 'increase' ? (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {Math.abs(change.value)}%
            </span>
            <span className="text-gray-500 ml-2">
              vs {change.period}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

// Chart Widget Base
interface ChartWidgetProps {
  title: string;
  data: any[];
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  config?: any;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  title,
  data,
  type,
}) => {
  // This is a placeholder - in a real app, you'd integrate with a charting library
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </h4>
      
      <div className="h-48 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {type.charAt(0).toUpperCase() + type.slice(1)} Chart
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {data.length} data points
          </p>
        </div>
      </div>
    </div>
  );
};

// Progress Widget
interface ProgressWidgetProps {
  title: string;
  items: {
    id: string;
    name: string;
    progress: number;
    color?: string;
  }[];
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({
  title,
  items,
}) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {title}
      </h4>
      
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {item.name}
              </span>
              <span className="text-sm text-gray-500">
                {item.progress}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${item.color || 'bg-blue-600'}`}
                initial={{ width: 0 }}
                animate={{ width: `${item.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};