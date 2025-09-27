import React from 'react'
import { Clock, FileText, DollarSign, CheckCircle, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/ui/Card'
import { Badge } from '@/ui/Badge'
import { CaseDetails, TimelineEvent } from '../types'
import { formatDate } from '@/lib/dateFormat'

interface TimelinePanelProps {
  caseData: CaseDetails
}

function getEventIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'milestone': return <CheckCircle className="h-4 w-4" />
    case 'document': return <FileText className="h-4 w-4" />
    case 'payment': return <DollarSign className="h-4 w-4" />
    case 'task': return <Clock className="h-4 w-4" />
    default: return <AlertCircle className="h-4 w-4" />
  }
}

function getEventColor(type: string) {
  switch (type.toLowerCase()) {
    case 'milestone': return 'bg-green-500'
    case 'document': return 'bg-blue-500'
    case 'payment': return 'bg-yellow-500'
    case 'task': return 'bg-purple-500'
    default: return 'bg-gray-500'
  }
}

export const TimelinePanel: React.FC<TimelinePanelProps> = ({ caseData }) => {
  // Generate sample timeline events if none exist
  const timelineEvents: TimelineEvent[] = caseData.timeline.length > 0 ? caseData.timeline : [
    {
      id: '1',
      title: 'Case Created',
      description: `Case ${caseData.id} was created and assigned`,
      date: caseData.created_at || new Date().toISOString(),
      type: 'MILESTONE'
    },
    {
      id: '2', 
      title: 'Initial Documents Requested',
      description: 'Client notified of required documentation',
      date: caseData.created_at || new Date().toISOString(),
      type: 'DOCUMENT'
    },
    {
      id: '3',
      title: 'Payment Processing',
      description: 'Payment methods configured and invoices sent',
      date: caseData.updated_at || new Date().toISOString(),
      type: 'PAYMENT'
    }
  ]

  const sortedEvents = timelineEvents.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Case Timeline</h3>
            <Badge variant="neutral">{sortedEvents.length} Events</Badge>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-[var(--border)]">
            {sortedEvents.map((event, index) => (
              <div key={event.id} className="p-6 relative">
                {/* Timeline connector */}
                {index < sortedEvents.length - 1 && (
                  <div className="absolute left-10 top-12 w-0.5 h-6 bg-[var(--border)]" />
                )}
                
                <div className="flex gap-4">
                  {/* Event icon */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full ${getEventColor(event.type)} flex items-center justify-center text-white`}>
                    {getEventIcon(event.type)}
                  </div>
                  
                  {/* Event content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-[var(--text)] mb-1">
                          {event.title}
                        </h4>
                        <p className="text-sm text-[var(--muted)] mb-2">
                          {event.description}
                        </p>
                        {event.status && (
                          <Badge variant="neutral" className="text-xs">
                            {event.status}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-right text-sm text-[var(--muted)] flex-shrink-0 ml-4">
                        <p>{formatDate(event.date)}</p>
                        <p>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {sortedEvents.length === 0 && (
              <div className="p-12 text-center">
                <Clock className="h-12 w-12 text-[var(--muted)] mx-auto mb-4" />
                <p className="text-[var(--muted)]">No timeline events available</p>
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
              <FileText className="h-5 w-5 text-[var(--accent)] mb-2" />
              <h4 className="font-medium text-[var(--text)] mb-1">Add Document Event</h4>
              <p className="text-sm text-[var(--muted)]">Log document submission or approval</p>
            </button>
            
            <button className="p-4 border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--bg)] transition-colors text-left">
              <DollarSign className="h-5 w-5 text-[var(--warning)] mb-2" />
              <h4 className="font-medium text-[var(--text)] mb-1">Add Payment Event</h4>
              <p className="text-sm text-[var(--muted)]">Record payment or invoice activity</p>
            </button>
            
            <button className="p-4 border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--bg)] transition-colors text-left">
              <CheckCircle className="h-5 w-5 text-[var(--success)] mb-2" />
              <h4 className="font-medium text-[var(--text)] mb-1">Add Milestone</h4>
              <p className="text-sm text-[var(--muted)]">Mark important case progression</p>
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}