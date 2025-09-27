import React from 'react'
import { CheckSquare, Clock, User, Plus, Calendar } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { CaseDetails, TaskItem } from '../types'
import { formatDate } from '@/lib/dateFormat'

interface TasksPanelProps {
  caseData: CaseDetails
}

function getStatusVariant(status: string): "success" | "warning" | "danger" | "neutral" {
  switch (status.toUpperCase()) {
    case 'COMPLETED': return 'success'
    case 'IN_PROGRESS': return 'warning'
    case 'PENDING': return 'neutral'
    default: return 'neutral'
  }
}

function getStatusIcon(status: string) {
  switch (status.toUpperCase()) {
    case 'COMPLETED': return <CheckSquare className="h-4 w-4" />
    case 'IN_PROGRESS': return <Clock className="h-4 w-4" />
    case 'PENDING': return <Calendar className="h-4 w-4" />
    default: return <Clock className="h-4 w-4" />
  }
}

export const TasksPanel: React.FC<TasksPanelProps> = ({ caseData }) => {
  // Generate sample tasks if none exist
  const tasks: TaskItem[] = caseData.tasks.length > 0 ? caseData.tasks : [
    {
      id: '1',
      title: 'Initial client consultation',
      status: 'COMPLETED',
      assignee: 'Legal Team',
      description: 'Complete initial consultation and case assessment'
    },
    {
      id: '2',
      title: 'Document collection',
      status: 'IN_PROGRESS',
      assignee: 'Document Specialist',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Collect all required documents from client'
    },
    {
      id: '3',
      title: 'Polish ancestors verification',
      status: 'PENDING',
      assignee: 'Research Team',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Verify Polish ancestry through historical records'
    },
    {
      id: '4',
      title: 'Application preparation',
      status: 'PENDING',
      assignee: 'Legal Team',
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
      description: 'Prepare citizenship application documents'
    }
  ]

  const stats = {
    total: tasks.length,
    completed: tasks.filter(task => task.status === 'COMPLETED').length,
    inProgress: tasks.filter(task => task.status === 'IN_PROGRESS').length,
    pending: tasks.filter(task => task.status === 'PENDING').length
  }

  const completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--text)]">{stats.total}</p>
            <p className="text-sm text-[var(--muted)]">Total Tasks</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-sm text-[var(--muted)]">Completed</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
            <p className="text-sm text-[var(--muted)]">In Progress</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
            <p className="text-sm text-[var(--muted)]">Pending</p>
          </CardBody>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Task Progress</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">Overall Completion</span>
              <span className="text-sm font-medium text-[var(--text)]">
                {stats.completed}/{stats.total} ({Math.round(completionRate)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
              <div
                className="bg-gradient-to-r from-[var(--accent)] to-[var(--success)] h-3 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Tasks</h3>
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-[var(--border)]">
            {tasks.map((task) => (
              <div key={task.id} className="p-4 hover:bg-[var(--bg)] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 mt-1">
                      {getStatusIcon(task.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[var(--text)] mb-1">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-sm text-[var(--muted)] mb-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
                        {task.assignee && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {task.assignee}
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due {formatDate(task.dueDate)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant={getStatusVariant(task.status)} className="flex-shrink-0 ml-4">
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
            
            {tasks.length === 0 && (
              <div className="p-12 text-center">
                <CheckSquare className="h-12 w-12 text-[var(--muted)] mx-auto mb-4" />
                <p className="text-[var(--muted)] mb-4">No tasks created yet</p>
                <Button variant="primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Task
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Quick Actions</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--bg)] transition-colors text-left">
              <CheckSquare className="h-5 w-5 text-[var(--success)] mb-2" />
              <h4 className="font-medium text-[var(--text)] mb-1">Mark Complete</h4>
              <p className="text-sm text-[var(--muted)]">Complete selected tasks</p>
            </button>
            
            <button className="p-4 border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--bg)] transition-colors text-left">
              <Clock className="h-5 w-5 text-[var(--warning)] mb-2" />
              <h4 className="font-medium text-[var(--text)] mb-1">Update Status</h4>
              <p className="text-sm text-[var(--muted)]">Change task status</p>
            </button>
            
            <button className="p-4 border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--bg)] transition-colors text-left">
              <User className="h-5 w-5 text-[var(--accent)] mb-2" />
              <h4 className="font-medium text-[var(--text)] mb-1">Assign Tasks</h4>
              <p className="text-sm text-[var(--muted)]">Reassign to team members</p>
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}