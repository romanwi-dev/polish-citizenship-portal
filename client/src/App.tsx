// App.tsx - CRITICAL FIX: Home page now wrapped in Layout - Updated: 2025-08-15 9:14 AM  
import React, { useEffect, useState } from "react";
import { Switch, Route, useLocation, useParams } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
// ThemeProvider temporarily removed to fix loading issue
// EditModeProvider temporarily removed to fix loading issue
import "@/styles/mobile-interactions.css";
import "@/styles/fixes-cases.css";
import "@/styles/portal-buttons.css";
import "./ui/theme/index.css";
import "@/ui/tokens.css";

// Critical components loaded immediately
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

// Import components directly without lazy loading for now
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { useToast } from "@/hooks/use-toast";



// 🚀 PERFORMANCE FIX: Lazy load pages to dramatically improve startup time
import { lazy, Suspense } from 'react';

// Convert all to lazy loading to prevent bundle crashes
const MobileDashboard = lazy(() => import("@/pages/mobile-dashboard"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const LandingPage = lazy(() => import("@/pages/landing"));
const LandingPageSpanish = lazy(() => import("@/pages/landing-spanish"));
const TestRunner = lazy(() => import("@/pages/TestRunner"));
const TestResults = lazy(() => import("@/pages/TestResults"));
const IndependentTesting = lazy(() => import("@/pages/IndependentTesting"));
const AutoFixTesting = lazy(() => import("@/pages/AutoFixTesting"));
const OpenAIDoubleCheck = lazy(() => import("@/pages/OpenAIDoubleCheck"));

// Convert to lazy loading to prevent bundle crashes
const PolishCitizenshipLaw = lazy(() => import("@/pages/law"));
const RequiredDocuments = lazy(() => import("@/pages/documents"));
const ClientProcess = lazy(() => import("@/pages/client-process"));

// Lazy load all other pages
const TestimonialsPage = lazy(() => import("@/pages/testimonials"));
// WorkflowDashboard removed
const CitizenshipTestPage = lazy(() => import("@/pages/citizenship-test"));
const FAQPage = lazy(() => import("@/pages/faq"));
const AdminDashboard = lazy(() => import("@/pages/admin"));
const DocumentProcessing = lazy(() => import("@/pages/document-processing"));
const ThemeCustomizer = lazy(() => import("@/pages/theme-customizer"));
// Law and Documents now loaded immediately above
const EUBenefits = lazy(() => import("@/pages/eu-benefits"));
const Translator = lazy(() => import("@/pages/translator"));
const TranslationPage = lazy(() => import("@/pages/translation"));
const Gallery = lazy(() => import("@/pages/gallery"));
const Styles = lazy(() => import("@/pages/styles"));
const PerformanceDashboard = lazy(() => import("@/pages/performance-dashboard"));
const OnboardingPage = lazy(() => import("@/pages/onboarding"));
const PrivacyPolicy = lazy(() => import("@/pages/privacy-policy"));
const TermsOfService = lazy(() => import("@/pages/terms-of-service"));
const LegalDisclaimer = lazy(() => import("@/pages/legal-disclaimer"));
// Client Process now loaded immediately above
const AuthPage = lazy(() => import("@/pages/auth"));
const CitizenshipProgressPage = lazy(() => import("@/pages/citizenship-progress"));
const DocumentValidationPage = lazy(() => import("@/pages/document-validation"));
const EligibilityPage = lazy(() => import("@/pages/eligibility"));
const PolishPassportPage = lazy(() => import("@/pages/polish-passport"));
const PolishCitizenshipPage = lazy(() => import("@/pages/polish-citizenship"));
const FamilyHistoryWriter = lazy(() => import("@/pages/family-history-writer"));
const CitizenshipGuide = lazy(() => import("@/pages/citizenship-guide"));
const DocumentProgress = lazy(() => import("@/pages/document-progress"));
const CaseStart = lazy(() => import("@/pages/case-start"));
const TestAcceptDeletePage = lazy(() => import("@/pages/test-accept-delete"));
const FamilyTreeGaps = lazy(() => import("@/pages/FamilyTreeGaps"));
const SecretsManagementDashboard = lazy(() => import("@/pages/secrets-dashboard").then(m => ({ default: m.SecretsManagementDashboard })));
const GrokTesting = lazy(() => import("@/pages/GrokTesting"));
import DataPopulation from "@/pages/DataPopulation";
const ClientPOAForm = lazy(() => import("@/components/ClientPOAForm.jsx"));
const AgentControlRoom = lazy(() => import("@/AgentControlRoom.jsx"));
const DesignSettings = lazy(() => import("@/ui/panels/DesignSettings.jsx").catch(() => ({ default: () => <div>Design Settings not available</div> })));
const CasesGridV3 = lazy(() => import("@/pages/admin/cases/CasesGridV3"));
const CaseDetailsV2 = lazy(() => import("@/pages/admin/cases/CaseDetailsV2"));

// Polish Citizenship Agent 2.0 Routes
const AdminCasesPage = lazy(() => import("@/routes/admin/cases").then(m => ({ default: m.AdminCasesPage })));
const CaseDetailPage = lazy(() => import("@/routes/case/[id]").then(m => ({ default: m.CaseDetailPage })));
const CaseSummaryPage = lazy(() => import("@/routes/case/[id]/CaseSummaryPage"));
const IngestQueue = lazy(() => import("@/pages/admin/IngestQueue"));
const ImportsDropbox = lazy(() => import("@/admin/ImportsDropbox.jsx"));
const NotificationSettings = lazy(() => import("@/admin/NotificationSettings.jsx"));
const SystemChecks = lazy(() => import("@/admin/SystemChecks.jsx"));
const EmailTemplatesPage = lazy(() => import("@/pages/EmailTemplatesPage"));
const PdfWorkbench = lazy(() => import("@/pages/PdfWorkbench"));
const TypeformIntegration = lazy(() => import("@/pages/TypeformIntegration"));
const TreeAccess = lazy(() => import("@/pages/tree-access"));
// Legacy CaseDetail component removed - using unified /agent/:caseId route instead

// Cases 2.0 Routes
const CasesList2Page = lazy(() => import("@/features/cases2/CasesList2Page"));
const CaseDetail2Page = lazy(() => import("@/features/cases2/CaseDetail2Page"));

// AI Agent Skeleton Pages
const EmailPage = lazy(() => import("@/pages/email"));
const CAPPage = lazy(() => import("@/pages/cap"));
const FamilyTreePage = lazy(() => import("@/pages/family-tree"));
const TasksPage = lazy(() => import("@/pages/tasks"));
const ReportsPage = lazy(() => import("@/pages/reports"));
const ClientsPage = lazy(() => import("@/pages/clients"));
const SettingsPage = lazy(() => import("@/pages/settings"));
const SystemPage = lazy(() => import("@/pages/system"));

// Client Portal Routes
const ClientLoginPage = lazy(() => import("@/pages/client-login"));
const ClientHomePage = lazy(() => import("@/pages/client-home"));
import { ClientRouteProtection } from "@/components/ClientRouteProtection";
import { AdminRouteProtection } from "@/components/AdminRouteProtection";
// Test pages now loaded immediately above

// Multilingual landing pages removed - never worked properly

// ⚡ Ultra-fast minimal loading component to prevent layout shift
const PageLoader = () => (
  <div style={{ height: 1 }} aria-hidden="true" />
);

// Fallback for critical pages that need more visibility
const VisibleLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
  </div>
);

// Wrapper component for lazy-loaded pages - optimized for no layout shift
const LazyPage = ({ children, visible = false }: { children: React.ReactNode; visible?: boolean }) => (
  <Suspense fallback={visible ? <VisibleLoader /> : <PageLoader />}>
    {children}
  </Suspense>
);

// ScrollToTop component - ensures every page starts at the top
function ScrollToTop() {
  const [pathname] = useLocation();
  
  useEffect(() => {
    // Scroll to top whenever the pathname changes
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

// 🚀 PERFORMANCE: Removed heavy floating buttons for faster loading

function Router() {
  // Router initialization tracking removed for production
  return (
    <Switch>
        {/* Multilingual landing pages removed - never worked properly */}

        <Route path="/dashboard">
          <LazyPage><MobileDashboard /></LazyPage>
        </Route>
        <Route path="/mobile-dashboard">
          <LazyPage><MobileDashboard /></LazyPage>
        </Route>
        <Route path="/client-dashboard">
          <LazyPage><Dashboard /></LazyPage>
        </Route>
        {/* Legacy redirect routes - cleaned up */}
        <Route path="/landing">
          <LazyPage><LandingPage /></LazyPage>
        </Route>
        <Route path="/landing-spanish">
          <LazyPage><LandingPageSpanish /></LazyPage>
        </Route>
        <Route path="/testimonials">
          <LazyPage><Layout><TestimonialsPage /></Layout></LazyPage>
        </Route>
        {/* WorkflowDashboard route removed */}
        <Route path="/citizenship-test">
          <LazyPage><Layout><CitizenshipTestPage /></Layout></LazyPage>
        </Route>
        <Route path="/faq">
          <LazyPage><FAQPage /></LazyPage>
        </Route>
        <Route path="/admin">
          <LazyPage><Layout><AdminDashboard /></Layout></LazyPage>
        </Route>
        <Route path="/admin/pdf-workbench">
          <LazyPage>
            <AdminRouteProtection>
              <PdfWorkbench />
            </AdminRouteProtection>
          </LazyPage>
        </Route>
        <Route path="/admin/typeform-integration">
          <LazyPage>
            <AdminRouteProtection>
              <TypeformIntegration />
            </AdminRouteProtection>
          </LazyPage>
        </Route>
        <Route path="/admin-staff">
          {() => {
            const adminUrl = '/admin';
            window.open(adminUrl, '_blank');
            return <div style={{padding: '50px', textAlign: 'center', fontSize: '18px'}}>Opening Admin V3 Staff Panel in new tab...</div>;
          }}
        </Route>
        <Route path="/secrets">
          <LazyPage><Layout><SecretsManagementDashboard /></Layout></LazyPage>
        </Route>
        <Route path="/auth">
          <LazyPage><AuthPage /></LazyPage>
        </Route>
        <Route path="/onboarding">
          <LazyPage><Layout><OnboardingPage /></Layout></LazyPage>
        </Route>
        <Route path="/document-processing">
          <LazyPage><Layout><DocumentProcessing /></Layout></LazyPage>
        </Route>
        <Route path="/law">
          <Layout><PolishCitizenshipLaw /></Layout>
        </Route>
        <Route path="/documents">
          <Layout><RequiredDocuments /></Layout>
        </Route>
        <Route path="/eu-benefits">
          <LazyPage><Layout><EUBenefits /></Layout></LazyPage>
        </Route>
        <Route path="/translator">
          <LazyPage><Layout><Translator /></Layout></LazyPage>
        </Route>
        <Route path="/translation">
          <LazyPage><Layout><TranslationPage /></Layout></LazyPage>
        </Route>
        <Route path="/gallery">
          <LazyPage><Layout><Gallery /></Layout></LazyPage>
        </Route>
        <Route path="/styles">
          <LazyPage><Layout><Styles /></Layout></LazyPage>
        </Route>
        <Route path="/theme-customizer">
          <LazyPage><Layout><ThemeCustomizer /></Layout></LazyPage>
        </Route>
        <Route path="/performance">
          <LazyPage><Layout><PerformanceDashboard /></Layout></LazyPage>
        </Route>
        <Route path="/privacy-policy">
          <LazyPage><Layout><PrivacyPolicy /></Layout></LazyPage>
        </Route>
        <Route path="/terms-of-service">
          <LazyPage><Layout><TermsOfService /></Layout></LazyPage>
        </Route>
        <Route path="/legal-disclaimer">
          <LazyPage><Layout><LegalDisclaimer /></Layout></LazyPage>
        </Route>
        <Route path="/client-process">
          <Layout><ClientProcess /></Layout>
        </Route>
        
        {/* Client Portal Routes */}
        <Route path="/client/login">
          <LazyPage><ClientLoginPage /></LazyPage>
        </Route>
        <Route path="/client/home">
          <LazyPage>
            <ClientRouteProtection>
              <ClientHomePage />
            </ClientRouteProtection>
          </LazyPage>
        </Route>
        
        {/* Legacy routes redirect to unified auth */}
        <Route path="/login">
          <LazyPage><AuthPage /></LazyPage>
        </Route>
        <Route path="/register">
          <LazyPage><AuthPage /></LazyPage>
        </Route>
        <Route path="/family-tree/:caseId">
          <LazyPage><FamilyTreeGaps /></LazyPage>
        </Route>
        <Route path="/tree/:leadId/:token">
          <LazyPage><TreeAccess /></LazyPage>
        </Route>
        <Route path="/citizenship-progress">
          <LazyPage><Layout><CitizenshipProgressPage /></Layout></LazyPage>
        </Route>
        <Route path="/document-validation">
          <LazyPage><Layout><DocumentValidationPage /></Layout></LazyPage>
        </Route>
        <Route path="/eligibility">
          <LazyPage><Layout><EligibilityPage /></Layout></LazyPage>
        </Route>
        <Route path="/polish-passport">
          <LazyPage><Layout><PolishPassportPage /></Layout></LazyPage>
        </Route>
        <Route path="/polish-citizenship">
          <LazyPage><Layout><PolishCitizenshipPage /></Layout></LazyPage>
        </Route>
        <Route path="/family-history-writer">
          <LazyPage><Layout><FamilyHistoryWriter /></Layout></LazyPage>
        </Route>
        <Route path="/citizenship-guide">
          <LazyPage><Layout><CitizenshipGuide /></Layout></LazyPage>
        </Route>
        <Route path="/document-progress">
          <LazyPage><Layout><DocumentProgress /></Layout></LazyPage>
        </Route>
        <Route path="/case-start">
          <LazyPage><Layout><CaseStart /></Layout></LazyPage>
        </Route>
        <Route path="/test-accept-delete">
          <LazyPage><Layout><TestAcceptDeletePage /></Layout></LazyPage>
        </Route>
        <Route path="/test-runner">
          <TestRunner />
        </Route>
        <Route path="/independent-testing">
          <IndependentTesting />
        </Route>
        <Route path="/auto-fix-testing">
          <AutoFixTesting />
        </Route>
        <Route path="/openai-double-check">
          <OpenAIDoubleCheck />
        </Route>
        <Route path="/test-results">
          <TestResults />
        </Route>
        <Route path="/grok-testing">
          <LazyPage><Layout><GrokTesting /></Layout></LazyPage>
        </Route>
        <Route path="/data-population">
          <Layout><DataPopulation /></Layout>
        </Route>
        <Route path="/poa-adult">
          <LazyPage><Layout><ClientPOAForm /></Layout></LazyPage>
        </Route>
        {/* Case Summary Route - Read-only view */}
        <Route path="/case/:id/summary">
          {(params) => (
            <LazyPage visible={true}>
              <Layout>
                <CaseSummaryPage caseId={params.id} />
              </Layout>
            </LazyPage>
          )}
        </Route>
        
        {/* Canonical Case View Route */}
        <Route path="/agent/:caseId">
          <LazyPage visible={true}><Layout><CaseDetailPage /></Layout></LazyPage>
        </Route>
        
        {/* Legacy route redirects to canonical route */}
        <Route path="/cases/:caseId">
          <LazyPage>
            {React.createElement(() => {
              const { caseId } = useParams<{ caseId: string }>();
              const [, setLocation] = useLocation();
              
              React.useEffect(() => {
                // Redirect to canonical agent route
                setLocation(`/agent/${caseId}`);
              }, [setLocation, caseId]);
              
              return null;
            })}
          </LazyPage>
        </Route>
        <Route path="/admin/cases/:id">
          <LazyPage>
            {React.createElement(() => {
              const { id } = useParams<{ id: string }>();
              const [, setLocation] = useLocation();
              
              React.useEffect(() => {
                // Redirect to canonical agent route
                setLocation(`/agent/${id}`);
              }, [setLocation, id]);
              
              return null;
            })}
          </LazyPage>
        </Route>
        <Route path="/agent">
          <LazyPage>
            {React.createElement(() => {
              const [, setLocation] = useLocation();
              const { toast } = useToast();
              
              React.useEffect(() => {
                // Redirect to cases page with message
                setLocation('/admin/cases');
                toast({
                  title: 'Pick a case',
                  description: 'Pick a case to open case view',
                });
              }, [setLocation, toast]);
              
              return null;
            })}
          </LazyPage>
        </Route>
        <Route path="/admin/cases">
          <LazyPage visible={true}><Layout><AdminCasesPage /></Layout></LazyPage>
        </Route>
        <Route path="/admin/cases2">
          <LazyPage visible={true}><CasesList2Page /></LazyPage>
        </Route>
        <Route path="/cases2">
          <LazyPage visible={true}><CasesList2Page /></LazyPage>
        </Route>
        <Route path="/cases2/:caseId">
          <LazyPage visible={true}><CaseDetail2Page /></LazyPage>
        </Route>
        <Route path="/admin/ingest">
          <LazyPage visible={true}><Layout><IngestQueue /></Layout></LazyPage>
        </Route>
        <Route path="/admin/imports/dropbox">
          <LazyPage><Layout><ImportsDropbox /></Layout></LazyPage>
        </Route>
        <Route path="/admin/notifications">
          <LazyPage><Layout><NotificationSettings /></Layout></LazyPage>
        </Route>
        <Route path="/admin/system-checks">
          <LazyPage><Layout><SystemChecks /></Layout></LazyPage>
        </Route>
        <Route path="/system-checks">
          <LazyPage><Layout><SystemChecks /></Layout></LazyPage>
        </Route>
        <Route path="/admin/email-templates">
          <LazyPage><Layout><EmailTemplatesPage /></Layout></LazyPage>
        </Route>
        <Route path="/admin/design">
          <LazyPage><Layout><DesignSettings /></Layout></LazyPage>
        </Route>

        {/* Polish Citizenship Agent 2.0 Case Details */}
        <Route path="/case/:id">
          <LazyPage visible={true}><CaseDetailPage /></LazyPage>
        </Route>

        {/* AI Agent Skeleton Routes */}
        <Route path="/email">
          <LazyPage visible={true}><Layout><EmailPage /></Layout></LazyPage>
        </Route>
        <Route path="/cap">
          <LazyPage visible={true}><Layout><CAPPage /></Layout></LazyPage>
        </Route>
        <Route path="/family-tree">
          <LazyPage visible={true}><Layout><FamilyTreePage /></Layout></LazyPage>
        </Route>
        <Route path="/tasks">
          <LazyPage visible={true}><Layout><TasksPage /></Layout></LazyPage>
        </Route>
        <Route path="/reports">
          <LazyPage visible={true}><Layout><ReportsPage /></Layout></LazyPage>
        </Route>
        <Route path="/clients">
          <LazyPage visible={true}><Layout><ClientsPage /></Layout></LazyPage>
        </Route>
        <Route path="/settings">
          <LazyPage visible={true}><Layout><SettingsPage /></Layout></LazyPage>
        </Route>
        <Route path="/system">
          <LazyPage visible={true}><Layout><SystemPage /></Layout></LazyPage>
        </Route>

        {/* Home Route - MUST BE LAST before NotFound */}
        <Route path="/">
          {() => {
            // Home route loading tracking removed for production
            return <Layout><Home /></Layout>;
          }}
        </Route>

        <Route component={NotFound} />
      </Switch>
  );
}

function App() {
  useEffect(() => {
    // Defer non-critical initializations to avoid blocking initial render
    const idleCallback = window.requestIdleCallback || ((cb: any) => setTimeout(cb, 1));
    
    idleCallback(() => {
      // Lazy load cache manager only when idle
      import('@/utils/cache-manager').then(({ initializeCache }) => {
        initializeCache();
      }).catch(() => {
        // Silently fail if cache manager has issues
      });
    });
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
            <TooltipProvider delayDuration={300} skipDelayDuration={0}>
            {/* Skip to main content link for accessibility */}
            <a 
              href="#main-content" 
              className="skip-link"
              onFocus={(e) => {
                // Announce to screen readers
                const announcement = document.createElement('div');
                announcement.setAttribute('aria-live', 'polite');
                announcement.className = 'sr-only';
                announcement.textContent = 'Skip to main content link focused. Press Enter to skip navigation.';
                document.body.appendChild(announcement);
                setTimeout(() => document.body.removeChild(announcement), 1000);
              }}
            >
              Skip to main content
            </a>
              <Router />
              <Toaster />
            </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
