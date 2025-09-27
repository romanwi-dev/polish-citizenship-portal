/**
 * Task Editor Component - Drawer/Sheet Implementation
 * Reuses existing edit panel behaviors with no style changes
 */

import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { Task } from '@/features/cap/capRules';
import { formatPL, parsePL } from '@/lib/date';
import { cn } from '@/lib/utils';

interface TaskEditorProps {
  isOpen: boolean;
  task: Task | null;
  onSave: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

// Form validation
interface TaskFormData {
  title: string;
  type: 'USC' | 'OBY' | 'Translation' | 'Archive' | 'General';
  status: 'open' | 'blocked' | 'done';
  due?: string;
  assignee?: string;
  notes?: string;
}

// Animation variants matching existing edit panel behavior
const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const mobileSheetVariants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 200 }
  },
  exit: { 
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { duration: 0.2 }
  }
};

const desktopRailVariants = {
  initial: { x: '100%' },
  animate: { 
    x: 0,
    transition: { type: "spring", damping: 25, stiffness: 200 }
  },
  exit: { 
    x: '100%',
    transition: { duration: 0.2 }
  }
};

export const TaskEditor: React.FC<TaskEditorProps> = ({ 
  isOpen, 
  task, 
  onSave, 
  onClose 
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    type: 'General',
    status: 'open',
    assignee: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Partial<TaskFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle responsive detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        type: task.type || 'General',
        status: task.status || 'open',
        due: task.due ? formatPL(task.due) : '',
        assignee: task.assignee || '',
        notes: task.notes || ''
      });
    } else {
      setFormData({
        title: '',
        type: 'General',
        status: 'open',
        assignee: '',
        notes: ''
      });
    }
    setErrors({});
  }, [task, isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSave();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<TaskFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.due && formData.due.trim()) {
      const parsedDate = parsePL(formData.due);
      if (!parsedDate) {
        newErrors.due = 'Invalid date format. Use DD.MM.YYYY';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      // Prepare task data for save
      const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title.trim(),
        type: formData.type,
        status: formData.status,
        assignee: formData.assignee?.trim() || undefined,
        notes: formData.notes?.trim() || undefined
      };

      // Handle due date parsing
      if (formData.due && formData.due.trim()) {
        const parsedDate = parsePL(formData.due);
        if (parsedDate) {
          taskData.due = parsedDate.toISOString();
        }
      }

      await onSave(taskData);
    } catch (error) {
      console.error('Failed to save task:', error);
      // Could add toast notification here
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, onSave]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleFieldChange = useCallback((field: keyof TaskFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  if (!isOpen) return null;

  const isEditing = Boolean(task?.id);
  const title = isEditing ? 'Edit Task' : 'Create Task';

  // Desktop: fixed right rail
  if (!isMobile) {
    return createPortal(
      <AnimatePresence>
        <motion.div
          key="desktop-overlay"
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 bg-black/50 z-50"
          onClick={handleClose}
        />
        <motion.div
          key="desktop-rail"
          variants={desktopRailVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed right-0 top-0 h-screen w-96 bg-white dark:bg-gray-900 shadow-xl z-50"
          style={{ willChange: 'transform' }}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                data-testid="button-close-task-editor"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form - Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    placeholder="Enter task title"
                    className={cn(
                      "w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                      errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    )}
                  />
                  {errors.title && (
                    <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Type
                  </label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleFieldChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="USC">USC</option>
                    <option value="OBY">OBY</option>
                    <option value="Translation">Translation</option>
                    <option value="Archive">Archive</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleFieldChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="open">Open</option>
                    <option value="blocked">Blocked</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="due" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Due Date
                  </label>
                  <input
                    id="due"
                    type="text"
                    value={formData.due || ''}
                    onChange={(e) => handleFieldChange('due', e.target.value)}
                    placeholder="DD.MM.YYYY"
                    className={cn(
                      "w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                      errors.due ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    )}
                  />
                  {errors.due && (
                    <p className="text-red-600 text-sm mt-1">{errors.due}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Assignee
                  </label>
                  <input
                    id="assignee"
                    type="text"
                    value={formData.assignee || ''}
                    onChange={(e) => handleFieldChange('assignee', e.target.value)}
                    placeholder="Enter assignee name"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={formData.notes || ''}
                    onChange={(e) => handleFieldChange('notes', e.target.value)}
                    placeholder="Additional notes..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSubmitting || !formData.title.trim()}
                  className={cn(
                    "flex-1 px-4 py-2 bg-blue-600 text-white rounded-md transition-colors flex items-center justify-center gap-2",
                    (isSubmitting || !formData.title.trim()) 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "hover:bg-blue-700"
                  )}
                  data-testid="button-save-task"
                >
                  {isSubmitting ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      {isEditing ? 'Update Task' : 'Create Task'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>,
      document.body
    );
  }

  // Mobile: full-screen sheet
  return createPortal(
    <AnimatePresence>
      <motion.div
        key="mobile-overlay"
        variants={overlayVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleClose}
      />
      <motion.div
        key="mobile-sheet"
        variants={mobileSheetVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-50 max-h-[90vh] min-h-[60vh] flex flex-col"
        style={{ willChange: 'transform' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            data-testid="button-close-task-editor-mobile"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form - Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-6">
            <div>
              <label htmlFor="title-mobile" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                id="title-mobile"
                type="text"
                value={formData.title}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                placeholder="Enter task title"
                className={cn(
                  "w-full px-3 py-3 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base min-h-[44px]",
                  errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                )}
              />
              {errors.title && (
                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label htmlFor="type-mobile" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                id="type-mobile"
                value={formData.type}
                onChange={(e) => handleFieldChange('type', e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base min-h-[44px]"
              >
                <option value="USC">USC</option>
                <option value="OBY">OBY</option>
                <option value="Translation">Translation</option>
                <option value="Archive">Archive</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label htmlFor="status-mobile" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                id="status-mobile"
                value={formData.status}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base min-h-[44px]"
              >
                <option value="open">Open</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label htmlFor="due-mobile" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Due Date
              </label>
              <input
                id="due-mobile"
                type="text"
                value={formData.due || ''}
                onChange={(e) => handleFieldChange('due', e.target.value)}
                placeholder="DD.MM.YYYY"
                className={cn(
                  "w-full px-3 py-3 border rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base min-h-[44px]",
                  errors.due ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                )}
              />
              {errors.due && (
                <p className="text-red-600 text-sm mt-1">{errors.due}</p>
              )}
            </div>

            <div>
              <label htmlFor="assignee-mobile" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Assignee
              </label>
              <input
                id="assignee-mobile"
                type="text"
                value={formData.assignee || ''}
                onChange={(e) => handleFieldChange('assignee', e.target.value)}
                placeholder="Enter assignee name"
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base min-h-[44px]"
              />
            </div>

            <div>
              <label htmlFor="notes-mobile" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes
              </label>
              <textarea
                id="notes-mobile"
                value={formData.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                placeholder="Additional notes..."
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-base min-h-[100px] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting || !formData.title.trim()}
              className={cn(
                "w-full px-4 py-3 bg-blue-600 text-white rounded-md transition-colors flex items-center justify-center gap-2 min-h-[44px]",
                (isSubmitting || !formData.title.trim()) 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "hover:bg-blue-700"
              )}
              data-testid="button-save-task-mobile"
            >
              {isSubmitting ? (
                'Saving...'
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditing ? 'Update Task' : 'Create Task'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-full px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors min-h-[44px]"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};