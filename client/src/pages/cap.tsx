import { Card, CardBody, CardHeader } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { Shield, CheckCircle, AlertTriangle, XCircle, Search, Filter } from 'lucide-react'

export default function CAPPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text)]">CAP - Checks Authority Panel</h1>
            <p className="text-[var(--muted)] mt-1">Monitor compliance checks and authority validations</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="primary" className="gap-2">
              <Shield className="h-4 w-4" />
              New Check
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Checks', value: '1,234', icon: Shield, color: 'text-[var(--accent)]' },
            { label: 'Passed', value: '1,089', icon: CheckCircle, color: 'text-green-600' },
            { label: 'Pending', value: '98', icon: AlertTriangle, color: 'text-yellow-600' },
            { label: 'Failed', value: '47', icon: XCircle, color: 'text-red-600' }
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

        {/* Checks Portfolio */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-medium text-[var(--text)]">Authority Checks Portfolio</h2>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[var(--muted)]" />
              <input 
                type="text" 
                placeholder="Search checks..."
                className="px-3 py-1 text-sm border border-[var(--border)] rounded-lg bg-[var(--bg-elev)]"
              />
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {/* Check Categories */}
              {[
                {
                  category: 'Document Verification',
                  checks: [
                    { name: 'Passport Validity', status: 'passed', priority: 'high' },
                    { name: 'Birth Certificate Auth', status: 'pending', priority: 'high' },
                    { name: 'Marriage Certificate', status: 'passed', priority: 'medium' }
                  ]
                },
                {
                  category: 'Eligibility Validation',
                  checks: [
                    { name: 'Ancestry Verification', status: 'passed', priority: 'critical' },
                    { name: 'Residence History', status: 'pending', priority: 'medium' },
                    { name: 'Language Proficiency', status: 'failed', priority: 'low' }
                  ]
                },
                {
                  category: 'Compliance Checks',
                  checks: [
                    { name: 'Criminal Background', status: 'passed', priority: 'critical' },
                    { name: 'Tax Obligations', status: 'passed', priority: 'high' },
                    { name: 'Military Service', status: 'pending', priority: 'medium' }
                  ]
                }
              ].map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-3">
                  <h3 className="font-medium text-[var(--text)] border-b border-[var(--border)] pb-2">
                    {group.category}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.checks.map((check, checkIndex) => (
                      <div key={checkIndex} className="p-3 border border-[var(--border)] rounded-lg bg-[var(--bg-elev)]">
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant={
                              check.status === 'passed' ? 'success' : 
                              check.status === 'pending' ? 'warning' : 'danger'
                            }
                            size="sm"
                          >
                            {check.status}
                          </Badge>
                          <Badge 
                            variant={
                              check.priority === 'critical' ? 'danger' :
                              check.priority === 'high' ? 'warning' : 'neutral'
                            }
                            size="sm"
                          >
                            {check.priority}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-[var(--text)]">{check.name}</p>
                      </div>
                    ))}
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