import { useEffect } from "react";
import { useLocation } from "wouter";

export default function EligibilityPage() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Redirect to citizenship test page
    setLocation("/citizenship-test");
  }, [setLocation]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Citizenship Test...</p>
      </div>
    </div>
  );
}