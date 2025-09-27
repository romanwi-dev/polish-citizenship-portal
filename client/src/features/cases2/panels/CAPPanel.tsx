import React from 'react'
import { Shield, AlertTriangle, CheckCircle, Settings, FileText, RefreshCw } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { CaseDetails } from '../types'
import { formatDate } from '@/lib/dateFormat'

interface CAPPanelProps {
  caseData: CaseDetails
}

// CAP (Case Authorization Protocol) Panel - HAC System Integration
export const CAPPanel: React.FC<CAPPanelProps> = ({ caseData }) => {
  // Mock HAC authorization data based on case
  const authStatus = {
    overall: caseData.score > 80 ? 'GREEN' : caseData.score > 60 ? 'AMBER' : 'RED',
    rules: [
      {
        id: 'R1',
        name: 'Document Completeness',
        status: caseData.documents.length >= 3 ? 'GREEN' : 'RED',
        description: 'All required documents must be uploaded and verified',
        weight: 'HIGH'
      },
      {
        id: 'R2', 
        name: 'Payment Status',
        status: 'GREEN', // Assume payments are handled
        description: 'All invoices must be paid before submission',
        weight: 'HIGH'
      },
      {
        id: 'R3',
        name: 'Family Tree Verification',
        status: 'AMBER',
        description: 'Polish ancestry must be verified through official records',
        weight: 'MEDIUM'
      },
      {
        id: 'R4',
        name: 'Case Review',
        status: caseData.confidence > 75 ? 'GREEN' : 'AMBER',
        description: 'Case must be reviewed by senior legal counsel',
        weight: 'MEDIUM'
      }
    ],
    lastEvaluation: new Date().toISOString(),
    submissionReady: false
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GREEN': return 'text-green-600'
      case 'AMBER': return 'text-yellow-600'
      case 'RED': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusVariant = (status: string): "success" | "warning" | "danger" | "neutral" => {
    switch (status) {
      case 'GREEN': return 'success'
      case 'AMBER': return 'warning'
      case 'RED': return 'danger'
      default: return 'neutral'
    }
  }

  const getWeightVariant = (weight: string): "success" | "warning" | "danger" | "neutral" => {
    switch (weight) {
      case 'HIGH': return 'danger'
      case 'MEDIUM': return 'warning'
      case 'LOW': return 'success'
      default: return 'neutral'
    }
  }

  const greenRules = authStatus.rules.filter(rule => rule.status === 'GREEN').length
  const totalRules = authStatus.rules.length

  return (
    <div className="space-y-6">
      {/* Authorization Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <h3 className="font-semibold">Case Authorization Protocol (CAP)</h3>
            </div>
            <Button variant="ghost" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Re-evaluate
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getStatusColor(authStatus.overall)}`}>
                {authStatus.overall}
              </div>
              <p className="text-sm text-[var(--muted)]">Overall Status</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--text)] mb-2">
                {greenRules}/{totalRules}
              </div>
              <p className="text-sm text-[var(--muted)]">Rules Passed</p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-[var(--text)] mb-2">
                {caseData.confidence}%
              </div>
              <p className="text-sm text-[var(--muted)]">Confidence</p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-[var(--border)]">
            <div className="flex items-center justify-between text-sm text-[var(--muted)]">
              <span>Last Evaluation: {formatDate(authStatus.lastEvaluation)} {new Date(authStatus.lastEvaluation).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span>Case ID: {caseData.id}</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Authorization Rules */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Authorization Rules</h3>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-[var(--border)]">
            {authStatus.rules.map((rule) => (
              <div key={rule.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                      {rule.status === 'GREEN' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : rule.status === 'AMBER' ? (
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-[var(--text)]">{rule.name}</h4>
                        <Badge variant={getWeightVariant(rule.weight)} className="text-xs">
                          {rule.weight}
                        </Badge>
                      </div>
                      <p className="text-sm text-[var(--muted)]">{rule.description}</p>
                    </div>
                  </div>
                  
                  <Badge variant={getStatusVariant(rule.status)} className="flex-shrink-0">
                    {rule.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Submission Controls */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Submission Controls</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {authStatus.overall === 'GREEN' ? (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-[var(--radius)]">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-800 dark:text-green-200">Ready for Submission</h4>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mb-4">
                  All authorization requirements have been met. Case is approved for OBYWATELSTWO submission.
                </p>
                <Button variant="primary" className="bg-green-600 hover:bg-green-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Submit to OBYWATELSTWO
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-[var(--radius)]">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Authorization Required</h4>
                </div>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                  Case does not meet all requirements for automatic submission. Manual override required.
                </p>
                <div className="flex gap-2">
                  <Button variant="secondary">
                    <Settings className="h-4 w-4 mr-2" />
                    Request Override
                  </Button>
                  <Button variant="ghost">
                    View Details
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* HAC System Info */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">HAC System Information</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[var(--muted)]">Authorization Framework</p>
              <p className="font-medium text-[var(--text)]">Hierarchical Access Control (HAC)</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Evaluation Method</p>
              <p className="font-medium text-[var(--text)]">Real-time Rule Engine</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Override Level</p>
              <p className="font-medium text-[var(--text)]">Senior Legal Counsel</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Audit Trail</p>
              <p className="font-medium text-[var(--text)]">Complete & Immutable</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}