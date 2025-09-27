import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield, TreePine, User, Calendar, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  email: string;
  name?: string;
  tier: 'A' | 'B' | 'C';
  score?: number;
  createdAt: string;
}

interface VerificationResult {
  valid: boolean;
  lead?: Lead;
  error?: string;
}

export default function TreeAccess() {
  const [, params] = useRoute('/tree/:leadId/:token');
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [lead, setLead] = useState<Lead | null>(null);
  const [workspaceInitialized, setWorkspaceInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!params?.leadId || !params?.token) {
      setVerificationStatus('error');
      return;
    }

    verifyAccess(params.leadId, params.token);
  }, [params]);

  const verifyAccess = async (leadId: string, token: string) => {
    try {
      const response = await fetch('/api/tree/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ leadId, token })
      });
      const result: VerificationResult = await response.json();

      if (result.valid && result.lead) {
        setLead(result.lead);
        setVerificationStatus('success');
        
        // Initialize workspace in localStorage
        initializeWorkspace(result.lead);
        
        console.log(`✅ Tree access verified for ${result.lead.email}`);
      } else {
        setVerificationStatus('error');
        toast({
          title: "Access Denied",
          description: result.error || "Invalid access credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationStatus('error');
      toast({
        title: "Connection Error",
        description: "Unable to verify your access. Please try again.",
        variant: "destructive"
      });
    }
  };

  const initializeWorkspace = (leadData: Lead) => {
    try {
      // Store lead session in localStorage for workspace access
      const workspaceData = {
        leadId: leadData.id,
        email: leadData.email,
        name: leadData.name,
        tier: leadData.tier,
        score: leadData.score,
        accessedAt: new Date().toISOString(),
        sessionActive: true
      };

      localStorage.setItem('tree-workspace', JSON.stringify(workspaceData));
      
      // Clear any existing form data to ensure fresh start
      localStorage.removeItem('familyTreeData');
      localStorage.removeItem('dashboardFormData');
      
      setWorkspaceInitialized(true);
      
      console.log('✅ Workspace initialized for lead:', leadData.email);
    } catch (error) {
      console.error('Failed to initialize workspace:', error);
    }
  };

  const getTierColor = (tier: 'A' | 'B' | 'C') => {
    switch (tier) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'C': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTierLabel = (tier: 'A' | 'B' | 'C') => {
    switch (tier) {
      case 'A': return 'High Priority';
      case 'B': return 'Medium Priority';
      case 'C': return 'Standard';
      default: return 'Unknown';
    }
  };

  const navigateToWorkspace = () => {
    // Redirect to mobile dashboard for lead workspace
    window.location.href = '/mobile-dashboard';
  };

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Verifying Access</h2>
          <p className="text-gray-600">Please wait while we validate your credentials...</p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-900">Access Denied</CardTitle>
            <CardDescription>
              The link you used is invalid or has expired. Please check your email for the correct link.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <TreePine className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Your Family Tree Workspace
          </h1>
          <p className="text-gray-600 text-lg">
            Your personalized Polish citizenship assessment results and documentation workspace
          </p>
        </div>

        {lead && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <User className="h-6 w-6 text-blue-600" />
                  <div>
                    <CardTitle>{lead.name || 'Welcome'}</CardTitle>
                    <CardDescription>{lead.email}</CardDescription>
                  </div>
                </div>
                <Badge className={getTierColor(lead.tier)}>
                  {getTierLabel(lead.tier)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lead.score && (
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">Assessment Score:</span>
                    <span className="font-bold text-blue-600">{lead.score}/100</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span className="font-medium">Submitted:</span>
                  <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your Workspace is Ready</CardTitle>
            <CardDescription>
              Based on your assessment responses, we've prepared a personalized workspace to help you organize your Polish citizenship documentation and next steps.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">What's included:</h3>
              <ul className="text-blue-800 space-y-1">
                <li>• Interactive Family Tree builder</li>
                <li>• Document checklist and upload system</li>
                <li>• Polish citizenship application forms</li>
                <li>• Personalized guidance based on your tier</li>
                <li>• Progress tracking tools</li>
              </ul>
            </div>

            {workspaceInitialized && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 font-medium">
                  ✅ Your workspace has been initialized and is ready to use!
                </p>
              </div>
            )}

            <Button 
              onClick={navigateToWorkspace}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
              data-testid="button-enter-workspace"
            >
              <TreePine className="h-5 w-5 mr-2" />
              Enter Your Workspace
            </Button>

            <p className="text-sm text-gray-600 text-center">
              This workspace is private and secure. Your data is saved locally on your device.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}