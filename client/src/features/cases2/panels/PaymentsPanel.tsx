import React from 'react'
import { DollarSign, CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/ui/Card'
import { Button } from '@/ui/Button'
import { Badge } from '@/ui/Badge'
import { CaseDetails, PaymentStatus } from '../types'
import { formatDate } from '@/lib/dateFormat'

interface PaymentsPanelProps {
  caseData: CaseDetails
}

function getStatusVariant(status: string): "success" | "warning" | "danger" | "neutral" {
  switch (status.toUpperCase()) {
    case 'PAID': return 'success'
    case 'PENDING': return 'warning'
    case 'OVERDUE': return 'danger'
    default: return 'neutral'
  }
}

function getStatusIcon(status: string) {
  switch (status.toUpperCase()) {
    case 'PAID': return <CheckCircle className="h-4 w-4" />
    case 'PENDING': return <Clock className="h-4 w-4" />
    case 'OVERDUE': return <AlertCircle className="h-4 w-4" />
    default: return <DollarSign className="h-4 w-4" />
  }
}

export const PaymentsPanel: React.FC<PaymentsPanelProps> = ({ caseData }) => {
  // Generate sample payments if none exist
  const payments: PaymentStatus[] = caseData.payments.length > 0 ? caseData.payments : [
    {
      id: '1',
      description: 'Initial Consultation Fee',
      status: 'PAID',
      amount: 150,
      currency: 'USD',
      notes: 'Consultation completed'
    },
    {
      id: '2', 
      description: 'Document Processing Fee',
      status: 'PENDING',
      amount: 500,
      currency: 'USD',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Payment due within 7 days'
    },
    {
      id: '3',
      description: 'Citizenship Application Fee',
      status: 'PENDING',
      amount: 1200,
      currency: 'USD',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      notes: 'Final payment for application submission'
    }
  ]

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const paidAmount = payments.filter(p => p.status === 'PAID').reduce((sum, payment) => sum + payment.amount, 0)
  const pendingAmount = payments.filter(p => p.status === 'PENDING').reduce((sum, payment) => sum + payment.amount, 0)
  const overdueAmount = payments.filter(p => p.status === 'OVERDUE').reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <div className="space-y-6">
      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-[var(--text)]">${totalAmount}</p>
            <p className="text-sm text-[var(--muted)]">Total Amount</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">${paidAmount}</p>
            <p className="text-sm text-[var(--muted)]">Paid</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">${pendingAmount}</p>
            <p className="text-sm text-[var(--muted)]">Pending</p>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">${overdueAmount}</p>
            <p className="text-sm text-[var(--muted)]">Overdue</p>
          </CardBody>
        </Card>
      </div>

      {/* Payment Progress */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Payment Progress</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--muted)]">Overall Progress</span>
              <span className="text-sm font-medium text-[var(--text)]">
                ${paidAmount} / ${totalAmount} ({Math.round((paidAmount / totalAmount) * 100)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(paidAmount / totalAmount) * 100}%` }}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Payment List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Payment Schedule</h3>
            <Button variant="primary" size="sm">
              <CreditCard className="h-4 w-4 mr-2" />
              Add Payment
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-[var(--border)]">
            {payments.map((payment) => (
              <div key={payment.id} className="p-4 hover:bg-[var(--bg)] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-[var(--text)]">
                        {payment.description}
                      </h4>
                      <div className="text-sm text-[var(--muted)]">
                        {payment.dueDate && (
                          <span>Due: {formatDate(payment.dueDate)}</span>
                        )}
                        {payment.notes && (
                          <span className="block">{payment.notes}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-[var(--text)]">
                        ${payment.amount} {payment.currency}
                      </p>
                    </div>
                    
                    <Badge variant={getStatusVariant(payment.status)} className="flex items-center gap-1">
                      {getStatusIcon(payment.status)}
                      {payment.status}
                    </Badge>
                    
                    {payment.status !== 'PAID' && (
                      <Button variant="primary" size="sm">
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {payments.length === 0 && (
              <div className="p-12 text-center">
                <DollarSign className="h-12 w-12 text-[var(--muted)] mx-auto mb-4" />
                <p className="text-[var(--muted)] mb-4">No payments scheduled</p>
                <Button variant="primary">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add First Payment
                </Button>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Payment Methods</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--bg)] transition-colors text-left">
              <CreditCard className="h-8 w-8 text-[var(--accent)] mb-2" />
              <h4 className="font-medium text-[var(--text)] mb-1">Credit Card</h4>
              <p className="text-sm text-[var(--muted)]">Visa, Mastercard, Amex</p>
            </button>
            
            <button className="p-4 border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--bg)] transition-colors text-left">
              <DollarSign className="h-8 w-8 text-[var(--success)] mb-2" />
              <h4 className="font-medium text-[var(--text)] mb-1">Bank Transfer</h4>
              <p className="text-sm text-[var(--muted)]">Direct wire transfer</p>
            </button>
            
            <button className="p-4 border border-[var(--border)] rounded-[var(--radius)] hover:bg-[var(--bg)] transition-colors text-left">
              <CheckCircle className="h-8 w-8 text-[var(--warning)] mb-2" />
              <h4 className="font-medium text-[var(--text)] mb-1">Payment Plan</h4>
              <p className="text-sm text-[var(--muted)]">Custom installments</p>
            </button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}