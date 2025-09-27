import { Card, CardBody, CardHeader } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { Settings as SettingsIcon, Users, Shield, Sliders, Bell, Database, Save } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text)]">System Settings</h1>
            <p className="text-[var(--muted)] mt-1">Manage roles, permissions, and system thresholds</p>
          </div>
          <Button variant="primary" className="gap-2">
            <Save className="h-4 w-4" />
            Save All Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Navigation */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-[var(--text)]">Settings Categories</h2>
              </CardHeader>
              <CardBody className="space-y-2">
                {[
                  { icon: Users, label: 'User Roles & Permissions', active: true },
                  { icon: Sliders, label: 'System Thresholds', active: false },
                  { icon: Bell, label: 'Notifications', active: false },
                  { icon: Database, label: 'Data Management', active: false },
                  { icon: Shield, label: 'Security Settings', active: false }
                ].map((item, index) => (
                  <button
                    key={index}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      item.active 
                        ? 'bg-[var(--accent)] text-white' 
                        : 'bg-[var(--bg-elev)] text-[var(--text)] hover:bg-[var(--surface)]'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </CardBody>
            </Card>
          </div>

          {/* Main Settings Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Roles & Permissions */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-[var(--text)]">User Roles & Permissions</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                {/* Role Management */}
                <div className="space-y-3">
                  <h3 className="font-medium text-[var(--text)]">System Roles</h3>
                  <div className="space-y-2">
                    {[
                      {
                        role: 'Super Admin',
                        description: 'Full system access and control',
                        users: 2,
                        permissions: ['All permissions'],
                        color: 'danger'
                      },
                      {
                        role: 'Case Manager',
                        description: 'Manage cases and client communications',
                        users: 8,
                        permissions: ['View cases', 'Edit cases', 'Client contact'],
                        color: 'success'
                      },
                      {
                        role: 'Document Specialist',
                        description: 'Handle document processing and verification',
                        users: 5,
                        permissions: ['View documents', 'Process documents', 'Verify documents'],
                        color: 'warning'
                      },
                      {
                        role: 'Viewer',
                        description: 'Read-only access to system data',
                        users: 12,
                        permissions: ['View cases', 'View reports'],
                        color: 'neutral'
                      }
                    ].map((role, index) => (
                      <div key={index} className="p-4 border border-[var(--border)] rounded-lg bg-[var(--bg-elev)]">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-medium text-[var(--text)]">{role.role}</h4>
                            <Badge variant={role.color as any} size="sm">
                              {role.users} users
                            </Badge>
                          </div>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </div>
                        <p className="text-sm text-[var(--muted)] mb-2">{role.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.map((permission, permIndex) => (
                            <Badge key={permIndex} variant="neutral" size="sm">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* System Thresholds */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-[var(--text)]">System Thresholds & Limits</h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      setting: 'Case Processing Timeout',
                      value: '60',
                      unit: 'days',
                      description: 'Auto-escalate cases after this period'
                    },
                    {
                      setting: 'Document Review Period',
                      value: '14',
                      unit: 'days',
                      description: 'Time allowed for document review'
                    },
                    {
                      setting: 'Client Response Timeout',
                      value: '7',
                      unit: 'days',
                      description: 'Auto-reminder after no client response'
                    },
                    {
                      setting: 'Max File Upload Size',
                      value: '50',
                      unit: 'MB',
                      description: 'Maximum allowed file size'
                    },
                    {
                      setting: 'Concurrent Cases per Manager',
                      value: '25',
                      unit: 'cases',
                      description: 'Maximum active cases per case manager'
                    },
                    {
                      setting: 'Document Retention Period',
                      value: '7',
                      unit: 'years',
                      description: 'How long to keep completed case documents'
                    }
                  ].map((setting, index) => (
                    <div key={index} className="p-3 border border-[var(--border)] rounded-lg bg-[var(--bg-elev)]">
                      <div className="space-y-2">
                        <h4 className="font-medium text-[var(--text)]">{setting.setting}</h4>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={setting.value}
                            className="w-20 px-2 py-1 text-sm border border-[var(--border)] rounded bg-[var(--bg)]"
                          />
                          <span className="text-sm text-[var(--muted)]">{setting.unit}</span>
                        </div>
                        <p className="text-xs text-[var(--muted)]">{setting.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-[var(--text)]">Quick Actions</h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { label: 'Export User Audit Log', icon: Database },
                    { label: 'Reset System Cache', icon: Settings },
                    { label: 'Generate Security Report', icon: Shield },
                    { label: 'Backup System Settings', icon: Save }
                  ].map((action, index) => (
                    <Button key={index} variant="ghost" className="gap-2 justify-start">
                      <action.icon className="h-4 w-4" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}