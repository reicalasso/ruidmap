import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { save, open } from '@tauri-apps/plugin-dialog';
import { readTextFile } from '@tauri-apps/plugin-fs';

interface ImportResult {
  success: boolean;
  imported_tasks: number;
  imported_projects: number;
  message: string;
  export_version: string;
  export_date?: string;
}

interface ImportValidation {
  valid: boolean;
  version: string;
  export_date?: string;
  task_count: number;
  project_count: number;
  format_type: string;
  warnings: string[];
  errors: string[];
}

interface DataManagementProps {
  onDataChanged: () => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({ onDataChanged }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importValidation, setImportValidation] = useState<ImportValidation | null>(null);
  const [mergeMode, setMergeMode] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Generate default filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const defaultFilename = `ruidmap_export_${timestamp}.json`;
      
      // Show save dialog
      const filePath = await save({
        defaultPath: defaultFilename,
        filters: [{
          name: 'JSON Files',
          extensions: ['json']
        }]
      });
      
      if (filePath) {
        // Export directly to file via backend
        await invoke('export_data_to_file', { filePath });
        
        // Show success message
        alert(`Data exported successfully to ${filePath}`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Export failed: ${error}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      setIsImporting(true);
      setImportResult(null);
      setImportValidation(null);
      
      // Show open dialog
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'JSON Files',
          extensions: ['json']
        }]
      });
      
      if (selected) {
        // Read file content
        const fileContent = await readTextFile(selected);
        
        // Validate the data first
        const validation: ImportValidation = await invoke('validate_import_data', {
          jsonContent: fileContent
        });
        
        setImportValidation(validation);
        
        if (!validation.valid) {
          alert(`Invalid data file: ${validation.errors.join(', ')}`);
          return;
        }
        
        // Show confirmation dialog with details
        const confirmMessage = `
Import Details:
- Format: ${validation.format_type}
- Version: ${validation.version}
- Tasks: ${validation.task_count}
- Projects: ${validation.project_count}
${validation.export_date ? `- Export Date: ${new Date(validation.export_date).toLocaleString()}` : ''}

${validation.warnings.length > 0 ? `\nWarnings:\n${validation.warnings.join('\n')}` : ''}

${mergeMode ? 'Data will be merged with existing data.' : 'All existing data will be replaced.'}

Continue with import?`;
        
        if (confirm(confirmMessage)) {
          // Perform the import
          const result: ImportResult = await invoke('import_data_from_content', {
            jsonContent: fileContent,
            mergeMode: mergeMode
          });
          
          setImportResult(result);
          
          if (result.success) {
            alert(result.message);
            onDataChanged(); // Notify parent to refresh data
          } else {
            alert(`Import failed: ${result.message}`);
          }
        }
      }
    } catch (error) {
      console.error('Import failed:', error);
      alert(`Import failed: ${error}`);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Data Management
      </h3>
      
      <div className="space-y-4">
        {/* Export Section */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
            Export Data
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Export all your tasks and projects to a JSON file for backup or sharing.
          </p>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isExporting ? 'Exporting...' : 'Export Data'}
          </button>
        </div>

        {/* Import Section */}
        <div>
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
            Import Data
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            Import tasks and projects from a RuidMap JSON file.
          </p>
          
          <div className="mb-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={mergeMode}
                onChange={(e) => setMergeMode(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Merge with existing data (instead of replacing)
              </span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {mergeMode 
                ? 'Imported data will be added to your existing tasks and projects'
                : 'All existing data will be replaced with imported data'
              }
            </p>
          </div>
          
          <button
            onClick={handleImport}
            disabled={isImporting}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isImporting ? 'Importing...' : 'Import Data'}
          </button>
        </div>

        {/* Import Results */}
        {importValidation && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Last Validation Results
            </h5>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>Format: {importValidation.format_type}</div>
              <div>Version: {importValidation.version}</div>
              <div>Tasks: {importValidation.task_count}</div>
              <div>Projects: {importValidation.project_count}</div>
              {importValidation.export_date && (
                <div>Export Date: {new Date(importValidation.export_date).toLocaleString()}</div>
              )}
              {importValidation.warnings.length > 0 && (
                <div className="text-yellow-600 dark:text-yellow-400">
                  Warnings: {importValidation.warnings.join(', ')}
                </div>
              )}
              {importValidation.errors.length > 0 && (
                <div className="text-red-600 dark:text-red-400">
                  Errors: {importValidation.errors.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {importResult && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
            <h5 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
              Import Successful
            </h5>
            <div className="text-xs text-green-600 dark:text-green-400 space-y-1">
              <div>Imported Tasks: {importResult.imported_tasks}</div>
              <div>Imported Projects: {importResult.imported_projects}</div>
              <div>Source Version: {importResult.export_version}</div>
              {importResult.export_date && (
                <div>Export Date: {new Date(importResult.export_date).toLocaleString()}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};