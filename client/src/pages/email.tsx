import { Card, CardBody, CardHeader } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { Mail, Send, Edit, Trash2, Archive, Search } from 'lucide-react'

export default function EmailPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text)]">Email Templates & Outbox</h1>
            <p className="text-[var(--muted)] mt-1">Manage email templates and monitor sent messages</p>
          </div>
          <Button variant="primary" className="gap-2">
            <Edit className="h-4 w-4" />
            New Template
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <h2 className="text-lg font-medium text-[var(--text)]">Email Templates</h2>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-[var(--muted)]" />
                  <input 
                    type="text" 
                    placeholder="Search templates..."
                    className="px-3 py-1 text-sm border border-[var(--border)] rounded-lg bg-[var(--bg-elev)]"
                  />
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                {/* Template Items */}
                {[
                  { name: 'Welcome Email', type: 'Onboarding', status: 'active' },
                  { name: 'Document Request', type: 'Process', status: 'active' },
                  { name: 'Status Update', type: 'Notification', status: 'draft' },
                  { name: 'Completion Notice', type: 'Process', status: 'active' }
                ].map((template, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg bg-[var(--bg-elev)]">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-[var(--accent)]" />
                      <div>
                        <h3 className="font-medium text-[var(--text)]">{template.name}</h3>
                        <p className="text-sm text-[var(--muted)]">{template.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={template.status === 'active' ? 'success' : 'warning'}>
                        {template.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          {/* Outbox Section */}
          <div>
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-[var(--text)]">Recent Outbox</h2>
              </CardHeader>
              <CardBody className="space-y-3">
                {[
                  { recipient: 'client@example.com', subject: 'Document Upload Confirmation', time: '2h ago', status: 'sent' },
                  { recipient: 'admin@example.com', subject: 'Case Status Update', time: '4h ago', status: 'delivered' },
                  { recipient: 'user@example.com', subject: 'Welcome to Polish Citizenship', time: '1d ago', status: 'sent' }
                ].map((email, index) => (
                  <div key={index} className="p-3 border border-[var(--border)] rounded-lg bg-[var(--bg-elev)]">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant={email.status === 'delivered' ? 'success' : 'neutral'} size="sm">
                        {email.status}
                      </Badge>
                      <span className="text-xs text-[var(--muted)]">{email.time}</span>
                    </div>
                    <p className="text-sm font-medium text-[var(--text)] truncate">{email.subject}</p>
                    <p className="text-xs text-[var(--muted)] truncate">{email.recipient}</p>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}