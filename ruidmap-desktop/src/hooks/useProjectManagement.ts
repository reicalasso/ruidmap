import { useState, useEffect, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Project, ProjectCreateRequest, ProjectUpdateRequest, ProjectStats } from '../types';

export const useProjectManagement = (onProjectChange?: (project: Project | null) => void) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all projects
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await invoke<Project[]>('get_projects');
      setProjects(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load current project
  const loadCurrentProject = useCallback(async () => {
    try {
      const result = await invoke<Project | null>('get_current_project');
      setCurrentProject(result);
      // Notify about project change
      if (onProjectChange) {
        onProjectChange(result);
      }
    } catch (err) {
      console.error('Failed to load current project:', err);
    }
  }, [onProjectChange]);

  // Create new project
  const createProject = useCallback(async (request: ProjectCreateRequest): Promise<Project> => {
    try {
      setLoading(true);
      setError(null);
      const newProject = await invoke<Project>('create_project', { request });
      setProjects(prev => [...prev, newProject]);
      setCurrentProject(newProject);
      return newProject;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create project';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update project
  const updateProject = useCallback(async (request: ProjectUpdateRequest): Promise<Project> => {
    try {
      setLoading(true);
      setError(null);
      const updatedProject = await invoke<Project>('update_project', { request });
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
      if (currentProject?.id === updatedProject.id) {
        setCurrentProject(updatedProject);
      }
      return updatedProject;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update project';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [currentProject]);

  // Delete project
  const deleteProject = useCallback(async (projectId: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await invoke('delete_project', { projectId });
      setProjects(prev => prev.filter(p => p.id !== projectId));
      if (currentProject?.id === projectId) {
        // Switch to first available project or null
        const remainingProjects = projects.filter(p => p.id !== projectId);
        setCurrentProject(remainingProjects.length > 0 ? remainingProjects[0] : null);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete project';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [currentProject, projects]);

  // Switch to different project
  const switchProject = useCallback(async (projectId: number): Promise<Project> => {
    try {
      setLoading(true);
      setError(null);
      const project = await invoke<Project>('switch_project', { projectId });
      setCurrentProject(project);
      // Notify about project change
      if (onProjectChange) {
        onProjectChange(project);
      }
      return project;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to switch project';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [onProjectChange]);

  // Get project statistics
  const getProjectStats = useCallback(async (projectId: number): Promise<ProjectStats> => {
    try {
      const stats = await invoke<ProjectStats>('get_project_stats', { projectId });
      return stats;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get project stats';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  // Initialize data on mount
  useEffect(() => {
    const initializeData = async () => {
      await loadProjects();
      await loadCurrentProject();
    };
    
    initializeData();
  }, [loadProjects, loadCurrentProject]);

  // Auto-refresh projects when current project changes
  useEffect(() => {
    if (currentProject) {
      loadProjects();
    }
  }, [currentProject, loadProjects]);

  return {
    // State
    projects,
    currentProject,
    loading,
    error,

    // Actions
    loadProjects,
    loadCurrentProject,
    createProject,
    updateProject,
    deleteProject,
    switchProject,
    getProjectStats,

    // Utilities
    clearError: () => setError(null),
  };
};