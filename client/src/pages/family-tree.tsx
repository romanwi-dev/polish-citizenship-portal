import { Card, CardBody, CardHeader } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { TreePine, Users, Eye, Search, Plus, Filter } from 'lucide-react'

export default function FamilyTreePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text)]">Family Tree Index</h1>
            <p className="text-[var(--muted)] mt-1">Browse and manage family trees across all cases</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="primary" className="gap-2">
              <Plus className="h-4 w-4" />
              New Tree
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Trees', value: '156', icon: TreePine, color: 'text-green-600' },
            { label: 'Complete Trees', value: '89', icon: Users, color: 'text-[var(--accent)]' },
            { label: 'In Progress', value: '51', icon: TreePine, color: 'text-yellow-600' },
            { label: 'Verified', value: '67', icon: Users, color: 'text-green-600' }
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

        {/* Family Trees List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-medium text-[var(--text)]">Case Family Trees</h2>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[var(--muted)]" />
              <input 
                type="text" 
                placeholder="Search family trees..."
                className="px-3 py-1 text-sm border border-[var(--border)] rounded-lg bg-[var(--bg-elev)]"
              />
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Tree Cards */}
              {[
                {
                  caseId: 'C001',
                  clientName: 'KOWALSKI FAMILY',
                  generations: 4,
                  members: 12,
                  status: 'complete',
                  verified: true
                },
                {
                  caseId: 'C002', 
                  clientName: 'NOWAK FAMILY',
                  generations: 3,
                  members: 8,
                  status: 'in_progress',
                  verified: false
                },
                {
                  caseId: 'C003',
                  clientName: 'WIŚNIEWSKI FAMILY', 
                  generations: 4,
                  members: 15,
                  status: 'complete',
                  verified: true
                },
                {
                  caseId: 'C004',
                  clientName: 'DĄBROWSKI FAMILY',
                  generations: 2,
                  members: 6,
                  status: 'pending',
                  verified: false
                },
                {
                  caseId: 'C005',
                  clientName: 'LEWANDOWSKI FAMILY',
                  generations: 3,
                  members: 9,
                  status: 'in_progress',
                  verified: false
                },
                {
                  caseId: 'C006',
                  clientName: 'KACZMAREK FAMILY',
                  generations: 4,
                  members: 11,
                  status: 'complete',
                  verified: true
                }
              ].map((tree, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardBody className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TreePine className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-[var(--muted)]">{tree.caseId}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge 
                          variant={
                            tree.status === 'complete' ? 'success' :
                            tree.status === 'in_progress' ? 'warning' : 'neutral'
                          }
                          size="sm"
                        >
                          {tree.status}
                        </Badge>
                        {tree.verified && (
                          <Badge variant="success" size="sm">
                            verified
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-[var(--text)]">{tree.clientName}</h3>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-[var(--muted)]">Generations:</span>
                        <span className="ml-1 font-medium text-[var(--text)]">{tree.generations}</span>
                      </div>
                      <div>
                        <span className="text-[var(--muted)]">Members:</span>
                        <span className="ml-1 font-medium text-[var(--text)]">{tree.members}</span>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="w-full gap-2">
                      <Eye className="h-4 w-4" />
                      View Tree
                    </Button>
                  </CardBody>
                </Card>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}