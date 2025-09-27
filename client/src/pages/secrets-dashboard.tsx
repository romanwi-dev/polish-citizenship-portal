import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Key, Shield, Save, TestTube, CheckCircle, XCircle, Settings } from "lucide-react";

interface SecretConfig {
  key: string;
  value: string;
  description: string;
  isRequired: boolean;
  isValid: boolean;
  lastTested?: string;
  category: 'ai' | 'storage' | 'auth' | 'integrations';
}

export function SecretsManagementDashboard() {
  const { toast } = useToast();
  const [secrets, setSecrets] = useState<SecretConfig[]>([]);
  const [visibleSecrets, setVisibleSecrets] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [testingSecret, setTestingSecret] = useState<string | null>(null);

  // Default secrets configuration
  const defaultSecrets: SecretConfig[] = [
    {
      key: 'OPENAI_API_KEY',
      value: '',
      description: 'OpenAI API key for document OCR and AI analysis',
      isRequired: true,
      isValid: false,
      category: 'ai'
    },
    {
      key: 'GOOGLE_SERVICE_ACCOUNT_KEY',
      value: '',
      description: 'Google Cloud service account for Google Drive integration',
      isRequired: false,
      isValid: false,
      category: 'integrations'
    },
    {
      key: 'MICROSOFT_ACCESS_TOKEN',
      value: '',
      description: 'Microsoft Graph API token for OneDrive integration',
      isRequired: false,
      isValid: false,
      category: 'integrations'
    },
    {
      key: 'DROPBOX_ACCESS_TOKEN',
      value: '',
      description: 'Dropbox API token for file storage integration',
      isRequired: false,
      isValid: false,
      category: 'storage'
    }
  ];

  useEffect(() => {
    loadSecrets();
  }, []);

  const loadSecrets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/secrets/status');
      const data = await response.json();
      
      if (data.success) {
        const updatedSecrets = defaultSecrets.map(secret => ({
          ...secret,
          isValid: data.secrets[secret.key]?.isValid || false,
          lastTested: data.secrets[secret.key]?.lastTested
        }));
        setSecrets(updatedSecrets);
      } else {
        setSecrets(defaultSecrets);
      }
    } catch (error) {
      console.error('Error loading secrets:', error);
      setSecrets(defaultSecrets);
    } finally {
      setLoading(false);
    }
  };

  const toggleSecretVisibility = (secretKey: string) => {
    setVisibleSecrets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(secretKey)) {
        newSet.delete(secretKey);
      } else {
        newSet.add(secretKey);
      }
      return newSet;
    });
  };

  const updateSecretValue = (secretKey: string, value: string) => {
    setSecrets(prev => prev.map(secret => 
      secret.key === secretKey 
        ? { ...secret, value: value.trim() }
        : secret
    ));
  };

  const saveSecret = async (secretKey: string) => {
    const secret = secrets.find(s => s.key === secretKey);
    if (!secret) return;

    setLoading(true);
    try {
      const response = await fetch('/api/secrets/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          key: secretKey,
          value: secret.value
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Secret Saved",
          description: `${secretKey} has been updated successfully`,
        });
        await loadSecrets(); // Reload to get updated status
      } else {
        toast({
          title: "Save Failed", 
          description: result.error || "Failed to save secret",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Save Error",
        description: "Failed to save secret due to network error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testSecret = async (secretKey: string) => {
    setTestingSecret(secretKey);
    try {
      const response = await fetch('/api/secrets/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key: secretKey })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Test Successful",
          description: `${secretKey} is working correctly`,
        });
        
        setSecrets(prev => prev.map(secret => 
          secret.key === secretKey 
            ? { ...secret, isValid: true, lastTested: new Date().toISOString() }
            : secret
        ));
      } else {
        toast({
          title: "Test Failed",
          description: result.error || "Secret test failed",
          variant: "destructive"
        });
        
        setSecrets(prev => prev.map(secret => 
          secret.key === secretKey 
            ? { ...secret, isValid: false }
            : secret
        ));
      }
    } catch (error) {
      toast({
        title: "Test Error",
        description: "Failed to test secret",
        variant: "destructive"
      });
    } finally {
      setTestingSecret(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ai': return '🧠';
      case 'storage': return '☁️';
      case 'auth': return '🔐';
      case 'integrations': return '🔗';
      default: return '⚙️';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ai': return 'bg-purple-100 text-purple-800';
      case 'storage': return 'bg-blue-100 text-blue-800';
      case 'auth': return 'bg-green-100 text-green-800';
      case 'integrations': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatLastTested = (lastTested?: string) => {
    if (!lastTested) return 'Never tested';
    return new Date(lastTested).toLocaleDateString() + ' at ' + new Date(lastTested).toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Secret Management Dashboard</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Manage API keys and configuration secrets for your Polish citizenship application system
          </p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {['ai', 'storage', 'auth', 'integrations'].map(category => {
            const categorySecrets = secrets.filter(s => s.category === category);
            const validSecrets = categorySecrets.filter(s => s.isValid).length;
            const totalSecrets = categorySecrets.length;
            
            return (
              <Card key={category} className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{getCategoryIcon(category)}</span>
                    <span className="font-semibold capitalize">{category}</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {validSecrets}/{totalSecrets}
                  </div>
                  <div className="text-sm text-gray-600">
                    Configured
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Secrets Management */}
        <div className="grid grid-cols-1 gap-6">
          {secrets.map((secret) => (
            <Card key={secret.key} className="bg-white shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-gray-600" />
                    <CardTitle className="text-xl">{secret.key}</CardTitle>
                    <Badge className={getCategoryColor(secret.category)}>
                      {getCategoryIcon(secret.category)} {secret.category}
                    </Badge>
                    {secret.isRequired && (
                      <Badge variant="destructive">Required</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {secret.isValid ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
                <p className="text-gray-600">{secret.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Label htmlFor={`secret-${secret.key}`} className="text-sm font-medium">
                        Secret Value
                      </Label>
                      <div className="relative mt-1">
                        <Input
                          id={`secret-${secret.key}`}
                          type={visibleSecrets.has(secret.key) ? "text" : "password"}
                          value={secret.value}
                          onChange={(e) => updateSecretValue(secret.key, e.target.value)}
                          placeholder={`Enter your ${secret.key}...`}
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => toggleSecretVisibility(secret.key)}
                        >
                          {visibleSecrets.has(secret.key) ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Last tested: {formatLastTested(secret.lastTested)}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => testSecret(secret.key)}
                        disabled={testingSecret === secret.key || !secret.value.trim()}
                        variant="outline"
                        size="sm"
                      >
                        <TestTube className="w-4 h-4 mr-2" />
                        {testingSecret === secret.key ? 'Testing...' : 'Test'}
                      </Button>
                      <Button
                        onClick={() => saveSecret(secret.key)}
                        disabled={loading || !secret.value.trim()}
                        size="sm"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Information */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Settings className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Security Information</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• All secrets are encrypted and stored securely</li>
                  <li>• API keys are never logged or exposed in client-side code</li>
                  <li>• Test functionality validates secrets without storing responses</li>
                  <li>• Changes take effect immediately after saving</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}