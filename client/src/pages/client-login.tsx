import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, LogIn, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Magic link request schema
const magicLinkSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

type MagicLinkFormData = z.infer<typeof magicLinkSchema>;

export default function ClientLoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [developmentToken, setDevelopmentToken] = useState<string>("");

  const form = useForm<MagicLinkFormData>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = async (data: MagicLinkFormData) => {
    setIsLoading(true);
    setLinkSent(false);
    
    try {
      const response = await fetch('/api/client/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send magic link');
      }

      setLinkSent(true);
      
      // For development, store the token
      if (result.developmentToken) {
        setDevelopmentToken(result.developmentToken);
      }

      toast({
        title: "Magic Link Sent!",
        description: "Check the server console for your access link (development mode).",
      });

    } catch (error) {
      console.error("Magic link request error:", error);
      toast({
        title: "Request Failed",
        description: error instanceof Error ? error.message : "Failed to send magic link",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevLogin = () => {
    if (developmentToken) {
      setLocation(`/client/home?token=${developmentToken}`);
    }
  };

  if (linkSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-700 dark:text-green-300">Magic Link Sent!</CardTitle>
            <CardDescription>
              Your secure access link has been generated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Development Mode:</strong> Check the server console for your magic link token.
                In production, this would be sent to your email.
              </AlertDescription>
            </Alert>

            {developmentToken && (
              <div className="space-y-3">
                <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900">
                  <AlertDescription className="text-sm">
                    <strong>Development Access:</strong> Click below to access your client portal directly.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={handleDevLogin}
                  className="w-full"
                  data-testid="button-dev-access"
                >
                  Access Client Portal
                </Button>
              </div>
            )}

            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setLinkSent(false)}
              data-testid="button-back"
            >
              Send Another Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Client Portal Access</CardTitle>
          <CardDescription>
            Enter your email address to receive a secure magic link to access your client portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="your.email@example.com"
                          className="pl-9"
                          data-testid="input-email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
                data-testid="button-magic-link"
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Sending Magic Link...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Send Magic Link
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Secure Access:</strong> No passwords required. We'll send you a secure, 
                time-limited link to access your client portal. This link expires in 24 hours.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}