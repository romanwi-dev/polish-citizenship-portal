import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { LanguageToggleCompact } from '@/components/LanguageToggle';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import logoImage from "@assets/polishcitizenship.pl -  EMAIL LOGO_1755227766291.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Menu, 
  X, 
  FileText, 
  MessageCircle, 
  Users,
  BarChart3,
  Globe,
  ShieldCheck,
  LogIn,
  ChevronDown,
  Search,
  Home,
  Star,
  BookOpen,
  Calculator,
  Upload,
  Phone,
  Mail,
  MapPin,
  Clock,
  Award,
  Zap,
  UserPlus,
  Shield,
  HelpCircle,
  CreditCard,
  Languages,
  User,
  Sparkles,
  Command,
  Rocket,
  Activity,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  Bot,
  Cpu,
  FolderOpen,
  TreePine,
  ClipboardCheck,
  Sun,
  Moon,
} from "lucide-react";

// Menu section configuration with type safety
interface MenuSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

interface MenuItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  isExternal?: boolean;
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

interface MobileNavigationV3Props {
  isMenuOpen?: boolean;
  setIsMenuOpen?: (open: boolean) => void;
}

export function MobileNavigationV3({ isMenuOpen: externalIsMenuOpen, setIsMenuOpen: externalSetIsMenuOpen }: MobileNavigationV3Props = {}) {
  const [internalIsMenuOpen, setInternalIsMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recentItems, setRecentItems] = useState<string[]>([]);
  const [automationStatus, setAutomationStatus] = useState<'online' | 'degraded' | 'offline'>('online');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [theme, setTheme, isDarkMode] = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  
  // Use external state if provided, otherwise use internal state
  const isMenuOpen = externalIsMenuOpen !== undefined ? externalIsMenuOpen : internalIsMenuOpen;
  const setIsMenuOpen = externalSetIsMenuOpen || setInternalIsMenuOpen;
  
  // Check admin authentication status
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsAdmin(false);
          setIsCheckingAuth(false);
          return;
        }

        // Check if user is admin by calling a protected admin endpoint
        const response = await fetch('/api/admin/checks/health', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        // If response is OK, user is admin
        setIsAdmin(response.ok);
      } catch (error) {
        console.error('Admin auth check failed:', error);
        setIsAdmin(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAdminAuth();
  }, []);
  
  // Theme toggle function using unified theme system
  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'midnight';
    setTheme(newTheme);
    triggerHapticFeedback();
  };
  
  // Contact scroll function
  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element && typeof element.getBoundingClientRect === 'function') {
      const navHeight = 120;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };
  
  
  // Menu sections configuration
  const baseSections: MenuSection[] = [
    {
      id: 'quick-actions',
      title: 'Quick actions',
      icon: Zap,
      items: [
        { id: 'agent', label: 'CASES', href: '/admin/cases', icon: Bot, description: 'Case management and monitoring dashboard' },
        { id: 'cases', label: 'CASES', href: '/admin/cases', icon: FolderOpen, description: 'Case dashboard with client progress tracking' },
        { id: 'test', label: 'CITIZENSHIP TEST', href: 'https://polishcitizenship.typeform.com/to/PS5ecU', icon: ClipboardCheck, description: 'Take the citizenship eligibility test', isExternal: true },
        { id: 'tree', label: 'FAMILY TREE', href: '/family-tree', icon: TreePine, description: 'Interactive genealogy visualization' },
        { id: 'account', label: 'ACCOUNT', href: '/auth', icon: User, description: 'Login or register your account' },
        { id: 'papers', label: 'DASHBOARD', href: '/dashboard', icon: BarChart3, description: 'View your citizenship documents and progress' },
        { id: 'contact', label: 'CONTACT', onClick: scrollToContact, icon: Phone, description: 'Get in touch with our team' }
      ]
    },
    {
      id: 'ai-agent',
      title: 'AI Agent',
      icon: Bot,
      items: [
        { id: 'case-management', label: 'CASES MANAGEMENT', href: '/admin/cases', icon: FolderOpen, description: 'Case dashboard with client progress tracking and sortable tables' },
        { id: 'cases2-beta', label: 'SPRAWY (BETA)', href: '/admin/cases2', icon: Rocket, description: 'New SPRAWY system with modern UI and comprehensive panels', badge: { text: 'BETA', variant: 'secondary' } },
        { id: 'ingest-queue', label: 'INGEST QUEUE', href: '/admin/ingest', icon: Upload, description: 'Manage auto-imported Dropbox folders and create new cases', badge: { text: 'NEW', variant: 'secondary' } },
        { id: 'agent-control-room', label: 'CASE VIEW', href: '#', icon: Bot, description: 'Unified case view (select case first)', badge: { text: 'UNIFIED', variant: 'secondary' } },
        { id: 'email-templates', label: 'EMAIL TEMPLATES', href: '/admin/email-templates', icon: Mail, description: 'Preview and copy email templates for client communication' },
        { id: 'notification-settings', label: 'EMAIL NOTIFICATIONS', href: '/admin/notifications', icon: Mail, description: 'Manage email notification settings and test email system' },
        { id: 'system-checks', label: 'SYSTEM CHECKS', href: '/admin/system-checks', icon: Activity, description: 'Comprehensive system monitoring: health, QA, security, performance, and UX checks', badge: { text: 'ADMIN', variant: 'secondary' } }
      ]
    },
    {
      id: 'family-tree',
      title: 'Family tree',
      icon: Users,
      items: [
        { id: 'family-tree-main', label: 'FAMILY TREE', href: '/family-tree', icon: Users, description: 'Interactive genealogy visualization with 4 generations tracking' }
      ]
    },
    {
      id: 'paperwork',
      title: 'Paperwork',
      icon: FileText,
      items: [
        { id: 'data-population', label: 'DATA POPULATION SYSTEM', href: '/data-population', icon: FileText, description: 'AI-powered document extraction and PDF generation for all Polish citizenship documents', badge: { text: 'NEW', variant: 'secondary' } }
      ]
    },
    {
      id: 'poas',
      title: 'POAs',
      icon: Shield,
      items: [
        { id: 'adult-poa', label: 'ADULT POA', href: '/poa-adult', icon: Shield, description: 'Generate Power of Attorney document for adults' }
      ]
    },
    {
      id: 'homepage',
      title: 'Homepage',
      icon: Home,
      items: [
        { id: 'home', label: 'HOME', onClick: () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setIsMenuOpen(false); }, icon: Home },
        { id: 'expertise', label: 'EXPERTISE', onClick: () => scrollToSection('services'), icon: Award },
        { id: 'client', label: 'CLIENT', onClick: () => scrollToSection('client-process'), icon: User },
        { id: 'case-start', label: 'CASE START', onClick: () => scrollToSection('case-start'), icon: Zap },
        { id: 'ai-analysis', label: 'AI ANALYZES', onClick: () => scrollToSection('ai-analysis'), icon: Globe },
        { id: 'pricing', label: 'PRICING', onClick: () => scrollToSection('pricing'), icon: CreditCard },
        { id: 'eligibility', label: 'ELIGIBILITY', onClick: () => scrollToSection('eligibility'), icon: ShieldCheck },
        { id: 'chances', label: 'CHANCES', onClick: () => scrollToSection('success-probability'), icon: BarChart3 },
        { id: 'timeline', label: 'TIMELINE', onClick: () => scrollToSection('process'), icon: Clock },
        { id: 'documents', label: 'DOCUMENTS', onClick: () => scrollToSection('documents'), icon: FileText },
        { id: 'testimonials', label: 'TESTIMONIALS', onClick: () => scrollToSection('testimonials'), icon: Star },
        { id: 'faq', label: 'FAQ', onClick: () => scrollToSection('faq'), icon: HelpCircle },
        { id: 'contact', label: 'CONTACT', onClick: () => scrollToSection('contact'), icon: Phone }
      ]
    },
    {
      id: 'aitesting',
      title: 'Testing',
      icon: Cpu,
      items: [
        { id: 'rule-1', label: 'RULE 1: MANDATORY AI TESTING', onClick: () => alert('RULE 1: MANDATORY AI TESTING VERIFICATION\n\n✅ Execute comprehensive AI testing after any code changes\n✅ Verify all core functionality works as expected\n✅ Run: node run-simple-test.mjs'), icon: Shield, description: 'Mandatory AI testing verification after changes', badge: { text: 'RULE 1', variant: 'destructive' } },
        { id: 'rule-2', label: 'RULE 2: TRIPLE-AI VERIFICATION', onClick: () => alert('RULE 2: MANDATORY TRIPLE-AI VERIFICATION\n\n✅ Run comprehensive testing across multiple AI systems\n✅ Verify build integrity and LSP diagnostics\n✅ Ensure 100% HTTP success rate across all pages'), icon: CheckCircle, description: 'Mandatory triple-AI verification system', badge: { text: 'RULE 2', variant: 'destructive' } },
        { id: 'rule-3', label: 'RULE 3: CACHE CLEANUP', onClick: () => alert('RULE 3: MANDATORY CACHE CLEANUP & SERVER MAINTENANCE\n\n✅ Clear all caches and restart workflows\n✅ Verify server health and system stability\n✅ Ensure clean state for testing'), icon: Activity, description: 'Mandatory cache cleanup and server maintenance', badge: { text: 'RULE 3', variant: 'destructive' } },
        { id: 'rule-4', label: 'RULE 4: SUPERIOR ENFORCEMENT', onClick: () => alert('RULE 4: SUPERIOR ENFORCEMENT UNTIL COMPLETE\n\n✅ SUPREME RULE - highest priority enforcement\n✅ Continue until all tasks are verified complete\n✅ No task completion without full verification'), icon: Zap, description: 'Supreme rule - superior enforcement until complete', badge: { text: 'RULE 4', variant: 'destructive' } },
        { id: 'rule-x', label: 'RULE X: GROK VERIFICATION', onClick: () => alert('RULE X: MANDATORY GROK VERIFICATION\n\n✅ Execute Grok AI verification system\n✅ Cross-validate all implementations\n✅ Ensure maximum compliance with project standards'), icon: Sparkles, description: 'Mandatory Grok verification system', badge: { text: 'RULE X', variant: 'destructive' } },
        { id: 'run-tests', label: 'RUN PLATFORM TESTS', href: '/test-runner', icon: Bot, description: 'Execute comprehensive AI testing suite' },
        { id: 'independent-testing', label: 'INDEPENDENT AI AGENT', href: '/independent-testing', icon: Shield, description: '10x verification with Claude API - catches mistakes objectively', badge: { text: 'INDEPENDENT', variant: 'secondary' } },
        { id: 'auto-fix-testing', label: 'AUTO-FIX & RE-TEST', href: '/auto-fix-testing', icon: Zap, description: 'Automatically fixes errors and re-tests until all pass', badge: { text: 'AUTO-FIX', variant: 'secondary' } },
        { id: 'openai-double-check', label: 'OPENAI DOUBLE-CHECK', href: '/openai-double-check', icon: CheckCircle, description: 'OpenAI verifies Claude results for cross-AI validation', badge: { text: 'DUAL-AI', variant: 'secondary' } },
        { id: 'test-results', label: 'TEST RESULTS', href: '/test-results', icon: FileText, description: 'View latest automated test results' },
        { id: 'quick-test', label: 'QUICK TEST COMMAND', onClick: () => alert('Run this in Shell tab:\n\nnode run-simple-test.mjs'), icon: FileText, description: 'node run-simple-test.mjs' },
        { id: 'test-guide', label: 'TESTING GUIDE', onClick: () => alert('Testing Commands:\n\n• node run-simple-test.mjs (Quick test)\n• ./run-tests.sh dashboard (Visual)\n• ./run-tests.sh full (Complete)'), icon: BookOpen, description: 'Complete testing guide and commands' },
        { id: 'shell-access', label: 'OPEN SHELL TAB', onClick: () => alert('To run tests:\n\n1. Click "Shell" tab at bottom\n2. Run: node run-simple-test.mjs\n3. View results instantly'), icon: BarChart3, description: 'Access terminal for testing' }
      ]
    },
    {
      id: 'newapproach',
      title: 'Approach',
      icon: Sparkles,
      items: [
        { id: 'ai-intake', label: 'AI CITIZENSHIP INTAKE', href: '/ai-citizenship-intake/', icon: Zap },
        { id: 'admin', label: 'AI INTAKE ADMIN', href: '/admin/', icon: Shield },
        { id: 'prescreen', label: 'PRE-SCREEN WIZARD', href: '/precheck', icon: Zap }
      ]
    },
    {
      id: 'automations',
      title: 'Automations',
      icon: Rocket,
      items: [
        { id: 'doc-analyzer', label: 'AI DOCUMENT ANALYZER', href: '/api/webhooks/lindy/document-analysis', icon: Globe, isExternal: true, description: 'Real-time Polish document processing' },
        { id: 'eligibility', label: 'ELIGIBILITY SCREENER', href: '/api/webhooks/lindy/eligibility-assessment', icon: ShieldCheck, isExternal: true, description: 'Automated citizenship qualification' },
        { id: 'support', label: '24/7 AI SUPPORT', href: '/api/webhooks/lindy/client-communication', icon: MessageCircle, isExternal: true, description: 'Intelligent client assistance' },
        { id: 'pipeline', label: 'DOCUMENT PIPELINE', href: '/api/webhooks/n8n/document-complete', icon: FileText, isExternal: true, description: 'End-to-end automated workflows' },
        { id: 'payments', label: 'PAYMENT AUTOMATION', href: '/api/webhooks/n8n/payment-update', icon: CreditCard, isExternal: true, description: 'Service activation and booking' },
        { id: 'status', label: 'STATUS DASHBOARD', href: '/api/automation/status', icon: BarChart3, isExternal: true, description: 'Monitor all automation integrations' }
      ]
    },
    {
      id: 'landings',
      title: 'Landings',
      icon: Languages,
      items: [
        { id: 'english', label: '🇺🇸 ENGLISH LANDING', href: '/landing', icon: Globe },
        { id: 'spanish', label: '🇪🇸 SPANISH LANDING', href: '/landing-spanish', icon: Globe },
        { id: 'portuguese', label: '🇧🇷 Portuguese Landing', href: '/pt', icon: Languages },
        { id: 'french', label: '🇫🇷 French Landing', href: '/fr', icon: Languages },
        { id: 'german', label: '🇩🇪 German Landing', href: '/de', icon: Languages },
        { id: 'hebrew', label: '🇮🇱 Hebrew Landing', href: '/he', icon: Languages },
        { id: 'russian', label: '🇷🇺 Russian Landing', href: '/ru', icon: Languages },
        { id: 'polish', label: '🇵🇱 Polish Landing', href: '/pl', icon: Languages }
      ]
    },
    {
      id: 'tools',
      title: 'Services',
      icon: Calculator,
      items: [
        { id: 'eligibility-test', label: 'ELIGIBILITY TEST', href: '/citizenship-test', icon: FileText },
        { id: 'document-upload', label: 'DOCUMENT UPLOAD', href: '/document-upload', icon: Upload },
        { id: 'translation', label: 'TRANSLATION SERVICES', href: '/translation', icon: Globe },
        { id: 'family-tree', label: 'FAMILY TREE', href: '/family-tree', icon: Users }
      ]
    },
    {
      id: 'portal',
      title: 'Portal',
      icon: User,
      items: [
        { id: 'dashboard', label: 'DASHBOARD', href: '/dashboard', icon: User },
        { id: 'account', label: 'LOGIN / REGISTER', href: '/auth', icon: LogIn, description: 'Login to existing account or register new account' },
        { id: 'citizenship-progress', label: 'CITIZENSHIP PROGRESS', href: '/citizenship-progress', icon: BarChart3 }
      ]
    },
    {
      id: 'resources',
      title: 'Resources',
      icon: BookOpen,
      items: [
        { id: 'faq', label: 'FAQ', href: '/faq', icon: HelpCircle },
        { id: 'testimonials', label: 'TESTIMONIALS', href: '/testimonials', icon: Star },
        { id: 'law', label: 'POLISH CITIZENSHIP LAW', href: '/law', icon: ShieldCheck },
        { id: 'documents', label: 'REQUIRED DOCUMENTS', href: '/documents', icon: FileText },
        { id: 'eu-benefits', label: 'EU BENEFITS', href: '/eu-benefits', icon: Award },
        { id: 'privacy', label: 'PRIVACY POLICY', href: '/privacy-policy', icon: Shield },
        { id: 'terms', label: 'TERMS OF SERVICE', href: '/terms-of-service', icon: FileText }
      ]
    }
  ];

  // Filter menu sections based on admin status - SECURITY: hide admin-only features
  const menuSections: MenuSection[] = baseSections.map(section => {
    if (section.id === 'ai-agent') {
      // Show all items including System Checks to all users
      const filteredItems = section.items.filter(item => {
        return true; // Show all items to all users
      });
      
      return {
        ...section,
        items: filteredItems
      };
    }
    return section; // Return other sections unchanged
  }).filter(section => {
    // Remove sections that have no items after filtering
    return section.items.length > 0;
  });

  // Enhanced functionality
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
      trackRecentItem(sectionId);
    }
  };

  const handleNavigation = (item: MenuItem) => {
    if (item.id === 'agent-control-room') {
      // Handle case view - redirect to cases list since no specific case is selected
      setLocation('/admin/cases');
      setIsMenuOpen(false);
      trackRecentItem(item.id);
      return;
    }
    
    if (item.href) {
      if (item.isExternal) {
        window.open(item.href, '_blank', 'noopener,noreferrer');
      } else {
        setLocation(item.href); // Use SPA navigation for internal links
      }
    } else if (item.onClick) {
      item.onClick();
    }
    setIsMenuOpen(false);
    trackRecentItem(item.id);
  };

  const toggleSection = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? '' : sectionId);
  };

  const trackRecentItem = (itemId: string) => {
    setRecentItems(prev => {
      const filtered = prev.filter(id => id !== itemId);
      return [itemId, ...filtered].slice(0, 3); // Keep last 3 items
    });
  };

  const filteredSections = searchQuery ? menuSections.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => section.items.length > 0) : menuSections;

  // Effects for enhanced functionality
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsMenuOpen(true);
        setTimeout(() => searchRef.current?.focus(), 100);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, setIsMenuOpen]);

  // Body scroll lock
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Haptic feedback (if supported)
  const triggerHapticFeedback = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <>
      {/* Premium Header with Glassmorphism */}
      <div className="flex items-center justify-between p-4 bg-white/2 backdrop-blur-sm border-b border-gray-200/10 relative z-30 safe-area-inset-top shadow-sm shadow-blue-500/2">
        {/* Logo with enhanced styling */}
        <Link href="/" className="flex items-center gap-2 group" data-testid="link-home">
          <div className="relative">
            <img 
              src={logoImage} 
              alt="PolishCitizenship.pl" 
              className="h-16 object-contain"
              loading="lazy"
              width={160}
              height={40}
            />
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Cases Management Icon */}
          <Link 
            href="/admin/cases" 
            className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-md hover:shadow-lg touch-target"
            title="Cases Management"
            data-testid="link-cases"
          >
            <User className="h-6 w-6 text-blue-600" />
          </Link>


          {/* Premium Hamburger Menu Button */}
          <button
            onClick={() => { setIsMenuOpen(!isMenuOpen); triggerHapticFeedback(); }}
            className="relative p-2 bg-gradient-to-br from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-md hover:shadow-lg touch-target overflow-hidden group"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
            data-testid="button-toggle-menu"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {isMenuOpen ? (
              <div className="relative w-6 h-6 flex items-center justify-center">
                <div className="absolute w-4 h-0.5 bg-gray-600 rounded-full transform rotate-45 transition-all duration-200"></div>
                <div className="absolute w-4 h-0.5 bg-gray-600 rounded-full transform -rotate-45 transition-all duration-200"></div>
              </div>
            ) : (
              <div className="relative w-6 h-6 flex flex-col justify-center items-center space-y-1">
                <div className="w-4 h-0.5 bg-gray-600 rounded-full shadow-sm transition-all duration-200 group-hover:w-5"></div>
                <div className="w-4 h-0.5 bg-gray-600 rounded-full shadow-sm transition-all duration-200 group-hover:w-3"></div>
                <div className="w-4 h-0.5 bg-gray-600 rounded-full shadow-sm transition-all duration-200 group-hover:w-5"></div>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* World-Class Glassmorphism Dropdown Menu */}
      {isMenuOpen && (
        <>
          {/* Backdrop with blur effect */}
          <div 
            className="fixed inset-0 lg:hidden bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300" 
            onClick={() => setIsMenuOpen(false)}
            data-testid="overlay-menu"
          />
          
          <div 
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="navigation-heading"
            className="fixed lg:absolute lg:top-0 lg:right-0 lg:w-80 lg:max-h-[95vh] inset-0 lg:inset-auto w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl shadow-2xl z-50 transform transition-all duration-300 ease-out overflow-hidden lg:rounded-2xl lg:m-4"
            style={{ 
              WebkitOverflowScrolling: 'touch',
              willChange: 'transform',
              transform: 'translate3d(0,0,0)',
              paddingTop: 'env(safe-area-inset-top, 0px)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)'
            }}
          >
            {/* Premium Header */}
            <div className="relative p-6 bg-gradient-to-r from-blue-50/80 via-indigo-50/80 to-purple-50/80 dark:from-gray-800/80 dark:via-gray-700/80 dark:to-gray-800/80 backdrop-blur border-b border-white/20 dark:border-white/10">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5" />
              
              <div className="relative flex items-center justify-between mb-6">
                {/* Left: Navigation title with icon */}
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-100/80 to-indigo-100/80 rounded-xl shadow-sm">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 id="navigation-heading" className="text-xl font-normal text-gray-900 dark:text-gray-100">Navigation</h2>
                </div>
                
                
                {/* Right: Close button */}
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-white/50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 touch-target"
                  aria-label="Close menu"
                  data-testid="button-close-menu"
                >
                  <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
              
              {/* Enhanced Search Bar */}
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  {!isSearchFocused && !searchQuery && (
                    <span className="text-xs text-gray-400 hidden sm:inline">⌘K</span>
                  )}
                </div>
                <Input
                  ref={searchRef}
                  type="text"
                  placeholder="Search services, automations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="pl-12 pr-4 py-3 w-full rounded-xl border-white/30 focus:border-blue-300 bg-white/70 backdrop-blur text-sm transition-all duration-200 focus:shadow-lg focus:bg-white/90"
                  data-testid="input-search"
                />
              </div>
              
              {/* Theme Toggle - Prominently Positioned */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2" data-testid="status-automation">
                  <div className={`w-2 h-2 rounded-full ${automationStatus === 'online' ? 'bg-green-500' : automationStatus === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`} data-testid="dot-status"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">Automation Status: {automationStatus}</span>
                </div>
                
                {/* Theme Toggle Button - High Visibility */}
                <button
                  onClick={toggleTheme}
                  className="p-3 lg:p-2 bg-gradient-to-br from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 dark:from-gray-700 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-500 rounded-xl lg:rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 touch-target shadow-lg hover:shadow-xl lg:shadow-md"
                  data-testid="button-theme-toggle"
                  title="Toggle dark mode"
                >
                  <span className="text-lg lg:text-base">
                    {isDarkMode ? '☀️' : '🌙'}
                  </span>
                </button>
              </div>
            </div>

            <div className="h-[calc(100vh-180px)] lg:h-[calc(100vh-80px)] lg:max-h-[calc(100vh-80px)] overflow-y-auto px-6" style={{ WebkitOverflowScrolling: 'touch' }}>
              {/* Quick Action Buttons */}
              <div className="mt-6 mb-6">
                <Link 
                  href="/auth" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl touch-target"
                  data-testid="link-auth"
                >
                  <LogIn className="h-6 w-6 mr-2" />
                  REGISTER / LOGIN
                </Link>
              </div>
              
              <Separator className="my-6" />

              {/* Recent Items */}
              {recentItems.length > 0 && !searchQuery && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent
                  </h3>
                  <div className="space-y-1">
                    {recentItems.slice(0, 3).map(itemId => {
                      const allItems = menuSections.flatMap(s => s.items);
                      const item = allItems.find(i => i.id === itemId);
                      if (!item) return null;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigation(item)}
                          className="flex items-center gap-3 w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                          data-testid={`button-recent-${item.id}`}
                        >
                          <item.icon className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                          <span className="text-sm text-gray-700 group-hover:text-gray-900">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <Separator className="mt-4" />
                </div>
              )}
              
              {/* Menu Sections */}
              {filteredSections.map((section) => (
                <div key={section.id} className="mb-4">
                  <button 
                    onClick={() => { toggleSection(section.id); triggerHapticFeedback(); }}
                    className="flex items-center justify-between w-full p-4 bg-gray-50/80 hover:bg-gray-100/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 rounded-xl transition-all duration-200 transform hover:scale-[1.02] touch-target"
                    data-testid={`button-toggle-${section.id}`}
                  >
                    <div className="flex items-center gap-3" data-testid={`section-header-${section.id}`}>
                      <div className={`p-3 rounded-xl transition-colors duration-200 ${
                        activeSection === section.id ? 'bg-blue-100 text-blue-600' : 'bg-white/80 text-gray-600 dark:bg-gray-700/80 dark:text-gray-300'
                      }`}>
                        <section.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-normal text-gray-900 dark:text-gray-100 text-xl">{section.title}</h3>
                      </div>
                    </div>
                    <ChevronDown className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                      activeSection === section.id ? 'rotate-180' : ''
                    }`} />
                  </button>
                  
                  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
                    activeSection === section.id ? 'max-h-[1000px] opacity-100 mt-3' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="space-y-2 pl-2">
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleNavigation(item)}
                          className="flex items-center justify-between w-full p-4 text-left hover:bg-blue-50/80 dark:hover:bg-gray-700/50 rounded-lg transition-all duration-200 group touch-target"
                          data-testid={`button-${section.id}-${item.id}`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <item.icon className={`h-5 w-5 transition-colors duration-200 ${
                              section.id === 'automations' && automationStatus !== 'online' 
                                ? 'text-yellow-500' 
                                : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-normal text-gray-900 dark:text-gray-100 group-hover:text-blue-900 dark:group-hover:text-blue-300 truncate">{item.label}</span>
                                {item.isExternal && (
                                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full shrink-0"></div>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-base text-gray-500 dark:text-gray-400 mt-1 truncate">{item.description}</p>
                              )}
                            </div>
                          </div>
                          {section.id === 'automations' && (
                            <div className={`w-2 h-2 rounded-full shrink-0 ${
                              automationStatus === 'online' ? 'bg-green-500' : 
                              automationStatus === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              {searchQuery && filteredSections.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">No results found for "{searchQuery}"</p>
                </div>
              )}
              
              {/* Footer */}
              <div className="mt-8 pt-6 pb-6 lg:pb-4 border-t border-gray-200/50 dark:border-gray-700/50">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center lg:hidden">
                  Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">⌘K</kbd> to search
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}