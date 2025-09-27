import { useState, useEffect } from 'react';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Clock,
  Smartphone,
  Key,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  loginNotifications: boolean;
  encryptionLevel: 'standard' | 'high' | 'maximum';
}

interface SessionInfo {
  id: string;
  device: string;
  location: string;
  lastActive: Date;
  current: boolean;
}

export function SecurityDashboard() {
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginNotifications: true,
    encryptionLevel: 'high'
  });
  
  const [sessions, setSessions] = useState<SessionInfo[]>([
    {
      id: '1',
      device: 'Chrome on Windows',
      location: 'New York, US',
      lastActive: new Date(),
      current: true
    },
    {
      id: '2',
      device: 'Safari on iPhone',
      location: 'New York, US',
      lastActive: new Date(Date.now() - 3600000),
      current: false
    }
  ]);

  const [timeoutWarning, setTimeoutWarning] = useState(false);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(settings.sessionTimeout * 60);

  // Session timeout countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTimeRemaining(prev => {
        const newTime = prev - 1;
        
        // Show warning when 5 minutes remaining
        if (newTime === 300 && !timeoutWarning) {
          setTimeoutWarning(true);
        }
        
        // Auto-logout when time reaches 0
        if (newTime <= 0) {
          handleSessionTimeout();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeoutWarning]);

  const handleSessionTimeout = () => {
    // In a real app, this would redirect to login
    alert('Session expired. Please log in again.');
  };

  const extendSession = () => {
    setSessionTimeRemaining(settings.sessionTimeout * 60);
    setTimeoutWarning(false);
  };

  const terminateSession = (sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
  };

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Session Timeout Warning */}
      {timeoutWarning && (
        <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between">
            <span>Your session will expire in {formatTimeRemaining(sessionTimeRemaining)}</span>
            <Button size="sm" onClick={extendSession} className="ml-4">
              Extend Session
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span>Security Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Key className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-semibold text-blue-700 dark:text-blue-300">
                2FA {settings.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">
                Two-factor authentication
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="font-semibold text-purple-700 dark:text-purple-300">
                Session Active
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">
                {formatTimeRemaining(sessionTimeRemaining)} remaining
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            <span>Two-Factor Authentication</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Enable 2FA</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Button
                variant={settings.twoFactorEnabled ? 'destructive' : 'default'}
                onClick={() => setSettings(prev => ({ 
                  ...prev, 
                  twoFactorEnabled: !prev.twoFactorEnabled 
                }))}
              >
                {settings.twoFactorEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
            
            {settings.twoFactorEnabled && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">2FA is active</span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Your account is protected with two-factor authentication
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-gray-600" />
            <span>Active Sessions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Smartphone className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{session.device}</span>
                      {session.current && (
                        <Badge variant="secondary" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {session.location} • Last active {session.lastActive.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                {!session.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => terminateSession(session.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Terminate
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <EyeOff className="h-5 w-5 text-purple-600" />
            <span>Privacy Controls</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Login Notifications</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Receive email notifications for new login attempts
                </p>
              </div>
              <Button
                variant={settings.loginNotifications ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSettings(prev => ({ 
                  ...prev, 
                  loginNotifications: !prev.loginNotifications 
                }))}
              >
                {settings.loginNotifications ? 'On' : 'Off'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Session Timeout</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically log out after inactivity
                </p>
              </div>
              <select
                value={settings.sessionTimeout}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  sessionTimeout: parseInt(e.target.value) 
                }))}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={240}>4 hours</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Data Encryption Level</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Choose your preferred encryption strength
                </p>
              </div>
              <select
                value={settings.encryptionLevel}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  encryptionLevel: e.target.value as any 
                }))}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
              >
                <option value="standard">Standard</option>
                <option value="high">High</option>
                <option value="maximum">Maximum</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Component for secure file upload
export function SecureFileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    
    // Simulate secure upload with encryption
    for (const file of files) {
      // In a real implementation, files would be encrypted client-side
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setUploading(false);
    setFiles([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lock className="h-5 w-5 text-green-600" />
          <span>Secure Document Upload</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="encryption"
              checked={encryptionEnabled}
              onChange={(e) => setEncryptionEnabled(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="encryption" className="text-sm">
              Enable client-side encryption
            </Label>
          </div>
          
          <Input
            type="file"
            multiple
            onChange={handleFileSelect}
            className="cursor-pointer"
          />
          
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Selected Files:</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-sm">{file.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </Badge>
                </div>
              ))}
            </div>
          )}
          
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading securely...' : 'Upload Files'}
          </Button>
          
          {encryptionEnabled && (
            <div className="text-xs text-green-600 dark:text-green-400 flex items-center space-x-1">
              <Lock className="h-3 w-3" />
              <span>Files will be encrypted before upload</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}