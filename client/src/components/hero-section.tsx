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
      {/* Beautiful European Heritage Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900"></div>
      
      {/* European Castle Silhouettes */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute bottom-0 left-0 w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice">
          {/* Rolling Hills */}
          <path d="M0,800 Q400,750 800,780 T1600,760 L1920,770 L1920,1080 L0,1080 Z" 
                fill="rgba(34, 139, 34, 0.3)" />
          
          {/* European Castle Silhouette */}
          <g transform="translate(1200,600)" fill="rgba(0,0,0,0.4)">
            <rect x="0" y="100" width="200" height="120" />
            <rect x="-20" y="80" width="40" height="100" />
            <rect x="180" y="80" width="40" height="100" />
            <rect x="80" y="60" width="50" height="140" />
            <polygon points="20,80 0,40 40,40" />
            <polygon points="200,80 180,40 220,40" />
            <polygon points="105,60 80,20 130,20" />
          </g>
          
          {/* European Village Houses */}
          <g transform="translate(800,750)" fill="rgba(139, 69, 19, 0.5)">
            <rect x="0" y="20" width="60" height="40" />
            <polygon points="30,20 10,0 50,0" fill="rgba(139, 0, 0, 0.6)" />
            <rect x="80" y="15" width="70" height="45" />
            <polygon points="115,15 90,-5 140,-5" fill="rgba(139, 0, 0, 0.6)" />
          </g>
          
          {/* Church Spire */}
          <g transform="translate(600,720)" fill="rgba(245, 245, 220, 0.4)">
            <rect x="0" y="40" width="60" height="60" />
            <rect x="20" y="0" width="20" height="60" />
            <polygon points="30,0 25,-15 35,-15" />
            <rect x="27" y="-20" width="6" height="8" fill="rgba(255, 215, 0, 0.8)" />
          </g>
          
          {/* Distant Mountains */}
          <polygon points="0,600 300,400 600,450 900,350 1200,400 1500,300 1920,380 1920,1080 0,1080" 
                   fill="rgba(70, 130, 180, 0.2)" />
          
          {/* Clouds */}
          <ellipse cx="300" cy="200" rx="80" ry="40" fill="rgba(255,255,255,0.1)" />
          <ellipse cx="800" cy="150" rx="100" ry="50" fill="rgba(255,255,255,0.08)" />
          <ellipse cx="1400" cy="180" rx="70" ry="35" fill="rgba(255,255,255,0.06)" />
          
          {/* Stars */}
          <circle cx="200" cy="100" r="2" fill="rgba(255,255,255,0.8)" />
          <circle cx="500" cy="80" r="1.5" fill="rgba(255,255,255,0.6)" />
          <circle cx="900" cy="120" r="2" fill="rgba(255,255,255,0.7)" />
          <circle cx="1300" cy="90" r="1" fill="rgba(255,255,255,0.5)" />
          <circle cx="1600" cy="110" r="1.5" fill="rgba(255,255,255,0.6)" />
        </svg>
      </div>
      
      {/* Elegant overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 backdrop-blur-sm"></div>

      
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
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold mb-8 leading-[1.1] tracking-tight drop-shadow-lg" style={{letterSpacing: 'var(--ios26-letter-spacing)', lineHeight: 'var(--ios26-line-height)'}}>
            <span className="hero-title-wave text-white">
              <span className="block">
                <span className="wave-word text-red-900">Polish</span>{" "}
                <span className="wave-word text-red-900">Citizenship</span>
              </span>
              <span className="block">
                <span className="wave-word text-gray-300">by</span>{" "}
                <span className="wave-word text-gray-300">Descent</span>
              </span>
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

        {/* Stats Grid with Glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="glass-card p-8 text-center hover:scale-105 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 glass-base rounded-full mb-4">
              <Clock3 className="h-8 w-8 text-white drop-shadow-md" />
            </div>
            <div className="text-3xl font-bold text-white mb-2 glass-text">2+ Years</div>
            <div className="text-white/80 font-medium">Realistic Timeline</div>
          </div>
          
          <div className="glass-card p-8 text-center hover:scale-105 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 glass-base rounded-full mb-4">
              <Euro className="h-8 w-8 text-white drop-shadow-md" />
            </div>
            <div className="text-3xl font-bold text-white mb-2 glass-text">€3,500+</div>
            <div className="text-white/80 font-medium">Transparent Real Pricing</div>
          </div>
          
          <div className="glass-card p-8 text-center hover:scale-105 transition-all duration-300">
            <div className="inline-flex items-center justify-center w-16 h-16 glass-base rounded-full mb-4">
              <CheckCircle2 className="h-8 w-8 text-white drop-shadow-md" />
            </div>
            <div className="text-3xl font-bold text-white mb-2 glass-text">100%</div>
            <div className="text-white/80 font-medium">True Success Rate</div>
          </div>
        </div>




      </div>
    </section>
  );
});

export default HeroSection;
