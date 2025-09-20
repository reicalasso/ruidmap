import React, { createContext, useContext, ReactNode } from 'react';

interface DragDropContextType {
  isDragging: boolean;
  draggedItem: any;
  setDraggedItem: (item: any) => void;
  clearDraggedItem: () => void;
}

const DragDropContext = createContext<DragDropContextType | null>(null);

interface DragDropProviderProps {
  children: ReactNode;
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({ children }) => {
  const [draggedItem, setDraggedItemState] = React.useState<any>(null);

  const setDraggedItem = (item: any) => {
    setDraggedItemState(item);
  };

  const clearDraggedItem = () => {
    setDraggedItemState(null);
  };

  const isDragging = draggedItem !== null;

  return (
    <DragDropContext.Provider
      value={{
        isDragging,
        draggedItem,
        setDraggedItem,
        clearDraggedItem,
      }}
    >
      {children}
    </DragDropContext.Provider>
  );
};

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
};