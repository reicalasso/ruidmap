# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.3] - 2025-09-20

### Added
- **Comprehensive Search & Filter System**: Universal search functionality
  - Advanced SearchFilter component with real-time filtering
  - Text search across tasks, projects, and content
  - Multi-criteria filtering (status, priority, tags, dates)
  - Smart sorting with customizable order
  - Keyboard shortcuts (Ctrl+F for search focus)
  - Search integration in TaskList, ProjectSelector, and dialogs
  - Tag-based filtering with dynamic suggestions
  - Date range filtering (overdue, today, this week, this month)

### Enhanced
- **User Experience**: Improved productivity with powerful search tools
- **Performance**: Memoized search results and optimized filtering
- **Accessibility**: Keyboard navigation and focus management for search

## [0.2.0] - 2025-09-20

### Added
- **Project & Workspace Management**: Multi-project support with project switching
- Project selector with visual indicators (colors and icons)
- Project management dialog for creating, editing, and deleting projects
- Project-specific task filtering and statistics
- Enhanced Task model with project relationships
- Automatic data migration from v0.1.0 format
- Project settings with task templates and default configurations
- Project color coding and icon customization
- Workspace switching with preserved task context

### Enhanced
- Task creation now respects current project context
- Statistics now show project-specific metrics
- Improved data persistence with version handling
- Better task organization through project hierarchy

### Technical
- Added Project data models and CRUD operations
- Implemented project-aware task filtering in backend
- Enhanced frontend with React project management components
- Added migration logic for backward compatibility
- Improved TypeScript interfaces for project management

## [1.0.0] - 2025-09-19

### Added
- Initial release of RuidMap Desktop
- ASCII-art inspired task management interface
- Kanban-style task board with To Do, In Progress, and Done columns
- Multiple themes: Light, Dark, and Custom
- Framer Motion animations for smooth transitions
- Keyboard shortcuts for efficient task management
- JSON-based data persistence
- Cross-platform desktop application built with Tauri
- React frontend with TypeScript
- Rust backend for performance and security

### Features
- ✨ Beautiful ASCII art banner with animations
- 📋 Task creation, editing, and deletion
- 🎨 Theme switching with persistent settings
- ⌨️ Keyboard shortcuts (Enter, Delete, Space, Ctrl+T)
- 💾 Automatic data saving to JSON file
- 🔄 Real-time task status updates
- 📱 Responsive design for different screen sizes
- 🎭 Smooth animations and transitions

### Technical
- Tauri v2 for desktop application framework
- React 19 with TypeScript for frontend
- Tailwind CSS v3 for styling
- Framer Motion for animations
- Rust for backend performance
- JSON file storage for simplicity and portability

[1.0.0]: https://github.com/reicalasso/ruidmap/releases/tag/v1.0.0