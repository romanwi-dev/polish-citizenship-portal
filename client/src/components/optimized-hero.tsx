import { memo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2 } from "lucide-react";

// Optimized hero section with minimal JavaScript
const OptimizedHero = memo(() => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700">
      {/* Background pattern - CSS only, no JS */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:40px_40px]" />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Badge */}
          <Badge className="mb-6 bg-white/10 text-white border-white/20 backdrop-blur-sm">
            20+ Years of Excellence • 100% Success Rate
          </Badge>
          
          {/* Main heading with animated gradient */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            <span className="inline-block animate-gradient bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
              Polish Passport
            </span>
            <br />
            <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-blue-100">
              & Polish Citizenship
            </span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Reclaim your heritage. Unlock EU freedom. Expert legal guidance for citizenship by descent.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a
              href="https://polishcitizenship.typeform.com/to/PS5ecU"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-700 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              Free Eligibility Test
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
            <Link href="/polish-citizenship">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Learn About Citizenship
              </Button>
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">2,847</p>
              <p className="text-sm text-white/80">Successful Cases</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">100%</p>
              <p className="text-sm text-white/80">Success Rate</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">47</p>
              <p className="text-sm text-white/80">Countries Served</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">3-6</p>
              <p className="text-sm text-white/80">Months Average</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
        </div>
      </div>
    </section>
  );
});

OptimizedHero.displayName = "OptimizedHero";

export default OptimizedHero;

// CSS for gradient animation (add to your global CSS)
export const heroStyles = `
  @keyframes gradient {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 4s ease infinite;
  }
  
  .bg-grid-white\\/\\[0\\.05\\] {
    background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
  }
`;