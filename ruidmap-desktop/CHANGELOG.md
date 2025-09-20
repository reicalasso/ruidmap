# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1] - 2025-09-20

### Added
- **Data Export/Import System**: Complete data management functionality
  - Export tasks and projects to JSON files with metadata (version, export date)
  - Import from JSON files with validation and format detection
  - Support for legacy data formats with automatic migration
  - Merge mode: Import data without replacing existing content
  - Replace mode: Full data replacement for clean imports
  - Real-time validation with detailed error and warning messages
  - Progress indicators and user feedback during operations
  - File dialog integration for easy file selection

### Enhanced
- **User Interface**: New Data Management modal in main header
  - Export button with timestamp-based file naming
  - Import button with merge/replace mode selection
  - Validation results display with format details
  - Success/error notifications with detailed feedback

### Technical Improvements
- **Backend Commands**: 
  - `export_data_dialog`: Generate export data with metadata
  - `export_data_to_file`: Direct file export functionality
  - `import_data_from_content`: Import with validation and merge support
  - `validate_import_data`: Pre-import validation and format detection
- **Dependencies**: Added Tauri dialog and filesystem plugins
- **Error Handling**: Comprehensive validation and user-friendly error messages

### Fixed
- Import validation for different data format versions
- File dialog integration with proper error handling
- Data format compatibility across application versions

## [0.2.0] - 2025-09-20

### Added
- **Project & Workspace Management**: Complete multi-project support
  - Create, edit, and delete projects with custom names, descriptions, colors, and icons
  - Project switching with automatic task filtering
  - Project-specific task management and statistics
  - Visual project selector in header with current project display
  - Project management dialog with full CRUD operations

### Enhanced
- **Task Management**: Tasks are now project-aware
  - All tasks belong to a specific project
  - Task filtering by project automatically applied
  - Project-specific task statistics and progress tracking
  - Seamless task creation within current project context

### Technical Improvements
- **Backend Models**: Enhanced data structures with project relationships
- **Database Migration**: Automatic migration from single-project to multi-project format
- **State Management**: Project-aware task hooks and state management
- **UI Components**: New project management components and dialogs

### Fixed
- Task filtering when switching between projects
- Data serialization compatibility with kebab-case task status
- Project-specific task statistics calculation

## [0.1.0] - 2025-09-19

### Added
- **Initial Release**: Modern ASCII-art inspired task management desktop application
- **Core Task Management**: 
  - Create, edit, update, and delete tasks
  - Task status management (todo, in-progress, done)
  - Task priority levels (low, medium, high, urgent)
  - Rich task details with descriptions and metadata
- **Desktop Application**: Built with Tauri v2 + React + TypeScript + Rust
- **Visual Design**: 
  - ASCII art banner and retro terminal aesthetics
  - Dark/light theme support with system preference detection
  - Responsive design with modern UI components
- **Data Persistence**: JSON-based local storage with automatic backup
- **Keyboard Shortcuts**: Efficient task management with hotkey support