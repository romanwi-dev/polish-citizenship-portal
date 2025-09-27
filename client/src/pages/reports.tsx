import { Card, CardBody, CardHeader } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { BarChart3, TrendingUp, Users, FileText, Download, Calendar, Filter } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text)]">Reports & Analytics</h1>
            <p className="text-[var(--muted)] mt-1">Monitor KPIs, track funnels, and analyze performance metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="ghost" className="gap-2">
              <Calendar className="h-4 w-4" />
              Date Range
            </Button>
            <Button variant="primary" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: 'Active Cases', 
              value: '156', 
              change: '+12%', 
              icon: FileText, 
              color: 'text-[var(--accent)]',
              trend: 'up'
            },
            { 
              label: 'Completion Rate', 
              value: '78%', 
              change: '+5%', 
              icon: TrendingUp, 
              color: 'text-green-600',
              trend: 'up'
            },
            { 
              label: 'Avg Processing Time', 
              value: '45 days', 
              change: '-3 days', 
              icon: BarChart3, 
              color: 'text-blue-600',
              trend: 'down'
            },
            { 
              label: 'Client Satisfaction', 
              value: '4.8/5', 
              change: '+0.2', 
              icon: Users, 
              color: 'text-purple-600',
              trend: 'up'
            }
          ].map((kpi, index) => (
            <Card key={index}>
              <CardBody className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-[var(--bg-elev)] ${kpi.color}`}>
                    <kpi.icon className="h-5 w-5" />
                  </div>
                  <Badge 
                    variant={kpi.trend === 'up' ? 'success' : 'neutral'}
                    size="sm"
                  >
                    {kpi.change}
                  </Badge>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text)]">{kpi.value}</p>
                  <p className="text-sm text-[var(--muted)]">{kpi.label}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-[var(--text)]">Conversion Funnel</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {[
                { stage: 'Initial Inquiry', count: 450, percentage: 100 },
                { stage: 'Document Submission', count: 380, percentage: 84 },
                { stage: 'Review Process', count: 310, percentage: 69 },
                { stage: 'Authority Approval', count: 245, percentage: 54 },
                { stage: 'Citizenship Granted', count: 189, percentage: 42 }
              ].map((stage, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--text)]">{stage.stage}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[var(--muted)]">{stage.count}</span>
                      <Badge variant="neutral" size="sm">{stage.percentage}%</Badge>
                    </div>
                  </div>
                  <div className="w-full bg-[var(--border)] rounded-full h-2">
                    <div 
                      className="bg-[var(--accent)] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Processing Time Analysis */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-[var(--text)]">Processing Time Analysis</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {[
                { phase: 'Document Collection', avgDays: 14, maxDays: 30, status: 'good' },
                { phase: 'Initial Review', avgDays: 7, maxDays: 14, status: 'good' },
                { phase: 'Authority Processing', avgDays: 28, maxDays: 60, status: 'warning' },
                { phase: 'Final Verification', avgDays: 5, maxDays: 10, status: 'good' }
              ].map((phase, index) => (
                <div key={index} className="p-3 border border-[var(--border)] rounded-lg bg-[var(--bg-elev)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[var(--text)]">{phase.phase}</span>
                    <Badge 
                      variant={
                        phase.status === 'good' ? 'success' :
                        phase.status === 'warning' ? 'warning' : 'danger'
                      }
                      size="sm"
                    >
                      {phase.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-[var(--muted)]">Avg:</span>
                      <span className="ml-1 font-medium text-[var(--text)]">{phase.avgDays} days</span>
                    </div>
                    <div>
                      <span className="text-[var(--muted)]">Max:</span>
                      <span className="ml-1 font-medium text-[var(--text)]">{phase.maxDays} days</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-[var(--text)]">Performance Trends</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Monthly Stats */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-[var(--text)]">Monthly Statistics</h3>
                <div className="space-y-2">
                  {[
                    { month: 'September', cases: 52, completed: 41 },
                    { month: 'August', cases: 48, completed: 39 },
                    { month: 'July', cases: 45, completed: 38 }
                  ].map((month, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-[var(--muted)]">{month.month}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[var(--text)]">{month.cases}</span>
                        <span className="text-green-600">({month.completed})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success Rates */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-[var(--text)]">Success Rates by Type</h3>
                <div className="space-y-2">
                  {[
                    { type: 'By Descent', rate: 89 },
                    { type: 'By Marriage', rate: 76 },
                    { type: 'By Naturalization', rate: 62 }
                  ].map((type, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--muted)]">{type.type}</span>
                        <span className="text-[var(--text)]">{type.rate}%</span>
                      </div>
                      <div className="w-full bg-[var(--border)] rounded-full h-1">
                        <div 
                          className="bg-green-600 h-1 rounded-full"
                          style={{ width: `${type.rate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Processing */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-[var(--text)]">Document Processing</h3>
                <div className="space-y-2">
                  {[
                    { doc: 'Birth Certificates', processed: 145 },
                    { doc: 'Marriage Certificates', processed: 89 },
                    { doc: 'Death Certificates', processed: 67 }
                  ].map((doc, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-[var(--muted)]">{doc.doc}</span>
                      <span className="text-[var(--text)]">{doc.processed}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}