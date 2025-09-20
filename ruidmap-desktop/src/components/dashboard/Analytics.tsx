import React from 'react';
import { motion } from 'framer-motion';
import { cardVariants } from '../../utils/animations';

// Analytics Data Types
export interface AnalyticsData {
  totalRoadmaps: number;
  activeProjects: number;
  completedTasks: number;
  overallProgress: number;
  recentActivity: ActivityItem[];
  progressTrends: TrendData[];
  topPerformingProjects: ProjectData[];
}

export interface ActivityItem {
  id: string;
  type: 'create' | 'update' | 'complete' | 'delete';
  description: string;
  timestamp: Date;
  projectName?: string;
}

export interface TrendData {
  date: string;
  value: number;
  label: string;
}

export interface ProjectData {
  id: string;
  name: string;
  progress: number;
  status: 'active' | 'completed' | 'paused';
  dueDate?: Date;
  teamSize: number;
}

// Analytics Summary Component
interface AnalyticsSummaryProps {
  data: AnalyticsData;
}

export const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({ data }) => {
  const summaryCards = [
    {
      title: 'Total Roadmaps',
      value: data.totalRoadmaps,
      icon: '🗺️',
      color: 'blue',
      change: { value: 12, type: 'increase' as const },
    },
    {
      title: 'Active Projects',
      value: data.activeProjects,
      icon: '🚀',
      color: 'green',
      change: { value: 5, type: 'increase' as const },
    },
    {
      title: 'Completed Tasks',
      value: data.completedTasks,
      icon: '✅',
      color: 'purple',
      change: { value: 23, type: 'increase' as const },
    },
    {
      title: 'Overall Progress',
      value: `${data.overallProgress}%`,
      icon: '📊',
      color: 'orange',
      change: { value: 8, type: 'increase' as const },
    },
  ];

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {summaryCards.map((card, index) => (
        <motion.div
          key={card.title}
          className={`relative overflow-hidden bg-gradient-to-br ${colorClasses[card.color as keyof typeof colorClasses]} rounded-xl p-6 text-white`}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: index * 0.1 }}
          whileHover="hover"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl">{card.icon}</div>
            <div className="text-right">
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-sm opacity-90">{card.title}</div>
            </div>
          </div>
          
          <div className="flex items-center text-sm opacity-90">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>+{card.change.value}% this month</span>
          </div>
          
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-20">
            <div className="w-24 h-24 rounded-full bg-white"></div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Recent Activity Component
interface RecentActivityProps {
  activities: ActivityItem[];
  limit?: number;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ 
  activities, 
  limit = 10 
}) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'complete': return '✅';
      case 'delete': return '🗑️';
      default: return '📝';
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'create': return 'text-green-600 bg-green-50';
      case 'update': return 'text-blue-600 bg-blue-50';
      case 'complete': return 'text-purple-600 bg-purple-50';
      case 'delete': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Recent Activity
      </h3>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.slice(0, limit).map((activity, index) => (
          <motion.div
            key={activity.id}
            className="flex items-start space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${getActivityColor(activity.type)}`}>
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-white">
                {activity.description}
                {activity.projectName && (
                  <span className="text-blue-600 dark:text-blue-400 ml-1">
                    in {activity.projectName}
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatTime(activity.timestamp)}
              </p>
            </div>
          </motion.div>
        ))}
        
        {activities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📝</div>
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Progress Trends Component
interface ProgressTrendsProps {
  trends: TrendData[];
  title?: string;
}

export const ProgressTrends: React.FC<ProgressTrendsProps> = ({ 
  trends, 
  title = "Progress Trends" 
}) => {
  const maxValue = Math.max(...trends.map(t => t.value));
  
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        {title}
      </h3>
      
      <div className="space-y-4">
        {trends.map((trend, index) => (
          <motion.div
            key={trend.date}
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {trend.label || trend.date}
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {trend.value}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(trend.value / maxValue) * 100}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Top Performing Projects Component
interface TopProjectsProps {
  projects: ProjectData[];
  limit?: number;
}

export const TopPerformingProjects: React.FC<TopProjectsProps> = ({ 
  projects, 
  limit = 5 
}) => {
  const getStatusColor = (status: ProjectData['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDueDate = (date?: Date) => {
    if (!date) return 'No due date';
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `Due in ${days} days`;
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Top Performing Projects
      </h3>
      
      <div className="space-y-4">
        {projects.slice(0, limit).map((project, index) => (
          <motion.div
            key={project.id}
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {project.name}
                </h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {project.progress}%
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mb-3">
              <motion.div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>👥 {project.teamSize} members</span>
              <span>{formatDueDate(project.dueDate)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};