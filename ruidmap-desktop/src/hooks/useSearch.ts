import { useState, useMemo, useCallback } from 'react';
import { Task, Project } from '../types';
import { SearchFilterState } from '../components/ui/SearchFilter';

export interface UseSearchResult<T> {
  filteredItems: T[];
  searchFilters: SearchFilterState;
  updateFilters: (filters: SearchFilterState) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
  resultCount: number;
}

// Hook for filtering tasks
export function useTaskSearch(tasks: Task[]): UseSearchResult<Task> {
  const [searchFilters, setSearchFilters] = useState<SearchFilterState>({
    searchTerm: '',
    statusFilter: 'all',
    priorityFilter: 'all',
    tagFilter: 'all',
    dueDateFilter: 'all',
    sortBy: 'created',
    sortOrder: 'desc'
  });

  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Text search
    if (searchFilters.searchTerm) {
      const searchTerm = searchFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm) ||
        task.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Status filter
    if (searchFilters.statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === searchFilters.statusFilter);
    }

    // Priority filter
    if (searchFilters.priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === searchFilters.priorityFilter);
    }

    // Tag filter
    if (searchFilters.tagFilter !== 'all') {
      filtered = filtered.filter(task => task.tags.includes(searchFilters.tagFilter));
    }

    // Due date filter
    if (searchFilters.dueDateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());
      const thisWeekEnd = new Date(thisWeekStart);
      thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      filtered = filtered.filter(task => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);

        switch (searchFilters.dueDateFilter) {
          case 'overdue':
            return dueDate < today;
          case 'today':
            return dueDate.toDateString() === today.toDateString();
          case 'this-week':
            return dueDate >= thisWeekStart && dueDate <= thisWeekEnd;
          case 'this-month':
            return dueDate >= thisMonthStart && dueDate <= thisMonthEnd;
          default:
            return true;
        }
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (searchFilters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
          break;
        case 'due-date':
          if (!a.due_date && !b.due_date) comparison = 0;
          else if (!a.due_date) comparison = 1;
          else if (!b.due_date) comparison = -1;
          else comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case 'created':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return searchFilters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [tasks, searchFilters]);

  const updateFilters = useCallback((filters: SearchFilterState) => {
    setSearchFilters(filters);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchFilters({
      searchTerm: '',
      statusFilter: 'all',
      priorityFilter: 'all',
      tagFilter: 'all',
      dueDateFilter: 'all',
      sortBy: 'created',
      sortOrder: 'desc'
    });
  }, []);

  const hasActiveFilters = useMemo(() => 
    searchFilters.searchTerm !== '' ||
    searchFilters.statusFilter !== 'all' ||
    searchFilters.priorityFilter !== 'all' ||
    searchFilters.tagFilter !== 'all' ||
    searchFilters.dueDateFilter !== 'all',
    [searchFilters]
  );

  return {
    filteredItems: filteredTasks,
    searchFilters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    resultCount: filteredTasks.length
  };
}

// Hook for filtering projects
export function useProjectSearch(projects: Project[]): UseSearchResult<Project> {
  const [searchFilters, setSearchFilters] = useState<SearchFilterState>({
    searchTerm: '',
    statusFilter: 'all',
    priorityFilter: 'all',
    tagFilter: 'all',
    dueDateFilter: 'all',
    sortBy: 'created',
    sortOrder: 'desc'
  });

  const filteredProjects = useMemo(() => {
    let filtered = [...projects];

    // Text search
    if (searchFilters.searchTerm) {
      const searchTerm = searchFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(project => 
        project.name.toLowerCase().includes(searchTerm) ||
        (project.description && project.description.toLowerCase().includes(searchTerm))
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (searchFilters.sortBy) {
        case 'title':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'updated':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
          break;
        case 'created':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }

      return searchFilters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [projects, searchFilters]);

  const updateFilters = useCallback((filters: SearchFilterState) => {
    setSearchFilters(filters);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchFilters({
      searchTerm: '',
      statusFilter: 'all',
      priorityFilter: 'all',
      tagFilter: 'all',
      dueDateFilter: 'all',
      sortBy: 'created',
      sortOrder: 'desc'
    });
  }, []);

  const hasActiveFilters = useMemo(() => 
    searchFilters.searchTerm !== '',
    [searchFilters]
  );

  return {
    filteredItems: filteredProjects,
    searchFilters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    resultCount: filteredProjects.length
  };
}

// Generic search hook for other items
export function useGenericSearch<T>(
  items: T[],
  searchFunction: (item: T, searchTerm: string) => boolean,
  sortFunction?: (a: T, b: T, sortBy: string, sortOrder: 'asc' | 'desc') => number
): UseSearchResult<T> {
  const [searchFilters, setSearchFilters] = useState<SearchFilterState>({
    searchTerm: '',
    statusFilter: 'all',
    priorityFilter: 'all',
    tagFilter: 'all',
    dueDateFilter: 'all',
    sortBy: 'created',
    sortOrder: 'desc'
  });

  const filteredItems = useMemo(() => {
    let filtered = [...items];

    // Text search
    if (searchFilters.searchTerm) {
      filtered = filtered.filter(item => searchFunction(item, searchFilters.searchTerm));
    }

    // Sorting (if sort function provided)
    if (sortFunction) {
      filtered.sort((a, b) => sortFunction(a, b, searchFilters.sortBy, searchFilters.sortOrder));
    }

    return filtered;
  }, [items, searchFilters, searchFunction, sortFunction]);

  const updateFilters = useCallback((filters: SearchFilterState) => {
    setSearchFilters(filters);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchFilters({
      searchTerm: '',
      statusFilter: 'all',
      priorityFilter: 'all',
      tagFilter: 'all',
      dueDateFilter: 'all',
      sortBy: 'created',
      sortOrder: 'desc'
    });
  }, []);

  const hasActiveFilters = useMemo(() => 
    searchFilters.searchTerm !== '',
    [searchFilters]
  );

  return {
    filteredItems,
    searchFilters,
    updateFilters,
    clearFilters,
    hasActiveFilters,
    resultCount: filteredItems.length
  };
}