import { Card, CardBody, CardHeader } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { Users, Mail, Phone, MapPin, Search, Plus, Filter, Eye } from 'lucide-react'

export default function ClientsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text)]">Contacts Directory</h1>
            <p className="text-[var(--muted)] mt-1">Manage client contacts and communication history</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="primary" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Client
            </Button>
          </div>
        </div>

        {/* Client Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Clients', value: '245', icon: Users, color: 'text-[var(--accent)]' },
            { label: 'Active Cases', value: '156', icon: Users, color: 'text-green-600' },
            { label: 'Completed', value: '78', icon: Users, color: 'text-blue-600' },
            { label: 'On Hold', value: '11', icon: Users, color: 'text-yellow-600' }
          ].map((stat, index) => (
            <Card key={index}>
              <CardBody className="flex items-center gap-3 p-4">
                <div className={`p-2 rounded-lg bg-[var(--bg-elev)] ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-[var(--text)]">{stat.value}</p>
                  <p className="text-sm text-[var(--muted)]">{stat.label}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Client Directory */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-medium text-[var(--text)]">Client Directory</h2>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[var(--muted)]" />
              <input 
                type="text" 
                placeholder="Search clients..."
                className="px-3 py-1 text-sm border border-[var(--border)] rounded-lg bg-[var(--bg-elev)]"
              />
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {/* Client List */}
              {[
                {
                  name: 'ANNA KOWALSKI',
                  email: 'anna.kowalski@email.com',
                  phone: '+1 (555) 123-4567',
                  location: 'New York, USA',
                  status: 'active',
                  caseType: 'By Descent',
                  lastContact: '2 days ago'
                },
                {
                  name: 'MICHAEL NOWAK',
                  email: 'michael.nowak@email.com',
                  phone: '+1 (555) 234-5678',
                  location: 'Chicago, USA',
                  status: 'pending',
                  caseType: 'By Marriage',
                  lastContact: '1 week ago'
                },
                {
                  name: 'SOPHIA WIŚNIEWSKA',
                  email: 'sophia.wisniewska@email.com',
                  phone: '+1 (555) 345-6789',
                  location: 'Los Angeles, USA',
                  status: 'completed',
                  caseType: 'By Descent',
                  lastContact: '3 weeks ago'
                },
                {
                  name: 'ROBERT DĄBROWSKI',
                  email: 'robert.dabrowski@email.com',
                  phone: '+1 (555) 456-7890',
                  location: 'Miami, USA',
                  status: 'active',
                  caseType: 'By Naturalization',
                  lastContact: '5 days ago'
                },
                {
                  name: 'MARIA LEWANDOWSKA',
                  email: 'maria.lewandowska@email.com',
                  phone: '+1 (555) 567-8901',
                  location: 'Boston, USA',
                  status: 'on_hold',
                  caseType: 'By Descent',
                  lastContact: '2 weeks ago'
                },
                {
                  name: 'JAMES KACZMAREK',
                  email: 'james.kaczmarek@email.com',
                  phone: '+1 (555) 678-9012',
                  location: 'Seattle, USA',
                  status: 'active',
                  caseType: 'By Marriage',
                  lastContact: '1 day ago'
                }
              ].map((client, index) => (
                <div key={index} className="p-4 border border-[var(--border)] rounded-lg bg-[var(--bg-elev)] hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-[var(--text)]">{client.name}</h3>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              client.status === 'active' ? 'success' :
                              client.status === 'pending' ? 'warning' :
                              client.status === 'completed' ? 'neutral' : 'danger'
                            }
                            size="sm"
                          >
                            {client.status}
                          </Badge>
                          <Badge variant="neutral" size="sm">
                            {client.caseType}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-[var(--muted)]">
                          <Mail className="h-4 w-4" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-2 text-[var(--muted)]">
                          <Phone className="h-4 w-4" />
                          {client.phone}
                        </div>
                        <div className="flex items-center gap-2 text-[var(--muted)]">
                          <MapPin className="h-4 w-4" />
                          {client.location}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[var(--muted)]">
                          Last contact: {client.lastContact}
                        </span>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Mail className="h-4 w-4" />
                            Email
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" />
                            View Case
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}