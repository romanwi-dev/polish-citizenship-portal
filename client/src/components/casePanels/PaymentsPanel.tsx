import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IOS26Card, IOS26CardHeader, IOS26CardBody } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';

interface PaymentData {
  id: string;
  name: string;
  amount: number;
  currency: string;
  status: 'pending' | 'received' | 'overdue';
  dueDate?: string;
  paidDate?: string;
  description?: string;
}

interface CaseData {
  payments?: { [key: string]: any };
}

interface PaymentsPanelProps {
  caseId: string;
  caseData: CaseData;
}

// ActionButton component - mobile-optimized
const ActionButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost'; size?: 'sm' | 'md' | 'lg' }>(({ children, variant = "primary", size = "md", className = "", ...props }, ref) => {
  const btnVariants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };
  
  const sizeVariants = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-6 py-3 text-lg"
  };
  
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
        "min-h-[44px] min-w-[44px]", // Touch target optimization for mobile
        btnVariants[variant],
        sizeVariants[size],
        "transition-all duration-200 hover:scale-105 active:scale-95",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

ActionButton.displayName = 'ActionButton';

export default function PaymentsPanel({ caseId, caseData }: PaymentsPanelProps) {
  const [payments, setPayments] = useState<PaymentData[]>(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: `payment-${i + 1}`,
      name: `Payment ${i + 1}`,
      amount: caseData.payments?.[`payment${i + 1}`]?.amount || 0,
      currency: caseData.payments?.[`payment${i + 1}`]?.currency || 'EUR',
      status: caseData.payments?.[`payment${i + 1}`]?.status || 'pending',
      dueDate: caseData.payments?.[`payment${i + 1}`]?.dueDate || '',
      paidDate: caseData.payments?.[`payment${i + 1}`]?.paidDate || '',
      description: caseData.payments?.[`payment${i + 1}`]?.description || ''
    }))
  );

  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();

  const updatePayment = useMutation({
    mutationFn: async (updatedPayments: PaymentData[]) => {
      const paymentsData = updatedPayments.reduce((acc, payment) => {
        acc[`payment${payment.id.split('-')[1]}`] = {
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          dueDate: payment.dueDate,
          paidDate: payment.paidDate,
          description: payment.description
        };
        return acc;
      }, {} as any);

      await apiRequest(`/api/admin/cases/${caseId}`, {
        method: 'PATCH',
        body: JSON.stringify({ payments: paymentsData })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-detail', caseId] });
    },
  });

  const handlePaymentChange = (index: number, field: keyof PaymentData, value: string | number) => {
    const updatedPayments = [...payments];
    updatedPayments[index] = { ...updatedPayments[index], [field]: value };
    setPayments(updatedPayments);

    // Auto-save with debounce
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    setSaveTimeout(setTimeout(() => {
      updatePayment.mutate(updatedPayments);
    }, 1000));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Payment Management</h2>
        </div>
        <ActionButton variant="ghost" disabled className="text-muted-foreground" data-testid="button-add-payment">
          <Plus className="h-4 w-4 mr-2" />
          Add Payment
        </ActionButton>
      </div>

      {/* Payment Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {payments.map((payment, index) => (
          <IOS26Card key={payment.id} strong={true}>
            <IOS26CardHeader>
              <h3 className="font-medium">{payment.name}</h3>
            </IOS26CardHeader>
            <IOS26CardBody>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor={`amount-${payment.id}`} className="text-xs">Amount</Label>
                    <Input
                      id={`amount-${payment.id}`}
                      type="number"
                      value={payment.amount}
                      onChange={(e) => handlePaymentChange(index, 'amount', parseFloat(e.target.value) || 0)}
                      className="text-sm"
                      data-testid={`input-amount-${payment.id}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`currency-${payment.id}`} className="text-xs">Currency</Label>
                    <Select value={payment.currency} onValueChange={(value) => handlePaymentChange(index, 'currency', value)}>
                      <SelectTrigger className="text-sm" data-testid={`select-currency-${payment.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="PLN">PLN</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor={`status-${payment.id}`} className="text-xs">Status</Label>
                  <Select value={payment.status} onValueChange={(value) => handlePaymentChange(index, 'status', value)}>
                    <SelectTrigger className="text-sm" data-testid={`select-status-${payment.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor={`description-${payment.id}`} className="text-xs">Description</Label>
                  <Input
                    id={`description-${payment.id}`}
                    value={payment.description}
                    onChange={(e) => handlePaymentChange(index, 'description', e.target.value)}
                    placeholder="Payment description"
                    className="text-sm"
                    data-testid={`input-description-${payment.id}`}
                  />
                </div>
              </div>
            </IOS26CardBody>
          </IOS26Card>
        ))}
      </div>
    </div>
  );
}