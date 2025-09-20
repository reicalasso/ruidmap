import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project, ProjectCreateRequest, ProjectUpdateRequest, ProjectStats } from '../types';
import { useProjectManagement } from '../hooks/useProjectManagement';

interface ProjectManagementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject?: Project | null;
  onProjectChange?: (project: Project) => void;
}

export const ProjectManagementDialog: React.FC<ProjectManagementDialogProps> = ({
  isOpen,
  onClose,
  currentProject,
  onProjectChange,
}) => {
  const {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    switchProject,
    getProjectStats,
    clearError,
  } = useProjectManagement();

  const [activeTab, setActiveTab] = useState<'projects' | 'create' | 'edit'>('projects');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectStats, setProjectStats] = useState<Map<number, ProjectStats>>(new Map());
  const [formData, setFormData] = useState<ProjectCreateRequest | ProjectUpdateRequest>({
    name: '',
    description: '',
    color: '#6366f1',
    icon: '📁',
  });

  useEffect(() => {
    if (isOpen) {
      clearError();
      loadProjectStats();
    }
  }, [isOpen, projects, clearError]);

  const loadProjectStats = async () => {
    const statsMap = new Map<number, ProjectStats>();
    for (const project of projects) {
      try {
        const stats = await getProjectStats(project.id);
        statsMap.set(project.id, stats);
      } catch (err) {
        console.error(`Failed to load stats for project ${project.id}:`, err);
      }
    }
    setProjectStats(statsMap);
  };

  const handleCreateProject = async () => {
    try {
      const newProject = await createProject(formData as ProjectCreateRequest);
      if (onProjectChange) {
        onProjectChange(newProject);
      }
      setFormData({ name: '', description: '', color: '#6366f1', icon: '📁' });
      setActiveTab('projects');
    } catch (err) {
      // Error is handled in hook
    }
  };

  const handleUpdateProject = async () => {
    if (!editingProject) return;
    
    try {
      const updateData: ProjectUpdateRequest = {
        id: editingProject.id,
        ...formData,
      };
      const updatedProject = await updateProject(updateData);
      if (onProjectChange && currentProject?.id === updatedProject.id) {
        onProjectChange(updatedProject);
      }
      setEditingProject(null);
      setFormData({ name: '', description: '', color: '#6366f1', icon: '📁' });
      setActiveTab('projects');
    } catch (err) {
      // Error is handled in hook
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (projects.length <= 1) {
      alert('Cannot delete the last project');
      return;
    }

    if (confirm(`Are you sure you want to delete "${project.name}"? This will also delete all tasks in this project.`)) {
      try {
        await deleteProject(project.id);
        if (currentProject?.id === project.id && onProjectChange) {
          const remainingProjects = projects.filter(p => p.id !== project.id);
          if (remainingProjects.length > 0) {
            onProjectChange(remainingProjects[0]);
          }
        }
      } catch (err) {
        // Error is handled in hook
      }
    }
  };

  const handleSwitchProject = async (project: Project) => {
    if (project.id === currentProject?.id) return;
    
    try {
      await switchProject(project.id);
      if (onProjectChange) {
        onProjectChange(project);
      }
    } catch (err) {
      // Error is handled in hook
    }
  };

  const startEditProject = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      color: project.color || '#6366f1',
      icon: project.icon || '📁',
    });
    setActiveTab('edit');
  };

  const getProjectColor = (project: Project) => project.color || '#6366f1';
  const getProjectIcon = (project: Project) => project.icon || '📁';

  const colorOptions = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316',
    '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1'
  ];

  const iconOptions = ['📁', '💼', '🎯', '⚡', '🔥', '🌟', '🚀', '💡', '🎨', '🔧'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black bg-opacity-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Dialog */}
      <motion.div
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[600px] m-4 overflow-hidden"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Project Management
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

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-600 px-6">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'projects'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'create'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            New Project
          </button>
          {editingProject && (
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'edit'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Edit "{editingProject.name}"
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'projects' && (
            <div className="space-y-4">
              {projects.map((project) => {
                const stats = projectStats.get(project.id);
                return (
                  <motion.div
                    key={project.id}
                    className={`p-4 border rounded-lg transition-all ${
                      project.id === currentProject?.id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    layout
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <span
                          className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: getProjectColor(project) }}
                        />
                        <span className="text-2xl">{getProjectIcon(project)}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {project.name}
                            {project.id === currentProject?.id && (
                              <span className="ml-2 px-2 py-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full">
                                Current
                              </span>
                            )}
                          </h3>
                          {project.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              {project.description}
                            </p>
                          )}
                          {stats && (
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                              <span>{stats.total_tasks} tasks</span>
                              <span>•</span>
                              <span>{stats.done_tasks} completed</span>
                              <span>•</span>
                              <span>{stats.progress_percentage.toFixed(0)}% progress</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {project.id !== currentProject?.id && (
                          <button
                            onClick={() => handleSwitchProject(project)}
                            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                          >
                            Switch
                          </button>
                        )}
                        <button
                          onClick={() => startEditProject(project)}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project)}
                          disabled={projects.length <= 1}
                          className="p-1 text-gray-400 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {(activeTab === 'create' || activeTab === 'edit') && (
            <div className="max-w-md space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter project name..."
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter project description..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-md border-2 transition-all ${
                        formData.color === color
                          ? 'border-gray-900 dark:border-white scale-110'
                          : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`w-10 h-10 rounded-md border-2 text-xl transition-all ${
                        formData.icon === icon
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 scale-110'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={activeTab === 'create' ? handleCreateProject : handleUpdateProject}
                  disabled={loading || !formData.name?.trim()}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? 'Saving...' : activeTab === 'create' ? 'Create Project' : 'Update Project'}
                </button>
                <button
                  onClick={() => {
                    setActiveTab('projects');
                    setEditingProject(null);
                    setFormData({ name: '', description: '', color: '#6366f1', icon: '📁' });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};