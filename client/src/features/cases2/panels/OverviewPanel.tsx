import React from 'react'
import { User, Clock, FileCheck, TrendingUp, Shield } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/ui/Card'
import { Badge } from '@/ui/Badge'
import { CaseDetails } from '../types'

interface OverviewPanelProps {
  caseData: CaseDetails
}

function getTierVariant(tier: string): "success" | "warning" | "danger" | "neutral" {
  switch (tier.toUpperCase()) {
    case 'VIP': return 'success'
    case 'GLOBAL': return 'warning' 
    case 'STANDARD': return 'neutral'
    case 'BASIC': return 'danger'
    default: return 'neutral'
  }
}

function getStageColor(stage: string): string {
  switch (stage.toLowerCase()) {
    case 'completed': return 'text-green-600'
    case 'in_progress': return 'text-blue-600'
    case 'pending': return 'text-yellow-600'
    case 'stalled': return 'text-red-600'
    default: return 'text-gray-600'
  }
}

export const OverviewPanel: React.FC<OverviewPanelProps> = ({ caseData }) => {
  const documentsUploaded = caseData.documents.filter(doc => doc.status === 'UPLOADED' || doc.status === 'APPROVED').length
  const totalDocuments = caseData.documents.length
  const documentProgress = totalDocuments > 0 ? (documentsUploaded / totalDocuments) * 100 : 0

  const completedTasks = caseData.tasks.filter(task => task.status === 'COMPLETED').length
  const totalTasks = caseData.tasks.length
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--muted)]">Case Score</p>
                <p className="text-2xl font-bold text-[var(--text)]">{caseData.score}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-[var(--accent)]" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--muted)]">Case Age</p>
                <p className="text-2xl font-bold text-[var(--text)]">{caseData.ageMonths}m</p>
              </div>
              <Clock className="h-8 w-8 text-[var(--accent)]" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--muted)]">Documents</p>
                <p className="text-2xl font-bold text-[var(--text)]">{documentsUploaded}/{totalDocuments}</p>
              </div>
              <FileCheck className="h-8 w-8 text-[var(--accent)]" />
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--muted)]">Confidence</p>
                <p className="text-2xl font-bold text-[var(--text)]">{caseData.confidence}%</p>
              </div>
              <Shield className="h-8 w-8 text-[var(--accent)]" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Case Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <h3 className="font-semibold">Client Details</h3>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <p className="text-sm text-[var(--muted)]">Name</p>
              <p className="font-medium text-[var(--text)]">{caseData.client.name}</p>
            </div>
            
            <div>
              <p className="text-sm text-[var(--muted)]">Email</p>
              <p className="font-medium text-[var(--text)]">{caseData.client.email}</p>
            </div>
            
            {caseData.client.phone && (
              <div>
                <p className="text-sm text-[var(--muted)]">Phone</p>
                <p className="font-medium text-[var(--text)]">{caseData.client.phone}</p>
              </div>
            )}
            
            {caseData.client.address && (
              <div>
                <p className="text-sm text-[var(--muted)]">Address</p>
                <p className="font-medium text-[var(--text)]">{caseData.client.address}</p>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Case Status */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Case Status</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">Stage</span>
              <span className={`font-medium ${getStageColor(caseData.stage)}`}>
                {caseData.stage}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">Tier</span>
              <Badge variant={getTierVariant(caseData.tier)}>
                {caseData.tier}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">Difficulty</span>
              <span className="font-medium text-[var(--text)]">{caseData.difficulty}/10</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">Processing</span>
              <span className="font-medium text-[var(--text)]">{caseData.processing}</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Progress Tracking */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Progress Overview</h3>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* Document Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--muted)]">Documents Progress</span>
              <span className="text-sm font-medium text-[var(--text)]">
                {documentsUploaded}/{totalDocuments} ({Math.round(documentProgress)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                className="bg-[var(--accent)] h-2 rounded-full transition-all duration-300"
                style={{ width: `${documentProgress}%` }}
              />
            </div>
          </div>

          {/* Task Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--muted)]">Tasks Progress</span>
              <span className="text-sm font-medium text-[var(--text)]">
                {completedTasks}/{totalTasks} ({Math.round(taskProgress)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                className="bg-[var(--success)] h-2 rounded-full transition-all duration-300"
                style={{ width: `${taskProgress}%` }}
              />
            </div>
          </div>

          {/* Overall Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--muted)]">Overall Progress</span>
              <span className="text-sm font-medium text-[var(--text)]">
                {caseData.score}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
              <div
                className="bg-gradient-to-r from-[var(--accent)] to-[var(--success)] h-2 rounded-full transition-all duration-300"
                style={{ width: `${caseData.score}%` }}
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}