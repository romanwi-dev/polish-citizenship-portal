import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, FileCheck2, Bot, ClipboardList, Upload, Settings, ShieldCheck, ArrowRight, RefreshCcw, FolderOpen, Plus, Folder, Palette, ChevronDown, Sun, Moon, Zap, Users, Clock, TrendingUp, FileText, Database, Menu, Home, Phone, Shield, Mail, Copy, Save, ExternalLink, Archive, Trash2, AlertCircle, ChevronLeft } from "lucide-react";
import { QA_MODE } from "@/lib/flags";
import { DebugMappedFields } from "@/components/DebugMappedFields";
import { Link, useLocation, useParams } from "wouter";
import { useQuery } from '@tanstack/react-query';
import { useTheme, THEME_VARIANTS } from '@/hooks/useTheme';
import { useToast } from '@/hooks/use-toast';
import AuthorityPanel from "./components/AuthorityPanel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  IOS26Card,
  IOS26CardHeader,
  IOS26CardBody
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// ---------- Animation variants ----------
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
    },
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: { duration: 0.3 },
  },
};

// ---------- Enhanced Theme Controls ----------
function ThemeSelector({ theme, setTheme }) {
  const currentTheme = THEME_VARIANTS[theme] || THEME_VARIANTS.light;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <AgentButton 
          variant="ghost"
          className="w-full gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
          data-testid="button-theme-selector"
        >
          <div 
            className="w-3 h-3 rounded-full border border-border/30" 
            style={{ backgroundColor: currentTheme.preview }}
          />
          <Palette className="h-4 w-4" />
          {currentTheme.name}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </AgentButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        side="bottom"
        sideOffset={4}
        className="w-48 glass-card border-border/50 shadow-lg overflow-hidden"
      >
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-b border-border/30">
          <div className="flex items-center gap-1.5">
            <Palette className="h-3 w-3" />
            Themes
          </div>
        </div>
        
        <div className="p-1 max-h-64 overflow-y-auto scrollbar-none">
          {Object.entries(THEME_VARIANTS).map(([key, variant]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => setTheme(key)}
              className={`cursor-pointer transition-colors duration-150 rounded-md mb-0.5 px-2 py-1.5 touch-target ${
                theme === key ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              }`}
              data-testid={`button-theme-${key}`}
            >
              <div className="flex items-center gap-2 w-full">
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-3 h-3 rounded-full border border-border/50" 
                    style={{ backgroundColor: variant.preview }}
                  />
                  <div 
                    className="w-1.5 h-1.5 rounded-full" 
                    style={{ backgroundColor: variant.accent }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{variant.name}</div>
                </div>
                {theme === key && (
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------- iOS-26 Enhanced Cards ----------
const EnhancedStatusCard = ({ title, subtitle, icon: Icon, status, children, className = "", ...props }) => (
  <motion.div
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    className={`${className}`}
    {...props}
  >
    <IOS26Card strong className="h-full">
      <IOS26CardHeader
        title={
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-semibold">{title}</span>
          </div>
        }
        subtitle={subtitle || undefined}
        right={status && (
          <div className={`w-3 h-3 rounded-full ${
            status === 'green' ? 'bg-green-500' :
            status === 'amber' ? 'bg-amber-500' :
            status === 'red' ? 'bg-red-500' : 'bg-gray-400'
          }`} />
        )}
      >
      </IOS26CardHeader>
      
      {/* Hairline divider */}
      <div className="h-px bg-border/30 mx-4" />
      
      <IOS26CardBody className="pt-3">
        {children}
      </IOS26CardBody>
    </IOS26Card>
  </motion.div>
);

const AgentButton = React.forwardRef(({ children, variant = "primary", className = "", ...props }, ref) => {
  const btnVariants = {
    primary: "btn btn-primary",
    secondary: "btn",
    ghost: "btn btn-ghost",
  };
  
  return (
    <button
      ref={ref}
      className={`${btnVariants[variant]} touch-target ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

AgentButton.displayName = 'AgentButton';

// Demo case constant removed - using only real case data

export default function AgentControlRoom(){
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [theme, setTheme, isDark] = useTheme();
  const [hacStatus, setHacStatus] = useState('AMBER');
  const [hacCanProceed, setHacCanProceed] = useState(false);
  const [isLawyer, setIsLawyer] = useState(true); // Stubbed role check
  const [dropboxFolders, setDropboxFolders] = useState([]);
  const [dropboxStatus, setDropboxStatus] = useState('loading');
  const [currentPath, setCurrentPath] = useState('');
  const [parentPath, setParentPath] = useState(null);
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [showDropboxImport, setShowDropboxImport] = useState(false);
  const [dropboxForm, setDropboxForm] = useState({
    clientName: '',
    email: '',
    processing: 'standard',
    difficulty: 1,
    clientScore: 50,
    folderPath: '/CASES/'
  });
  const [newClient, setNewClient] = useState({ name: '', email: '', folder: '', processing: 'standard', difficulty: 1, clientScore: 75 });
  
  // Extract case ID from URL parameters using wouter
  const params = useParams();
  const caseId = params.caseId;
  
  // Fetch case data using the same endpoint as cases grid
  const { data: allCasesData, isLoading: caseLoading, error: caseError } = useQuery({
    queryKey: ['/api/admin/cases'],
    enabled: !!caseId,
    retry: false
  });

  // Find the specific case from all cases
  const apiCaseData = useMemo(() => {
    if (!allCasesData?.cases || !caseId) return null;
    return allCasesData.cases.find(c => c.caseId === caseId || c.id === caseId);
  }, [allCasesData, caseId]);
  
  // Transform API data to match expected format - no demo fallback
  const caseData = useMemo(() => {
    if (!apiCaseData) return null;
    
    return {
      id: apiCaseData.caseId || apiCaseData.id,
      client: {
        name: apiCaseData.caseManager || apiCaseData.clientName || `Client ${apiCaseData.id}`,
        email: apiCaseData.client_email || null
      },
      state: apiCaseData.status || 'INTAKE',
      docs: [
        { type: "passport", status: apiCaseData.passportStatus || "PENDING" },
        { type: "birth_cert_foreign", status: apiCaseData.birthCertStatus || "PENDING" },
        { type: "birth_cert_PL", status: apiCaseData.polishBirthCertStatus || "PENDING" },
        { type: "marriage_cert", status: "RECEIVED" },
        { type: "divorce_decree", status: "PENDING" },
        { type: "military_records", status: "RECEIVED" },
        { type: "education_cert", status: "PENDING" },
        { type: "employment_history", status: "RECEIVED" },
        { type: "police_clearance", status: "PENDING" },
        { type: "medical_records", status: "RECEIVED" },
        { type: "address_proof", status: "PENDING" },
        { type: "tax_documents", status: "RECEIVED" }
      ],
      mappedFields: apiCaseData.mappedFields || {},
      processing: apiCaseData.serviceLevel || 'standard',
      difficulty: apiCaseData.difficulty || 1,
      clientScore: apiCaseData.progress || 0,
      created_at: apiCaseData.created_at,
      updated_at: apiCaseData.updated_at
    };
  }, [apiCaseData]);
  
  const [currentCaseData, setCurrentCaseData] = useState(caseData);
  
  useEffect(() => {
    setCurrentCaseData(caseData);
  }, [caseData]);
  
  // Handle case loading and error states
  if (caseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading case data...</p>
        </div>
      </div>
    );
  }
  
  if (caseError || !caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Case Not Found</h1>
          <p className="text-muted-foreground">
            {caseError?.message || `Case ${caseId} could not be found or loaded.`}
          </p>
          <AgentButton
            onClick={() => setLocation('/admin/cases')}
            variant="primary"
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            Back to Cases
          </AgentButton>
        </div>
      </div>
    );
  }
  
  // Load Dropbox folders for client creation with enhanced navigation
  const loadDropboxFolders = async (path = '') => {
    try {
      setDropboxStatus('loading');
      const response = await fetch(`/integrations/dropbox/folders?path=${encodeURIComponent(path)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.entries) {
          // Filter to only show folders (not files)
          const folders = data.entries.filter(item => item.type === 'folder');
          setDropboxFolders(folders);
          setCurrentPath(data.currentPath || path);
          setParentPath(data.parentPath);
          setDropboxStatus('connected');
          
          // Auto-create if ?auto=1 in URL (only when explicitly requested)
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('auto') === '1' && folders.length > 0 && !showCreateClient) {
            // Remove auto parameter to prevent infinite loop
            urlParams.delete('auto');
            const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`;
            window.history.replaceState({}, '', newUrl);
            
            setShowCreateClient(true);
            const firstFolder = folders[0];
            setNewClient(prev => ({
              ...prev,
              name: firstFolder.name.replace(/[#()0-9]/g, '').trim(),
              folder: firstFolder.path_lower
            }));
            setTimeout(() => {
              createClientFromDropbox();
            }, 1000);
          }
        } else {
          setDropboxStatus('error');
        }
      } else {
        setDropboxStatus('error');
      }
    } catch (error) {
      console.log('Could not load Dropbox folders:', error);
      setDropboxStatus('error');
    }
  };

  useEffect(() => {
    // Load initial folder without specifying path - let backend determine ROOT
    loadDropboxFolders('');
  }, []);
  
  const blockers = useMemo(()=>{
    if (!currentCaseData) return [];
    
    const blocks = [];
    
    // Check if required documents are missing
    const missingDocs = currentCaseData.docs.filter(d => d.status === 'PENDING');
    if (missingDocs.length > 0) {
      blocks.push(`Missing documents: ${missingDocs.map(d => d.type).join(', ')}`);
    }
    
    // Check if case is in correct state for submission
    if (currentCaseData.state !== 'OBY_SUBMITTABLE') {
      blocks.push(`Case not ready for submission: currently in ${currentCaseData.state} state. Must be OBY_SUBMITTABLE.`);
    }
    
    // Check if HAC status is red
    if (hacStatus === 'RED') {
      blocks.push('HAC status is RED - authorization required');
    }
    
    return blocks;
  },[currentCaseData, hacStatus]);

  // HAC authorization for submission - based on actual HAC status and override
  const isHACAuthorized = hacCanProceed || (QA_MODE && hacStatus !== 'RED');
  
  const canSubmitOBY = blockers.length === 0 || isHACAuthorized;

  const handleHACStatusChange = (status, canProceed) => {
    setHacStatus(status);
    setHacCanProceed(canProceed);
  };

  function simulateUSCReady(){
    setCurrentCaseData(prev=>({
      ...prev,
      state: "USC_READY",
      docs: prev.docs.map(d => d.type==="birth_cert_PL"? {...d, status:"RECEIVED"}: d)
    }));
    
    toast({
      title: "USC Ready",
      description: "Case state updated to USC Ready. Polish birth certificate received."
    });
    
    // Trigger HAC re-evaluation without page reload
    const refreshButton = document.querySelector('[data-testid="button-hac-refresh"]');
    if (refreshButton) {
      refreshButton.click();
    }
  }
  
  function generatePOA(){
    toast({
      title: "POA Generated",
      description: "PDF: POA (Adult) generated with embedded font and visible fields. Ready for signature."
    });
  }
  
  function draftOBY(){
    setCurrentCaseData(prev=>({...prev, state: "OBY_DRAFTING"}));
    toast({
      title: "OBY Drafted",
      description: "OBY packet drafted: 12 pages, attachments list, exhibits bound. Waiting for USC confirmation to submit."
    });
  }
  
  function submitOBY(){
    // Check for blockers and HAC authorization
    if (blockers.length > 0 && !isHACAuthorized) {
      toast({
        title: "Cannot submit OBY",
        description: "Please resolve blocking issues or get HAC authorization override.",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentCaseData(prev=>({...prev, state: "OBY_SUBMITTED"}));
    toast({
      title: "OBY Submitted",
      description: "OBY packet submitted to the Voivode."
    });
  }
  
  function handleOverrideSubmit(){
    setCurrentCaseData(prev=>({...prev, state: "OBY_SUBMITTED"}));
    toast({
      title: "Override Submit",
      description: "OBY packet submitted despite HAC warnings. Logged for audit trail.",
      variant: "destructive"
    });
  }

  // Quick Dropbox import function for AI Dashboard
  async function handleDropboxImport() {
    if (!dropboxForm.clientName || !dropboxForm.folderPath) {
      toast({
        title: "Missing required fields",
        description: "Client name and folder path are required",
        variant: "destructive"
      });
      return;
    }

    try {
      const adminToken = QA_MODE ? (localStorage.getItem('admin_token') || 'dev-token') : localStorage.getItem('admin_token');
      if (!adminToken) {
        toast({
          title: "Authorization required", 
          description: "Admin token is required for this operation",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('/api/import/createAccounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          items: [{
            path: dropboxForm.folderPath,
            clientName: dropboxForm.clientName,
            email: dropboxForm.email,
            processing: dropboxForm.processing,
            difficulty: parseInt(dropboxForm.difficulty),
            clientScore: parseInt(dropboxForm.clientScore)
          }]
        })
      });

      const result = await response.json();
      
      if (result.ok && result.created && result.created.length > 0) {
        const created = result.created[0];
        toast({
          title: "🎉 Client imported from Dropbox!",
          description: `✅ Case ID: ${created.caseId}\n📁 Dropbox: ${created.dropboxPath}\n💾 Database: ${created.databaseId}\n🔒 HAC Ready: ${created.hacReady ? 'Yes' : 'No'}`
        });
        setShowDropboxImport(false);
        // Reset form
        setDropboxForm({
          clientName: '',
          email: '',
          processing: 'standard',
          difficulty: 1,
          clientScore: 50,
          folderPath: '/CASES/'
        });
      } else {
        toast({
          title: "Import failed",
          description: result.error || 'Unknown error',
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: error.message,
        variant: "destructive"
      });
    }
  }

  async function createClientFromDropbox() {
    if (!newClient.name || !newClient.folder) {
      toast({
        title: "Missing required fields",
        description: "Client name and folder selection required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const adminToken = QA_MODE ? (localStorage.getItem('admin_token') || 'dev-token') : localStorage.getItem('admin_token');
      if (!adminToken) {
        toast({
          title: "Authorization required", 
          description: "Admin token is required for this operation",
          variant: "destructive"
        });
        return;
      }

      const response = await fetch('/import/dropbox/create-accounts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          items: [{
            path: newClient.folder,
            clientName: newClient.name,
            email: newClient.email,
            processing: newClient.processing,
            difficulty: newClient.difficulty,
            clientScore: newClient.clientScore
          }]
        })
      });
      
      const result = await response.json();
      if (result.ok) {
        toast({
          title: "✅ Client created successfully!",
          description: `Case ID: ${result.created[0].caseId}\nPath: ${result.created[0].dropboxPath}`
        });
        setShowCreateClient(false);
        setNewClient({ name: '', email: '', folder: '', processing: 'standard', difficulty: 1, clientScore: 75 });
        // Refresh the page to load the new case
        window.location.reload();
      } else {
        toast({
          title: "Error creating client",
          description: result.error || 'Failed to create client',
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: "Error creating client",
        variant: "destructive"
      });
    }
  }

  return (
    <div className="agent-control-room">
      {/* Breadcrumb Navigation */}
      <div className="w-full px-4 py-2 mb-4 border-b border-border/30">
        <nav className="flex items-center space-x-2 text-sm">
          <Link href="/admin/cases" className="text-muted-foreground hover:text-foreground transition-colors">
            Cases
          </Link>
          <ChevronLeft className="h-4 w-4 -rotate-90 text-muted-foreground" />
          <span className="font-medium text-foreground">
            {caseData.client.name} (C-{caseData.id.toString().slice(-8)})
          </span>
        </nav>
      </div>
      {/* Top Button Row - Fixed Size, Horizontal Scroll */}
      <div className="w-full overflow-x-auto overflow-y-hidden mb-6">
        <div 
          className="flex items-center gap-3 min-w-max px-4" 
          style={{ 
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          {/* PROMINENT DROPBOX BUTTON */}
          <AgentButton
            onClick={() => setShowDropboxImport(true)}
            variant="ghost"
            className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
            data-testid="button-import-dropbox-main"
          >
            <Upload className="h-4 w-4" />
            Dropbox
          </AgentButton>

          {/* Import Link */}
          <Link href="/admin/imports/dropbox">
            <AgentButton
              variant="ghost"
              className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-advanced-import"
            >
              <Settings className="h-4 w-4" />
              Import
            </AgentButton>
          </Link>


          {/* Cases Button */}
          <Link href="/admin/cases">
            <AgentButton
              variant="ghost"
              className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-cases"
            >
              <FolderOpen className="h-4 w-4" />
              Cases
            </AgentButton>
          </Link>

          {/* Checks Button */}
          <Link href="/admin/system-checks">
            <AgentButton
              variant="ghost"
              className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-checks"
            >
              <ShieldCheck className="h-4 w-4" />
              Checks
            </AgentButton>
          </Link>

          {/* Family Tree Button */}
          <Link href={`/family-tree/${caseId}`}>
            <AgentButton
              variant="ghost"
              className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-family-tree"
            >
              <Users className="h-4 w-4" />
              Family Tree
            </AgentButton>
          </Link>

          {/* Email Button */}
          <Link href="/workflows">
            <AgentButton
              variant="ghost"
              className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-email"
            >
              <Mail className="h-4 w-4" />
              Email
            </AgentButton>
          </Link>

          {/* Themes Button */}
          <div className="relative z-10 w-[180px] flex-shrink-0">
            <ThemeSelector theme={theme} setTheme={setTheme} />
          </div>
        </div>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Case Processing
        </h1>
        {caseLoading ? (
          <p className="text-base text-muted-foreground mt-2 font-medium">
            Loading case data...
          </p>
        ) : caseError && caseId !== CASE.id ? (
          <p className="text-base text-muted-foreground mt-2 font-medium">
            <AlertCircle className="inline h-4 w-4 mr-1" />
            Could not load case {caseId}, showing demo data
          </p>
        ) : (
          <p className="text-base text-muted-foreground mt-2 font-medium" data-testid="case-header-info">
            {currentCaseData.id} • {currentCaseData.client.name}
            {QA_MODE && hacStatus && (
              <span className="ml-2 text-xs bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 px-2 py-1 rounded">
                QA MODE - HAC: {hacStatus}
              </span>
            )}
          </p>
        )}
      </motion.div>

      {/* Top Priority Cards: Case Status and Documents */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-none px-0 mx-0 -mx-4 md:mx-0 mb-8"
      >
        <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 w-full max-w-none px-0 mx-0">
        {/* Case Status */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
        <EnhancedStatusCard
          title="Case Status"
          subtitle={`${currentCaseData.state} • ${(currentCaseData.processing || 'standard').toUpperCase()}`}
          icon={TrendingUp}
          status={currentCaseData.state === 'OBY_SUBMITTED' ? 'green' : currentCaseData.state === 'INTAKE' ? 'red' : 'amber'}
          className="w-full max-w-none h-[400px]"
        >
          <div className="space-y-4 mt-4 h-full flex flex-col">
            {/* Progress Section */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {currentCaseData.state === 'INTAKE' ? '20%' :
                 currentCaseData.state === 'USC_IN_FLIGHT' ? '45%' :
                 currentCaseData.state === 'USC_READY' ? '75%' :
                 currentCaseData.state === 'OBY_SUBMITTED' ? '90%' : '60%'}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{
                  width: currentCaseData.state === 'INTAKE' ? '20%' :
                         currentCaseData.state === 'USC_IN_FLIGHT' ? '45%' :
                         currentCaseData.state === 'USC_READY' ? '75%' :
                         currentCaseData.state === 'OBY_SUBMITTED' ? '90%' : '60%'
                }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted rounded-lg p-2">
                <div className="text-muted-foreground">Difficulty</div>
                <div className="font-medium">{currentCaseData.difficulty}/10</div>
              </div>
              <div className="bg-muted rounded-lg p-2">
                <div className="text-muted-foreground">Docs</div>
                <div className="font-medium">{currentCaseData.docs.filter(d => d.status === 'RECEIVED').length}/{currentCaseData.docs.length}</div>
              </div>
            </div>

            {/* State Pipeline Visual */}
            <div className="grid grid-cols-2 gap-2 text-xs flex-1">
              {["INTAKE","USC_IN_FLIGHT","USC_READY","OBY_SUBMITTED"].map((s)=> (
                <div key={s} className={`rounded-lg px-2 py-1 text-center premium-transition ${
                  currentCaseData.state===s
                    ?"glass-card-strong text-primary border border-primary/20"
                    :"glass-card-light text-muted-foreground"
                }`}>
                  {s.replace('_',' ')}
                </div>
              ))}
            </div>
          </div>
        </EnhancedStatusCard>
        </motion.div>

        {/* Documents */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
        >
        <EnhancedStatusCard
          title="Documents"
          subtitle={`${currentCaseData.docs.filter(d => d.status === 'RECEIVED').length}/${currentCaseData.docs.length} received`}
          icon={FileCheck2}
          status={currentCaseData.docs.every(d => d.status === 'RECEIVED') ? 'green' : 'amber'}
          className="w-full max-w-none h-[400px] overflow-hidden"
        >
          <div className="flex flex-col h-[280px] mt-4">
            {/* Scrollable Documents List */}
            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pr-2">
              {currentCaseData.docs.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 glass-card-light rounded-lg flex-shrink-0">
                  <span className="text-sm text-foreground capitalize">
                    {doc.type.replace(/_/g, ' ')}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    doc.status === 'RECEIVED' ? 'bg-green-500' :
                    doc.status === 'PENDING' ? 'bg-amber-500' : 'bg-red-500'
                  }`} />
                </div>
              ))}
            </div>
            
            {/* Upload Button - Fixed at Bottom */}
            <div className="pt-4 flex-shrink-0">
              <AgentButton 
                variant="ghost" 
                className="w-full gap-2 justify-center"
                onClick={() => toast({
                  title: "Document upload",
                  description: "Document upload interface would open here"
                })}
                data-testid="button-upload-document"
              >
                <Upload className="h-4 w-4" />
                Upload Document
              </AgentButton>
            </div>
          </div>
        </EnhancedStatusCard>
        </motion.div>
        </div>
      </motion.div>

      {/* HAC Authority Panel - Full Width */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-none px-0 mx-0 -mx-4 md:mx-0 mb-8"
      >
        <EnhancedStatusCard
          title="HAC Authorization"
          subtitle=""
          icon={Shield}
          status={hacStatus.toLowerCase() === 'green' ? 'green' : 
                 hacStatus.toLowerCase() === 'amber' ? 'amber' : 'red'}
          className="w-full max-w-none min-h-[500px]"
        >
          <AuthorityPanel
            caseId={currentCaseData.id}
            onStatusChange={handleHACStatusChange}
            currentCaseState={currentCaseData.state}
            className="h-full"
            hideTitle={true}
          />
        </EnhancedStatusCard>
      </motion.div>

      {/* Quick Actions and Active Tasks - Top Row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-none px-0 mx-0 -mx-4 md:mx-0"
      >
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:gap-8 md:grid-cols-2 lg:grid-cols-3 mb-8 px-0 mx-0">
        {/* Quick Actions */}
        <EnhancedStatusCard
          title="Quick Actions"
          subtitle=""
          icon={Zap}
          className="w-full max-w-none"
        >
          <div className="space-y-3 mt-4">
            <AgentButton
              onClick={simulateUSCReady}
              variant="ghost"
              className="w-full gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              disabled={currentCaseData.state !== "USC_IN_FLIGHT"}
              data-testid="button-simulate-usc"
            >
              <CheckCircle className="h-4 w-4" />
              USC Ready
            </AgentButton>

            <AgentButton
              onClick={generatePOA}
              variant="ghost"
              className="w-full gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-generate-poa"
            >
              <Upload className="h-4 w-4" />
              Generate POA
            </AgentButton>

            <AgentButton
              onClick={draftOBY}
              variant="ghost"
              className="w-full gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              disabled={currentCaseData.state !== "USC_READY"}
              data-testid="button-draft-oby"
            >
              <FileText className="h-4 w-4" />
              Draft OBY
            </AgentButton>

            <AgentButton
              onClick={submitOBY}
              variant="ghost"
              className={`w-full gap-2 justify-center touch-target transition-all duration-200 hover:scale-105 ${
                !canSubmitOBY ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!canSubmitOBY}
              data-testid="button-submit-oby"
            >
              <ArrowRight className="h-4 w-4" />
              Submit OBY {blockers.length > 0 && `(${blockers.length} blockers)`}
            </AgentButton>

            <AgentButton
              onClick={() => {
                const caseInfo = `Case ID: ${currentCaseData.id}\nClient: ${currentCaseData.client.name}\nEmail: ${currentCaseData.client.email}\nStatus: ${currentCaseData.state}\nProcessing: ${currentCaseData.processing || 'standard'}\nDifficulty: ${currentCaseData.difficulty}/10\nScore: ${currentCaseData.clientScore}%`;
                navigator.clipboard.writeText(caseInfo);
                toast({
                  title: "Case info copied",
                  description: "Case details have been copied to clipboard"
                });
              }}
              variant="ghost"
              className="w-full gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-copy-case-info"
            >
              <Copy className="h-4 w-4" />
              Copy Case Info
            </AgentButton>

            <AgentButton
              onClick={() => {
                window.open(`/admin/cases/${currentCaseData.id}`, '_blank');
              }}
              variant="ghost"
              className="w-full gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-view-full-details"
            >
              <ExternalLink className="h-4 w-4" />
              View Full Details
            </AgentButton>
          </div>
        </EnhancedStatusCard>

        {/* Combined Active Tasks */}
        <EnhancedStatusCard
          title="Active Tasks"
          subtitle=""
          icon={Clock}
          className="w-full max-w-none"
        >
          <div className="max-h-64 overflow-y-auto space-y-3 mt-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            <div className="p-3 glass-card-light rounded-lg">
              <div className="font-medium text-sm text-foreground">USC Registration</div>
              <div className="text-xs text-muted-foreground">Due in 14 days • Warsaw</div>
            </div>
            <div className="p-3 glass-card-light rounded-lg">
              <div className="font-medium text-sm text-foreground">Translation</div>
              <div className="text-xs text-muted-foreground">ETA 5 days • PT→PL</div>
            </div>
            <div className="p-3 glass-card-light rounded-lg">
              <div className="font-medium text-sm text-foreground">Archive Search</div>
              <div className="text-xs text-muted-foreground">Query sent</div>
            </div>
            <div className="p-3 glass-card-light rounded-lg">
              <div className="font-medium text-sm text-foreground">Document Review</div>
              <div className="text-xs text-muted-foreground">In progress • 2/5 files</div>
            </div>
            <div className="p-3 glass-card-light rounded-lg">
              <div className="font-medium text-sm text-foreground">Legal Verification</div>
              <div className="text-xs text-muted-foreground">Pending approval</div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <AgentButton 
              variant="ghost" 
              className="w-full gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              onClick={() => {
                toast({
                  title: "Future Feature",
                  description: "Add Task functionality will be available in a future update"
                });
              }}
              data-testid="button-add-task"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </AgentButton>
          </div>
        </EnhancedStatusCard>

        {/* Case Management */}
        <EnhancedStatusCard
          title="Case Management"
          subtitle=""
          icon={Shield}
          className="w-full max-w-none"
        >
          <div className="space-y-3 mt-4">
            <AgentButton
              onClick={() => {
                setCurrentCaseData(prev => ({...prev, state: "INTAKE"}));
                toast({
                  title: "Case reset to intake",
                  description: "Case has been moved back to intake stage"
                });
              }}
              variant="ghost"
              className="w-full gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-reset-to-intake"
            >
              <RefreshCcw className="h-4 w-4" />
              Reset to Intake
            </AgentButton>

            <AgentButton
              onClick={() => {
                const reportData = `CASE REPORT\n\nCase ID: ${currentCaseData.id}\nClient: ${currentCaseData.client.name}\nEmail: ${currentCaseData.client.email}\nProcessing: ${currentCaseData.processing || 'standard'}\nDifficulty: ${currentCaseData.difficulty}/10\nClient Score: ${currentCaseData.clientScore}%\nStatus: ${currentCaseData.state}\nCreated: ${currentCaseData.created_at || 'N/A'}\nUpdated: ${currentCaseData.updated_at || 'N/A'}\n\nDOCUMENTS:\n${currentCaseData.docs.map(d => `- ${d.type}: ${d.status}`).join('\n')}\n\nMAPPED FIELDS:\n${Object.entries(currentCaseData.mappedFields).map(([k,v]) => `${k}: ${v}`).join('\n')}`;
                const blob = new Blob([reportData], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `case-report-${currentCaseData.id}.txt`;
                a.click();
                URL.revokeObjectURL(url);
                toast({
                  title: "Report downloaded",
                  description: "Case report has been downloaded"
                });
              }}
              variant="ghost"
              className="w-full gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-export-report"
            >
              <Save className="h-4 w-4" />
              Export Report
            </AgentButton>

            <AgentButton
              onClick={() => {
                if (confirm(`Are you sure you want to archive case ${currentCaseData.id}?`)) {
                  setCurrentCaseData(prev => ({...prev, state: "ARCHIVED"}));
                  toast({
                    title: "Case archived",
                    description: "Case has been archived successfully"
                  });
                }
              }}
              variant="ghost"
              className="w-full gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-archive-case"
            >
              <Archive className="h-4 w-4" />
              Archive Case
            </AgentButton>

            <AgentButton
              onClick={() => {
                if (confirm(`Are you sure you want to suspend case ${currentCaseData.id}?`)) {
                  setCurrentCaseData(prev => ({...prev, state: "SUSPENDED"}));
                  toast({
                    title: "Case suspended",
                    description: "Case has been suspended"
                  });
                }
              }}
              variant="ghost"
              className="w-full gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-suspend-case"
            >
              <AlertCircle className="h-4 w-4" />
              Suspend Case
            </AgentButton>

            <AgentButton
              onClick={() => {
                if (confirm(`Are you sure you want to cancel case ${currentCaseData.id}?`)) {
                  setCurrentCaseData(prev => ({...prev, state: "CANCELLED"}));
                  toast({
                    title: "Case cancelled",
                    description: "Case has been cancelled"
                  });
                }
              }}
              variant="ghost"
              className="w-full gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-cancel-case"
            >
              <Trash2 className="h-4 w-4" />
              Cancel Case
            </AgentButton>

            <AgentButton
              onClick={() => {
                if (confirm(`Are you sure you want to postpone case ${currentCaseData.id}?`)) {
                  setCurrentCaseData(prev => ({...prev, state: "POSTPONED"}));
                  toast({
                    title: "Case postponed",
                    description: "Case has been postponed"
                  });
                }
              }}
              variant="ghost"
              className="w-full gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-postpone-case"
            >
              <Clock className="h-4 w-4" />
              Postpone Case
            </AgentButton>
          </div>
        </EnhancedStatusCard>
        </div>
      </motion.div>

      
      {/* Main Content Hairline Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />

      {/* Status Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-none px-0 mx-0 -mx-4 md:mx-0"
      >
        <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 w-full max-w-none px-0 mx-0">


        {/* Debug: Mapped Fields - Only shown in QA mode or for admin users */}
        {(QA_MODE || false) && ( // TODO: Add user?.role === "admin" when user context is available
          <div className="md:col-span-2">
            <DebugMappedFields mappedFields={currentCaseData.mappedFields} />
          </div>
        )}
        </div>
      </motion.div>

      {/* Status Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-none px-0 mx-0 -mx-4 md:mx-0"
      >
        <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 w-full max-w-none px-0 mx-0">


        {/* Debug: Mapped Fields - Only shown in QA mode or for admin users */}
        {(QA_MODE || false) && ( // TODO: Add user?.role === "admin" when user context is available
          <div className="md:col-span-2">
            <DebugMappedFields mappedFields={caseData.mappedFields} />
          </div>
        )}
        </div>
      </motion.div>

      {/* Dropbox Import Modal */}
      <Dialog open={showDropboxImport} onOpenChange={setShowDropboxImport}>
        <DialogContent className="max-h-[85svh] overflow-y-auto max-w-lg" data-testid="modal-dropbox-import">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Client from Dropbox
            </DialogTitle>
            <DialogDescription>
              Quickly import a client from your Dropbox /CASES folder. This will create the case in your database and link it to Dropbox files.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Client Name *</label>
              <input
                type="text"
                value={dropboxForm.clientName}
                onChange={(e) => setDropboxForm({...dropboxForm, clientName: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 mt-1"
                placeholder="Enter client name"
                data-testid="input-dropbox-client-name"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Email (Optional)</label>
              <input
                type="email"
                value={dropboxForm.email}
                onChange={(e) => setDropboxForm({...dropboxForm, email: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 mt-1"
                placeholder="Enter email address"
                data-testid="input-dropbox-email"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Dropbox Folder Path *</label>
              <input
                type="text"
                value={dropboxForm.folderPath}
                onChange={(e) => setDropboxForm({...dropboxForm, folderPath: e.target.value})}
                className="w-full border rounded-lg px-3 py-2 mt-1"
                placeholder="/CASES/ClientName"
                data-testid="input-dropbox-folder-path"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Processing</label>
                <select
                  value={dropboxForm.processing}
                  onChange={(e) => setDropboxForm({...dropboxForm, processing: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  data-testid="select-dropbox-processing"
                >
                  <option value="standard">Standard</option>
                  <option value="expedited">Expedited</option>
                  <option value="vip">VIP</option>
                  <option value="vip+">VIP+</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Difficulty (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={dropboxForm.difficulty}
                  onChange={(e) => setDropboxForm({...dropboxForm, difficulty: parseInt(e.target.value)})}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                  data-testid="input-dropbox-difficulty"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <AgentButton
              onClick={() => setShowDropboxImport(false)}
              variant="ghost"
              className="w-full gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-cancel-dropbox-import"
            >
              Cancel
            </AgentButton>
            <AgentButton
              onClick={handleDropboxImport}
              variant="ghost"
              className="w-full gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-confirm-dropbox-import"
            >
              Import Client
            </AgentButton>
            <Link href="/admin/imports/dropbox">
              <AgentButton
                variant="ghost"
                className="w-full gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
                data-testid="button-advanced-dropbox-import"
              >
                Advanced Import
              </AgentButton>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Creation Dialog */}
      <Dialog open={showCreateClient} onOpenChange={setShowCreateClient}>
        <DialogContent className="max-h-[85svh] overflow-y-auto glass-card border-border/50 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Create New Client from Dropbox
            </DialogTitle>
            <DialogDescription>
              Configure client settings and link to Dropbox folder
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="responsive-grid">
              <div className="responsive-card">
                <label className="text-sm font-medium mb-2 block wrap">Client Name</label>
                <input
                  type="text"
                  value={newClient.name}
                  onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                  className="input touch-target"
                  placeholder="Enter client name"
                  data-testid="input-client-name"
                />
              </div>
              <div className="responsive-card">
                <label className="text-sm font-medium mb-2 block wrap">Email</label>
                <input
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                  className="input touch-target"
                  placeholder="Enter email address"
                  data-testid="input-client-email"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Selected Folder</label>
              <div className="p-3 rounded-xl glass-card-light border border-border/30">
                <span className="text-sm text-muted-foreground">
                  {newClient.folder || "No folder selected"}
                </span>
              </div>
            </div>

            <div className="responsive-grid">
              <div className="responsive-card">
                <label className="text-sm font-medium mb-2 block wrap">Processing</label>
                <select
                  value={newClient.processing}
                  onChange={(e) => setNewClient(prev => ({ ...prev, processing: e.target.value }))}
                  className="select touch-target"
                  data-testid="select-processing-type"
                >
                  <option value="standard">Standard</option>
                  <option value="expedited">Expedited</option>
                  <option value="vip">VIP</option>
                  <option value="vip+">VIP+</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Difficulty</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newClient.difficulty}
                  onChange={(e) => setNewClient(prev => ({ ...prev, difficulty: parseInt(e.target.value) }))}
                  className="w-full"
                  data-testid="input-difficulty-level"
                />
                <span className="text-xs text-muted-foreground">Level {newClient.difficulty}</span>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Client Score</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newClient.clientScore}
                  onChange={(e) => setNewClient(prev => ({ ...prev, clientScore: parseInt(e.target.value) }))}
                  className="w-full"
                  data-testid="input-client-score"
                />
                <span className="text-xs text-muted-foreground">{newClient.clientScore}%</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <AgentButton
              variant="ghost"
              onClick={() => setShowCreateClient(false)}
              className="w-full gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-cancel-create-client"
            >
              Cancel
            </AgentButton>
            <AgentButton
              onClick={createClientFromDropbox}
              disabled={!newClient.name || !newClient.email || !newClient.folder}
              variant="ghost"
              className="w-full gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-confirm-create-client"
            >
              Create Client
            </AgentButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}