import React from 'react'
import { FileText, Upload, Download, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { CaseDetails, DocumentStatus } from '../types'
import { formatDate } from '@/lib/dateFormat'

interface DocumentsPanelProps {
  caseData: CaseDetails
}

function getStatusVariant(status: string): "success" | "warning" | "danger" | "neutral" {
  switch (status.toUpperCase()) {
    case 'APPROVED': return 'success'
    case 'UPLOADED': return 'warning'
    case 'PENDING': return 'neutral'
    case 'REJECTED': return 'danger'
    default: return 'neutral'
  }
}

function getStatusIcon(status: string) {
  switch (status.toUpperCase()) {
    case 'APPROVED': return <CheckCircle className="h-4 w-4" />
    case 'UPLOADED': return <FileText className="h-4 w-4" />
    case 'PENDING': return <Clock className="h-4 w-4" />
    case 'REJECTED': return <XCircle className="h-4 w-4" />
    default: return <FileText className="h-4 w-4" />
  }
}

export const DocumentsPanel: React.FC<DocumentsPanelProps> = ({ caseData }) => {
  // Generate sample documents if none exist
  const documents: DocumentStatus[] = caseData.documents.length > 0 ? caseData.documents : [
    {
      id: '1',
      type: 'passport',
      status: 'UPLOADED',
      name: 'passport_copy.pdf',
      uploadedAt: new Date().toISOString()
    },
    {
      id: '2',
      type: 'birth_certificate',
      status: 'PENDING',
      name: 'birth_cert.pdf'
    },
    {
      id: '3',
      type: 'polish_ancestor_docs',
      status: 'APPROVED',
      name: 'ancestor_birth_cert_PL.pdf',
      uploadedAt: new Date(Date.now() - 86400000).toISOString()
    }
  ]

  const stats = {
    total: documents.length,
    uploaded: documents.filter(doc => doc.status === 'UPLOADED' || doc.status === 'APPROVED').length,
    pending: documents.filter(doc => doc.status === 'PENDING').length,
    rejected: documents.filter(doc => doc.status === 'REJECTED').length
  }

  return (
    <div className="space-y-6">
      {/* Document Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--text)]">{stats.total}</p>
            <p className="text-sm text-[var(--muted)]">Total Documents</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.uploaded}</p>
            <p className="text-sm text-[var(--muted)]">Uploaded</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            <p className="text-sm text-[var(--muted)]">Pending</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            <p className="text-sm text-[var(--muted)]">Rejected</p>
          </CardBody>
        </Card>
      </div>

      {/* Document List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Documents</h3>
            <Button variant="primary" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-[var(--border)]">
            {documents.map((document) => (
              <div key={document.id} className="p-4 hover:bg-[var(--bg)] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-[var(--text)]">
                        {document.name || `${document.type.replace('_', ' ').toLowerCase()}.pdf`}
                      </h4>
                      <p className="text-sm text-[var(--muted)] capitalize">
                        {document.type.replace('_', ' ')}
                        {document.uploadedAt && (
                          <span> • Uploaded {formatDate(document.uploadedAt)}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(document.status)} className="flex items-center gap-1">
                      {getStatusIcon(document.status)}
                      {document.status}
                    </Badge>
                    
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {documents.length === 0 && (
              <div className="p-12 text-center">
                <FileText className="h-12 w-12 text-[var(--muted)] mx-auto mb-4" />
                <p className="text-[var(--muted)] mb-4">No documents uploaded yet</p>
                <Button variant="primary">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload First Document
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Document Requirements */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Required Documents</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Valid Passport', required: true, uploaded: documents.some(d => d.type === 'passport') },
              { name: 'Birth Certificate', required: true, uploaded: documents.some(d => d.type === 'birth_certificate') },
              { name: 'Polish Ancestor Documents', required: true, uploaded: documents.some(d => d.type === 'polish_ancestor_docs') },
              { name: 'Marriage Certificate', required: false, uploaded: documents.some(d => d.type === 'marriage_certificate') },
              { name: 'Divorce Papers', required: false, uploaded: documents.some(d => d.type === 'divorce_papers') },
              { name: 'Name Change Certificate', required: false, uploaded: documents.some(d => d.type === 'name_change') }
            ].map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-[var(--border)] rounded-[var(--radius)]">
                <div className="flex items-center gap-2">
                  {doc.uploaded ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 border border-[var(--border)] rounded" />
                  )}
                  <span className="text-sm text-[var(--text)]">{doc.name}</span>
                  {doc.required && (
                    <Badge variant="danger" className="text-xs">Required</Badge>
                  )}
                </div>
                
                {!doc.uploaded && (
                  <Button variant="ghost" size="sm">
                    <Upload className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  )
}