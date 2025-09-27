import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { ArrowLeft, User, Clock, FileCheck, TrendingUp, Mail, Phone, Shield, CheckCircle, CreditCard, Download, FileText } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/dateFormat';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  IOS26Card,
  IOS26CardHeader,
  IOS26CardBody
} from '@/components/ui/card';

// Import the exact components and helpers from CaseCardV3
function getProcessingColor(processing: string): string {
  switch (processing.toLowerCase()) {
    case 'tier1': return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'tier2': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'tier3': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    case 'rush': return 'bg-red-500/20 text-red-400 border border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}

function getStateColor(state: string): string {
  switch (state.toLowerCase()) {
    case 'intake': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'usc_in_flight': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
    case 'oby_drafting': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    case 'usc_ready': return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'oby_submittable': return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
    case 'oby_submitted': return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';
    case 'decision_received': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}

// ActionButton component matching CaseCardV3 exactly
const ActionButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }>(({ children, variant = "primary", className = "", ...props }, ref) => {
  const btnVariants = {
    primary: "btn btn-primary",
    secondary: "btn",
    ghost: "btn btn-ghost",
  };
  
  return (
    <button
      ref={ref}
      className={cn(
        btnVariants[variant],
        "touch-target transition-all duration-200 hover:scale-105",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

ActionButton.displayName = 'ActionButton';

// EnhancedStatusCard wrapper matching CaseCardV3 exactly
const EnhancedStatusCard = ({ title, subtitle, icon: Icon, status, children, className = "", ...props }: {
  title?: string;
  subtitle?: string;
  icon?: any;
  status?: string;
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20, scale: 0.95 }}
    animate={{ 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    }}
    whileHover={{
      y: -4,
      scale: 1.02,
      transition: { duration: 0.3 },
    }}
    className={cn("w-full", className)}
    {...props}
  >
    <IOS26Card strong={true} className="h-full">
      <div className="flex items-start justify-between p-4">
        <div className="flex flex-col space-y-1">
          {title && (
            <h3 className="text-2xl font-bold leading-none tracking-tight text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            status === 'green' ? 'bg-green-500/20 text-green-400' :
            status === 'amber' ? 'bg-amber-500/20 text-amber-400' :
            status === 'red' ? 'bg-red-500/20 text-red-400' :
            'bg-muted/20 text-muted-foreground'
          )}>
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <IOS26CardBody>
        {children}
      </IOS26CardBody>
    </IOS26Card>
  </motion.div>
);

interface CaseDetailsParams {
  id: string;
}

// Payment type for payment placeholders
interface Payment {
  id: string;
  label: string;
  status: 'pending' | 'paid' | 'overdue';
  amount?: number | null;
  currency?: string;
  dueDate?: string | null;
}


const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function CaseDetailsV2() {
  const params = useParams<CaseDetailsParams>();
  const [location, setLocation] = useLocation();
  const caseId = params.id;
  
  // Extract tab from query params and set up tab state
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const urlTab = urlParams.get('tab');
  const validTabs = ['overview', 'timeline', 'documents', 'payments', 'oby', 'usc'];
  const initialTab = validTabs.includes(urlTab || '') ? urlTab! : 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [obyModalOpen, setObyModalOpen] = useState(false);
  const [obyData, setObyData] = useState<any>(null);
  const { toast } = useToast();
  
  // Update URL when tab changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const currentPath = location.split('?')[0];
    const newUrl = newTab === 'overview' ? currentPath : `${currentPath}?tab=${newTab}`;
    setLocation(newUrl);
  };

  // OBY JSON export mutation
  const generateObyMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/cases/${caseId}/oby-json`, {
        method: 'POST'
      });
      return response;
    },
    onSuccess: (data) => {
      if (data.success) {
        setObyData(data.data);
        setObyModalOpen(true);
        toast({
          title: "OBY JSON Generated",
          description: data.warnings?.length ? `Generated with ${data.warnings.length} warnings` : "Successfully generated OBY JSON",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: data.errors?.join(', ') || "Failed to generate OBY JSON",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Export Error",
        description: error.message || "Failed to generate OBY JSON",
        variant: "destructive",
      });
    }
  });

  const handleExportOby = () => {
    generateObyMutation.mutate();
  };

  const handleDownloadOby = () => {
    if (!obyData) return;
    
    const dataStr = JSON.stringify(obyData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `oby-${caseId}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast({
      title: "Download Complete",
      description: "OBY JSON file downloaded successfully",
    });
  };

  // Fetch case data
  const { data: apiData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/cases', caseId],
    queryFn: async () => {
      const response = await fetch('/api/admin/cases');
      if (!response.ok) throw new Error('Failed to fetch cases');
      const data = await response.json();
      return data.cases.find((c: any) => c.caseId === caseId || c.id === caseId);
    },
    enabled: !!caseId,
  });

  const handleBack = () => {
    setLocation('/admin/cases');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !apiData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Case not found</p>
          <ActionButton onClick={handleBack} variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Cases
          </ActionButton>
        </div>
      </div>
    );
  }

  // Transform the case data
  const caseData = {
    id: apiData.caseId || apiData.id,
    client: {
      name: apiData.caseManager || `Client ${apiData.caseId}`,
      email: apiData.client_email || null
    },
    processing: apiData.serviceLevel || 'standard',
    difficulty: apiData.difficulty ?? null,
    clientScore: apiData.progress ?? null,
    state: apiData.status || 'INTAKE',
    docs: {
      received: apiData.evidence?.length ?? apiData.documentsCollected ?? 0,
      expected: apiData.documentsRequired ?? 12
    },
    ageMonths: Math.floor((new Date().getTime() - new Date(apiData.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)) || 1,
    lineage: 'Polish ancestry',
    confidence: apiData.confidence,
    notes: apiData.notes || '',
    createdAt: apiData.created_at
  };

  // Create 12 payment placeholders
  const paymentPlaceholders: Payment[] = Array.from({ length: 12 }, (_, index) => ({
    id: `payment-${index + 1}`,
    label: `Payment ${index + 1}`,
    status: 'pending' as const,
    amount: null,
    currency: 'EUR',
    dueDate: null
  }));

  const progressPercent = caseData.docs.expected > 0 
    ? Math.round((caseData.docs.received / caseData.docs.expected) * 100)
    : 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ActionButton
              onClick={handleBack}
              variant="ghost"
              className="gap-2 btn btn-ghost"
              data-testid="button-back-to-cases"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cases
            </ActionButton>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text)]">
                {caseData.client.name}
              </h1>
              <p className="text-[var(--text-subtle)]">Case ID: {caseData.id}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Processing Tier Badge */}
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold",
              getProcessingColor(caseData.processing)
            )}>
              {caseData.processing.toUpperCase()}
            </div>
            
            {/* Stage Badge */}
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              getStateColor(caseData.state)
            )}>
              {caseData.state.replace('_', ' ')}
            </div>
            
            {/* HAC Status Badge - Dynamic Color */}
            <div className={cn(
              "px-2 py-1 rounded-full text-xs font-medium border",
              caseData.confidence && caseData.confidence > 80
                ? "bg-green-500/20 text-green-400 border-green-500/30" // GREEN status
                : "bg-red-500/20 text-red-400 border-red-500/30"       // RED status
            )}>
              HAC: {caseData.confidence && caseData.confidence > 80 ? 'GREEN' : 'RED'}
            </div>
          </div>
        </div>

        {/* Key Metrics Grid - matching CaseCardV3 exactly */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-3 glass-card-light rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground font-medium">Difficulty</div>
            <div className={cn("text-lg font-bold", 
              caseData.difficulty === null ? 'text-muted-foreground' :
              caseData.difficulty >= 8 ? 'text-red-400' :
              caseData.difficulty >= 6 ? 'text-amber-400' :
              caseData.difficulty >= 4 ? 'text-yellow-400' :
              'text-green-400'
            )}>
              {caseData.difficulty ? `${caseData.difficulty}/10` : 'N/A'}
            </div>
          </div>
          
          <div className="text-center p-3 glass-card-light rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground font-medium">Score</div>
            <div className="text-lg font-bold text-[var(--text)]">
              {caseData.clientScore ? `${caseData.clientScore}%` : 'N/A'}
            </div>
          </div>
          
          <div className="text-center p-3 glass-card-light rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-sm text-muted-foreground font-medium">Age</div>
            <div className="text-lg font-bold text-[var(--text)]">
              {caseData.ageMonths}mo
            </div>
          </div>
        </div>

        {/* Document Progress - matching CaseCardV3 exactly */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-[var(--text-subtle)] font-medium">Documents</span>
            </div>
            <span className="text-sm font-semibold text-[var(--text)]">
              {caseData.docs.received}/{caseData.docs.expected}
            </span>
          </div>
          <div className="w-full bg-[var(--surface)] rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-xs text-[var(--text-subtle)] font-medium">
            {progressPercent}% complete • {caseData.lineage}
          </div>
        </div>

        {/* Main Content Tabs */}
        <motion.div variants={cardVariants}>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 gap-1">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="timeline" className="text-xs sm:text-sm">Timeline</TabsTrigger>
              <TabsTrigger value="documents" className="text-xs sm:text-sm">Documents</TabsTrigger>
              <TabsTrigger value="payments" className="text-xs sm:text-sm">Payments</TabsTrigger>
              <TabsTrigger value="oby" className="text-xs sm:text-sm">OBY</TabsTrigger>
              <TabsTrigger value="usc" className="text-xs sm:text-sm">USC</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Client Information */}
                <EnhancedStatusCard
                  title="Client Information"
                  subtitle={caseData.client.email}
                  icon={User}
                  status="green"
                  className="h-full min-h-0"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-[var(--text-subtle)]" />
                      <span className="text-sm text-[var(--text)]">{caseData.client.email}</span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[var(--text)]">Lineage</p>
                      <p className="text-sm text-[var(--text-subtle)]">{caseData.lineage}</p>
                    </div>
                    {caseData.confidence && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-[var(--text)]">Confidence Level</p>
                        <p className="text-sm text-[var(--text-subtle)]">{caseData.confidence}%</p>
                      </div>
                    )}
                  </div>
                </EnhancedStatusCard>

                {/* Case Progress */}
                <EnhancedStatusCard
                  title="Case Progress"
                  subtitle={`${progressPercent}% complete`}
                  icon={FileCheck}
                  status={progressPercent > 80 ? 'green' : progressPercent > 50 ? 'amber' : 'red'}
                  className="h-full min-h-0"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-[var(--text)]">Document Collection</span>
                        <span className="text-[var(--text)]">{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-[var(--surface)] rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500 ease-out"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[var(--text)]">Current Stage</p>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium inline-block",
                        getStateColor(caseData.state)
                      )}>
                        {caseData.state.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-[var(--text)]">Processing Tier</p>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-semibold inline-block",
                        getProcessingColor(caseData.processing)
                      )}>
                        {caseData.processing.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </EnhancedStatusCard>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6">
              <EnhancedStatusCard
                title="Case Timeline"
                subtitle="Track case milestones"
                icon={Clock}
                status="green"
                className="h-full min-h-0"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 glass-card-light rounded-lg">
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"></div>
                    <div>
                      <p className="font-medium text-[var(--text)]">Case Created</p>
                      <p className="text-sm text-[var(--text-subtle)]">
                        {formatDate(caseData.createdAt)}
                      </p>
                    </div>
                  </div>
                  {/* Add more timeline events here */}
                </div>
              </EnhancedStatusCard>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              <EnhancedStatusCard
                title="Required Documents"
                subtitle={`${caseData.docs.received}/${caseData.docs.expected} collected`}
                icon={FileCheck}
                status={progressPercent > 80 ? 'green' : progressPercent > 50 ? 'amber' : 'red'}
                className="h-full min-h-0"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Mock documents - replace with real data */}
                  {Array.from({ length: caseData.docs.expected }).map((_, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 glass-card-light rounded-lg">
                      <span className="text-sm text-[var(--text)]">Document {idx + 1}</span>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        idx < caseData.docs.received ? "bg-green-500" : "bg-amber-500"
                      )} />
                    </div>
                  ))}
                </div>
                
                {/* Export OBY JSON Section */}
                <div className="mt-6 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-[var(--text)] mb-1">
                        Export OBY JSON
                      </h4>
                      <p className="text-xs text-[var(--text-subtle)]">
                        Generate OBYWATELSTWO application JSON from case data
                      </p>
                    </div>
                    <Button
                      onClick={handleExportOby}
                      disabled={generateObyMutation.isPending}
                      className="gap-2"
                      data-testid="button-export-oby"
                    >
                      {generateObyMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          Export OBY JSON
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </EnhancedStatusCard>
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <EnhancedStatusCard
                title="Payment Schedule"
                subtitle="12 payment items"
                icon={CreditCard}
                status="green"
                className="h-full min-h-0"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paymentPlaceholders.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 glass-card-light rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[var(--text)] mb-1">
                          {payment.label}
                        </div>
                        <div className="text-xs text-[var(--text-subtle)]">
                          Amount: {payment.amount ? `${payment.amount} ${payment.currency}` : '—'}
                        </div>
                        <div className="text-xs text-[var(--text-subtle)]">
                          Due: {payment.dueDate || '—'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          payment.status === 'paid' ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                          payment.status === 'overdue' ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                          "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        )}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </EnhancedStatusCard>
            </TabsContent>

            <TabsContent value="oby" className="space-y-6">
              <EnhancedStatusCard
                title="OBY Drafting"
                subtitle="Document drafting workflow"
                icon={FileCheck}
                status="amber"
                className="h-full min-h-0"
              >
                <div className="text-center py-12">
                  <FileCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[var(--text)] mb-2">OBY Drafting</h3>
                  <p className="text-[var(--text-subtle)] mb-6">
                    OBY document drafting workflow coming soon...
                  </p>
                  <div className="text-sm text-[var(--text-subtle)]">
                    This section will contain tools for drafting and managing OBY documents.
                  </div>
                </div>
              </EnhancedStatusCard>
            </TabsContent>

            <TabsContent value="usc" className="space-y-6">
              <EnhancedStatusCard
                title="USC Workflow"
                subtitle="USC task management"
                icon={Clock}
                status="amber"
                className="h-full min-h-0"
              >
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[var(--text)] mb-2">USC Tasks</h3>
                  <p className="text-[var(--text-subtle)] mb-6">
                    USC workflow management coming soon...
                  </p>
                  <div className="text-sm text-[var(--text-subtle)]">
                    This section will contain tools for creating and managing USC tasks.
                  </div>
                </div>
              </EnhancedStatusCard>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* OBY JSON Preview Modal */}
      <Dialog open={obyModalOpen} onOpenChange={setObyModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              OBY JSON Preview - Case {caseId}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 min-h-0 space-y-4">
            {obyData && (
              <>
                {/* Warnings if any */}
                {generateObyMutation.data?.warnings?.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-amber-400 mb-2">Warnings:</h4>
                    <ul className="text-xs text-amber-300 space-y-1">
                      {generateObyMutation.data.warnings.map((warning: string, idx: number) => (
                        <li key={idx}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* JSON Preview */}
                <div className="flex-1 min-h-0">
                  <Textarea
                    value={JSON.stringify(obyData, null, 2)}
                    readOnly
                    className="h-full min-h-[400px] font-mono text-xs resize-none"
                    data-testid="textarea-oby-preview"
                  />
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    Generated: {obyData._meta?.generatedAt ? `${formatDate(obyData._meta.generatedAt)} ${new Date(obyData._meta.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Unknown'}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setObyModalOpen(false)}
                      data-testid="button-close-modal"
                    >
                      Close
                    </Button>
                    <Button
                      onClick={handleDownloadOby}
                      className="gap-2"
                      data-testid="button-download-oby"
                    >
                      <Download className="h-4 w-4" />
                      Download JSON
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}