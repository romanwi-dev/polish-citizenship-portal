import { Card, CardBody, CardHeader } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { 
  Server, 
  Database, 
  Wifi, 
  HardDrive, 
  Cpu, 
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function SystemPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text)]">System Status</h1>
            <p className="text-[var(--muted)] mt-1">Monitor system health, performance, and infrastructure</p>
          </div>
          <Button variant="primary" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh Status
          </Button>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { 
              label: 'System Status', 
              status: 'Operational', 
              icon: Server, 
              color: 'text-green-600',
              badge: 'success'
            },
            { 
              label: 'Database', 
              status: 'Connected', 
              icon: Database, 
              color: 'text-green-600',
              badge: 'success'
            },
            { 
              label: 'API Services', 
              status: 'Running', 
              icon: Wifi, 
              color: 'text-green-600',
              badge: 'success'
            },
            { 
              label: 'Background Jobs', 
              status: 'Processing', 
              icon: Activity, 
              color: 'text-yellow-600',
              badge: 'warning'
            }
          ].map((item, index) => (
            <Card key={index}>
              <CardBody className="flex items-center gap-3 p-4">
                <div className={`p-2 rounded-lg bg-[var(--bg-elev)] ${item.color}`}>
                  <item.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-[var(--muted)]">{item.label}</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[var(--text)]">{item.status}</p>
                    <Badge variant={item.badge as any} size="sm">●</Badge>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resource Usage */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-[var(--text)]">Resource Usage</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              {[
                { resource: 'CPU Usage', usage: 45, max: 100, unit: '%', icon: Cpu, status: 'good' },
                { resource: 'Memory Usage', usage: 8.2, max: 16, unit: 'GB', icon: HardDrive, status: 'good' },
                { resource: 'Disk Usage', usage: 127, max: 500, unit: 'GB', icon: HardDrive, status: 'good' },
                { resource: 'Network I/O', usage: 1.2, max: 10, unit: 'Mbps', icon: Wifi, status: 'good' }
              ].map((resource, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <resource.icon className="h-4 w-4 text-[var(--muted)]" />
                      <span className="text-sm font-medium text-[var(--text)]">{resource.resource}</span>
                    </div>
                    <span className="text-sm text-[var(--muted)]">
                      {resource.usage}{resource.unit} / {resource.max}{resource.unit}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--border)] rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        resource.status === 'good' ? 'bg-green-600' :
                        resource.status === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                      }`}
                      style={{ 
                        width: `${(resource.usage / resource.max) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          {/* Service Status */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-[var(--text)]">Service Status</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {[
                { service: 'Web Server', status: 'running', uptime: '99.9%', lastCheck: '2 min ago' },
                { service: 'Database Server', status: 'running', uptime: '99.8%', lastCheck: '1 min ago' },
                { service: 'File Storage', status: 'running', uptime: '100%', lastCheck: '3 min ago' },
                { service: 'Email Service', status: 'degraded', uptime: '98.5%', lastCheck: '5 min ago' },
                { service: 'Document Processing', status: 'running', uptime: '99.7%', lastCheck: '1 min ago' },
                { service: 'Backup Service', status: 'running', uptime: '99.9%', lastCheck: '10 min ago' }
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg bg-[var(--bg-elev)]">
                  <div className="flex items-center gap-3">
                    {service.status === 'running' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : service.status === 'degraded' ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">{service.service}</p>
                      <p className="text-xs text-[var(--muted)]">Uptime: {service.uptime}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={
                        service.status === 'running' ? 'success' :
                        service.status === 'degraded' ? 'warning' : 'danger'
                      }
                      size="sm"
                    >
                      {service.status}
                    </Badge>
                    <p className="text-xs text-[var(--muted)] mt-1">{service.lastCheck}</p>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* System Information */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-[var(--text)]">System Information</h2>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Environment Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-[var(--text)]">Environment</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Environment:</span>
                    <span className="text-[var(--text)]">Production</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Version:</span>
                    <span className="text-[var(--text)]">v2.1.4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Build:</span>
                    <span className="text-[var(--text)]">#1247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Deploy Date:</span>
                    <span className="text-[var(--text)]">2025-09-20</span>
                  </div>
                </div>
              </div>

              {/* Infrastructure */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-[var(--text)]">Infrastructure</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Platform:</span>
                    <span className="text-[var(--text)]">Replit</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Runtime:</span>
                    <span className="text-[var(--text)]">Node.js 20.x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Database:</span>
                    <span className="text-[var(--text)]">PostgreSQL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">CDN:</span>
                    <span className="text-[var(--text)]">CloudFlare</span>
                  </div>
                </div>
              </div>

              {/* Monitoring */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-[var(--text)]">Monitoring</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Last Backup:</span>
                    <span className="text-[var(--text)]">2h ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Health Check:</span>
                    <span className="text-green-600">Passing</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">SSL Certificate:</span>
                    <span className="text-green-600">Valid</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted)]">Uptime:</span>
                    <span className="text-[var(--text)]">99.9%</span>
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