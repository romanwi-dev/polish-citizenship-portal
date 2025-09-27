import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";



const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setNeedsVerification(false);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.needsVerification) {
          setNeedsVerification(true);
        }
        throw new Error(result.message || 'Login failed');
      }

      // Store auth token and user data
      localStorage.setItem('token', result.token);
      localStorage.setItem('userId', result.user.id);
      
      toast({
        title: "Login Successful!",
        description: "Welcome back! Redirecting to your dashboard...",
      });
      
      // Redirect to dashboard
      setTimeout(() => {
        setLocation("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      
      <div className="max-w-md mx-auto px-4 py-16">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center text-lg">
              Sign in to access your Polish citizenship portal
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {needsVerification && (
              <Alert className="mb-6 bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Please verify your email before logging in. Check your inbox for the verification link.
                </AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-4 top-5 h-5 w-5 text-gray-400" />
                          <Input 
                            {...field} 
                            type="email"
                            placeholder="your.email@example.com"
                            className="h-14 text-lg pl-12 pr-5 bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-base font-semibold">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-4 top-5 h-5 w-5 text-gray-400" />
                          <Input 
                            {...field} 
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="h-14 text-lg pl-12 pr-12 bg-gray-50 focus:bg-white transition-all duration-200 border-2 focus:border-blue-500 rounded-xl"
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-5 p-1 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm" />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between text-base">
                  <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
                    Forgot password?
                  </Link>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 text-lg font-semibold bg-red-800 hover:bg-red-900 text-white rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5 mr-3" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Create Account
                </Link>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-500">
                By signing in, you agree to our{" "}
                <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-700">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  );
}