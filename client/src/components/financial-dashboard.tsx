import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  Download,
  Receipt,
  PiggyBank,
  Target,
  Clock,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Payment {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentDate?: string;
  method?: string;
}

interface Service {
  id: string;
  name: string;
  category: 'legal' | 'translation' | 'research' | 'government';
  cost: number;
  status: 'completed' | 'in-progress' | 'pending';
  description: string;
}

const mockPayments: Payment[] = [
  {
    id: "p1",
    description: "Initial Consultation & Assessment",
    amount: 800,
    dueDate: "2024-03-15",
    status: "paid",
    paymentDate: "2024-03-14",
    method: "Credit Card"
  },
  {
    id: "p2", 
    description: "Document Collection & Verification",
    amount: 1200,
    dueDate: "2024-12-01",
    status: "paid",
    paymentDate: "2024-11-28",
    method: "Bank Transfer"
  },
  {
    id: "p3",
    description: "Archive Research Services",
    amount: 600,
    dueDate: "2025-01-15", 
    status: "pending"
  },
  {
    id: "p4",
    description: "Legal Documentation Preparation",
    amount: 900,
    dueDate: "2025-02-15",
    status: "pending"
  },
  {
    id: "p5",
    description: "Government Submission & Processing",
    amount: 450,
    dueDate: "2025-03-15",
    status: "pending"
  },
  {
    id: "p6",
    description: "Final Review & Delivery",
    amount: 350,
    dueDate: "2025-04-15",
    status: "pending"
  }
];

const mockServices: Service[] = [
  {
    id: "s1",
    name: "Legal Consultation & Case Assessment",
    category: "legal",
    cost: 800,
    status: "completed",
    description: "Comprehensive eligibility analysis and legal strategy"
  },
  {
    id: "s2",
    name: "Document Translation & Certification",
    category: "translation", 
    cost: 450,
    status: "in-progress",
    description: "Official translation of Polish documents with apostille"
  },
  {
    id: "s3",
    name: "Archive Research & Document Recovery",
    category: "research",
    cost: 750,
    status: "in-progress",
    description: "Professional research in Polish State Archives"
  },
  {
    id: "s4",
    name: "Application Preparation & Review",
    category: "legal",
    cost: 650,
    status: "pending",
    description: "Legal document preparation and quality assurance"
  },
  {
    id: "s5",
    name: "Government Filing & Follow-up",
    category: "government",
    cost: 400,
    status: "pending",
    description: "Official submission and status monitoring"
  }
];

export default function FinancialDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'services' | 'budget'>('overview');
  const { toast } = useToast();

  const totalCost = mockPayments.reduce((acc, payment) => acc + payment.amount, 0);
  const paidAmount = mockPayments.filter(p => p.status === 'paid').reduce((acc, payment) => acc + payment.amount, 0);
  const pendingAmount = mockPayments.filter(p => p.status === 'pending').reduce((acc, payment) => acc + payment.amount, 0);
  const nextPayment = mockPayments.find(p => p.status === 'pending');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'legal': return 'bg-purple-100 text-purple-800';
      case 'translation': return 'bg-orange-100 text-orange-800';
      case 'research': return 'bg-teal-100 text-teal-800';
      case 'government': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleMakePayment = (paymentId: string) => {
    toast({
      title: "Payment Processing",
      description: "Redirecting to secure payment portal..."
    });
    // In real app, redirect to payment processor
  };

  const handleDownloadInvoice = (paymentId: string) => {
    toast({
      title: "Invoice Generated",
      description: "Your invoice has been generated and will download shortly."
    });
  };

  const handleSetupAutoPay = () => {
    toast({
      title: "Auto-Pay Setup",
      description: "Redirecting to automatic payment configuration..."
    });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary-blue" />
            Financial Dashboard
          </CardTitle>
          <div className="flex gap-2 mt-4">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'payments', label: 'Payment Schedule' },
              { key: 'services', label: 'Service Breakdown' },
              { key: 'budget', label: 'Budget Tracking' }
            ].map(tab => (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab.key as any)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">€{totalCost.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Total Project Cost</div>
                </div>
                
                <Progress value={(paidAmount / totalCost) * 100} className="h-3" />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">€{paidAmount.toLocaleString()}</div>
                    <div className="text-sm text-green-700">Paid</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600">€{pendingAmount.toLocaleString()}</div>
                    <div className="text-sm text-yellow-700">Remaining</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Payment Due */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Next Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nextPayment ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-blue-900">{nextPayment.description}</div>
                        <div className="text-sm text-blue-700">Due: {nextPayment.dueDate}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-900">€{nextPayment.amount}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleMakePayment(nextPayment.id)}
                      className="flex-1"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay Now
                    </Button>
                    <Button variant="outline" onClick={handleSetupAutoPay}>
                      Setup Auto-Pay
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  All payments completed!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Schedule Tab */}
      {activeTab === 'payments' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-primary-blue" />
              Payment Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockPayments.map((payment, index) => (
                <div key={payment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {payment.status === 'paid' ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : payment.status === 'overdue' ? (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{payment.description}</div>
                        <div className="text-sm text-gray-600">
                          Due: {payment.dueDate}
                          {payment.paymentDate && ` • Paid: ${payment.paymentDate}`}
                          {payment.method && ` • ${payment.method}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">€{payment.amount}</div>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {payment.status === 'pending' && (
                    <div className="flex gap-2 justify-end">
                      <Button 
                        size="sm" 
                        onClick={() => handleMakePayment(payment.id)}
                      >
                        <CreditCard className="w-4 h-4 mr-1" />
                        Pay Now
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadInvoice(payment.id)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Invoice
                      </Button>
                    </div>
                  )}
                  
                  {payment.status === 'paid' && (
                    <div className="flex justify-end">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadInvoice(payment.id)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Receipt
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-blue" />
              Service Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {mockServices.map(service => (
                <div key={service.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{service.description}</div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold">€{service.cost}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Badge className={getStatusColor(service.category)}>
                      {service.category}
                    </Badge>
                    <Badge className={getStatusColor(service.status)}>
                      {service.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Tab */}
      {activeTab === 'budget' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-green-600" />
                Budget Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">€{(totalCost * 0.95).toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Under Original Budget</div>
                  <div className="text-xs text-green-600 mt-1">5% savings achieved</div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Original Estimate</span>
                    <span className="font-medium">€6,850</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Current Total</span>
                    <span className="font-medium">€{totalCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span className="text-sm">Savings</span>
                    <span className="font-medium">€350</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cost by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { category: 'Legal Services', amount: 1450, color: 'bg-purple-500' },
                  { category: 'Document Services', amount: 1200, color: 'bg-orange-500' },
                  { category: 'Research Services', amount: 750, color: 'bg-teal-500' },
                  { category: 'Government Fees', amount: 400, color: 'bg-indigo-500' },
                  { category: 'Translation Services', amount: 700, color: 'bg-yellow-500' }
                ].map((item) => (
                  <div key={item.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.category}</span>
                      <span>€{item.amount} ({Math.round((item.amount / totalCost) * 100)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${(item.amount / totalCost) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}