import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, useAnimation } from 'framer-motion';

export interface DraggableItem {
  id: string;
  type: string;
  data: any;
}

interface DragDropContextType {
  draggedItem: DraggableItem | null;
  setDraggedItem: (item: DraggableItem | null) => void;
  isDragging: boolean;
}

const DragDropContext = React.createContext<DragDropContextType | undefined>(undefined);

export const useDragDrop = () => {
  const context = React.useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within DragDropProvider');
  }
  return context;
};

interface DragDropProviderProps {
  children: ReactNode;
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({ children }) => {
  const [draggedItem, setDraggedItem] = useState<DraggableItem | null>(null);
  const isDragging = draggedItem !== null;

  return (
    <DragDropContext.Provider value={{ draggedItem, setDraggedItem, isDragging }}>
      {children}
    </DragDropContext.Provider>
  );
};

// Draggable Component
interface DraggableProps {
  item: DraggableItem;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onDragStart?: (item: DraggableItem) => void;
  onDragEnd?: (item: DraggableItem) => void;
}

export const Draggable: React.FC<DraggableProps> = ({
  item,
  children,
  className = '',
  disabled = false,
  onDragStart,
  onDragEnd,
}) => {
  const { setDraggedItem } = useDragDrop();
  const controls = useAnimation();
  const constraintsRef = useRef(null);

  const handleDragStart = () => {
    if (disabled) return;
    setDraggedItem(item);
    onDragStart?.(item);
  };

  const handleDragEnd = () => {
    if (disabled) return;
    setDraggedItem(null);
    onDragEnd?.(item);
    controls.start({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={constraintsRef}
      className={`${className} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-grab active:cursor-grabbing'}`}
      drag={!disabled}
      dragConstraints={constraintsRef}
      dragElastic={0.1}
      whileDrag={{ 
        scale: 1.05, 
        rotate: 2,
        zIndex: 1000,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      animate={controls}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30
      }}
    >
      {children}
    </motion.div>
  );
};

// Drop Zone Component
interface DropZoneProps {
  onDrop: (item: DraggableItem, event: MouseEvent) => void;
  acceptedTypes?: string[];
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  disabled?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onDrop,
  acceptedTypes = [],
  children,
  className = '',
  activeClassName = '',
  disabled = false,
}) => {
  const { draggedItem, isDragging } = useDragDrop();
  const [isOver, setIsOver] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const canAcceptDrop = draggedItem && 
    (acceptedTypes.length === 0 || acceptedTypes.includes(draggedItem.type));

  useEffect(() => {
    const element = dropRef.current;
    if (!element || disabled) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (canAcceptDrop) {
        setIsOver(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      if (!element.contains(e.relatedTarget as Node)) {
        setIsOver(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsOver(false);
      
      if (canAcceptDrop && draggedItem) {
        onDrop(draggedItem, e as any);
      }
    };

    // Mouse events for our custom drag system
    const handleMouseEnter = () => {
      if (isDragging && canAcceptDrop) {
        setIsOver(true);
      }
    };

    const handleMouseLeave = () => {
      setIsOver(false);
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isOver && canAcceptDrop && draggedItem) {
        onDrop(draggedItem, e);
        setIsOver(false);
      }
    };

    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('dragleave', handleDragLeave);
    element.addEventListener('drop', handleDrop);
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    element.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('dragover', handleDragOver);
      element.removeEventListener('dragleave', handleDragLeave);
      element.removeEventListener('drop', handleDrop);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      element.removeEventListener('mouseup', handleMouseUp);
    };
  }, [canAcceptDrop, draggedItem, isDragging, isOver, onDrop, disabled]);

  const shouldShowActive = isOver && canAcceptDrop && !disabled;

  return (
    <motion.div
      ref={dropRef}
      className={`
        ${className}
        ${shouldShowActive ? activeClassName : ''}
        ${disabled ? 'opacity-50' : ''}
      `}
      animate={{
        backgroundColor: shouldShowActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
        borderColor: shouldShowActive ? '#3B82F6' : 'transparent',
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

// Sortable List Component
interface SortableItem extends DraggableItem {
  position: number;
}

interface SortableListProps {
  items: SortableItem[];
  onReorder: (items: SortableItem[]) => void;
  renderItem: (item: SortableItem, index: number) => ReactNode;
  className?: string;
  itemClassName?: string;
  direction?: 'vertical' | 'horizontal';
}

export const SortableList: React.FC<SortableListProps> = ({
  items,
  onReorder,
  renderItem,
  className = '',
  itemClassName = '',
  direction = 'vertical',
}) => {
  const [localItems, setLocalItems] = useState(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const handleDrop = (draggedItem: DraggableItem, targetIndex: number) => {
    const draggedIndex = localItems.findIndex(item => item.id === draggedItem.id);
    if (draggedIndex === -1 || draggedIndex === targetIndex) return;

    const newItems = [...localItems];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, removed);

    // Update positions
    const updatedItems = newItems.map((item, index) => ({
      ...item,
      position: index,
    }));

    setLocalItems(updatedItems);
    onReorder(updatedItems);
  };

  return (
    <div className={`${className} ${direction === 'horizontal' ? 'flex' : 'space-y-2'}`}>
      {localItems.map((item, index) => (
        <DropZone
          key={item.id}
          onDrop={(draggedItem) => handleDrop(draggedItem, index)}
          acceptedTypes={[item.type]}
          className={`${direction === 'horizontal' ? 'flex-shrink-0' : ''}`}
          activeClassName="border-2 border-dashed border-blue-400"
        >
          <Draggable
            item={item}
            className={itemClassName}
          >
            {renderItem(item, index)}
          </Draggable>
        </DropZone>
      ))}
    </div>
  );
};