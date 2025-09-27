import { useEffect, useState, ReactNode } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Shield, Lock } from "lucide-react";

interface AdminRouteProtectionProps {
  children: ReactNode;
}

interface User {
  id: string;
  email: string;
  role: string;
}

export function AdminRouteProtection({ children }: AdminRouteProtectionProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        // Get token from localStorage (assuming JWT auth is used)
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('authentication_required');
          setIsLoading(false);
          return;
        }

        // Get user info from token by calling the auth endpoint
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          // Token invalid or expired
          localStorage.removeItem('token');
          setError('authentication_required');
          toast({
            title: "Session Expired",
            description: "Please log in again to access admin features.",
            variant: "destructive"
          });
        } else if (response.ok) {
          const result = await response.json();
          
          if (result.success && result.user) {
            // Check if user has admin or staff role
            if (result.user.role === 'admin' || result.user.role === 'staff') {
              setUser({
                id: result.user.id,
                email: result.user.email,
                role: result.user.role
              });
            } else {
              // User is authenticated but doesn't have admin/staff role
              setError('access_denied');
              toast({
                title: "Access Denied",
                description: "Administrator or staff privileges required to access this page.",
                variant: "destructive"
              });
            }
          } else {
            setError('authentication_required');
          }
        } else {
          setError('server_error');
        }
      } catch (error) {
        console.error('Admin authentication check failed:', error);
        setError('server_error');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, [toast]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-muted-foreground">Verifying admin access...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle authentication required (redirect to login)
  if (error === 'authentication_required') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Lock className="mx-auto h-12 w-12 text-blue-500" />
              <h2 className="text-xl font-semibold">Authentication Required</h2>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You need to be logged in to access admin features. Please log in with your admin credentials.
                </AlertDescription>
              </Alert>
              <Button 
                className="w-full" 
                onClick={() => setLocation('/auth')}
                data-testid="button-redirect-login"
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle access denied (403 - user is authenticated but not admin)
  if (error === 'access_denied') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Shield className="mx-auto h-12 w-12 text-red-500" />
              <h2 className="text-xl font-semibold">Access Denied</h2>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This area is restricted to administrators only. If you believe this is an error, 
                  please contact your system administrator.
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => setLocation('/')}
                  data-testid="button-go-home"
                >
                  Go Home
                </Button>
                <Button 
                  onClick={() => setLocation('/auth')}
                  data-testid="button-switch-account"
                >
                  Switch Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle server errors
  if (error === 'server_error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="mx-auto h-12 w-12 text-orange-500" />
              <h2 className="text-xl font-semibold">Server Error</h2>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Unable to verify your admin access due to a server error. Please try again later.
                </AlertDescription>
              </Alert>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
                data-testid="button-retry"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If we get here, user is authenticated and is admin
  return <>{children}</>;
}