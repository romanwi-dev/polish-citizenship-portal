import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Undo, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Undo Context for managing undo actions
const UndoContext = createContext();

export const useUndo = () => {
  const context = useContext(UndoContext);
  if (!context) {
    throw new Error('useUndo must be used within UndoProvider');
  }
  return context;
};

// Undo Provider Component
export function UndoProvider({ children }) {
  const [undoQueue, setUndoQueue] = useState([]);
  const [nextId, setNextId] = useState(1);

  // Add an undo action to the queue
  const addUndoAction = useCallback((action) => {
    const undoItem = {
      id: nextId,
      ...action,
      timestamp: Date.now(),
      countdown: action.countdown || 10000, // 10 seconds default
    };
    
    setUndoQueue(prev => [...prev, undoItem]);
    setNextId(prev => prev + 1);
    
    // Auto-execute after countdown
    setTimeout(() => {
      setUndoQueue(prev => {
        const item = prev.find(item => item.id === undoItem.id);
        if (item) {
          // Execute the action if not undone
          if (item.onExecute) {
            item.onExecute();
          }
          // Remove from queue
          return prev.filter(item => item.id !== undoItem.id);
        }
        return prev;
      });
    }, undoItem.countdown);
    
    return undoItem.id;
  }, [nextId]);

  // Execute undo for a specific action
  const executeUndo = useCallback((id) => {
    setUndoQueue(prev => {
      const item = prev.find(item => item.id === id);
      if (item && item.onUndo) {
        item.onUndo();
      }
      return prev.filter(item => item.id !== id);
    });
  }, []);

  // Cancel an undo action (let it execute immediately)
  const cancelUndo = useCallback((id) => {
    setUndoQueue(prev => {
      const item = prev.find(item => item.id === id);
      if (item && item.onExecute) {
        item.onExecute();
      }
      return prev.filter(item => item.id !== id);
    });
  }, []);

  const value = {
    addUndoAction,
    executeUndo,
    cancelUndo,
    undoQueue,
  };

  return (
    <UndoContext.Provider value={value}>
      {children}
      <UndoToasts />
    </UndoContext.Provider>
  );
}

// Undo Toast Component
function UndoToast({ item, onUndo, onCancel }) {
  const [timeLeft, setTimeLeft] = useState(item.countdown / 1000);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const progressPercent = (timeLeft / (item.countdown / 1000)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-4 min-w-[320px]"
      data-testid={`undo-toast-${item.id}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${
          item.type === 'delete' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
          item.type === 'archive' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
          'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {item.icon || <Clock className="h-4 w-4" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
            {item.title}
          </div>
          <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
            {item.message}
          </div>
          
          {/* Progress bar */}
          <div className="mt-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-1">
            <motion.div
              className={`h-1 rounded-full ${
                item.type === 'delete' ? 'bg-red-500' :
                item.type === 'archive' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}
              initial={{ width: '100%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </div>
          
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timeLeft}s remaining
            </span>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUndo(item.id)}
                className="h-6 px-2 text-xs"
                data-testid={`button-undo-${item.id}`}
              >
                <Undo className="h-3 w-3 mr-1" />
                Undo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCancel(item.id)}
                className="h-6 px-2 text-xs"
                data-testid={`button-cancel-undo-${item.id}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Undo Toasts Container
function UndoToasts() {
  const { undoQueue, executeUndo, cancelUndo } = useUndo();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence>
        {undoQueue.map(item => (
          <UndoToast
            key={item.id}
            item={item}
            onUndo={executeUndo}
            onCancel={cancelUndo}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Hook for easy destructive actions with undo
export function useDestructiveAction() {
  const { addUndoAction } = useUndo();

  const executeWithUndo = useCallback((actionConfig) => {
    return addUndoAction(actionConfig);
  }, [addUndoAction]);

  return { executeWithUndo };
}

// Named export for executeWithUndo helper (required by watchdog)
// NOTE: This requires being called from within UndoProvider context
export const executeWithUndo = (actionConfig, undoContext) => {
  if (!undoContext) {
    console.error('[UNDO] executeWithUndo requires undo context. Use useDestructiveAction hook instead.');
    return null;
  }
  return undoContext.addUndoAction(actionConfig);
};

export default UndoProvider;