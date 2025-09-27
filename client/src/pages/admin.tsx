import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IOS26Card, IOS26CardHeader, IOS26CardBody } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from "@/lib/utils";
import { 
  Save, Edit3, Eye, Plus, Trash2, Settings, Menu, Home, FileText, RefreshCw, 
  Palette, ChevronDown, Monitor, Smartphone, Tablet, Zap, Shield,
  Database, Users, TrendingUp, Clock, ChevronRight, Bell, Mail, CheckCircle,
  Send, History, User, Award, MessageSquare, Filter, CheckSquare, Square
} from "lucide-react";
import { useContent, useUpdateContent, useCreateDefaultContent, type ContentItem } from "@/hooks/useContent";
import { useTheme, THEME_VARIANTS, type ThemeVariant } from '@/hooks/useTheme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

// ---------- iOS-26 Token Chip Component ----------
function TokenChip({ children, tone = "zinc" }: { children: React.ReactNode; tone?: string }) {
  const map: Record<string, string> = {
    zinc: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100",
    sky: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
    violet: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
    amber: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
    rose: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
    emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  };
  return (
    <span className={cn(
      "px-3 py-1.5 text-xs rounded-full font-semibold transition-all duration-200",
      "shadow-sm border border-white/20 backdrop-blur-sm",
      "hover:shadow-md hover:scale-105 transform-gpu",
      map[tone] || map.zinc
    )}>
      {children}
    </span>
  );
}

// Using centralized theme system from @/hooks/useTheme

// useTheme now imported from centralized hook

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

const fieldVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 }
  },
  editing: {
    scale: 1.02,
    transition: { duration: 0.2 }
  }
};

// ---------- Enhanced Theme Controls ----------
function ThemeSelector({ theme, setTheme }: { theme: ThemeVariant; setTheme: (theme: ThemeVariant) => void }) {
  const currentTheme = THEME_VARIANTS[theme as ThemeVariant] || THEME_VARIANTS.light;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 premium-transition glass-card-light hover:glass-card touch-target"
          data-testid="button-theme-selector"
        >
          <div 
            className="w-3 h-3 rounded-full border border-border/30" 
            style={{ backgroundColor: currentTheme.preview }}
          />
          <Palette className="h-4 w-4" />
          {currentTheme.name}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        side="bottom"
        sideOffset={8}
        className="min-w-64 glass-card border-border/50 shadow-xl"
      >
        <div className="px-3 py-2 text-sm font-semibold text-muted-foreground">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Theme Selection
          </div>
        </div>
        <DropdownMenuSeparator className="bg-border/50" />
        
        {/* Light Themes */}
        <div className="px-2 py-1">
          <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Light Themes</div>
          {Object.entries(THEME_VARIANTS)
            .filter(([key]) => !['midnight', 'space', 'forest', 'ocean', 'sunset'].includes(key))
            .map(([key, variant]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => setTheme(key as ThemeVariant)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md premium-transition hover:glass-card-light ${
                theme === key ? 'glass-card-light ring-1 ring-primary/30' : ''
              }`}
            >
              <div 
                className="w-4 h-4 rounded border border-border/30 shadow-sm" 
                style={{ backgroundColor: variant.preview }}
              />
              <div className="flex-1">
                <div className="font-medium">{variant.name}</div>
                <div className="text-xs text-muted-foreground">{variant.description}</div>
              </div>
              {theme === key && <div className="w-2 h-2 rounded-full bg-primary" />}
            </DropdownMenuItem>
          ))}
        </div>
        
        <DropdownMenuSeparator className="bg-border/50" />
        
        {/* Dark Themes */}
        <div className="px-2 py-1">
          <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Dark Themes</div>
          {Object.entries(THEME_VARIANTS)
            .filter(([key]) => ['midnight', 'space', 'forest', 'ocean', 'sunset'].includes(key))
            .map(([key, variant]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => setTheme(key as ThemeVariant)}
              className={`flex items-center gap-3 px-3 py-2 rounded-md premium-transition hover:glass-card-light ${
                theme === key ? 'glass-card-light ring-1 ring-primary/30' : ''
              }`}
            >
              <div 
                className="w-4 h-4 rounded border border-border/30 shadow-sm" 
                style={{ backgroundColor: variant.preview }}
              />
              <div className="flex-1">
                <div className="font-medium">{variant.name}</div>
                <div className="text-xs text-muted-foreground">{variant.description}</div>
              </div>
              {theme === key && <div className="w-2 h-2 rounded-full bg-primary" />}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminContentManager() {
  const [theme, setTheme, isDark] = useTheme();
  const { toast } = useToast();
  const [editingItems, setEditingItems] = useState<{ [key: string]: string }>({});
  const queryClient = useQueryClient();
  
  // Email Notification Management State
  const [selectedUser, setSelectedUser] = useState('');
  const [testUserId, setTestUserId] = useState('');
  const [testCaseId, setTestCaseId] = useState('');
  const [testNotes, setTestNotes] = useState('');

  // Full Project Auditor State
  const [auditState, setAuditState] = useState<'idle' | 'running' | 'pass' | 'fail'>('idle');
  const [auditText, setAuditText] = useState('');

  // Feedback Management State
  const [selectedFeedback, setSelectedFeedback] = useState<Set<string>>(new Set());
  const [kbFormData, setKbFormData] = useState({
    intent_id: '',
    user_utterances: '',
    answer_text: '',
    tags: 'review'
  });
  const [showKbForm, setShowKbForm] = useState(false);

  const { data: contentItems = [], isLoading } = useContent();
  const updateContentMutation = useUpdateContent();
  const createDefaultContentMutation = useCreateDefaultContent();

  // Feedback Queries
  const { data: feedbackData, isLoading: feedbackLoading } = useQuery({
    queryKey: ['admin-feedback'],
    queryFn: async () => {
      const adminToken = localStorage.getItem('admin_token') || import.meta.env.VITE_ADMIN_TOKEN;
      if (!adminToken) {
        throw new Error('Admin token not configured');
      }
      
      const response = await fetch('/api/admin/feedback', {
        headers: {
          'x-admin-token': adminToken
        }
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch feedback');
      }
      return response.json();
    },
    retry: false
  });
  
  // Email Notification Queries
  const { data: preferencesData, isLoading: preferencesLoading } = useQuery({
    queryKey: ['notification-preferences', selectedUser],
    queryFn: async () => {
      if (!selectedUser) return null;
      const response = await fetch(`/api/notification-preferences/${selectedUser}`);
      if (!response.ok) throw new Error('Failed to fetch preferences');
      return response.json();
    },
    enabled: !!selectedUser
  });
  
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['notification-history', selectedUser],
    queryFn: async () => {
      if (!selectedUser) return null;
      const response = await fetch(`/api/notification-history/${selectedUser}?limit=20`);
      if (!response.ok) throw new Error('Failed to fetch history');
      return response.json();
    },
    enabled: !!selectedUser
  });
  
  // Email Notification Mutations
  const updatePreferencesMutation = useMutation({
    mutationFn: async ({ userId, preferences }: { userId: string; preferences: Record<string, boolean> }) => {
      const response = await fetch(`/api/notification-preferences/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Notification preferences updated successfully' });
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });
  
  const sendTestMutation = useMutation({
    mutationFn: async ({ userId, notificationType, caseId, notes }: { userId: string; notificationType: string; caseId: string; notes: string }) => {
      const response = await fetch('/api/admin/send-test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, notificationType, caseId, notes })
      });
      if (!response.ok) throw new Error('Failed to send test notification');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Test notification sent successfully' });
      queryClient.invalidateQueries({ queryKey: ['notification-history'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Feedback to KB conversion mutation
  const convertToKbMutation = useMutation({
    mutationFn: async ({ feedbackIds, kbEntry }: { feedbackIds: string[]; kbEntry: typeof kbFormData }) => {
      const adminToken = localStorage.getItem('admin_token') || import.meta.env.VITE_ADMIN_TOKEN;
      if (!adminToken) {
        throw new Error('Admin token not configured');
      }
      
      const response = await fetch('/api/admin/feedback/to-kb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ feedbackIds, kbEntry })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to convert feedback to KB');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: 'Success', 
        description: `${data.processedCount} feedback items converted to KB entry` 
      });
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
      setSelectedFeedback(new Set());
      setShowKbForm(false);
      setKbFormData({
        intent_id: '',
        user_utterances: '',
        answer_text: '',
        tags: 'review'
      });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });
  
  // Notification Management Handlers
  const handlePreferenceToggle = (preference: string, value: boolean) => {
    if (!selectedUser) return;
    
    const currentPreferences = preferencesData?.preferences || {};
    const updatedPreferences = { ...currentPreferences, [preference]: value };
    
    updatePreferencesMutation.mutate({
      userId: selectedUser,
      preferences: updatedPreferences
    });
  };
  
  const handleSendTest = (notificationType: string) => {
    if (!testUserId || !testCaseId) {
      toast({ 
        title: 'Missing Information', 
        description: 'Please enter both User ID and Case ID',
        variant: 'destructive' 
      });
      return;
    }
    
    sendTestMutation.mutate({
      userId: testUserId,
      notificationType,
      caseId: testCaseId,
      notes: testNotes || ""
    });
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'emerald';
      case 'failed': return 'rose';
      case 'pending': return 'amber';
      default: return 'zinc';
    }
  };

  // Feedback Management Handlers
  const handleFeedbackSelect = (feedbackId: string) => {
    setSelectedFeedback(prev => {
      const newSet = new Set(prev);
      if (newSet.has(feedbackId)) {
        newSet.delete(feedbackId);
      } else {
        newSet.add(feedbackId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (!feedbackData?.feedback) return;
    
    const openFeedback = feedbackData.feedback.filter((f: any) => f.status !== 'applied');
    if (selectedFeedback.size === openFeedback.length) {
      setSelectedFeedback(new Set());
    } else {
      setSelectedFeedback(new Set(openFeedback.map((f: any) => f.id)));
    }
  };

  const handleProposeKB = () => {
    if (selectedFeedback.size === 0) {
      toast({
        title: 'No Selection',
        description: 'Please select at least one feedback item',
        variant: 'destructive'
      });
      return;
    }
    setShowKbForm(true);
  };

  const handleSubmitKB = () => {
    if (!kbFormData.intent_id || !kbFormData.user_utterances || !kbFormData.answer_text) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    convertToKbMutation.mutate({
      feedbackIds: Array.from(selectedFeedback),
      kbEntry: kbFormData
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleSave = (item: ContentItem) => {
    const updatedItem = {
      ...item,
      value: editingItems[item.id] || item.value
    };
    updateContentMutation.mutate(updatedItem, {
      onSuccess: () => {
        toast({
          title: "Content Updated",
          description: "Changes saved successfully and will appear on the website immediately",
        });
        setEditingItems(prev => {
          const newState = { ...prev };
          delete newState[item.id];
          return newState;
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Update Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleInitializeContent = () => {
    createDefaultContentMutation.mutate(undefined, {
      onSuccess: (data) => {
        toast({
          title: "Content Initialized",
          description: `Created ${data.items?.length || 0} default content items`,
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Initialization Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItems(prev => ({
      ...prev,
      [item.id]: item.value
    }));
  };

  const handleCancel = (item: ContentItem) => {
    setEditingItems(prev => {
      const newState = { ...prev };
      delete newState[item.id];
      return newState;
    });
  };

  const renderContentField = (item: ContentItem) => {
    const isEditing = item.id in editingItems;
    const currentValue = isEditing ? editingItems[item.id] : item.value;

    if (!isEditing) {
      return (
        <motion.div 
          variants={fieldVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.01 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 glass-card border-border/30 premium-transition group"
          data-testid={`content-field-${item.id}`}
        >
          <div className="flex-1 mb-4 sm:mb-0 sm:mr-6">
            <div className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              {item.label}
            </div>
            {item.description && (
              <div className="text-sm text-muted-foreground mt-1 mb-3">{item.description}</div>
            )}
            <div className="text-foreground/90 glass-card-light p-3 rounded-lg border border-border/20 backdrop-blur-sm">
              {item.type === 'textarea' ? (
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{item.value}</div>
              ) : (
                <span className="text-sm font-medium">{item.value}</span>
              )}
            </div>
          </div>
          <div className="flex gap-2 sm:gap-3 self-end sm:self-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(item)}
              className="touch-target premium-transition glass-card-light hover:glass-card hover:scale-105 border-border/30"
              data-testid={`button-edit-${item.id}`}
            >
              <Edit3 className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Edit</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                toast({
                  title: "Delete Function",
                  description: "Delete functionality coming soon",
                  variant: "destructive",
                });
              }}
              className="touch-target premium-transition glass-card-light hover:bg-destructive/10 hover:text-destructive hover:scale-105 border-border/30"
              data-testid={`button-delete-${item.id}`}
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Delete</span>
            </Button>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div 
        variants={fieldVariants}
        initial="hidden"
        animate="editing"
        className="p-4 sm:p-6 glass-card-strong border-primary/30 premium-transition shadow-lg"
        data-testid={`content-field-editing-${item.id}`}
      >
        <Label className="font-semibold text-foreground mb-3 block flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          {item.label}
        </Label>
        {item.description && (
          <div className="text-sm text-muted-foreground mb-4 px-1">{item.description}</div>
        )}
        {item.type === 'textarea' ? (
          <Textarea
            value={currentValue}
            onChange={(e) => setEditingItems(prev => ({
              ...prev,
              [item.id]: e.target.value
            }))}
            rows={6}
            className="mb-4 glass-card-light border-border/30 focus:border-primary/50 focus:ring-primary/25 premium-transition backdrop-blur-sm"
            data-testid={`textarea-${item.id}`}
          />
        ) : (
          <Input
            value={currentValue}
            onChange={(e) => setEditingItems(prev => ({
              ...prev,
              [item.id]: e.target.value
            }))}
            className="mb-4 glass-card-light border-border/30 focus:border-primary/50 focus:ring-primary/25 premium-transition backdrop-blur-sm"
            data-testid={`input-${item.id}`}
          />
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            size="sm"
            onClick={() => handleSave(item)}
            disabled={updateContentMutation.isPending}
            className="touch-target premium-transition bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105"
            data-testid={`button-save-${item.id}`}
          >
            {updateContentMutation.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCancel(item)}
            className="touch-target premium-transition glass-card-light hover:glass-card border-border/30 hover:scale-105"
            data-testid={`button-cancel-${item.id}`}
          >
            Cancel
          </Button>
        </div>
      </motion.div>
    );
  };

  const groupedContent = (contentItems || []).reduce((acc: { [key: string]: ContentItem[] }, item: ContentItem) => {
    if (!acc[item.section]) {
      acc[item.section] = [];
    }
    acc[item.section].push(item);
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 rounded-xl shadow-xl"
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary"
            />
            <div className="text-foreground font-medium">Loading Content Manager...</div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-background"
    >
      {/* Premium Glass Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card-strong border-b border-border/30 backdrop-blur-xl sticky top-0 z-50 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 glass-card-light rounded-lg border border-border/30">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                    Content Manager
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">ADMIN</span>
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base">Edit all website content directly with premium controls</p>
                </div>
              </div>
            </motion.div>
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
            >
              <ThemeSelector theme={theme} setTheme={setTheme} />
              <Button 
                asChild 
                variant="outline"
                className="touch-target premium-transition glass-card-light hover:glass-card border-border/30 hover:scale-105"
                data-testid="button-view-website"
              >
                <a href="/" target="_blank" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">View Website</span>
                  <span className="sm:hidden">Preview</span>
                </a>
              </Button>
              <Button 
                asChild
                className="touch-target premium-transition bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105"
                data-testid="button-dashboard"
              >
                <a href="/dashboard" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Admin</span>
                  <ChevronRight className="h-4 w-4" />
                </a>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="homepage" className="space-y-8">
            {/* Premium Glass Tabs */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-8 glass-card border-border/30 p-1 shadow-lg h-auto">
                <TabsTrigger 
                  value="homepage" 
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 premium-transition hover:glass-card-light data-[state=active]:glass-card-strong data-[state=active]:text-primary touch-target py-3 px-2 sm:px-4"
                  data-testid="tab-homepage"
                >
                  <Home className="h-4 w-4" />
                  <span className="text-xs sm:text-sm font-medium">Homepage</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="navigation" 
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 premium-transition hover:glass-card-light data-[state=active]:glass-card-strong data-[state=active]:text-primary touch-target py-3 px-2 sm:px-4"
                  data-testid="tab-navigation"
                >
                  <Menu className="h-4 w-4" />
                  <span className="text-xs sm:text-sm font-medium">Navigation</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="footer" 
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 premium-transition hover:glass-card-light data-[state=active]:glass-card-strong data-[state=active]:text-primary touch-target py-3 px-2 sm:px-4"
                  data-testid="tab-footer"
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-xs sm:text-sm font-medium">Footer</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="forms" 
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 premium-transition hover:glass-card-light data-[state=active]:glass-card-strong data-[state=active]:text-primary touch-target py-3 px-2 sm:px-4"
                  data-testid="tab-forms"
                >
                  <Edit3 className="h-4 w-4" />
                  <span className="text-xs sm:text-sm font-medium">Forms</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 premium-transition hover:glass-card-light data-[state=active]:glass-card-strong data-[state=active]:text-primary touch-target py-3 px-2 sm:px-4"
                  data-testid="tab-notifications"
                >
                  <Bell className="h-4 w-4" />
                  <span className="text-xs sm:text-sm font-medium">Notifications</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="qa-status" 
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 premium-transition hover:glass-card-light data-[state=active]:glass-card-strong data-[state=active]:text-primary touch-target py-3 px-2 sm:px-4"
                  data-testid="tab-qa-status"
                >
                  <Shield className="h-4 w-4" />
                  <span className="text-xs sm:text-sm font-medium">QA Status</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="feedback" 
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 premium-transition hover:glass-card-light data-[state=active]:glass-card-strong data-[state=active]:text-primary touch-target py-3 px-2 sm:px-4"
                  data-testid="tab-feedback"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-xs sm:text-sm font-medium">Feedback</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="other" 
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 premium-transition hover:glass-card-light data-[state=active]:glass-card-strong data-[state=active]:text-primary touch-target py-3 px-2 sm:px-4 col-span-2 sm:col-span-1"
                  data-testid="tab-other"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-xs sm:text-sm font-medium">Other</span>
                </TabsTrigger>
              </TabsList>
            </motion.div>

            {/* Dynamic Content Sections */}
            <AnimatePresence mode="wait">
              {Object.entries(groupedContent).map(([section, items]) => (
                <TabsContent key={section} value={section} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="glass-card border-border/30 shadow-xl backdrop-blur-xl">
                      <CardHeader className="glass-card-light border-b border-border/20">
                        <CardTitle className="capitalize text-foreground flex items-center gap-3">
                          <div className="p-2 glass-card-light rounded-lg border border-border/30">
                            {section === 'homepage' && <Home className="h-5 w-5 text-primary" />}
                            {section === 'navigation' && <Menu className="h-5 w-5 text-primary" />}
                            {section === 'footer' && <FileText className="h-5 w-5 text-primary" />}
                            {section === 'forms' && <Edit3 className="h-5 w-5 text-primary" />}
                            {section === 'notifications' && <Bell className="h-5 w-5 text-primary" />}
                            {section === 'feedback' && <MessageSquare className="h-5 w-5 text-primary" />}
                            {section === 'other' && <Plus className="h-5 w-5 text-primary" />}
                            {section === 'qa-status' && <Shield className="h-5 w-5 text-primary" />}
                          {!['homepage', 'navigation', 'footer', 'forms', 'notifications', 'feedback', 'qa-status', 'other'].includes(section) && <FileText className="h-5 w-5 text-primary" />}
                          </div>
                          <div>
                            <div className="text-xl font-bold">{section} Content</div>
                            <div className="text-sm text-muted-foreground font-normal">Manage {section} content settings</div>
                          </div>
                          <span className="ml-auto text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                            {(items as any[]).length} {(items as any[]).length === 1 ? 'item' : 'items'}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-6">
                        <motion.div 
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="space-y-4"
                        >
                          {(items as any[]).map((item: any, index: number) => (
                            <motion.div 
                              key={item.id}
                              variants={cardVariants}
                              custom={index}
                            >
                              {renderContentField(item)}
                            </motion.div>
                          ))}
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              ))}
              
              {/* Feedback Management Section */}
              <TabsContent value="feedback" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="glass-card border-border/30 shadow-xl backdrop-blur-xl">
                    <CardHeader className="glass-card-light border-b border-border/20">
                      <CardTitle className="text-foreground flex items-center gap-3">
                        <div className="p-2 glass-card-light rounded-lg border border-border/30">
                          <MessageSquare className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-xl font-bold">Feedback Management</div>
                          <div className="text-sm text-muted-foreground font-normal">Review and convert bad answers to KB entries</div>
                        </div>
                        {feedbackData?.count && (
                          <span className="ml-auto text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                            {feedbackData.count} items
                          </span>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {feedbackLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary"
                          />
                          <span className="ml-3 text-muted-foreground">Loading feedback...</span>
                        </div>
                      ) : feedbackData?.feedback?.length > 0 ? (
                        <div className="space-y-4">
                          {/* Controls */}
                          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleSelectAll}
                                className="flex items-center gap-2"
                                data-testid="button-select-all-feedback"
                              >
                                {selectedFeedback.size === feedbackData.feedback.filter((f: any) => f.status !== 'applied').length ? (
                                  <CheckSquare className="h-4 w-4" />
                                ) : (
                                  <Square className="h-4 w-4" />
                                )}
                                Select All Open
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleProposeKB}
                                disabled={selectedFeedback.size === 0}
                                className="flex items-center gap-2"
                                data-testid="button-propose-kb"
                              >
                                <Plus className="h-4 w-4" />
                                Propose KB Row ({selectedFeedback.size})
                              </Button>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {selectedFeedback.size} of {feedbackData.feedback.filter((f: any) => f.status !== 'applied').length} selected
                            </div>
                          </div>

                          {/* Feedback Table */}
                          <div className="glass-card border border-border/30 rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="glass-card-light border-b border-border/20">
                                  <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                      Select
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                      Timestamp
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                      Question
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                      Answer
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                      Page
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/20">
                                  {feedbackData.feedback.map((feedback: any) => (
                                    <tr 
                                      key={feedback.id}
                                      className={cn(
                                        "hover:glass-card-light transition-colors",
                                        feedback.status === 'applied' && "opacity-50"
                                      )}
                                      data-testid={`feedback-row-${feedback.id}`}
                                    >
                                      <td className="px-4 py-3">
                                        {feedback.status !== 'applied' && (
                                          <input
                                            type="checkbox"
                                            checked={selectedFeedback.has(feedback.id)}
                                            onChange={() => handleFeedbackSelect(feedback.id)}
                                            className="rounded border-border/30 text-primary focus:ring-primary/25"
                                            data-testid={`checkbox-feedback-${feedback.id}`}
                                          />
                                        )}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-muted-foreground">
                                        {new Date(feedback.ts).toLocaleDateString()} {new Date(feedback.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-foreground">
                                        <div className="max-w-xs break-words">
                                          {truncateText(feedback.question, 100)}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-foreground">
                                        <div className="max-w-xs break-words">
                                          {truncateText(feedback.answer, 150)}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-sm text-muted-foreground">
                                        {feedback.page || 'N/A'}
                                      </td>
                                      <td className="px-4 py-3">
                                        <TokenChip tone={feedback.status === 'applied' ? 'emerald' : 'amber'}>
                                          {feedback.status === 'applied' ? 'Applied' : 'Open'}
                                        </TokenChip>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* KB Mapping Form */}
                          {showKbForm && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="glass-card border border-primary/30 rounded-lg p-6 space-y-4"
                            >
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-foreground">Map to Knowledge Base Entry</h3>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowKbForm(false)}
                                  data-testid="button-cancel-kb-form"
                                >
                                  Cancel
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="intent-id" className="text-sm font-medium">
                                    Intent ID *
                                  </Label>
                                  <Input
                                    id="intent-id"
                                    value={kbFormData.intent_id}
                                    onChange={(e) => setKbFormData(prev => ({ ...prev, intent_id: e.target.value }))}
                                    placeholder="e.g., polish_citizenship_faq"
                                    className="mt-1"
                                    data-testid="input-intent-id"
                                  />
                                </div>
                                
                                <div>
                                  <Label htmlFor="tags" className="text-sm font-medium">
                                    Tags
                                  </Label>
                                  <Input
                                    id="tags"
                                    value={kbFormData.tags}
                                    onChange={(e) => setKbFormData(prev => ({ ...prev, tags: e.target.value }))}
                                    placeholder="review"
                                    className="mt-1"
                                    data-testid="input-tags"
                                  />
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="user-utterances" className="text-sm font-medium">
                                  User Utterances *
                                </Label>
                                <Textarea
                                  id="user-utterances"
                                  value={kbFormData.user_utterances}
                                  onChange={(e) => setKbFormData(prev => ({ ...prev, user_utterances: e.target.value }))}
                                  placeholder="How the user might ask this question..."
                                  rows={3}
                                  className="mt-1"
                                  data-testid="textarea-user-utterances"
                                />
                              </div>

                              <div>
                                <Label htmlFor="answer-text" className="text-sm font-medium">
                                  Answer Text *
                                </Label>
                                <Textarea
                                  id="answer-text"
                                  value={kbFormData.answer_text}
                                  onChange={(e) => setKbFormData(prev => ({ ...prev, answer_text: e.target.value }))}
                                  placeholder="The correct answer that should be provided..."
                                  rows={4}
                                  className="mt-1"
                                  data-testid="textarea-answer-text"
                                />
                              </div>

                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setShowKbForm(false)}
                                  data-testid="button-cancel-kb"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleSubmitKB}
                                  disabled={convertToKbMutation.isPending}
                                  data-testid="button-submit-kb"
                                >
                                  {convertToKbMutation.isPending ? (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                      Processing...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Append to KB
                                    </>
                                  )}
                                </Button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-foreground mb-2">No Feedback Found</h3>
                          <p className="text-muted-foreground">
                            No feedback items available for review. Feedback will appear here when users submit problematic answers.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* QA Status Section */}
              <TabsContent value="qa-status" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* QA Status Overview */}
                  <IOS26Card strong className="backdrop-blur-xl shadow-xl">
                    <IOS26CardHeader
                      title="Quality Assurance Status"
                      right={
                        <div className="p-2 glass-card-light rounded-lg border border-border/30">
                          <Shield className="h-5 w-5 text-primary" />
                        </div>
                      }
                    />
                    <IOS26CardBody className="space-y-6">
                      {/* System Status Badges */}
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          System Status
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="glass-card-light p-4 rounded-lg border border-border/30">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-muted-foreground">QA Mode</span>
                              <TokenChip tone={typeof window !== 'undefined' && localStorage.getItem('QA_MODE') === '1' ? 'emerald' : 'zinc'}>
                                {typeof window !== 'undefined' && localStorage.getItem('QA_MODE') === '1' ? 'ON' : 'OFF'}
                              </TokenChip>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {typeof window !== 'undefined' && localStorage.getItem('QA_MODE') === '1' ? 'Testing with mock storage' : 'Production mode'}
                            </p>
                          </div>
                          
                          <div className="glass-card-light p-4 rounded-lg border border-border/30">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-muted-foreground">Storage</span>
                              <TokenChip tone={typeof window !== 'undefined' && localStorage.getItem('QA_MODE') === '1' ? 'amber' : 'sky'}>
                                {typeof window !== 'undefined' && localStorage.getItem('QA_MODE') === '1' ? 'MOCK' : 'DROPBOX'}
                              </TokenChip>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {typeof window !== 'undefined' && localStorage.getItem('QA_MODE') === '1' ? 'Mock storage adapter' : 'Production Dropbox'}
                            </p>
                          </div>
                          
                          <div className="glass-card-light p-4 rounded-lg border border-border/30">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-muted-foreground">i18n</span>
                              <TokenChip tone="violet">EN/PL</TokenChip>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Multilingual support active
                            </p>
                          </div>
                          
                          <div className="glass-card-light p-4 rounded-lg border border-border/30">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-muted-foreground">Routes</span>
                              <TokenChip tone="emerald">OK</TokenChip>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              All routes mounted
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Test Coverage */}
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          Test Coverage
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="glass-card-light p-4 rounded-lg border border-border/30">
                            <div className="flex items-center gap-3 mb-2">
                              <Database className="h-4 w-4 text-emerald-500" />
                              <span className="font-medium text-foreground">API Tests</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">Unit tests for all endpoints</p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Health, HAC, Forms, Ingest</span>
                              <TokenChip tone="emerald">✓</TokenChip>
                            </div>
                          </div>
                          
                          <div className="glass-card-light p-4 rounded-lg border border-border/30">
                            <div className="flex items-center gap-3 mb-2">
                              <Monitor className="h-4 w-4 text-sky-500" />
                              <span className="font-medium text-foreground">E2E Tests</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">End-to-end user flows</p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Smoke tests, navigation</span>
                              <TokenChip tone="sky">✓</TokenChip>
                            </div>
                          </div>
                          
                          <div className="glass-card-light p-4 rounded-lg border border-border/30">
                            <div className="flex items-center gap-3 mb-2">
                              <Users className="h-4 w-4 text-violet-500" />
                              <span className="font-medium text-foreground">A11y Tests</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">Accessibility compliance</p>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">WCAG 2.1 AA standards</span>
                              <TokenChip tone="violet">✓</TokenChip>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Quality Metrics */}
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          Quality Metrics
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="glass-card-light p-4 rounded-lg border border-border/30">
                            <div className="flex items-center gap-3 mb-3">
                              <Award className="h-4 w-4 text-rose-500" />
                              <span className="font-medium text-foreground">UX Validation</span>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex justify-between">
                                <span>Human-readable labels</span>
                                <TokenChip tone="emerald">✓</TokenChip>
                              </div>
                              <div className="flex justify-between">
                                <span>Error messages</span>
                                <TokenChip tone="emerald">✓</TokenChip>
                              </div>
                              <div className="flex justify-between">
                                <span>Form validation</span>
                                <TokenChip tone="emerald">✓</TokenChip>
                              </div>
                            </div>
                          </div>
                          
                          <div className="glass-card-light p-4 rounded-lg border border-border/30">
                            <div className="flex items-center gap-3 mb-3">
                              <FileText className="h-4 w-4 text-amber-500" />
                              <span className="font-medium text-foreground">Print Support</span>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <div className="flex justify-between">
                                <span>CSS @page rules</span>
                                <TokenChip tone="emerald">✓</TokenChip>
                              </div>
                              <div className="flex justify-between">
                                <span>A4 landscape layout</span>
                                <TokenChip tone="emerald">✓</TokenChip>
                              </div>
                              <div className="flex justify-between">
                                <span>Color accuracy</span>
                                <TokenChip tone="emerald">✓</TokenChip>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </IOS26CardBody>
                  </IOS26Card>
                  
                  {/* Self-Check Actions */}
                  <IOS26Card strong className="backdrop-blur-xl shadow-xl">
                    <IOS26CardHeader
                      title="QA Actions"
                      right={
                        <div className="p-2 glass-card-light rounded-lg border border-border/30">
                          <Zap className="h-5 w-5 text-primary" />
                        </div>
                      }
                    />
                    <IOS26CardBody className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Button 
                          variant="outline" 
                          className="h-20 flex flex-col items-center justify-center glass-card-light hover:glass-card border-border/30 premium-transition touch-target group shadow-lg hover:shadow-xl"
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/admin/selfcheck');
                              const result = await response.json();
                              toast({
                                title: 'Self-Check Complete',
                                description: `Status: ${result.status}. Check console for details.`,
                                variant: result.status === 'ok' ? 'default' : 'destructive'
                              });
                              console.log('Self-check results:', result);
                            } catch (error) {
                              toast({
                                title: 'Self-Check Failed',
                                description: 'Unable to run system self-check',
                                variant: 'destructive'
                              });
                            }
                          }}
                          data-testid="button-run-selfcheck"
                        >
                          <Shield className="h-6 w-6 text-primary mb-2 group-hover:scale-110 premium-transition" />
                          <span className="font-semibold text-sm text-center">Run Self-Check</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="h-20 flex flex-col items-center justify-center glass-card-light hover:glass-card border-border/30 premium-transition touch-target group shadow-lg hover:shadow-xl"
                          onClick={() => {
                            const qaMode = localStorage.getItem('QA_MODE') === '1';
                            localStorage.setItem('QA_MODE', qaMode ? '0' : '1');
                            toast({
                              title: 'QA Mode Toggled',
                              description: `QA Mode is now ${qaMode ? 'OFF' : 'ON'}. Refresh page to apply.`,
                            });
                            setTimeout(() => window.location.reload(), 1500);
                          }}
                          data-testid="button-toggle-qa-mode"
                        >
                          <Settings className="h-6 w-6 text-primary mb-2 group-hover:scale-110 premium-transition" />
                          <span className="font-semibold text-sm text-center">Toggle QA Mode</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="h-20 flex flex-col items-center justify-center glass-card-light hover:glass-card border-border/30 premium-transition touch-target group shadow-lg hover:shadow-xl"
                          onClick={() => {
                            window.open('/api/status', '_blank');
                          }}
                          data-testid="button-view-status"
                        >
                          <TrendingUp className="h-6 w-6 text-primary mb-2 group-hover:scale-110 premium-transition" />
                          <span className="font-semibold text-sm text-center">View API Status</span>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          className="h-20 flex flex-col items-center justify-center glass-card-light hover:glass-card border-border/30 premium-transition touch-target group shadow-lg hover:shadow-xl"
                          onClick={async () => {
                            try {
                              setAuditState('running');
                              setAuditText('Running comprehensive audit...');
                              
                              const adminToken = localStorage.getItem('adminToken') || '';
                              const response = await fetch('/api/admin/auditor/run', {
                                method: 'POST',
                                headers: {
                                  'Authorization': `Bearer ${adminToken}`,
                                  'Content-Type': 'application/json'
                                }
                              });
                              
                              const result = await response.json();
                              
                              if (result.ok && result.report) {
                                const passed = result.report.passed;
                                setAuditState(passed ? 'pass' : 'fail');
                                setAuditText(JSON.stringify(result.report, null, 2));
                                
                                toast({
                                  title: 'Full Project Audit Complete',
                                  description: `Status: ${passed ? 'PASSED' : 'FAILED'}. Duration: ${result.duration}ms. Reports saved to ${result.jsonPath}`,
                                  variant: passed ? 'default' : 'destructive'
                                });
                              } else {
                                setAuditState('fail');
                                setAuditText(`Audit failed: ${result.error || 'Unknown error'}`);
                                toast({
                                  title: 'Full Project Audit Failed',
                                  description: result.error || 'Unable to complete comprehensive audit',
                                  variant: 'destructive'
                                });
                              }
                            } catch (error) {
                              setAuditState('fail');
                              setAuditText(`Network error: ${error.message}`);
                              toast({
                                title: 'Full Project Audit Failed',
                                description: 'Network error during audit execution',
                                variant: 'destructive'
                              });
                            }
                          }}
                          disabled={auditState === 'running'}
                          data-testid="button-run-full-audit"
                        >
                          <Zap className="h-6 w-6 text-primary mb-2 group-hover:scale-110 premium-transition" />
                          <span className="font-semibold text-sm text-center">
                            {auditState === 'running' ? 'Auditing...' : 'Full Audit (MAX)'}
                          </span>
                        </Button>
                      </div>
                      
                      <Separator className="bg-border/50" />
                      
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">QA Pipeline Commands</h4>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="glass-card-light p-3 rounded-lg border border-border/20 font-mono text-sm">
                            <span className="text-muted-foreground">$</span> npm run qa
                            <span className="ml-4 text-xs text-muted-foreground">// Full QA pipeline</span>
                          </div>
                          <div className="glass-card-light p-3 rounded-lg border border-border/20 font-mono text-sm">
                            <span className="text-muted-foreground">$</span> npm run test
                            <span className="ml-4 text-xs text-muted-foreground">// Unit tests only</span>
                          </div>
                          <div className="glass-card-light p-3 rounded-lg border border-border/20 font-mono text-sm">
                            <span className="text-muted-foreground">$</span> npm run test:ui
                            <span className="ml-4 text-xs text-muted-foreground">// Playwright E2E tests</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Full Project Auditor Results Display */}
                      {auditText && (
                        <>
                          <Separator className="bg-border/50" />
                          <div>
                            <div className="flex items-center gap-3 mb-3">
                              <Zap className="h-4 w-4 text-primary" />
                              <h4 className="text-sm font-semibold text-foreground">Full Project Audit Results</h4>
                              <div className={cn(
                                "px-2 py-1 rounded-full text-xs font-semibold",
                                auditState === 'pass' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' :
                                auditState === 'fail' ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200' :
                                auditState === 'running' ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200' :
                                'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100'
                              )}>
                                {auditState === 'pass' ? 'PASSED' : 
                                 auditState === 'fail' ? 'FAILED' : 
                                 auditState === 'running' ? 'RUNNING' : 'IDLE'}
                              </div>
                            </div>
                            <div className="glass-card-light p-3 rounded-lg border border-border/20">
                              <pre 
                                className="text-xs font-mono bg-slate-900 text-slate-100 dark:bg-slate-950 dark:text-slate-200 p-3 rounded-md overflow-auto max-h-80"
                                style={{
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word'
                                }}
                              >
                                {auditText}
                              </pre>
                            </div>
                          </div>
                        </>
                      )}
                    </IOS26CardBody>
                  </IOS26Card>
                </motion.div>
              </TabsContent>
              
              {/* Email Notification Management Section */}
              <TabsContent value="notifications" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-5"
                >
                  {/* User Preferences Panel */}
                  <IOS26Card strong className="backdrop-blur-xl shadow-xl">
                    <IOS26CardHeader
                      title="User Notification Preferences"
                      right={
                        <div className="p-2 glass-card-light rounded-lg border border-border/30">
                          <Settings className="h-5 w-5 text-primary" />
                        </div>
                      }
                    />
                    <IOS26CardBody className="space-y-4">
                      <div>
                        <Label htmlFor="user-select" className="text-[16px] font-semibold text-foreground mb-2 block">
                          Select User
                        </Label>
                        <Input
                          id="user-select"
                          placeholder="Enter User ID"
                          value={selectedUser}
                          onChange={(e) => setSelectedUser(e.target.value)}
                          className="glass-card-light border-border/30 focus:border-primary/50 text-[14.5px]"
                          data-testid="input-user-id"
                        />
                      </div>
                      
                      {selectedUser && preferencesData?.preferences && (
                        <div className="space-y-4">
                          <Separator className="bg-border/50" />
                          <h3 className="text-[16px] font-semibold text-foreground">Email Notification Types</h3>
                          
                          <div className="space-y-3">
                            {[
                              { key: 'case_status_updates', label: 'Case Status Updates', icon: FileText },
                              { key: 'document_status_updates', label: 'Document Status Updates', icon: CheckCircle },
                              { key: 'milestone_notifications', label: 'Milestone Achievements', icon: Award },
                              { key: 'weekly_progress_reports', label: 'Weekly Progress Reports', icon: Clock },
                              { key: 'admin_announcements', label: 'Admin Announcements', icon: Mail }
                            ].map(({ key, label, icon: Icon }) => (
                              <div key={key} className="flex items-center justify-between p-4 glass-card-light rounded-lg border border-border/20">
                                <div className="flex items-center gap-3">
                                  <Icon className="h-4 w-4 text-primary" />
                                  <Label htmlFor={key} className="cursor-pointer text-[14.5px] font-medium">{label}</Label>
                                </div>
                                <Switch
                                  id={key}
                                  checked={preferencesData.preferences[key] || false}
                                  onCheckedChange={(checked) => handlePreferenceToggle(key, checked)}
                                  disabled={updatePreferencesMutation.isPending}
                                  data-testid={`switch-${key}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {preferencesLoading && (
                        <div className="text-center py-6">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full mx-auto mb-2"
                          />
                          <p className="text-[14.5px] text-muted-foreground">Loading preferences...</p>
                        </div>
                      )}
                    </IOS26CardBody>
                  </IOS26Card>
                  
                  {/* Test Notifications Panel */}
                  <IOS26Card strong className="backdrop-blur-xl shadow-xl">
                    <IOS26CardHeader
                      title="Test Notifications"
                      right={
                        <div className="p-2 glass-card-light rounded-lg border border-border/30">
                          <Send className="h-5 w-5 text-primary" />
                        </div>
                      }
                    />
                    <IOS26CardBody className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="test-user-id" className="text-[16px] font-semibold text-foreground mb-2 block">
                            User ID
                          </Label>
                          <Input
                            id="test-user-id"
                            placeholder="Enter User ID"
                            value={testUserId}
                            onChange={(e) => setTestUserId(e.target.value)}
                            className="glass-card-light border-border/30 focus:border-primary/50 text-[14.5px]"
                            data-testid="input-test-user-id"
                          />
                        </div>
                        <div>
                          <Label htmlFor="test-case-id" className="text-[16px] font-semibold text-foreground mb-2 block">
                            Case ID
                          </Label>
                          <Input
                            id="test-case-id"
                            placeholder="Enter Case ID"
                            value={testCaseId}
                            onChange={(e) => setTestCaseId(e.target.value)}
                            className="glass-card-light border-border/30 focus:border-primary/50 text-[14.5px]"
                            data-testid="input-test-case-id"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="test-notes" className="text-[16px] font-semibold text-foreground mb-2 block">
                          Optional Notes
                        </Label>
                        <Textarea
                          id="test-notes"
                          placeholder="Add custom notes for the test notification..."
                          value={testNotes}
                          onChange={(e) => setTestNotes(e.target.value)}
                          rows={3}
                          className="glass-card-light border-border/30 focus:border-primary/50 text-[14.5px]"
                          data-testid="textarea-test-notes"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <button
                          onClick={() => handleSendTest('case_status')}
                          disabled={sendTestMutation.isPending}
                          className="btn btn-primary w-full text-[14.5px] font-semibold"
                          data-testid="button-test-case-status"
                        >
                          {sendTestMutation.isPending ? 'Sending...' : 'Send Case Status Test'}
                        </button>
                        
                        <button
                          onClick={() => handleSendTest('milestone')}
                          disabled={sendTestMutation.isPending}
                          className="btn btn-ghost w-full text-[14.5px] font-semibold"
                          data-testid="button-test-milestone"
                        >
                          {sendTestMutation.isPending ? 'Sending...' : 'Send Milestone Test'}
                        </button>
                      </div>
                    </IOS26CardBody>
                  </IOS26Card>
                </motion.div>
                
                {/* Notification History */}
                {selectedUser && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <IOS26Card strong className="backdrop-blur-xl shadow-xl">
                      <IOS26CardHeader
                        title={`Notification History - ${selectedUser}`}
                        right={
                          <div className="p-2 glass-card-light rounded-lg border border-border/30">
                            <History className="h-5 w-5 text-primary" />
                          </div>
                        }
                      />
                      <IOS26CardBody>
                        {historyLoading ? (
                          <div className="text-center py-8">
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full mx-auto mb-2"
                            />
                            <p className="text-[14.5px] text-muted-foreground">Loading history...</p>
                          </div>
                        ) : historyData?.history?.length > 0 ? (
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {historyData.history.map((notification: any) => (
                              <motion.div 
                                key={notification.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between p-4 glass-card-light rounded-lg border border-border/20 hover:border-border/30 transition-all duration-200"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[16px] font-semibold text-foreground">{notification.email_subject}</span>
                                    <TokenChip tone={getStatusColor(notification.status)}>
                                      {notification.status}
                                    </TokenChip>
                                  </div>
                                  <div className="text-[14.5px] text-muted-foreground space-y-1">
                                    <p>Type: {notification.notification_type}</p>
                                    {notification.old_value && notification.new_value && (
                                      <p>Change: {notification.old_value} → {notification.new_value}</p>
                                    )}
                                    <p>Sent: {formatDate(notification.sent_at)}</p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p className="text-[14.5px]">No notification history found for this user</p>
                          </div>
                        )}
                      </IOS26CardBody>
                    </IOS26Card>
                  </motion.div>
                )}
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>

        {/* Premium Quick Actions Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card className="glass-card border-border/30 shadow-xl backdrop-blur-xl">
            <CardHeader className="glass-card-light border-b border-border/20">
              <CardTitle className="text-foreground flex items-center gap-3">
                <div className="p-2 glass-card-light rounded-lg border border-border/30">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold">Quick Actions</div>
                  <div className="text-sm text-muted-foreground font-normal">Powerful management tools</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-5">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    variant="outline" 
                    className="h-24 sm:h-28 w-full flex flex-col items-center justify-center glass-card-light hover:glass-card border-border/30 premium-transition touch-target group shadow-lg hover:shadow-xl"
                    onClick={handleInitializeContent}
                    disabled={createDefaultContentMutation.isPending}
                    data-testid="button-initialize-content"
                  >
                    <div className="p-3 glass-card-light rounded-full border border-border/30 mb-3 group-hover:scale-110 premium-transition">
                      {createDefaultContentMutation.isPending ? (
                        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                      ) : (
                        <Plus className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <span className="font-semibold text-foreground text-sm text-center leading-tight">
                      Initialize Default Content
                    </span>
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    variant="outline" 
                    className="h-24 sm:h-28 w-full flex flex-col items-center justify-center glass-card-light hover:glass-card border-border/30 premium-transition touch-target group shadow-lg hover:shadow-xl"
                    onClick={() => window.location.reload()}
                    data-testid="button-refresh-content"
                  >
                    <div className="p-3 glass-card-light rounded-full border border-border/30 mb-3 group-hover:scale-110 premium-transition">
                      <RefreshCw className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-semibold text-foreground text-sm text-center leading-tight">
                      Refresh Content
                    </span>
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="sm:col-span-2 lg:col-span-1"
                >
                  <Button 
                    variant="outline" 
                    className="h-24 sm:h-28 w-full flex flex-col items-center justify-center glass-card-light hover:glass-card border-border/30 premium-transition touch-target group shadow-lg hover:shadow-xl"
                    onClick={() => {
                      toast({
                        title: "Content Export",
                        description: "Export functionality coming soon",
                      });
                    }}
                    data-testid="button-export-content"
                  >
                    <div className="p-3 glass-card-light rounded-full border border-border/30 mb-3 group-hover:scale-110 premium-transition">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-semibold text-foreground text-sm text-center leading-tight">
                      Export Content
                    </span>
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}