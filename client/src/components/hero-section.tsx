import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle2, Sparkles, Users2, Clock3, TrendingUp, Euro, Calendar, DollarSign } from "lucide-react";
import { Link } from "wouter";
import { EditableText } from "@/components/EditableText";
import "@/styles/flag-wave.css";
import logoImage from "@assets/polishcitizenship-logo.png";

const HeroSection = memo(function HeroSection() {
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <section id="home" className="relative min-h-screen overflow-hidden mobile-stable">
      {/* Simple Professional Background */}
      <div className="absolute inset-0 bg-blue-600 dark:bg-blue-800"></div>
      
      {/* Text readability overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      
      <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-20 mobile-stable">
        {/* Trust Indicators */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-6 text-sm text-white/90 drop-shadow-md">
            <div className="flex items-center">
              <Sparkles className="h-4 w-4 text-blue-300 mr-1" />
              <span className="font-medium">22+ Years</span>
            </div>
            <div className="w-1 h-1 bg-white/60 rounded-full"></div>
            <div className="flex items-center">
              <Users2 className="h-4 w-4 text-blue-300 mr-1" />
              <span className="font-medium">5,000+ Cases</span>
            </div>
            <div className="w-1 h-1 bg-white/60 rounded-full"></div>
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-blue-300 mr-1" />
              <span className="font-medium">100% Success</span>
            </div>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-5xl mx-auto mb-16">
          <h1 className="text-8xl lg:text-9xl xl:text-[12rem] font-bold mb-8 leading-[0.8] tracking-tight drop-shadow-lg" style={{letterSpacing: 'var(--ios26-letter-spacing)', lineHeight: 'var(--ios26-line-height)'}}>
            <span className="block text-red-600 dark:text-red-500">
              Polish Citizenship
            </span>
            <span className="block text-white">
              by Descent
            </span>
          </h1>
          <EditableText
            contentKey="hero-main-description"
            fallback="Expert legal guidance for people of Polish and Polish-Jewish descent from around the world for obtaining Polish citizenship and EU passports through Polish ancestry - unmatched 100% success rate, true realist timeline 1,5 - 4 years, transparent pricing €3,500 - €12,500+"
            pageId="homepage"
            as="h2"
            multiline={true}
            className="text-xl lg:text-2xl text-white/90 font-sans font-thin mb-12 leading-relaxed drop-shadow-md tracking-widest" style={{letterSpacing: 'var(--ios26-letter-spacing)', lineHeight: 'var(--ios26-line-height)'}}
          />
        </div>

        {/* CTA Buttons with Glassmorphism */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-20">
          <Link to="/family-tree">
            <Button
              size="lg"
              className="btn btn-primary px-10 py-6 text-lg font-medium min-w-[300px]"
            >
              <EditableText
                contentKey="hero-button-family-tree"
                fallback="Fill Your Family Tree"
                pageId="homepage"
                as="span"
              />
            </Button>
          </Link>
          <a href="https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl" target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              className="btn btn-secondary px-10 py-6 text-lg font-medium min-w-[300px]"
            >
              <EditableText
                contentKey="hero-button-citizenship-test"
                fallback="Take Full Polish Citizenship Test"
                pageId="homepage"
                as="span"
              />
            </Button>
          </a>
        </div>

        {/* Simple Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm p-8 text-center border border-white/20 rounded-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Clock3 className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">2+ Years</div>
            <div className="text-white/80 font-medium">Realistic Timeline</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-8 text-center border border-white/20 rounded-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Euro className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">€3,500+</div>
            <div className="text-white/80 font-medium">Transparent Real Pricing</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-8 text-center border border-white/20 rounded-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">100%</div>
            <div className="text-white/80 font-medium">True Success Rate</div>
          </div>
        </div>




      </div>
    </section>
  );
});

export default HeroSection;
