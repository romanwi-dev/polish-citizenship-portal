import { useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, Shield } from "lucide-react";

interface ClientRouteProtectionProps {
  children: ReactNode;
}

export function ClientRouteProtection({ children }: ClientRouteProtectionProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please request a magic link to access the client portal.",
        variant: "destructive"
      });
      setLocation('/client/login');
    }
  }, [setLocation, toast]);

  // Show loading state while checking authentication
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Shield className="mx-auto h-12 w-12 text-orange-500" />
              <h2 className="text-xl font-semibold">Access Denied</h2>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You need a valid magic link token to access the client portal. 
                  Please request a new magic link from the login page.
                </AlertDescription>
              </Alert>
              <Button 
                className="w-full" 
                onClick={() => setLocation('/client/login')}
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

  return <>{children}</>;
}