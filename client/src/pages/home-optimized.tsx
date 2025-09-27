import { lazy, Suspense } from "react";
import { useEffect } from "react";

// Only load critical components immediately
const HeroSection = () => (
  <section className="min-h-screen bg-gradient-to-br from-blue-800 to-blue-600 text-white flex items-center justify-center">
    <div className="container mx-auto px-4 text-center">
      <h1 className="text-4xl md:text-6xl font-bold mb-6">
        Polish Citizenship by Descent
      </h1>
      <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-95">
        Professional legal services for Polish citizenship and EU passport applications
      </p>
      <div className="flex gap-4 justify-center">
        <a href="/eligibility" className="bg-white text-blue-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
          Start Free Assessment
        </a>
        <a href="/process" className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-800 transition">
          Learn More
        </a>
      </div>
    </div>
  </section>
);

// Lazy load everything else
const ExpertiseSection = lazy(() => import("@/components/expertise-section"));
const ClientProcessSection = lazy(() => import("@/components/client-process-section"));
const TestimonialsSection = lazy(() => import("@/components/testimonials-section"));
const Footer = lazy(() => import("@/components/footer"));

const LoadingFallback = () => (
  <div className="min-h-[200px] flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

export default function HomeOptimized() {
  useEffect(() => {
    // Report Web Vitals for monitoring
    if ('web-vital' in window) {
      (window as any).webVitals.getFCP((metric: any) => {
        console.log('FCP:', metric.value);
      });
    }
  }, []);

  return (
    <>
      {/* Critical: Hero renders immediately */}
      <HeroSection />
      
      {/* Non-critical: Everything else loads async */}
      <Suspense fallback={<LoadingFallback />}>
        <ExpertiseSection />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <ClientProcessSection />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
        <TestimonialsSection />
      </Suspense>
      
      <Suspense fallback={<LoadingFallback />}>
  
      </Suspense>
    </>
  );
}