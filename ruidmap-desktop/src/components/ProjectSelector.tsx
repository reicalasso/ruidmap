import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Project, ProjectCreateRequest } from '../types';

interface ProjectSelectorProps {
  currentProject?: Project | null;
  onProjectChange: (project: Project) => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  currentProject,
  onProjectChange,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const result = await invoke<Project[]>('get_projects');
      setProjects(result);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleProjectSwitch = async (project: Project) => {
    try {
      setLoading(true);
      await invoke('switch_project', { projectId: project.id });
      onProjectChange(project);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Failed to switch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      setLoading(true);
      const request: ProjectCreateRequest = {
        name: newProjectName.trim(),
        description: `Project created on ${new Date().toLocaleDateString()}`,
        color: '#6366f1', // Default indigo color
      };

      const newProject = await invoke<Project>('create_project', { request });
      setProjects([...projects, newProject]);
      setNewProjectName('');
      setIsCreating(false);
      onProjectChange(newProject);
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProjectColor = (project: Project) => {
    return project.color || '#6366f1';
  };

  const getProjectIcon = (project: Project) => {
    return project.icon || '📁';
  };

  return (
    <div className="relative">
      {/* Current Project Display */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={loading}
        className="flex items-center space-x-3 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-w-[200px] text-left"
      >
        {currentProject ? (
          <>
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: getProjectColor(currentProject) }}
            />
            <span className="text-lg">{getProjectIcon(currentProject)}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 dark:text-white truncate">
                {currentProject.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {currentProject.task_count} tasks
              </div>
            </div>
          </>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">No project selected</div>
        )}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {/* Project List */}
          <div className="py-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleProjectSwitch(project)}
                disabled={loading || project.id === currentProject?.id}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  project.id === currentProject?.id
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-r-2 border-indigo-500'
                    : ''
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getProjectColor(project) }}
                />
                <span className="text-lg">{getProjectIcon(project)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {project.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {project.task_count} tasks
                  </div>
                </div>
                {project.id === currentProject?.id && (
                  <svg
                    className="w-5 h-5 text-indigo-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-gray-600"></div>

          {/* Create Project Section */}
          <div className="p-3">
            {isCreating ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Project name..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateProject();
                    } else if (e.key === 'Escape') {
                      setIsCreating(false);
                      setNewProjectName('');
                    }
                  }}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleCreateProject}
                    disabled={loading || !newProjectName.trim()}
                    className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    {loading ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewProjectName('');
                    }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center space-x-2 px-3 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-md transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-medium">New Project</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};