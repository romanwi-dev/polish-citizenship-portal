import { Card, CardBody, CardHeader } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { CheckSquare, Clock, AlertCircle, User, Calendar, Search, Plus, Filter } from 'lucide-react'

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text)]">Global Tasks Board</h1>
            <p className="text-[var(--muted)] mt-1">Track and manage tasks across all cases and processes</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="primary" className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { label: 'Total Tasks', value: '342', icon: CheckSquare, color: 'text-[var(--accent)]' },
            { label: 'Pending', value: '89', icon: Clock, color: 'text-yellow-600' },
            { label: 'In Progress', value: '156', icon: AlertCircle, color: 'text-blue-600' },
            { label: 'Completed', value: '97', icon: CheckSquare, color: 'text-green-600' },
            { label: 'Overdue', value: '23', icon: AlertCircle, color: 'text-red-600' }
          ].map((stat, index) => (
            <Card key={index}>
              <CardBody className="flex items-center gap-3 p-4">
                <div className={`p-2 rounded-lg bg-[var(--bg-elev)] ${stat.color}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-semibold text-[var(--text)]">{stat.value}</p>
                  <p className="text-sm text-[var(--muted)]">{stat.label}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Tasks Board */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-medium text-[var(--text)]">Task Overview</h2>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[var(--muted)]" />
              <input 
                type="text" 
                placeholder="Search tasks..."
                className="px-3 py-1 text-sm border border-[var(--border)] rounded-lg bg-[var(--bg-elev)]"
              />
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {/* Task Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Tasks */}
                <div className="space-y-3">
                  <h3 className="font-medium text-[var(--text)] flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    Pending Tasks
                  </h3>
                  <div className="space-y-2">
                    {[
                      { 
                        title: 'Document Review - Case C001',
                        assignee: 'Admin User',
                        priority: 'high',
                        dueDate: '2025-09-26'
                      },
                      {
                        title: 'Family Tree Verification',
                        assignee: 'Genealogy Expert',
                        priority: 'medium',
                        dueDate: '2025-09-27'
                      },
                      {
                        title: 'Translation Review',
                        assignee: 'Polish Translator',
                        priority: 'low',
                        dueDate: '2025-09-28'
                      }
                    ].map((task, index) => (
                      <div key={index} className="p-3 border border-[var(--border)] rounded-lg bg-[var(--bg-elev)]">
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant={
                              task.priority === 'high' ? 'danger' :
                              task.priority === 'medium' ? 'warning' : 'neutral'
                            }
                            size="sm"
                          >
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-[var(--muted)]">{task.dueDate}</span>
                        </div>
                        <h4 className="text-sm font-medium text-[var(--text)] mb-1">{task.title}</h4>
                        <p className="text-xs text-[var(--muted)] flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.assignee}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In Progress Tasks */}
                <div className="space-y-3">
                  <h3 className="font-medium text-[var(--text)] flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    In Progress
                  </h3>
                  <div className="space-y-2">
                    {[
                      {
                        title: 'USC Document Processing',
                        assignee: 'Document Specialist',
                        priority: 'high',
                        dueDate: '2025-09-25'
                      },
                      {
                        title: 'Client Communication',
                        assignee: 'Case Manager',
                        priority: 'medium',
                        dueDate: '2025-09-26'
                      }
                    ].map((task, index) => (
                      <div key={index} className="p-3 border border-[var(--border)] rounded-lg bg-[var(--bg-elev)]">
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant={
                              task.priority === 'high' ? 'danger' :
                              task.priority === 'medium' ? 'warning' : 'neutral'
                            }
                            size="sm"
                          >
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-[var(--muted)]">{task.dueDate}</span>
                        </div>
                        <h4 className="text-sm font-medium text-[var(--text)] mb-1">{task.title}</h4>
                        <p className="text-xs text-[var(--muted)] flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.assignee}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Completed Tasks */}
                <div className="space-y-3">
                  <h3 className="font-medium text-[var(--text)] flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-green-600" />
                    Completed
                  </h3>
                  <div className="space-y-2">
                    {[
                      {
                        title: 'Birth Certificate Verification',
                        assignee: 'Document Verifier',
                        priority: 'high',
                        completedDate: '2025-09-24'
                      },
                      {
                        title: 'Initial Case Setup',
                        assignee: 'Case Manager',
                        priority: 'medium',
                        completedDate: '2025-09-23'
                      }
                    ].map((task, index) => (
                      <div key={index} className="p-3 border border-[var(--border)] rounded-lg bg-[var(--bg-elev)] opacity-75">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="success" size="sm">
                            completed
                          </Badge>
                          <span className="text-xs text-[var(--muted)]">{task.completedDate}</span>
                        </div>
                        <h4 className="text-sm font-medium text-[var(--text)] mb-1">{task.title}</h4>
                        <p className="text-xs text-[var(--muted)] flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.assignee}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}