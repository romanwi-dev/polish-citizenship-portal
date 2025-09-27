/**
 * Tasks Tab Component
 * Implements complete Tasks CRUD functionality as specified
 */

import React, { useState, useCallback, useMemo } from 'react';
import { CheckSquare, Clock, User, Plus, Calendar, Filter } from 'lucide-react';
import { Task, CaseWithCAP } from '@/features/cap/capRules';
import { TaskEditor } from './TaskEditor';
import { useCaseStore } from '@/stores/caseStore';
import { formatPL } from '@/lib/date';
import { id } from '@/lib/id';
import { cn } from '@/lib/utils';

interface TasksTabProps {
  caseData: CaseWithCAP;
}

type TaskStatus = 'open' | 'blocked' | 'done';
type TaskType = 'USC' | 'OBY' | 'Translation' | 'Archive' | 'General';

export const TasksTab: React.FC<TasksTabProps> = ({ caseData }) => {
  const { updateCase } = useCaseStore();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterType, setFilterType] = useState<TaskType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');

  // Get tasks from case data
  const tasks = caseData.tasks || [];

  // Handle URL prefill for task creation from CAP
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const prefillData = urlParams.get('prefill');

    if (action === 'create' && prefillData) {
      try {
        const prefill = JSON.parse(decodeURIComponent(prefillData));
        setEditingTask({
          id: '', // Will be generated on save
          title: prefill.title || '',
          type: prefill.type || 'General',
          status: prefill.status || 'open',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        setIsEditorOpen(true);
        
        // Clean up URL
        const newUrl = window.location.pathname + window.location.search.replace(/[?&](action|prefill)=[^&]*/g, '').replace(/^&/, '?');
        window.history.replaceState({}, '', newUrl || window.location.pathname);
      } catch (error) {
        console.error('Failed to parse prefill data:', error);
      }
    }
  }, []);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filterType !== 'all' && task.type !== filterType) return false;
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      return true;
    });
  }, [tasks, filterType, filterStatus]);

  // Group tasks by status for display
  const groupedTasks = useMemo(() => {
    return {
      open: filteredTasks.filter(task => task.status === 'open'),
      blocked: filteredTasks.filter(task => task.status === 'blocked'),
      done: filteredTasks.filter(task => task.status === 'done')
    };
  }, [filteredTasks]);

  const handleCreateTask = useCallback(() => {
    setEditingTask({
      id: '',
      title: '',
      type: 'General',
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    setIsEditorOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask({ ...task });
    setIsEditorOpen(true);
  }, []);

  const handleSaveTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    let updatedTasks: Task[];

    if (editingTask?.id) {
      // Update existing task
      updatedTasks = tasks.map(task => 
        task.id === editingTask.id 
          ? { ...taskData, id: editingTask.id, createdAt: task.createdAt, updatedAt: now }
          : task
      );
    } else {
      // Create new task
      const newTask: Task = {
        ...taskData,
        id: id(),
        createdAt: now,
        updatedAt: now
      };
      updatedTasks = [...tasks, newTask];
    }

    // Optimistic update
    updateCase(caseData.id, { tasks: updatedTasks });
    setIsEditorOpen(false);
    setEditingTask(null);
  }, [editingTask, tasks, updateCase, caseData.id]);

  const handleDeleteTask = useCallback((taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      updateCase(caseData.id, { tasks: updatedTasks });
    }
  }, [tasks, updateCase, caseData.id]);

  const handleCloseEditor = useCallback(() => {
    setIsEditorOpen(false);
    setEditingTask(null);
  }, []);

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'done': return 'text-green-600';
      case 'blocked': return 'text-red-600';
      case 'open': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'done': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'blocked': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'open': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const getTypeColor = (type: TaskType) => {
    switch (type) {
      case 'USC': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200';
      case 'OBY': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'Translation': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
      case 'Archive': return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
      case 'General': return 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'done': return CheckSquare;
      case 'blocked': return Clock;
      case 'open': return Calendar;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks</h3>
          <button
            onClick={handleCreateTask}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium min-h-[44px] touch-manipulation"
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as TaskType | 'all')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="USC">USC</option>
              <option value="OBY">OBY</option>
              <option value="Translation">Translation</option>
              <option value="Archive">Archive</option>
              <option value="General">General</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="blocked">Blocked</option>
              <option value="done">Done</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Groups */}
      <div className="space-y-6">
        {(['open', 'blocked', 'done'] as TaskStatus[]).map(status => {
          const statusTasks = groupedTasks[status];
          if (statusTasks.length === 0 && filterStatus !== 'all' && filterStatus !== status) return null;
          
          const StatusIcon = getStatusIcon(status);
          
          return (
            <div key={status} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <StatusIcon className={cn('h-5 w-5', getStatusColor(status))} />
                  <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                    {status.replace('_', ' ')} ({statusTasks.length})
                  </h4>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {statusTasks.map((task) => (
                  <div key={task.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cn('px-2 py-1 rounded text-xs font-medium', getTypeColor(task.type))}>
                            {task.type}
                          </span>
                          <span className={cn('px-2 py-1 rounded text-xs font-medium', getStatusBadge(task.status))}>
                            {task.status.toUpperCase()}
                          </span>
                        </div>
                        <h5 className="font-medium text-gray-900 dark:text-white mb-1">{task.title}</h5>
                        {task.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{task.notes}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          {task.assignee && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {task.assignee}
                            </div>
                          )}
                          {task.due && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due {formatPL(task.due)}
                            </div>
                          )}
                          <div>Updated {formatPL(task.updatedAt)}</div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="px-3 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors text-sm font-medium min-h-[44px] touch-manipulation"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors text-sm font-medium min-h-[44px] touch-manipulation"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {statusTasks.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">No {status} tasks</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg dark:shadow-2xl p-12 text-center">
          <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Tasks Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Create your first task to start organizing case work.</p>
          <button
            onClick={handleCreateTask}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors font-medium"
          >
            <Plus className="h-4 w-4" />
            Create First Task
          </button>
        </div>
      )}

      {/* Task Editor */}
      <TaskEditor
        isOpen={isEditorOpen}
        task={editingTask}
        onSave={handleSaveTask}
        onClose={handleCloseEditor}
      />
    </div>
  );
};