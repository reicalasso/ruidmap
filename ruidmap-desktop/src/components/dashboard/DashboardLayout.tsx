import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Draggable } from '../ui/DragDrop';
import { Widget, DashboardWidget } from './Widget';
import { pageVariants } from '../../utils/animations';

interface DashboardLayoutProps {
  widgets: DashboardWidget[];
  onWidgetEdit?: (widget: DashboardWidget) => void;
  onWidgetRemove?: (widgetId: string) => void;
  isEditing?: boolean;
  columns?: number;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  widgets,
  onWidgetEdit,
  onWidgetRemove,
  isEditing = false,
  columns = 4,
}) => {
  const [layoutWidgets, setLayoutWidgets] = useState<DashboardWidget[]>(widgets);

  useEffect(() => {
    setLayoutWidgets(widgets);
  }, [widgets]);

  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  }[columns] || 'grid-cols-4';

  return (
    <motion.div
      className={`grid ${gridCols} gap-6 auto-rows-min p-6`}
      variants={pageVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {layoutWidgets.map((widget) => (
          <motion.div
            key={widget.id}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            {isEditing ? (
              <Draggable
                item={{
                  id: widget.id,
                  type: 'widget',
                  data: widget,
                }}
                className="cursor-move"
              >
                <Widget
                  widget={widget}
                  onEdit={onWidgetEdit}
                  onRemove={onWidgetRemove}
                  isEditing={isEditing}
                >
                  <WidgetContent widget={widget} />
                </Widget>
              </Draggable>
            ) : (
              <Widget
                widget={widget}
                onEdit={onWidgetEdit}
                onRemove={onWidgetRemove}
              >
                <WidgetContent widget={widget} />
              </Widget>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

// Widget Content Renderer
const WidgetContent: React.FC<{ widget: DashboardWidget }> = ({ widget }) => {
  switch (widget.type) {
    case 'metric':
      return (
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {widget.data?.value || '0'}
          </div>
          <div className="text-sm text-gray-500">
            {widget.data?.label || 'Metric'}
          </div>
        </div>
      );
      
    case 'chart':
      return (
        <div className="h-48 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm text-gray-500">Chart Widget</p>
          </div>
        </div>
      );
      
    case 'list':
      return (
        <div className="space-y-2">
          {(widget.data?.items || []).slice(0, 5).map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="text-sm">{item.name || `Item ${index + 1}`}</span>
              <span className="text-xs text-gray-500">{item.value || '0'}</span>
            </div>
          ))}
        </div>
      );
      
    case 'progress':
      return (
        <div className="space-y-3">
          {(widget.data?.items || []).map((item: any, index: number) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{item.name || `Task ${index + 1}`}</span>
                <span>{item.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress || 0}%` }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          ))}
        </div>
      );
      
    default:
      return (
        <div className="text-center text-gray-500">
          <div className="text-2xl mb-2">🔧</div>
          <p>Custom Widget</p>
        </div>
      );
  }
};

// Widget Palette for Adding New Widgets
interface WidgetPaletteProps {
  onAddWidget: (widget: Omit<DashboardWidget, 'id' | 'position'>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const WidgetPalette: React.FC<WidgetPaletteProps> = ({
  onAddWidget,
  isOpen,
  onClose,
}) => {
  const widgetTemplates = [
    {
      title: 'Total Roadmaps',
      type: 'metric' as const,
      size: 'small' as const,
      data: { value: '12', label: 'Active Roadmaps' },
    },
    {
      title: 'Completion Rate',
      type: 'metric' as const,
      size: 'small' as const,
      data: { value: '78%', label: 'Overall Progress' },
    },
    {
      title: 'Recent Activity',
      type: 'list' as const,
      size: 'medium' as const,
      data: {
        items: [
          { name: 'Created new milestone', value: '2 hours ago' },
          { name: 'Updated roadmap', value: '5 hours ago' },
          { name: 'Completed task', value: '1 day ago' },
        ],
      },
    },
    {
      title: 'Project Progress',
      type: 'progress' as const,
      size: 'medium' as const,
      data: {
        items: [
          { name: 'Frontend Development', progress: 85 },
          { name: 'Backend API', progress: 92 },
          { name: 'Testing', progress: 45 },
        ],
      },
    },
    {
      title: 'Analytics Chart',
      type: 'chart' as const,
      size: 'large' as const,
      data: { chartType: 'line' },
    },
  ];

  const handleAddWidget = (template: typeof widgetTemplates[0]) => {
    onAddWidget({
      ...template,
      config: {},
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add Widget
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {widgetTemplates.map((template, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleAddWidget(template)}
                    className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="font-medium text-gray-900 dark:text-white mb-1">
                      {template.title}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">
                      {template.type} • {template.size}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};