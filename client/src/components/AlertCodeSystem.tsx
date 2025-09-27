import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Terminal, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle, 
  Zap,
  Search,
  Play,
  Code,
  Activity
} from 'lucide-react';

interface AlertCode {
  code: string;
  name: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
  category: string;
  action?: () => void;
}

/**
 * 🚨 ALERT CODE SYSTEM
 * Named alert codes for quick triggering throughout the project
 */

export function AlertCodeSystem() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchCode, setSearchCode] = useState('');
  const [activeAlert, setActiveAlert] = useState<AlertCode | null>(null);
  const [showActiveAlert, setShowActiveAlert] = useState(false);

  // Predefined alert codes
  const alertCodes: AlertCode[] = [
    // Workflow System Alerts
    {
      code: 'WF001',
      name: 'Workflow Success',
      message: '🎉 All workflows completed successfully! No manual intervention required.',
      type: 'success',
      category: 'Workflows'
    },
    {
      code: 'WF002', 
      name: 'Workflow Issues Fixed',
      message: '⚠️ Issues detected and automatically fixed. Quick review recommended.',
      type: 'warning',
      category: 'Workflows'
    },
    {
      code: 'WF003',
      name: 'Workflow Critical',
      message: '🚨 Critical workflow failure. Manual intervention required immediately.',
      type: 'error',
      category: 'Workflows'
    },
    {
      code: 'WF004',
      name: 'Scheduler Active',
      message: '✅ Replit-native workflow scheduler is active and monitoring.',
      type: 'info',
      category: 'Workflows'
    },

    // Testing System Alerts
    {
      code: 'T001',
      name: 'Rule 1 Enforced',
      message: '🔴 RULE 1: UI Functionality Testing completed successfully.',
      type: 'success',
      category: 'Testing'
    },
    {
      code: 'T002',
      name: 'Rule 4 Auto-Fix',
      message: '🔴 RULE 4: Auto-fix system applied corrections until perfect.',
      type: 'success',
      category: 'Testing'
    },
    {
      code: 'T003',
      name: 'Rule X Grok',
      message: '🔴 RULE X: Grok architecture verification completed.',
      type: 'success',
      category: 'Testing'
    },
    {
      code: 'T004',
      name: 'Testing Failed',
      message: '❌ Testing suite failed. Check system logs for details.',
      type: 'error',
      category: 'Testing'
    },

    // System Status Alerts
    {
      code: 'S001',
      name: 'System Operational',
      message: '🚀 All systems operational. Polish citizenship app running perfectly.',
      type: 'success',
      category: 'System'
    },
    {
      code: 'S002',
      name: 'Database Connected',
      message: '💾 Database connection established and healthy.',
      type: 'info',
      category: 'System'
    },
    {
      code: 'S003',
      name: 'Server Error',
      message: '🔥 Server error detected. Restart may be required.',
      type: 'error',
      category: 'System'
    },

    // Development Alerts
    {
      code: 'D001',
      name: 'Deploy Ready',
      message: '🚀 All checks passed. Project ready for deployment!',
      type: 'success',
      category: 'Development'
    },
    {
      code: 'D002',
      name: 'Code Changes',
      message: '📝 Code changes detected. Running automated verification...',
      type: 'info',
      category: 'Development'
    },
    {
      code: 'D003',
      name: 'Build Error',
      message: '💥 Build failed. Check TypeScript errors and dependencies.',
      type: 'error',
      category: 'Development'
    },

    // User Experience Alerts
    {
      code: 'U001',
      name: 'Time Saved',
      message: '⏰ At 58, time is precious - automation just saved you hours!',
      type: 'success',
      category: 'User Experience'
    },
    {
      code: 'U002',
      name: 'No Manual Check',
      message: '📱 NO PHONE CHECKING NEEDED! Sit back and relax.',
      type: 'success',
      category: 'User Experience'
    },

    // Emergency Alerts
    {
      code: 'E001',
      name: 'Emergency Stop',
      message: '🛑 Emergency stop activated. All workflows halted.',
      type: 'error',
      category: 'Emergency'
    },
    {
      code: 'E002',
      name: 'Recovery Mode',
      message: '🔧 Recovery mode activated. Attempting auto-repair...',
      type: 'warning',
      category: 'Emergency'
    }
  ];

  const filteredAlerts = searchCode 
    ? alertCodes.filter(alert => 
        alert.code.toLowerCase().includes(searchCode.toLowerCase()) ||
        alert.name.toLowerCase().includes(searchCode.toLowerCase()) ||
        alert.category.toLowerCase().includes(searchCode.toLowerCase())
      )
    : alertCodes;

  const categories = [...new Set(alertCodes.map(alert => alert.category))];

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const triggerAlert = (alert: AlertCode) => {
    setActiveAlert(alert);
    setShowActiveAlert(true);
    setIsOpen(false);

    // Auto-hide after 5 seconds for success/info, 8 seconds for warnings/errors
    const hideTimeout = ['success', 'info'].includes(alert.type) ? 5000 : 8000;
    setTimeout(() => {
      setShowActiveAlert(false);
    }, hideTimeout);

    // Execute action if defined
    if (alert.action) {
      alert.action();
    }

    // Log to console for debugging
    console.log(`🚨 Alert ${alert.code}: ${alert.name} - ${alert.message}`);
  };

  // Global function to trigger alerts by code
  useEffect(() => {
    (window as any).triggerAlertCode = (code: string) => {
      const alert = alertCodes.find(a => a.code === code);
      if (alert) {
        triggerAlert(alert);
      } else {
        console.warn(`Alert code ${code} not found`);
      }
    };

    return () => {
      delete (window as any).triggerAlertCode;
    };
  }, []);

  return (
    <>
      {/* Alert Code Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" data-testid="button-alert-codes">
            <Terminal className="h-4 w-4 mr-2" />
            Alert Codes
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              Alert Code System
            </DialogTitle>
            <DialogDescription>
              Trigger named alerts throughout your project. Use codes like WF001, T001, S001, etc.
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search alert codes, names, or categories..."
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              data-testid="input-search-alerts"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map(category => (
              <Badge key={category} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
          </div>

          {/* Alert Codes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredAlerts.map((alert) => (
              <Card key={alert.code} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-sm font-mono">{alert.code}</CardTitle>
                      <p className="text-xs text-gray-600">{alert.name}</p>
                    </div>
                    <Badge variant="outline" className={getTypeColor(alert.type)}>
                      {getIcon(alert.type)}
                      {alert.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700 mb-3">{alert.message}</p>
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="text-xs">
                      {alert.category}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => triggerAlert(alert)}
                      data-testid={`button-trigger-${alert.code}`}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Trigger
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator />

          {/* Usage Instructions */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Usage Instructions:</h4>
            <div className="space-y-1 text-xs text-gray-600">
              <p><code className="bg-gray-200 px-1 rounded">triggerAlertCode('WF001')</code> - Trigger alert by code</p>
              <p><code className="bg-gray-200 px-1 rounded">window.triggerAlertCode('T001')</code> - Global function access</p>
              <p>Alert codes are categorized: WF=Workflows, T=Testing, S=System, D=Development, U=User, E=Emergency</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Active Alert Display */}
      {showActiveAlert && activeAlert && (
        <div className="fixed top-4 right-4 z-50 w-96">
          <Alert className={`${getTypeColor(activeAlert.type)} shadow-lg animate-in slide-in-from-right`}>
            <div className="flex items-center gap-2">
              {getIcon(activeAlert.type)}
              <AlertTitle className="flex items-center gap-2">
                <code className="text-xs bg-white/50 px-1 rounded">{activeAlert.code}</code>
                {activeAlert.name}
              </AlertTitle>
            </div>
            <AlertDescription className="mt-2">
              {activeAlert.message}
            </AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0"
              onClick={() => setShowActiveAlert(false)}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </Alert>
        </div>
      )}
    </>
  );
}

/**
 * 🔧 USAGE EXAMPLES:
 * 
 * // In components:
 * triggerAlertCode('WF001') // Workflow success
 * triggerAlertCode('T004')  // Testing failed
 * triggerAlertCode('S001')  // System operational
 * 
 * // In browser console:
 * window.triggerAlertCode('E001') // Emergency stop
 * 
 * // Categories:
 * WF = Workflows, T = Testing, S = System
 * D = Development, U = User Experience, E = Emergency
 */