import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
// Button import removed - using ActionButton component for unified styling
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Settings, 
  Mail, 
  CheckCircle, 
  Clock, 
  Send,
  History,
  User,
  FileText,
  Award,
  Zap,
  Download,
  Upload,
  RefreshCw,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

// ActionButton component for unified styling across AI Agent sections
const ActionButton = React.forwardRef(({ children, variant = "primary", className = "", ...props }, ref) => {
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

ActionButton.displayName = 'ActionButton';

export default function NotificationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [testUserId, setTestUserId] = useState('');
  const [testCaseId, setTestCaseId] = useState('');
  const [testNotes, setTestNotes] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [hacTestCaseId, setHacTestCaseId] = useState('');
  const [stageTestCaseId, setStageTestCaseId] = useState('');
  const [stageOld, setStageOld] = useState('');
  const [stageNew, setStageNew] = useState('');

  // Fetch notification preferences for selected user
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

  // Fetch notification history for selected user
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

  // Fetch HAC & Case Management email settings
  const { data: emailSettings, isLoading: emailSettingsLoading } = useQuery({
    queryKey: ['email-settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/email-settings');
      if (!response.ok) throw new Error('Failed to fetch email settings');
      return response.json();
    }
  });

  // Fetch test data for notifications
  const { data: testData } = useQuery({
    queryKey: ['notification-test-data'],
    queryFn: async () => {
      const response = await fetch('/api/admin/notification-test-data');
      if (!response.ok) throw new Error('Failed to fetch test data');
      return response.json();
    }
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async ({ userId, preferences }) => {
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
      queryClient.invalidateQueries(['notification-preferences']);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Send test notification mutation
  const sendTestMutation = useMutation({
    mutationFn: async ({ userId, notificationType, caseId, notes }) => {
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
      queryClient.invalidateQueries(['notification-history']);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Update HAC email settings mutation
  const updateEmailSettingsMutation = useMutation({
    mutationFn: async (settings) => {
      const response = await fetch('/api/admin/email-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      if (!response.ok) throw new Error('Failed to update email settings');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Email notification settings updated successfully' });
      queryClient.invalidateQueries(['email-settings']);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Test HAC notification mutation
  const testHACMutation = useMutation({
    mutationFn: async ({ type, caseId }) => {
      const response = await fetch('/api/admin/test-hac-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, caseId })
      });
      if (!response.ok) throw new Error('Failed to send test HAC notification');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Test HAC notification sent successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  // Test stage change notification mutation
  const testStageChangeMutation = useMutation({
    mutationFn: async ({ caseId, oldStage, newStage, notes }) => {
      const response = await fetch('/api/admin/test-stage-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, oldStage, newStage, notes })
      });
      if (!response.ok) throw new Error('Failed to send test stage notification');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Test stage change notification sent successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  });

  const handlePreferenceToggle = (preference, value) => {
    if (!selectedUser) return;
    
    const currentPreferences = preferencesData?.preferences || {};
    const updatedPreferences = { ...currentPreferences, [preference]: value };
    
    updatePreferencesMutation.mutate({
      userId: selectedUser,
      preferences: updatedPreferences
    });
  };

  const handleSendTest = (notificationType) => {
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
      notes: testNotes || undefined
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8" data-testid="notification-settings">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Bell className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Email Notification Management</h1>
        </div>
        <p className="text-gray-600">
          Manage email notification settings and test the notification system
        </p>
      </div>

      {/* Top Action Buttons with Horizontal Scroll */}
      <div className="overflow-x-auto notification-scroll -mx-4 px-4 mb-6">
        <div className="flex flex-nowrap gap-3 items-center snap-x snap-mandatory scrollbar-hide justify-end md:justify-start notification-button-scroll">
          <ActionButton
            onClick={() => {
              if (emailSettings?.settings?.globalEnabled) {
                updateEmailSettingsMutation.mutate({
                  ...emailSettings.settings,
                  globalEnabled: false
                });
              } else {
                updateEmailSettingsMutation.mutate({
                  ...emailSettings.settings,
                  globalEnabled: true
                });
              }
            }}
            variant="ghost"
            className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
            disabled={updateEmailSettingsMutation.isPending}
            data-testid="button-toggle-global-emails"
          >
            {emailSettings?.settings?.globalEnabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            {emailSettings?.settings?.globalEnabled ? 'Disable All' : 'Enable All'}
          </ActionButton>

          <ActionButton
            onClick={() => handleSendTest('quick_test')}
            variant="ghost"
            className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
            disabled={sendTestMutation.isPending || !testUserId || !testCaseId}
            data-testid="button-quick-test"
          >
            <Zap className="h-4 w-4" />
            Quick Test
          </ActionButton>

          <ActionButton
            onClick={() => {
              queryClient.invalidateQueries(['email-settings']);
              queryClient.invalidateQueries(['notification-preferences']);
              queryClient.invalidateQueries(['notification-history']);
              toast({ title: 'Refreshed', description: 'All email settings and history refreshed' });
            }}
            variant="ghost"
            className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
            data-testid="button-refresh-settings"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </ActionButton>

          <ActionButton
            onClick={() => {
              // Export settings logic
              const settingsExport = {
                emailSettings: emailSettings?.settings,
                timestamp: new Date().toISOString()
              };
              const blob = new Blob([JSON.stringify(settingsExport, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `email-settings-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
              URL.revokeObjectURL(url);
              toast({ title: 'Exported', description: 'Email settings exported successfully' });
            }}
            variant="ghost"
            className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
            data-testid="button-export-settings"
          >
            <Download className="h-4 w-4" />
            Export
          </ActionButton>

          <ActionButton
            onClick={() => {
              document.getElementById('import-settings')?.click();
            }}
            variant="ghost"
            className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
            data-testid="button-import-settings"
          >
            <Upload className="h-4 w-4" />
            Import
          </ActionButton>

          <input
            id="import-settings"
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const settings = JSON.parse(event.target?.result);
                    if (settings.emailSettings) {
                      updateEmailSettingsMutation.mutate(settings.emailSettings);
                      toast({ title: 'Imported', description: 'Email settings imported successfully' });
                    } else {
                      throw new Error('Invalid settings file');
                    }
                  } catch (error) {
                    toast({ title: 'Error', description: 'Failed to import settings', variant: 'destructive' });
                  }
                };
                reader.readAsText(file);
              }
            }}
          />

          {selectedUser && (
            <ActionButton
              onClick={() => {
                queryClient.invalidateQueries(['notification-history', selectedUser]);
                toast({ title: 'Refreshed', description: `History refreshed for ${selectedUser}` });
              }}
              variant="ghost"
              className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
              data-testid="button-refresh-history"
            >
              <History className="h-4 w-4" />
              Refresh History
            </ActionButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-5">
        {/* HAC & Case Management Email Settings Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              HAC & Case Management Email Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-5">
            {emailSettingsLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading settings...</p>
              </div>
            ) : emailSettings?.settings && (
              <div className="space-y-4">
                {/* Global Toggle */}
                <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-blue-600" />
                    <Label htmlFor="global-enabled" className="cursor-pointer font-medium">Global Email Notifications</Label>
                  </div>
                  <Switch
                    id="global-enabled"
                    checked={emailSettings.settings.globalEnabled || false}
                    onCheckedChange={(checked) => {
                      updateEmailSettingsMutation.mutate({
                        ...emailSettings.settings,
                        globalEnabled: checked
                      });
                    }}
                    disabled={updateEmailSettingsMutation.isPending}
                    data-testid="switch-global-enabled"
                  />
                </div>

                <Separator />

                {/* HAC Notifications */}
                <h3 className="font-medium text-gray-900">HAC System Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <div>
                        <Label htmlFor="hac-new-request" className="cursor-pointer">New HAC Requests to Roman</Label>
                        <p className="text-xs text-gray-500">Send notifications when new HAC requests are submitted</p>
                      </div>
                    </div>
                    <Switch
                      id="hac-new-request"
                      checked={emailSettings.settings.hacNotifications?.newRequestToRoman || false}
                      onCheckedChange={(checked) => {
                        updateEmailSettingsMutation.mutate({
                          ...emailSettings.settings,
                          hacNotifications: {
                            ...emailSettings.settings.hacNotifications,
                            newRequestToRoman: checked
                          }
                        });
                      }}
                      disabled={updateEmailSettingsMutation.isPending || !emailSettings.settings.globalEnabled}
                      data-testid="switch-hac-new-request"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-gray-500" />
                      <div>
                        <Label htmlFor="hac-approval" className="cursor-pointer">HAC Approvals to Case Owners</Label>
                        <p className="text-xs text-gray-500">Send notifications when HAC requests are approved</p>
                      </div>
                    </div>
                    <Switch
                      id="hac-approval"
                      checked={emailSettings.settings.hacNotifications?.approvalToOwner || false}
                      onCheckedChange={(checked) => {
                        updateEmailSettingsMutation.mutate({
                          ...emailSettings.settings,
                          hacNotifications: {
                            ...emailSettings.settings.hacNotifications,
                            approvalToOwner: checked
                          }
                        });
                      }}
                      disabled={updateEmailSettingsMutation.isPending || !emailSettings.settings.globalEnabled}
                      data-testid="switch-hac-approval"
                    />
                  </div>
                </div>

                <Separator />

                {/* Case Management Notifications */}
                <h3 className="font-medium text-gray-900">Case Management Notifications</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div>
                        <Label htmlFor="case-stage-changes" className="cursor-pointer">Stage Changes to Clients</Label>
                        <p className="text-xs text-gray-500">Send notifications when case stages change</p>
                      </div>
                    </div>
                    <Switch
                      id="case-stage-changes"
                      checked={emailSettings.settings.caseNotifications?.stageChangesToClients || false}
                      onCheckedChange={(checked) => {
                        updateEmailSettingsMutation.mutate({
                          ...emailSettings.settings,
                          caseNotifications: {
                            ...emailSettings.settings.caseNotifications,
                            stageChangesToClients: checked
                          }
                        });
                      }}
                      disabled={updateEmailSettingsMutation.isPending || !emailSettings.settings.globalEnabled}
                      data-testid="switch-case-stage-changes"
                    />
                  </div>
                </div>

                <Separator />

                {/* Roman's Email Setting */}
                <div className="space-y-2">
                  <Label htmlFor="roman-email" className="text-sm font-medium">Roman's Email Address</Label>
                  <Input
                    id="roman-email"
                    type="email"
                    placeholder="roman@example.com"
                    value={emailSettings.settings.romanEmail || ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      // Debounce the update
                      setTimeout(() => {
                        updateEmailSettingsMutation.mutate({
                          ...emailSettings.settings,
                          romanEmail: newValue
                        });
                      }, 1000);
                    }}
                    data-testid="input-roman-email"
                  />
                  <p className="text-xs text-gray-500">Email address to receive HAC notifications</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Preferences Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              User Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-5">
            <div>
              <Label htmlFor="user-select" className="text-sm font-medium">Select User</Label>
              <Input
                id="user-select"
                placeholder="Enter User ID"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                data-testid="input-user-id"
              />
            </div>

            {selectedUser && preferencesData?.preferences && (
              <div className="space-y-4">
                <Separator />
                <h3 className="font-medium text-gray-900">Email Notification Types</h3>
                
                <div className="space-y-3 md:space-y-5">
                  {[
                    { key: 'case_status_updates', label: 'Case Status Updates', icon: FileText },
                    { key: 'document_status_updates', label: 'Document Status Updates', icon: CheckCircle },
                    { key: 'milestone_notifications', label: 'Milestone Achievements', icon: Award },
                    { key: 'weekly_progress_reports', label: 'Weekly Progress Reports', icon: Clock },
                    { key: 'admin_announcements', label: 'Admin Announcements', icon: Mail }
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-gray-500" />
                        <Label htmlFor={key} className="cursor-pointer">{label}</Label>
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
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading preferences...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Notifications Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Test Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="test-user-id" className="text-sm font-medium">User ID</Label>
                <Input
                  id="test-user-id"
                  placeholder="Enter User ID"
                  value={testUserId}
                  onChange={(e) => setTestUserId(e.target.value)}
                  data-testid="input-test-user-id"
                />
              </div>
              <div>
                <Label htmlFor="test-case-id" className="text-sm font-medium">Case ID</Label>
                <Input
                  id="test-case-id"
                  placeholder="Enter Case ID"
                  value={testCaseId}
                  onChange={(e) => setTestCaseId(e.target.value)}
                  data-testid="input-test-case-id"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="test-notes" className="text-sm font-medium">Optional Notes</Label>
              <Textarea
                id="test-notes"
                placeholder="Add custom notes for the test notification..."
                value={testNotes}
                onChange={(e) => setTestNotes(e.target.value)}
                rows={3}
                data-testid="textarea-test-notes"
              />
            </div>

            {/* Horizontal scrollable test buttons */}
            <div className="overflow-x-auto notification-scroll -mx-4 px-4">
              <div className="flex flex-nowrap gap-3 items-center snap-x snap-mandatory scrollbar-hide justify-end md:justify-start notification-button-scroll">
                <ActionButton
                  onClick={() => handleSendTest('case_status')}
                  disabled={sendTestMutation.isPending}
                  variant="ghost"
                  className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
                  data-testid="button-test-case-status"
                >
                  {sendTestMutation.isPending ? 'Sending...' : 'Case Status'}
                </ActionButton>
                
                <ActionButton
                  onClick={() => handleSendTest('milestone')}
                  disabled={sendTestMutation.isPending}
                  variant="ghost"
                  className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
                  data-testid="button-test-milestone"
                >
                  {sendTestMutation.isPending ? 'Sending...' : 'Milestone'}
                </ActionButton>

                <ActionButton
                  onClick={() => handleSendTest('document_status')}
                  disabled={sendTestMutation.isPending}
                  variant="ghost"
                  className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
                  data-testid="button-test-document-status"
                >
                  {sendTestMutation.isPending ? 'Sending...' : 'Document'}
                </ActionButton>

                <ActionButton
                  onClick={() => handleSendTest('weekly_report')}
                  disabled={sendTestMutation.isPending}
                  variant="ghost"
                  className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
                  data-testid="button-test-weekly-report"
                >
                  {sendTestMutation.isPending ? 'Sending...' : 'Weekly Report'}
                </ActionButton>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* HAC & Case Management Test Notifications Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Test HAC & Case Management Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* HAC Notifications Test */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  HAC Notifications Test
                </h3>
                
                <div>
                  <Label htmlFor="hac-test-case-id" className="text-sm font-medium">Case ID for HAC Test</Label>
                  <Input
                    id="hac-test-case-id"
                    placeholder="TEST-123"
                    value={hacTestCaseId}
                    onChange={(e) => setHacTestCaseId(e.target.value)}
                    data-testid="input-hac-test-case-id"
                  />
                </div>

                {/* Horizontal scrollable HAC test buttons */}
                <div className="overflow-x-auto notification-scroll -mx-4 px-4">
                  <div className="flex flex-nowrap gap-3 items-center snap-x snap-mandatory scrollbar-hide justify-end md:justify-start notification-button-scroll">
                    <ActionButton
                      onClick={() => testHACMutation.mutate({ type: 'new_request', caseId: hacTestCaseId })}
                      disabled={testHACMutation.isPending || !hacTestCaseId}
                      variant="ghost"
                      className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
                      data-testid="button-test-hac-new-request"
                    >
                      {testHACMutation.isPending ? 'Sending...' : 'New Request'}
                    </ActionButton>
                    
                    <ActionButton
                      onClick={() => testHACMutation.mutate({ type: 'approval', caseId: hacTestCaseId })}
                      disabled={testHACMutation.isPending || !hacTestCaseId}
                      variant="ghost"
                      className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
                      data-testid="button-test-hac-approval"
                    >
                      {testHACMutation.isPending ? 'Sending...' : 'HAC Approval'}
                    </ActionButton>

                    <ActionButton
                      onClick={() => testHACMutation.mutate({ type: 'decline', caseId: hacTestCaseId })}
                      disabled={testHACMutation.isPending || !hacTestCaseId}
                      variant="ghost"
                      className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
                      data-testid="button-test-hac-decline"
                    >
                      {testHACMutation.isPending ? 'Sending...' : 'HAC Decline'}
                    </ActionButton>
                  </div>
                </div>
              </div>

              {/* Case Stage Change Test */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Stage Change Test
                </h3>
                
                <div>
                  <Label htmlFor="stage-test-case-id" className="text-sm font-medium">Case ID</Label>
                  <Input
                    id="stage-test-case-id"
                    placeholder="TEST-123"
                    value={stageTestCaseId}
                    onChange={(e) => setStageTestCaseId(e.target.value)}
                    data-testid="input-stage-test-case-id"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="stage-old" className="text-sm font-medium">From Stage</Label>
                    <Select value={stageOld} onValueChange={setStageOld}>
                      <SelectTrigger data-testid="select-stage-old">
                        <SelectValue placeholder="Old Stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {testData?.testData?.availableStages?.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage.replace('_', ' ')}
                          </SelectItem>
                        )) || [
                          'initial_assessment',
                          'document_collection',
                          'archive_search',
                          'translation',
                          'submission',
                          'review',
                          'decision',
                          'completed'
                        ].map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="stage-new" className="text-sm font-medium">To Stage</Label>
                    <Select value={stageNew} onValueChange={setStageNew}>
                      <SelectTrigger data-testid="select-stage-new">
                        <SelectValue placeholder="New Stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {testData?.testData?.availableStages?.map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage.replace('_', ' ')}
                          </SelectItem>
                        )) || [
                          'initial_assessment',
                          'document_collection',
                          'archive_search',
                          'translation',
                          'submission',
                          'review',
                          'decision',
                          'completed'
                        ].map((stage) => (
                          <SelectItem key={stage} value={stage}>
                            {stage.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Horizontal scrollable stage change test button */}
                <div className="overflow-x-auto notification-scroll -mx-4 px-4">
                  <div className="flex flex-nowrap gap-3 items-center snap-x snap-mandatory scrollbar-hide justify-end md:justify-start notification-button-scroll">
                    <ActionButton
                      onClick={() => testStageChangeMutation.mutate({ 
                        caseId: stageTestCaseId, 
                        oldStage: stageOld, 
                        newStage: stageNew, 
                        notes: 'Test stage change notification' 
                      })}
                      disabled={testStageChangeMutation.isPending || !stageTestCaseId || !stageOld || !stageNew}
                      variant="ghost"
                      className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
                      data-testid="button-test-stage-change"
                    >
                      {testStageChangeMutation.isPending ? 'Sending...' : 'Stage Change'}
                    </ActionButton>

                    <ActionButton
                      onClick={() => testStageChangeMutation.mutate({ 
                        caseId: stageTestCaseId, 
                        oldStage: 'initial_assessment', 
                        newStage: 'completed', 
                        notes: 'Test full stage progression notification' 
                      })}
                      disabled={testStageChangeMutation.isPending || !stageTestCaseId}
                      variant="ghost"
                      className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
                      data-testid="button-test-stage-progression"
                    >
                      {testStageChangeMutation.isPending ? 'Sending...' : 'Full Progression'}
                    </ActionButton>

                    <ActionButton
                      onClick={() => testStageChangeMutation.mutate({ 
                        caseId: stageTestCaseId, 
                        oldStage: 'review', 
                        newStage: 'initial_assessment', 
                        notes: 'Test stage rollback notification' 
                      })}
                      disabled={testStageChangeMutation.isPending || !stageTestCaseId}
                      variant="ghost"
                      className="w-[180px] flex-shrink-0 gap-2 justify-center touch-target transition-all duration-200 hover:scale-105"
                      data-testid="button-test-stage-rollback"
                    >
                      {testStageChangeMutation.isPending ? 'Sending...' : 'Test Rollback'}
                    </ActionButton>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">💡 Test Information</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• HAC notifications will be sent to the configured Roman email address</li>
                <li>• Client notifications use mock emails: client-{'{caseId}'}@example.com</li>
                <li>• All test emails are logged to console in development mode</li>
                <li>• Check server logs to see email content and delivery status</li>
                <li>• Emails are only sent if corresponding settings are enabled above</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification History */}
      {selectedUser && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Notification History - {selectedUser}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading history...</p>
              </div>
            ) : historyData?.history?.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {historyData.history.map((notification) => (
                  <div 
                    key={notification.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{notification.email_subject}</span>
                        <Badge className={`text-xs ${getStatusColor(notification.status)}`}>
                          {notification.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>Type: {notification.notification_type}</p>
                        {notification.old_value && notification.new_value && (
                          <p>Change: {notification.old_value} → {notification.new_value}</p>
                        )}
                        <p>Sent: {formatDate(notification.sent_at)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No notification history found for this user</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}