import { useState, useEffect } from "react";
import { useLocation } from "wouter";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Upload, 
  MessageCircle, 
  Calendar, 
  FileText, 
  Shield, 
  Clock3, 
  CheckCircle2,
  AlertCircle,
  User,
  BookOpen,
  Phone,
  Download,
  Eye,
  Send,
  Activity,
  BarChart3,
  Bell,
  Video,
  Star,
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  RefreshCw,
  Archive,
  X,
  Edit3,
  Users,
  UserPlus,
  Sparkles,
  Trophy,
  StickyNote,
  Scan
} from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import ApplicantDetailsForm from "@/components/applicant-details";
import PolishCitizenshipApplication from "@/components/polish-citizenship-application";
import DocumentChecklist from "@/components/document-checklist";
import { DocumentUpload } from "@/components/document-upload";
import { DocumentProcessingCard } from "@/components/DocumentProcessingCard";
import { OnboardingTour } from "@/components/OnboardingTour";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useOnboarding } from "@/hooks/useOnboarding";
import CaseProgressTracker from "@/components/case-progress-tracker";
import FinancialDashboard from "@/components/financial-dashboard";
import TipPlaceholder from "@/components/tip-placeholder";
import QuickActionsWidget from "@/components/quick-actions-widget";
import SecureMessaging from "@/components/secure-messaging";
import SmartAlerts from "@/components/smart-alerts";
import InteractiveTimeline from "@/components/interactive-timeline";
import MilestoneAchievements from "@/components/milestone-achievements";
import PersonalNotes from "@/components/personal-notes";
import FamilyPortal from "@/components/family-portal";
import DocumentScanner from "@/components/document-scanner";
import AdvancedAnalytics from "@/components/advanced-analytics";

export default function ClientDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Onboarding tour
  const {
    shouldShowOnboarding,
    isOnboardingOpen,
    completeOnboarding,
    skipOnboarding,
    restartOnboarding,
    closeOnboarding
  } = useOnboarding();
  const [progress, setProgress] = useState(35);
  const [message, setMessage] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Document Approved", message: "Your birth certificate has been verified", time: "2 hours ago", read: false, type: "success" },
    { id: 2, title: "Next Step Ready", message: "Archive search results are available for review", time: "1 day ago", read: false, type: "info" },
    { id: 3, title: "Payment Due", message: "Next installment due in 5 days", time: "2 days ago", read: true, type: "warning" }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get user ID from localStorage (authentication is now optional)
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  
  // Authentication check disabled - dashboard accessible without login
  /*
  useEffect(() => {
    if (!userId && !token) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to access the dashboard",
        variant: "destructive"
      });
      setLocation("/register");
    }
  }, [userId, token, setLocation, toast]);
  */
  
  // Fetch user data
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('userId');
          localStorage.removeItem('token');
          setLocation('/register');
        }
        throw new Error('Failed to fetch user data');
      }
      const result = await response.json();
      return result.user;
    },
    enabled: !!token,
    retry: false
  });
  
  const { data: caseProgressData, isLoading: isLoadingProgress } = useQuery({
    queryKey: ['/api/case-progress', userId],
    queryFn: async () => {
      const response = await fetch(`/api/case-progress/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch case progress');
      const result = await response.json();
      return result.data;
    },
    enabled: !!userId, // Only fetch if userId exists
    retry: false
  });
  
  // Update progress when case data loads
  useEffect(() => {
    if (caseProgressData?.overallProgress) {
      setProgress(caseProgressData.overallProgress);
    }
  }, [caseProgressData]);

  // Fetch security status
  const { data: securityStatus } = useQuery({
    queryKey: ['/api/security/status', userId],
    queryFn: async () => {
      const response = await fetch(`/api/security/status/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch security status');
      const result = await response.json();
      return result.data;
    },
    enabled: !!userId, // Only fetch if userId exists
    retry: false
  });

  // Transform case progress data to match existing component structure
  const clientData = caseProgressData ? {
    name: userData?.firstName && userData?.lastName ? `${userData.firstName} ${userData.lastName}` : "Guest User",
    email: userData?.email || "demo@polishcitizenship.pl",
    caseId: caseProgressData.caseId,
    currentPhase: caseProgressData.currentPhase.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    estimatedCompletion: caseProgressData.estimatedCompletionDate 
      ? `${Math.ceil((new Date(caseProgressData.estimatedCompletionDate).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000))} months remaining`
      : "18 months remaining",
    serviceLevel: caseProgressData.serviceLevel.toUpperCase(),
    caseManager: caseProgressData.caseManager || "Anna Kowalska",
    managerEmail: "anna.kowalska@polishcitizenship.pl",
    startDate: new Date(caseProgressData.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    totalCost: "€6,500",
    paidAmount: "€2,600",
    nextPayment: "€800",
    nextPaymentDate: "February 15, 2025",
    successProbability: caseProgressData.successProbability
  } : {
    name: userData?.firstName && userData?.lastName ? `${userData.firstName} ${userData.lastName}` : "Demo User",
    email: userData?.email || "demo@polishcitizenship.pl",
    phone: "+1234567890",
    caseId: "PL-2024-1847",
    currentPhase: "Document Collection",
    estimatedCompletion: "18 months remaining",
    serviceLevel: "EXPEDITED",
    caseManager: "Anna Kowalska",
    managerEmail: "anna.kowalska@polishcitizenship.pl",
    startDate: "March 15, 2024",
    totalCost: "€6,500",
    paidAmount: "€2,600",
    nextPayment: "€800",
    nextPaymentDate: "February 15, 2025",
    successProbability: 92
  };

  // Enhanced analytics data from real progress
  const analyticsData = caseProgressData ? {
    caseProgress: {
      documentsCollected: caseProgressData.documentsCollected,
      totalDocuments: caseProgressData.documentsRequired,
      verifiedDocuments: caseProgressData.documentsVerified,
      translationsComplete: caseProgressData.translationsCompleted,
      totalTranslations: caseProgressData.translationsRequired
    },
    timeline: {
      daysActive: Math.ceil((Date.now() - new Date(caseProgressData.createdAt).getTime()) / (24 * 60 * 60 * 1000)),
      averageResponseTime: "6 hours",
      lastActivity: caseProgressData.lastActivityDate 
        ? new Date(caseProgressData.lastActivityDate).toLocaleString()
        : "2 hours ago"
    },
    costs: {
      budgetUsed: 40,
      remainingBudget: 60,
      additionalCosts: "€450"
    }
  } : {
    caseProgress: {
      documentsCollected: 8,
      totalDocuments: 12,
      verifiedDocuments: 6,
      translationsComplete: 4,
      totalTranslations: 6
    },
    timeline: {
      daysActive: 125,
      averageResponseTime: "6 hours",
      lastActivity: "2 hours ago"
    },
    costs: {
      budgetUsed: 40,
      remainingBudget: 60,
      additionalCosts: "€450"
    }
  };

  const recentActivity = [
    {
      id: 1,
      action: "Birth certificate verified",
      date: "2 days ago",
      status: "completed",
      icon: CheckCircle2
    },
    {
      id: 2,
      action: "Marriage certificate uploaded",
      date: "5 days ago", 
      status: "completed",
      icon: Upload
    },
    {
      id: 3,
      action: "Translation in progress",
      date: "1 week ago",
      status: "in-progress",
      icon: Clock3
    },
    {
      id: 4,
      action: "Archive search initiated",
      date: "2 weeks ago",
      status: "completed",
      icon: FileText
    }
  ];

  const documents = [
    {
      id: 1,
      name: "Birth Certificate - Maria Johnson",
      type: "Birth Certificate",
      status: "verified",
      uploadDate: "Dec 15, 2024",
      size: "2.4 MB"
    },
    {
      id: 2,
      name: "Marriage Certificate - Parents",
      type: "Marriage Certificate", 
      status: "verified",
      uploadDate: "Dec 10, 2024",
      size: "1.8 MB"
    },
    {
      id: 3,
      name: "Grandfather Birth Certificate - Polish",
      type: "Birth Certificate",
      status: "pending-translation",
      uploadDate: "Dec 8, 2024",
      size: "3.1 MB"
    }
  ];

  const phases = [
    { name: "Initial Assessment", status: "completed", percentage: 100 },
    { name: "Document Collection", status: "current", percentage: 75 },
    { name: "Archive Research", status: "pending", percentage: 0 },
    { name: "Legal Review", status: "pending", percentage: 0 },
    { name: "Government Submission", status: "pending", percentage: 0 },
    { name: "Processing & Approval", status: "pending", percentage: 0 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'verified': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'current': return 'text-blue-600 bg-blue-50'; 
      case 'pending': return 'text-gray-500 bg-gray-50';
      case 'pending-translation': return 'text-amber-600 bg-amber-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const markNotificationAsRead = (id: number) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const refreshDashboard = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
    toast({
      title: "Dashboard Refreshed",
      description: "All data has been updated successfully."
    });
  };

  const handleVideoCall = () => {
    toast({
      title: "Video Call Scheduled",
      description: "A Calendly link will be sent to your email shortly."
    });
  };

  const handleCitizenshipTest = () => {
    window.open("https://polishcitizenshiptest.com", "_blank");
  };

  const handleContactManager = () => {
    window.location.href = `mailto:${clientData.managerEmail}?subject=Case ${clientData.caseId} - Inquiry`;
  };

  const handleGenerateDocuments = () => {
    toast({
      title: "Documents Generated",
      description: "Your Power of Attorney and application forms are ready for download."
    });
  };

  const handlePhaseTransition = () => {
    toast({
      title: "Phase Transition",
      description: "Moving to the next phase. You'll receive an email with next steps."
    });
  };

  const handleUploadComplete = () => {
    setShowUploadDialog(false);
    toast({
      title: "Document Uploaded Successfully",
      description: "Your document has been uploaded and is ready for review."
    });
  };

  // Mock user ID for demo purposes
  const mockUserId = "demo-user-123";

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen glass-surface mobile-stable" style={{ 
      letterSpacing: 'var(--ios26-letter-spacing)',
      lineHeight: 'var(--ios26-line-height)'
    }}>
      <ThemeSwitcher />
      
      {/* Welcome Area for Onboarding Tour */}
      <div data-tour="dashboard-welcome" className="sr-only">Dashboard Welcome</div>
      <div data-tour="dashboard-center" className="sr-only">Dashboard Center</div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mobile-stable">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="flex items-center gap-4 mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900" style={{ 
                letterSpacing: 'var(--ios26-letter-spacing)',
                lineHeight: 'var(--ios26-line-height)'
              }}>Your Citizenship Portal</h1>
              <Button
                onClick={refreshDashboard}
                variant="ghost"
                size="sm"
                disabled={isRefreshing}
                className="text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            {/* All Action Buttons in One Row */}
            <div className="overflow-x-auto">
              <div className="flex items-center gap-3 min-w-max">
                {/* Overview Button */}
                <button className="btn btn-secondary">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="font-medium text-gray-700">Overview</span>
                </button>
                
                {/* Quick Actions Button */}
                <button className="btn btn-secondary">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="font-medium text-gray-700">Quick Actions</span>
                </button>

                {/* Take Tour Button */}
                <button 
                  onClick={restartOnboarding} 
                  className="btn btn-primary"
                >
                  <Sparkles className="w-5 h-5" />
                  <span className="font-medium">Take Tour</span>
                </button>
                
                {/* Notifications Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="btn btn-secondary relative"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 glass-card-danger text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                
                  {showNotifications && (
                    <div className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-0 top-full mt-2 w-[90vw] max-w-sm sm:w-96 glass-card rounded-lg z-50 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-white/20">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div className="divide-y divide-gray-100">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 cursor-pointer glass-hover ${!notification.read ? 'glass-card-info' : ''}`}
                            onClick={() => markNotificationAsRead(notification.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 text-sm">{notification.title}</h4>
                                <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                                <p className="text-gray-400 text-xs mt-2">{notification.time}</p>
                              </div>
                              {!notification.read && (
                                <span className="w-2 h-2 glass-accent rounded-full mt-2"></span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              
                {/* Schedule Video Call Button */}
                <button
                  onClick={handleVideoCall}
                  className="btn btn-secondary px-6 py-3 rounded-full whitespace-nowrap"
                >
                  <Video className="w-5 h-5" />
                  <span className="font-medium">Schedule Video Call</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Bank-Level Security Field - Moved Below Pills */}
          <Card className="glass-card-success mb-4">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-green-600" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-800">Bank-Level Security</h4>
                  <p className="text-sm text-green-700">
                    Your personal information and documents are protected with enterprise-grade encryption. 
                    We maintain the highest standards of data security and privacy compliance.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* AI Document Processing - Moved to top */}
          <div className="document-processing-card mb-4" data-tour="document-processing-card">
            <DocumentProcessingCard />
          </div>
          
          {/* Enhanced Client Info Bar */}
          <Card className="glass-card-primary text-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                <div>
                  <div className="text-sm text-blue-100">Client</div>
                  <div className="font-semibold text-white">{clientData.name}</div>
                </div>
                <div>
                  <div className="text-sm text-blue-200">Case ID</div>
                  <div className="font-semibold text-white">{clientData.caseId}</div>
                </div>
                <div>
                  <div className="text-sm text-blue-200">MARRIED</div>
                  <div className="font-semibold text-white">NO</div>
                </div>
                <div>
                  <div className="text-sm text-blue-200">Service Level</div>
                  <div className="font-semibold text-white flex items-center gap-1">
                    <Zap className="w-4 h-4 text-yellow-300" />
                    {clientData.serviceLevel}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-blue-200">Success Rate</div>
                  <div className="font-semibold text-white flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-300" />
                    {clientData.successProbability}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-blue-200">Total Investment</div>
                  <div className="font-semibold text-white">{clientData.totalCost}</div>
                </div>
                <div>
                  <div className="text-sm text-blue-200">Case Manager</div>
                  <div className="font-semibold text-white">{clientData.caseManager}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mt-6 glass-tab-container p-1 rounded-lg overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'applicantdetails', label: 'FORM', icon: UserPlus },
              { id: 'familytree', label: 'TREE', icon: Users },
              { id: 'quickactions', label: 'Quick Actions', icon: Zap },
              { id: 'alerts', label: 'Alerts', icon: Bell },
              { id: 'timeline', label: 'Timeline', icon: Clock3 },
              { id: 'progress', label: 'Case Progress', icon: TrendingUp },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'scanner', label: 'Scanner', icon: Scan },
              { id: 'financial', label: 'Financial', icon: DollarSign },
              { id: 'messaging', label: 'Messaging', icon: MessageCircle },
              { id: 'familyportal', label: 'Family Portal', icon: Users },
              { id: 'achievements', label: 'Achievements', icon: Trophy },
              { id: 'notes', label: 'Notes', icon: StickyNote },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'polishcitizenship', label: 'Wniosek o Obywatelstwo', icon: FileText },
              { id: 'powerattorney', label: 'Pełnomocnictwo', icon: FileText },
              { id: 'documentchecklist', label: 'Document Checklist', icon: CheckCircle2 }
            ].map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-primary-blue shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tab Content - Key Metrics for Overview */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                
                {/* Applicant Card - Green Section */}
                <Card className="glass-card-success text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-white font-bold text-lg mb-1">Applicant</h3>
                        <p className="text-green-100 text-sm">Personal Information</p>
                      </div>
                      <User className="w-8 h-8 text-green-200" />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-green-100 text-sm">Name:</span>
                        <span className="text-sm font-medium">{userData?.firstName && userData?.lastName ? `${userData.firstName} ${userData.lastName}`.toUpperCase() : "NOT SET"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-100 text-sm">MARRIED:</span>
                        <span className="text-sm font-bold">{userData?.married || "NO"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-100 text-sm">Status:</span>
                        <span className="text-sm font-medium">Active</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Completely Redesigned Document Progress Overview */}
                <Card className="glass-card-primary text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-white font-bold text-lg mb-1">Document Progress Overview</h3>
                        <p className="text-purple-100 text-sm">Complete Documentation Status</p>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-0 glass-highlight rounded-full blur-xl"></div>
                        <FileText className="w-10 h-10 text-white relative z-10" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-100 text-sm font-medium">Total Progress</span>
                        <span className="text-xl font-bold">{analyticsData.caseProgress.documentsCollected}/{analyticsData.caseProgress.totalDocuments}</span>
                      </div>
                      
                      <div className="relative">
                        <div className="w-full glass-surface bg-opacity-20 rounded-full h-4">
                          <div 
                            className="glass-card-success h-4 rounded-full relative overflow-hidden"
                            style={{ width: `${(analyticsData.caseProgress.documentsCollected / analyticsData.caseProgress.totalDocuments) * 100}%` }}
                          >
                            <div className="absolute inset-0 glass-highlight opacity-30 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="text-xs text-purple-200">0 docs</span>
                          <span className="text-xs text-purple-200 font-bold">{Math.round((analyticsData.caseProgress.documentsCollected / analyticsData.caseProgress.totalDocuments) * 100)}%</span>
                          <span className="text-xs text-purple-200">12 docs</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="text-center glass-card p-2 rounded-lg">
                          <CheckCircle2 className="w-5 h-5 text-green-300 mx-auto mb-1" />
                          <p className="text-xs text-purple-100">Verified</p>
                          <p className="text-sm font-bold">{analyticsData.caseProgress.verifiedDocuments}</p>
                        </div>
                        <div className="text-center glass-card p-2 rounded-lg">
                          <Clock3 className="w-5 h-5 text-yellow-300 mx-auto mb-1" />
                          <p className="text-xs text-purple-100">Pending</p>
                          <p className="text-sm font-bold">{analyticsData.caseProgress.documentsCollected - analyticsData.caseProgress.verifiedDocuments}</p>
                        </div>
                        <div className="text-center glass-card p-2 rounded-lg">
                          <AlertCircle className="w-5 h-5 text-orange-300 mx-auto mb-1" />
                          <p className="text-xs text-purple-100">Required</p>
                          <p className="text-sm font-bold">{analyticsData.caseProgress.totalDocuments - analyticsData.caseProgress.documentsCollected}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Budget Used</p>
                        <p className="text-2xl font-bold">{analyticsData.costs.budgetUsed}%</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-200" />
                    </div>
                    <div className="mt-4">
                      <Progress value={analyticsData.costs.budgetUsed} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Success Rate</p>
                        <p className="text-2xl font-bold">{clientData.successProbability}%</p>
                      </div>
                      <Target className="w-8 h-8 text-purple-200" />
                    </div>
                    <div className="mt-4">
                      <Progress value={clientData.successProbability} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Enhanced Communication Tab */}
            {activeTab === 'communications' && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-primary-blue" />
                      Communication Center
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Video Call Starting",
                            description: "Connecting you with Anna Kowalska...",
                          });
                        }}
                        className="hover:bg-blue-50"
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Video Call
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          toast({
                            title: "Meeting Scheduled",
                            description: "Meeting request sent to your case manager.",
                          });
                        }}
                        className="hover:bg-blue-50"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Meeting
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    <div className="flex space-x-3">
                      <div className="w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <div className="text-sm font-medium text-gray-900 mb-1">Anna Kowalska (Case Manager)</div>
                          <p className="text-sm text-gray-700">Hi Maria! Great news - your birth certificate has been successfully verified. We're now proceeding with the archive search for your grandfather's documents.</p>
                          <div className="text-xs text-gray-500 mt-2">Today, 2:30 PM</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="space-y-4">
                      <Textarea 
                        placeholder="Type your message to the legal team..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        className="w-full"
                      />
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          <Shield className="w-4 h-4 inline mr-1" />
                          All communications are encrypted and secure
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setShowUploadDialog(true)}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Attach File
                          </Button>
                          <Button 
                            className="bg-primary-blue hover:bg-primary-blue-light"
                            onClick={() => {
                              if (message.trim()) {
                                toast({
                                  title: "Message Sent",
                                  description: "Your message has been sent to the legal team.",
                                });
                                setMessage("");
                              }
                            }}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Family Tree Tab */}
            {activeTab === 'familytree' && (
              <div data-tour="family-tree-card">
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                  Family Tree will be implemented later
                </div>
              </div>
            )}

            {/* Applicant Details Tab */}
            {activeTab === 'applicantdetails' && (
              <div data-tour="client-details-card">
                <ApplicantDetailsForm />
              </div>
            )}

            {/* Polish Citizenship Application Tab */}
            {activeTab === 'polishcitizenship' && (
              <PolishCitizenshipApplication />
            )}

            {/* Power of Attorney Tab */}
            {activeTab === 'powerattorney' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-blue-900 flex items-center gap-2">
                    <FileText className="w-7 h-7" />
                    Pełnomocnictwo (Power of Attorney)
                  </CardTitle>
                  <div className="bg-blue-100 p-4 rounded-lg border border-blue-200 mt-4">
                    <p className="text-blue-800 font-medium">📋 Formularz Pełnomocnictwa</p>
                    <p className="text-blue-700 text-sm mt-1">
                      Ten formularz jest automatycznie wypełniany danymi z Drzewa Genealogicznego i Danych Klienta.
                      <br />
                      <strong>Dlaczego to ważne:</strong> Pełnomocnictwo pozwala naszym prawnikom działać w Twoim imieniu podczas procesu uzyskiwania obywatelstwa polskiego.
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-800 mb-2">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold">Status: Gotowy do automatycznego wypełnienia</span>
                    </div>
                    <p className="text-green-700 text-sm">
                      Ten dokument zostanie automatycznie wygenerowany na podstawie informacji podanych w:
                    </p>
                    <ul className="text-green-700 text-sm mt-2 ml-4 list-disc">
                      <li>Drzewo Genealogiczne → Dane osobowe i rodzinne</li>
                      <li>Dane Klienta → Informacje kontaktowe i identyfikacyjne</li>
                      <li>Wniosek o Obywatelstwo → Szczegóły prawne</li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Sekcje Pełnomocnictwa:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Dane Mocodawcy (Twoje dane)
                        </li>
                        <li className="flex items-center gap-2 text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Dane Pełnomocnika (Kancelaria prawna)
                        </li>
                        <li className="flex items-center gap-2 text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Zakres upoważnienia
                        </li>
                        <li className="flex items-center gap-2 text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Podpis i data
                        </li>
                      </ul>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Wymagane dokumenty:</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Dokument tożsamości
                        </li>
                        <li className="flex items-center gap-2 text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Notarialne poświadczenie (opcjonalne)
                        </li>
                        <li className="flex items-center gap-2 text-gray-600">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          Apostille (dla dokumentów spoza UE)
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/generate-poa-pdf', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              principalFullName: clientData.name || 'John Doe',
                              principalBirthDate: '01.01.1970',
                              principalBirthPlace: 'Warsaw, Poland',
                              principalAddress: '123 Main St, New York, NY 10001',
                              principalPassportNumber: 'AB1234567',
                              principalPhone: clientData.phone || '+1234567890',
                              principalEmail: clientData.email || 'client@example.com',
                              poaType: 'single',
                              scopeOfAuthority: [
                                'Reprezentowanie przed wszystkimi urzędami w Polsce',
                                'Składanie wniosków o potwierdzenie obywatelstwa polskiego',
                                'Odbieranie dokumentów i korespondencji',
                                'Składanie odwołań i zażaleń',
                                'Dostęp do akt sprawy'
                              ]
                            })
                          });
                          
                          if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'pelnomocnictwo-power-of-attorney.pdf';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                          } else {
                            alert('Error generating PDF. Please try again.');
                          }
                        } catch (error) {
                          console.error('Error generating POA PDF:', error);
                          alert('Failed to generate PDF. Please try again.');
                        }
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Wygeneruj Pełnomocnictwo
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={async () => {
                        try {
                          const response = await fetch('/api/blank-citizenship-pdf', {
                            method: 'GET'
                          });
                          
                          if (response.ok) {
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'blank-wniosek-obywatelstwo.pdf';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                          }
                        } catch (error) {
                          console.error('Error downloading template:', error);
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Pobierz szablon PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Case Progress Tab */}
            {activeTab === 'progress' && (
              <CaseProgressTracker />
            )}

            {/* Financial Dashboard Tab */}
            {activeTab === 'financial' && (
              <FinancialDashboard />
            )}

            {/* Document Checklist Tab */}
            {activeTab === 'documentchecklist' && (
              <DocumentChecklist />
            )}

            {/* Quick Actions Widget Tab */}
            {activeTab === 'quickactions' && (
              <QuickActionsWidget />
            )}

            {/* Smart Alerts Tab */}
            {activeTab === 'alerts' && (
              <SmartAlerts userId={userId || "default"} />
            )}

            {/* Interactive Timeline Tab */}
            {activeTab === 'timeline' && (
              <InteractiveTimeline userId={userId || "default"} />
            )}

            {/* Document Scanner Tab */}
            {activeTab === 'scanner' && (
              <DocumentScanner userId={userId || "default"} />
            )}

            {/* Secure Messaging Tab */}
            {activeTab === 'messaging' && (
              <SecureMessaging userId={userId || "default"} />
            )}

            {/* Family Portal Tab */}
            {activeTab === 'familyportal' && (
              <FamilyPortal userId={userId || "default"} />
            )}

            {/* Milestone Achievements Tab */}
            {activeTab === 'achievements' && (
              <MilestoneAchievements userId={userId || "default"} />
            )}

            {/* Personal Notes Tab */}
            {activeTab === 'notes' && (
              <PersonalNotes userId={userId || "default"} />
            )}

            {/* Advanced Analytics Tab - moved here to avoid duplicate with existing analytics */}
            {activeTab === 'analytics' && (
              <AdvancedAnalytics userId={userId || "default"} />
            )}
            
            {/* Application Status - Show on Overview and Documents tabs */}
            {(activeTab === 'overview' || activeTab === 'documents') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-blue" />
                  Application Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-medium text-gray-900">Current Phase: {clientData.currentPhase}</span>
                    <span className="text-sm text-gray-600">{progress}% Complete</span>
                  </div>
                  <Progress value={progress} className="h-3 mb-2" />
                  <div className="text-sm text-gray-600">Est. {clientData.estimatedCompletion}</div>
                </div>

                {/* Phase Timeline */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Phase Timeline</h4>
                  {phases.map((phase, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${
                        phase.status === 'completed' ? 'bg-green-500' :
                        phase.status === 'current' ? 'bg-blue-500' : 'bg-gray-300'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className={`text-sm ${
                            phase.status === 'completed' || phase.status === 'current' 
                              ? 'font-medium text-gray-900' 
                              : 'text-gray-500'
                          }`}>
                            {phase.name}
                          </span>
                          {phase.status === 'current' && (
                            <Badge variant="secondary" className="text-xs">In Progress</Badge>
                          )}
                          {phase.status === 'completed' && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">Complete</Badge>
                          )}
                        </div>
                        {phase.status === 'current' && phase.percentage > 0 && (
                          <Progress value={phase.percentage} className="h-1 mt-1" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Document Management - Show on Overview and Documents tabs */}
            {(activeTab === 'overview' || activeTab === 'documents') && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-blue" />
                    Document Management
                  </CardTitle>
                  <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-primary-blue hover:bg-primary-blue-light">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                      </DialogHeader>
                      <DocumentUpload 
                        userId={mockUserId} 
                        onUploadComplete={handleUploadComplete}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{doc.name}</div>
                          <div className="text-sm text-gray-500">
                            {doc.type} • {doc.size} • {doc.uploadDate}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getStatusColor(doc.status)}`}>
                          {doc.status.replace('-', ' ')}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            )}

            {/* Communication Center - Only show on Overview tab */}
            {activeTab === 'overview' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary-blue" />
                  Direct Communication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">Message your legal team</div>
                    <Textarea 
                      placeholder="Ask questions about your case, request updates, or discuss next steps..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      className="bg-primary-blue hover:bg-primary-blue-light"
                      onClick={() => {
                        if (!message.trim()) {
                          toast({ 
                            title: "Message Required", 
                            description: "Please enter a message before sending.", 
                            variant: "destructive" 
                          });
                          return;
                        }
                        toast({
                          title: "Message Sent",
                          description: "Your message has been sent to the legal team."
                        });
                        setMessage("");
                      }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button variant="outline" onClick={handleVideoCall}>
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Call
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-8">
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary-blue" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const IconComponent = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-start gap-3">
                        <div className={`p-1 rounded-full ${getStatusColor(activity.status)}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{activity.action}</div>
                          <div className="text-xs text-gray-500">{activity.date}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowUploadDialog(true)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={handleVideoCall}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Call
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => {
                      toast({
                        title: "Emergency Contact",
                        description: "Calling your case manager directly. Please wait..."
                      });
                      window.location.href = "tel:+48123456789";
                    }}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Emergency Contact
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      toast({
                        title: "Generating Reports",
                        description: "Your case report and progress summary are being prepared."
                      });
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Reports
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Resource Library */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-blue" />
                  Resource Library
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="font-medium text-sm">Document Checklist</div>
                    <div className="text-xs text-gray-500">Required documents guide</div>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="font-medium text-sm">Process Timeline</div>
                    <div className="text-xs text-gray-500">Detailed process overview</div>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="font-medium text-sm">FAQ Guide</div>
                    <div className="text-xs text-gray-500">Common questions answered</div>
                  </div>
                  <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="font-medium text-sm">Legal Templates</div>
                    <div className="text-xs text-gray-500">Forms and templates</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="bg-red-600 text-white relative" data-tour="case-manager-card">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4 text-white">Your Case Manager</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-red-100" />
                    <span className="text-sm text-red-100">{clientData.caseManager}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-red-100" />
                    <span className="text-sm text-red-100">{clientData.managerEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock3 className="w-4 h-4 text-red-100" />
                    <span className="text-sm text-red-100">24-hour response guarantee</span>
                  </div>
                </div>

                <Button 
                  className="w-full mt-4 border-red-600 text-red-600 hover:bg-red-600 hover:text-white bg-white border" 
                  variant="outline"
                  onClick={handleContactManager}
                >
                  Contact Manager Directly
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Security Notice */}
        <Card className="mt-8 bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-800">Bank-Level Security</h4>
                <p className="text-sm text-green-700">
                  Your personal information and documents are protected with enterprise-grade encryption. 
                  We maintain the highest standards of data security and privacy compliance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onboarding Tour */}
      {shouldShowOnboarding && (
        <OnboardingTour
          isOpen={isOnboardingOpen}
          onClose={closeOnboarding}
          onComplete={completeOnboarding}
        />
      )}
    </div>
  );
}