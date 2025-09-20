import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskStatus, TaskPriority } from '../../types';

export interface SearchFilterState {
  searchTerm: string;
  statusFilter: TaskStatus | 'all';
  priorityFilter: TaskPriority | 'all';
  tagFilter: string | 'all';
  dueDateFilter: 'all' | 'overdue' | 'today' | 'this-week' | 'this-month';
  sortBy: 'created' | 'updated' | 'title' | 'priority' | 'due-date';
  sortOrder: 'asc' | 'desc';
}

interface SearchFilterProps {
  onFilterChange: (filters: SearchFilterState) => void;
  availableTags: string[];
  className?: string;
  placeholder?: string;
  showAdvancedFilters?: boolean;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  onFilterChange,
  availableTags,
  className = '',
  placeholder = 'Search tasks...',
  showAdvancedFilters = true
}) => {
  const [filters, setFilters] = useState<SearchFilterState>({
    searchTerm: '',
    statusFilter: 'all',
    priorityFilter: 'all',
    tagFilter: 'all',
    dueDateFilter: 'all',
    sortBy: 'created',
    sortOrder: 'desc'
  });
  
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const updateFilter = (key: keyof SearchFilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      statusFilter: 'all',
      priorityFilter: 'all',
      tagFilter: 'all',
      dueDateFilter: 'all',
      sortBy: 'created',
      sortOrder: 'desc'
    });
  };

  const hasActiveFilters = filters.searchTerm || 
    filters.statusFilter !== 'all' || 
    filters.priorityFilter !== 'all' || 
    filters.tagFilter !== 'all' || 
    filters.dueDateFilter !== 'all';

  const statusOptions = [
    { value: 'all', label: 'All Status', icon: '📋' },
    { value: 'todo', label: 'To Do', icon: '📋' },
    { value: 'in-progress', label: 'In Progress', icon: '⚡' },
    { value: 'done', label: 'Done', icon: '✅' }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities', icon: '⚠️' },
    { value: 'high', label: 'High', icon: '🔥' },
    { value: 'medium', label: 'Medium', icon: '⚠️' },
    { value: 'low', label: 'Low', icon: '🔵' }
  ];

  const dueDateOptions = [
    { value: 'all', label: 'All Dates', icon: '📅' },
    { value: 'overdue', label: 'Overdue', icon: '⚠️' },
    { value: 'today', label: 'Today', icon: '📅' },
    { value: 'this-week', label: 'This Week', icon: '📅' },
    { value: 'this-month', label: 'This Month', icon: '📅' }
  ];

  const sortOptions = [
    { value: 'created', label: 'Created Date' },
    { value: 'updated', label: 'Updated Date' },
    { value: 'title', label: 'Title' },
    { value: 'priority', label: 'Priority' },
    { value: 'due-date', label: 'Due Date' }
  ];

  return (
    <div className={`search-filter ${className}`}>
      {/* Main Search Bar */}
      <div className="relative">
        <div className={`
          flex items-center bg-white dark:bg-gray-800 border-2 rounded-lg transition-all duration-200
          ${isFocused ? 'border-blue-500 shadow-lg' : 'border-gray-300 dark:border-gray-600'}
        `}>
          <div className="pl-4 pr-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="flex-1 py-3 px-2 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none"
          />
          
          {hasActiveFilters && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={clearFilters}
              className="mr-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Clear filters"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
          
          {showAdvancedFilters && (
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`
                mr-3 p-2 rounded-md transition-colors
                ${isAdvancedOpen ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}
              `}
              title="Advanced filters"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {isAdvancedOpen && showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={filters.statusFilter}
                  onChange={(e) => updateFilter('statusFilter', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={filters.priorityFilter}
                  onChange={(e) => updateFilter('priorityFilter', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tag Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <select
                  value={filters.tagFilter}
                  onChange={(e) => updateFilter('tagFilter', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">🏷️ All Tags</option>
                  {availableTags.map(tag => (
                    <option key={tag} value={tag}>
                      🏷️ {tag}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <select
                  value={filters.dueDateFilter}
                  onChange={(e) => updateFilter('dueDateFilter', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {dueDateOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort Order
                </label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => updateFilter('sortOrder', e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="asc">↑ Ascending</option>
                  <option value="desc">↓ Descending</option>
                </select>
              </div>
            </div>

            {/* Filter Summary */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {filters.searchTerm && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      🔍 "{filters.searchTerm}"
                    </span>
                  )}
                  {filters.statusFilter !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Status: {filters.statusFilter}
                    </span>
                  )}
                  {filters.priorityFilter !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      Priority: {filters.priorityFilter}
                    </span>
                  )}
                  {filters.tagFilter !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      Tag: {filters.tagFilter}
                    </span>
                  )}
                  {filters.dueDateFilter !== 'all' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Due: {filters.dueDateFilter}
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchFilter;