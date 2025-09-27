import { useEffect, useState, memo, useCallback } from "react";
import { Link } from "wouter";
// Critical above-the-fold components loaded immediately
import HeroSection from "@/components/hero-section";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowLeft, ClipboardCheck, UserPlus, LogIn, BarChart3, Phone, CheckCircle2, Bot } from "lucide-react";

// Import all components directly for immediate loading

import logoImage from "@assets/polishcitizenship.pl -  EMAIL LOGO_1755227766291.png";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CitizenshipTestButton, CitizenshipTestButtonCalm } from "@/components/citizenship-test-button";
import QuickAccessBar from "@/components/quick-access-bar";
import EUFlagsSlider from "@/components/eu-flags-slider";
import { TrustBadges } from "@/components/trust-badges";

// Import all page components directly
import ServiceOverview from "@/components/service-overview";
import AiAnalysis from "@/components/ai-analysis";
import PricingSection from "@/components/pricing-section";
import Footer from "@/components/footer";
import EligibilityCheck from "@/components/eligibility-check";
import ProcedureGuide from "@/components/procedure-guide";
import DocumentsSection from "@/components/documents-section";
import Testimonials from "@/components/testimonials";
import ContactForm from "@/components/contact-form";

import CostCalculator from "@/components/cost-calculator";



import SEOOptimization from "@/components/seo-optimization";
import EnhancedSchemaMarkup from "@/components/enhanced-schema-markup";
import DocumentChecklist from "@/components/document-checklist";
import DocumentVerificationRings from "@/components/document-verification-rings";
import SuccessProbability from "@/components/success-probability";
import ClientProcessSteps from "@/components/client-process-steps";
import CaseStartSteps from "@/components/case-start-steps";
import EnhancedFAQ from "@/components/enhanced-faq";
import { 
  RomeImage,
  LondonImage, 
  WarsawImage,
  BudapestImage,
  AthensImage,
  MadridImage,
  ParisImage,
  ViennaImage,
  StockholmImage,
  BrusselsImage
} from "@/components/european-cities-section";

// Simple loading placeholder
const SectionLoader = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const Home = memo(function Home() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 100);
      setIsScrolling(true);
      
      // Calculate scroll progress
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.pageYOffset / totalHeight) * 100;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);



  return (
    <div id="home" className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <SEOOptimization />
      <EnhancedSchemaMarkup />




      
      {/* EU Flags Slider - Moved to top */}
      <EUFlagsSlider />
      
      {/* ========== BLOCK 1: IMAGE/SECTION/WISDOM/CTA ========== */}
      
      {/* IMAGE 1: Warsaw */}
      <WarsawImage />
      
      {/* SECTION 1: Hero Section */}
      <div id="hero">
        <HeroSection />
      </div>
      
      {/* WISDOM 1: Important Tips */}
      <div className="max-w-6xl mx-auto px-6">
        
      </div>
      
      {/* ========== BLOCK 2: IMAGE/SECTION/WISDOM/CTA ========== */}
      
      {/* IMAGE 2: London */}
      <LondonImage />
      
      {/* SECTION 2: Services Overview */}
      <div className="bg-slate-50 mobile-stable">
        <main id="main-content" className="mobile-stable pt-4 lg:pt-6">
          <QuickAccessBar />
          <div id="services">
            <ServiceOverview />
          </div>
        </main>
      </div>
      
      {/* WISDOM 2: Important Tips */}
      <div className="max-w-6xl mx-auto px-6">
        
      </div>
      
      {/* CTA 2: Citizenship Test Button Calm */}
      <section className="py-12 bg-white mobile-stable">
        <div className="max-w-4xl mx-auto px-4">
          <CitizenshipTestButtonCalm />
        </div>
      </section>
      
      {/* ========== BLOCK 3: IMAGE/SECTION/WISDOM/CTA ========== */}
      
      {/* IMAGE 3: Rome */}
      <RomeImage />
      
      {/* SECTION 3: Client Process Steps */}
      <div id="client-process">
        <ClientProcessSteps compact={true} />
      </div>
      
      {/* WISDOM 3: Important Tips */}
      <div className="max-w-6xl mx-auto px-6">
        
      </div>
      
      {/* CTA 3: Citizenship Test Button Calm */}
      <section className="py-12 bg-white mobile-stable">
        <div className="max-w-4xl mx-auto px-4">
          <CitizenshipTestButtonCalm />
        </div>
      </section>
      
      {/* ========== BLOCK 4: IMAGE/SECTION/WISDOM/CTA ========== */}
      
      {/* IMAGE 4: Budapest */}
      <BudapestImage />
      
      {/* SECTION 4: Case Start Steps */}
      <div id="case-start">
        <CaseStartSteps compact={true} />
      </div>
      
      {/* WISDOM 4: Important Tips */}
      <div className="max-w-6xl mx-auto px-6">
        
      </div>
      
      {/* CTA 4: Citizenship Test Button Calm */}
      <section className="py-12 bg-white mobile-stable">
        <div className="max-w-4xl mx-auto px-4">
          <CitizenshipTestButtonCalm />
        </div>
      </section>
      
      {/* ========== BLOCK 5: IMAGE/SECTION/WISDOM/CTA ========== */}
      
      {/* IMAGE 5: Athens */}
      <AthensImage />
      
      {/* SECTION 5: AI Analysis */}
      <div id="ai-analysis">
        <AiAnalysis />
      </div>
      
      {/* WISDOM 5: Important Tips */}
      <div className="max-w-6xl mx-auto px-6">
        
      </div>
      
      {/* CTA 5: Citizenship Test Button from AI Analysis */}
      <section className="py-12 bg-white mobile-stable">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="relative text-center bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-8 rounded-2xl border border-gray-200 shadow-lg backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-2xl"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-3 text-gray-900">Ready to Check Your Eligibility?</h3>
                <p className="text-gray-700 mb-6">Take the most comprehensive Polish citizenship by descent test available online</p>
                <a href="https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl" target="_blank" rel="noopener noreferrer" className="block">
                  <Button size="lg" className="animated-gradient-btn w-full sm:w-auto mx-auto block h-16 sm:h-14 px-6 sm:px-8 text-lg sm:text-xl font-bold text-white bg-red-800 hover:bg-red-900 transition-all duration-300 transform hover:scale-105 hover:shadow-xl rounded-lg">
                    POLISH CITIZENSHIP TEST
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* ========== BLOCK 6: IMAGE/SECTION/WISDOM/CTA ========== */}
      
      {/* IMAGE 6: Madrid */}
      <MadridImage />
      
      {/* SECTION 6: Pricing & Calculator */}
      <div id="pricing">
        <PricingSection />
      </div>
      <div id="calculator">
        <CostCalculator />
      </div>
      
      {/* WISDOM 6: Important Tips */}
      <div className="max-w-6xl mx-auto px-6">
        
      </div>
      
      {/* CTA 6: Citizenship Test Button Calm */}
      <section className="py-12 bg-white mobile-stable">
        <div className="max-w-4xl mx-auto px-4">
          <CitizenshipTestButtonCalm />
        </div>
      </section>
      
      {/* ========== BLOCK 7: IMAGE/SECTION/WISDOM/CTA ========== */}
      
      {/* IMAGE 7: Paris */}
      <ParisImage />
      
      {/* SECTION 7: Eligibility Check */}
      <div id="eligibility">
        <EligibilityCheck />
      </div>
      
      {/* WISDOM 7: Important Tips */}
      <div className="max-w-6xl mx-auto px-6">
        
      </div>
      
      {/* CTA 7: Citizenship Test Button Calm */}
      <section className="py-12 bg-white mobile-stable">
        <div className="max-w-4xl mx-auto px-4">
          <CitizenshipTestButtonCalm />
        </div>
      </section>
      
      {/* ========== BLOCK 8: IMAGE/SECTION/WISDOM/CTA ========== */}
      
      {/* IMAGE 8: Vienna */}
      <ViennaImage />
      
      {/* SECTION 8: Success Probability */}
      <div id="success-probability">
        <SuccessProbability />
      </div>
      
      {/* WISDOM 8: Important Tips */}
      <div className="max-w-6xl mx-auto px-6">
        
      </div>
      
      {/* CTA 8: Citizenship Test Button Calm */}
      <section className="py-12 bg-white mobile-stable">
        <div className="max-w-4xl mx-auto px-4">
          <CitizenshipTestButtonCalm />
        </div>
      </section>
      
      {/* ========== BLOCK 9: IMAGE/SECTION/WISDOM/CTA ========== */}
      
      {/* IMAGE 9: Stockholm */}
      <StockholmImage />
      
      {/* SECTION 9: Procedure Guide */}
      <div id="process">
        <ProcedureGuide />
      </div>
      
      {/* WISDOM 9: Important Tips */}
      <div className="max-w-6xl mx-auto px-6">
        
      </div>
      
      {/* CTA 9: Citizenship Test Button Calm */}
      <section className="py-12 bg-white mobile-stable">
        <div className="max-w-4xl mx-auto px-4">
          <CitizenshipTestButtonCalm />
        </div>
      </section>
      
      {/* ========== BLOCK 10: IMAGE/SECTION/WISDOM/CTA ========== */}
      
      {/* IMAGE 10: Brussels */}
      <BrusselsImage />
      
      {/* SECTION 10: Documents Section */}
      <div id="documents">
        <DocumentsSection />
      </div>
      
      {/* WISDOM 10: Important Tips */}
      <div className="max-w-6xl mx-auto px-6">
        
      </div>
      
      {/* CTA 10: Citizenship Test Button Calm */}
      <section className="py-12 bg-white mobile-stable">
        <div className="max-w-4xl mx-auto px-4">
          <CitizenshipTestButtonCalm />
        </div>
      </section>
      
      {/* ========== TESTIMONIALS & FAQ SECTIONS ========== */}
      
      {/* IMAGE: Warsaw (duplicate for Testimonials) */}
      <WarsawImage />
      
      <div id="testimonials">
        <Testimonials />
      </div>
      
      {/* WISDOM 11: Important Tips */}
      <div className="max-w-6xl mx-auto px-6">
        
      </div>
      
      {/* CTA 11: Citizenship Test Button Calm */}
      <section className="py-12 bg-white mobile-stable">
        <div className="max-w-4xl mx-auto px-4">
          <CitizenshipTestButtonCalm />
        </div>
      </section>
      
      {/* IMAGE: Warsaw (duplicate for FAQ) */}
      <WarsawImage />
      
      {/* Frequently Asked Questions */}
      <div id="faq">
        <EnhancedFAQ />
      </div>
      
      {/* WISDOM 12: Important Tips */}
      <div className="max-w-6xl mx-auto px-6">
        
      </div>
      
      {/* CTA 12: Citizenship Test Button Calm */}
      <section className="py-12 bg-white mobile-stable">
        <div className="max-w-4xl mx-auto px-4">
          <CitizenshipTestButtonCalm />
        </div>
      </section>
      
      {/* IMAGE: Warsaw (duplicate for Contact) */}
      <WarsawImage />
      
      <div id="contact">
        <ContactForm />
      </div>
      
      <Footer />
      
      {/* Additional Features */}


      
    </div>
  );
});

export default Home;