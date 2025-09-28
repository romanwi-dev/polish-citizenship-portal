import { memo } from "react";
import { WorkingThemeSwitcher } from "@/components/working-theme-switcher";
import { EditableText } from "@/components/EditableText";
import SectionTitle from "@/components/SectionTitle";

// Only critical imports for initial load
import HeroSection from "@/components/hero-section";
import TipPlaceholder from "@/components/tip-placeholder";
import ContactForm from "@/components/contact-form";
import Footer from "@/components/footer";
import EnhancedFAQ from "@/components/enhanced-faq";
import EUFlagsSlider from "@/components/eu-flags-slider";

// Essential components only
import { CitizenshipTestButton, CitizenshipTestButtonCalm } from "@/components/citizenship-test-button";
import ServiceOverview from "@/components/service-overview";
import { TrustBadges } from "@/components/trust-badges";
import QuickAccessBar from "@/components/quick-access-bar";
import DocumentsSection from "@/components/documents-section";
import Testimonials from "@/components/testimonials";
import PolishCrownTimeline from "@/components/timeline-side-by-side";

// European city images
import { 
  WarsawImage,
  LondonImage,
  BrusselsImage,
  RomeImage,
  MadridImage,
  ParisImage,
  ViennaImage,
  StockholmImage,
  BudapestImage,
  AthensImage
} from "@/components/european-cities-section";

// Import actual components
import ClientProcessSteps from "@/components/client-process-steps";
import CaseStartSteps from "@/components/case-start-steps";
import AiAnalysis from "@/components/ai-analysis";
import PricingSection from "@/components/pricing-section";
import CostCalculator from "@/components/cost-calculator";
import EligibilityCheck from "@/components/eligibility-check";
import SuccessProbability from "@/components/success-probability";

// Lazy loaded
const SEOOptimization = memo(() => null);


// Simple loading placeholder
const SectionLoader = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Simplified component without intersection observer

const Home = memo(function Home() {

  return (
    <div 
      id="home" 
      className="min-h-screen glass-surface transition-all duration-300"
      style={{ 
        color: 'var(--theme-text, #0c4a6e)',
        fontFamily: 'var(--theme-font-primary, Inter, system-ui, sans-serif)',
        letterSpacing: 'var(--ios26-letter-spacing)',
        lineHeight: 'var(--ios26-line-height)'
      }}
    >
      
      
      {/* CSS CLASS BASED - FORCE VISIBLE */}
      <div className="force-progress-bar"></div>
      
      {/* REMOVED tiny arrows per user request */}
      

      
      {/* EU Flags Slider - TEMPORARILY REMOVED (preserved for later use) */}
      {/* <EUFlagsSlider /> */}
      
      {/* ========== BLOCK 1: IMAGE/SECTION/WISDOM/CTA ========== */}
      
      {/* IMAGE 1: Warsaw */}
      <WarsawImage />
      
      {/* SECTION 1: Hero Section - No spacing */}
      <div id="hero" className="-mt-1">
        <HeroSection />
      </div>

      {/* INTRODUCTION SECTION */}
      <section>
        <div className="container">
          <div className="responsive-card">
            <SectionTitle 
              first="The Most Comprehensive Online Legal Service"
              second="for Polish Citizenship and Polish European Passport"
            />
            <div 
              className="prose prose-lg max-w-none leading-relaxed transition-colors duration-300"
              style={{ 
                color: 'var(--theme-text-secondary, #0369a1)',
                fontFamily: 'var(--theme-font-primary, Inter, system-ui, sans-serif)',
                letterSpacing: 'var(--ios26-letter-spacing)',
                lineHeight: 'var(--ios26-line-height)'
              }}
            >
              <EditableText
                contentKey="homepage-main-description"
                fallback="Since 2003, we have been advising people of Polish ancestry in confirming Polish citizenship by descent, obtaining a European Polish passport, and navigating all related matters. For almost 20 years, we have been working to help people of Polish descent from various countries in receiving Polish citizenship and a Polish European passport. Our excellent legal assistance is provided by independent experts in the field of Polish citizenship, lawyers of various specializations, experienced representatives, and documents researchers, as well as the use of advice and consultations provided by the staff of the relevant Polish government offices."
                pageId="homepage"
                as="p"
                multiline={true}
                className="mb-6"
              />
              <EditableText
                contentKey="homepage-call-to-action"
                fallback="Embark on your journey to obtaining Polish citizenship and enjoy the benefits of a European Polish passport. Trust us to provide you with the guidance, expertise, and support you need to navigate the complexities of the application process. Start your application today and make your Polish heritage a permanent part of your identity."
                pageId="homepage"
                as="p"
                multiline={true}
                className="text-lg font-medium text-blue-600 dark:text-blue-400 mb-8"
              />
              
              <div className="border-t border-white/20 pt-8">
                <SectionTitle 
                  first="AI Deep Case"
                  second="Analyzes"
                />
                <EditableText
                  contentKey="homepage-ai-description-1"
                  fallback="We are now able to 'predict' the probability of success and the time of the procedure in advance in each case of Polish citizenship by descent with HIGH ACCURACY based on the cases we processed over the last twenty years, with AI analyzes and human-expert knowledge. This has revolutionized our approach, allowing us to offer personalized guidance and support to our clients right from the initial consultation. By leveraging this combination of AI and expert insights, we can identify potential challenges and opportunities unique to each case, ensuring a more streamlined and efficient application process."
                  pageId="homepage"
                  as="p"
                  multiline={true}
                  className="mb-4"
                />
                <EditableText
                  contentKey="homepage-ai-description-2"
                  fallback="Our clients benefit from reduced uncertainty and increased confidence, knowing that their application is backed by a robust predictive framework. Furthermore, our comprehensive database, enriched with years of historical data, serves as a powerful resource for refining our predictive models. This continuous learning process not only enhances the accuracy of our predictions but also enables us to adapt to changing legal landscapes and procedural requirements."
                  pageId="homepage"
                  as="p"
                  multiline={true}
                  className="mb-4"
                />
                <EditableText
                  contentKey="homepage-ai-conclusion"
                  fallback="In essence, the integration of AI technology with our deep domain expertise, and professional honesty deeply implemented in our core politics as legal advisers), marks a significant leap forward in our ability to assist individuals in obtaining Polish citizenship by descent. Our commitment to innovation ensures that we remain at the forefront of our field, providing exceptional service and maximizing the likelihood of successful outcomes for our clients."
                  pageId="homepage"
                  as="p"
                  multiline={true}
                  className="text-lg font-medium text-blue-600 dark:text-blue-400"
                />
              </div>
              
              <div className="border-t border-blue-200 pt-8 mt-8">
                <SectionTitle 
                  first="Over 20 Million People"
                  second="of Polish Descent"
                />
                <EditableText
                  contentKey="homepage-polish-people-description"
                  fallback="There are more than 20 million people of Polish descent that live outside of Poland today , which itself has a population of about 38,5 million. This means that more than 1/3 of Poles and people of Polish descent actually live outside of the country. For many generations of European unrest, people have been emigrating outside of Poland, especially in the 20th century."
                  pageId="homepage"
                  as="p"
                  multiline={true}
                  className="mb-4"
                />
                <EditableText
                  contentKey="homepage-polish-people-conclusion"
                  fallback="Since 1989, however, the quality of life has changed for the better in Poland. Poland has been an EU member since 2004 and is one of its biggest countries. We support the idea of a united Europe, and being a European citizen is a widely held dream. Many people of Polish origin can now legally confirm their Polish citizenship by descent and obtain the Polish European passport as a gateway to the EU."
                  pageId="homepage"
                  as="p"
                  multiline={true}
                  className="text-lg font-medium text-primary"
                />
              </div>
              
              <div className="border-t border-blue-200 pt-8 mt-8">
                <SectionTitle 
                  first="The Benefits of Polish"
                  second="European Citizenship"
                />
                <p className="mb-4">
                  The education system in Europe is outstanding and offers the best elementary schools, top high schools, and some of the world's best universities. The latest medical technology and the best pharmaceutical developments ensure that your health is in good hands in Europe. With a Polish European passport you can freely move, travel, live, and work in any of the 28 member states of the EU.
                </p>
                <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
                  Businesses enjoy the benefits of duty-free imports and exports across country borders within the member states of the European Union. And, of course, we have the Champions League!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW TIMELINE - Beautiful Polish Crown Design */}
      <PolishCrownTimeline />
      
      {/* WISDOM 1: Important Tips */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <TipPlaceholder number={1} variant="blue" />
      </div>
      
      {/* CTA 1: Citizenship Test Button */}
      <section className="py-8 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <CitizenshipTestButton />
        </div>
      </section>
      
      {/* ========== BLOCK 2: IMAGE/SECTION/WISDOM/CTA ========== */}
      
      {/* IMAGE 2: London */}
      <LondonImage />
      
      {/* SECTION 2: Services Overview */}
      <div className="mobile-stable">
        <main id="main-content" className="mobile-stable pt-4 lg:pt-6">
          <TrustBadges />
          <QuickAccessBar />
          <div id="services">
            <ServiceOverview />
          </div>
        </main>
      </div>
      
      {/* WISDOM 2: Important Tips */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <TipPlaceholder number={2} variant="green" />
      </div>
      
      {/* CTA 2: Citizenship Test Button Calm */}
      <section className="py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <CitizenshipTestButtonCalm />
        </div>
      </section>
      
      {/* ========== BLOCK 3: IMAGE/SECTION/WISDOM/CTA ========== */}
      
      {/* IMAGE 3: Rome */}
      <RomeImage />
      
      {/* SECTION 3: Client Process Steps */}
      <div id="client-process">
        <ClientProcessSteps />
      </div>
      
      {/* WISDOM 3: Important Tips */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <TipPlaceholder number={3} variant="amber" />
      </div>
      
      {/* CTA 3: Citizenship Test Button */}
      <section className="py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <CitizenshipTestButton />
        </div>
      </section>
      
      {/* ========== BLOCK 4: IMAGE/SECTION/WISDOM/CTA ========== */}
      
      {/* IMAGE 4: Budapest */}
      <BudapestImage />
      
      {/* SECTION 4: Case Start Steps */}
      <div id="case-start">
        <CaseStartSteps />
      </div>
      
      {/* WISDOM 4: Important Tips */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <TipPlaceholder number={4} variant="purple" />
      </div>
      
      {/* CTA 4: Citizenship Test Button Calm */}
      <section className="py-8 md:py-12">
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
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <TipPlaceholder number={5} variant="red" />
      </div>
      
      {/* CTA 5: Citizenship Test Button */}
      <section className="py-8 md:py-16">
        <div className="max-w-4xl mx-auto px-4">
          <CitizenshipTestButton />
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
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <TipPlaceholder number={6} variant="purple" />
      </div>
      
      {/* CTA 6: Citizenship Test Button */}
      <section className="py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <CitizenshipTestButton />
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
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <TipPlaceholder number={7} variant="red" />
      </div>
      
      {/* CTA 7: Citizenship Test Button Calm */}
      <section className="py-8 md:py-12">
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
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
        <TipPlaceholder number={8} variant="indigo" />
      </div>
      
      {/* CTA 8: Citizenship Test Button */}
      <section className="py-16 glass-surface">
        <div className="max-w-4xl mx-auto px-4">
          <CitizenshipTestButton />
        </div>
      </section>
      
      {/* ========== BLOCK 9: IMAGE/SECTION/WISDOM/CTA ========== */}
      
      {/* IMAGE 9: Stockholm */}
      <StockholmImage />
      
      
      {/* WISDOM 9: Important Tips */}
      <div className="max-w-6xl mx-auto px-6">
        <TipPlaceholder number={9} variant="blue" />
      </div>
      
      {/* CTA 9: Citizenship Test Button Calm */}
      <section className="py-12 glass-surface mobile-stable">
        <div className="max-w-4xl mx-auto px-4">
          <CitizenshipTestButtonCalm />
        </div>
      </section>
      
      {/* ========== BLOCK 10: IMAGE/SECTION/WISDOM/CTA ========== */}
      
      {/* IMAGE 10: Additional European City */}
      <BrusselsImage />
      
      {/* SECTION 10: Documents Section */}
      <div id="documents">
        <DocumentsSection />
      </div>
      
      {/* WISDOM 10: Important Tips */}
      <div className="max-w-6xl mx-auto px-6">
        <TipPlaceholder number={10} variant="green" />
      </div>
      
      {/* CTA 10: Citizenship Test Button */}
      <section className="py-8 md:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <CitizenshipTestButton />
        </div>
      </section>
      
      {/* SECTION 11: Testimonials */}
      <div id="testimonials">
        <Testimonials />
      </div>
      
      {/* WISDOM 11: Important Tips */}
      <div className="max-w-6xl mx-auto px-6">
        <TipPlaceholder number={11} variant="amber" />
      </div>
      
      {/* Frequently Asked Questions */}
      <div id="faq">
        <EnhancedFAQ />
      </div>
      
      {/* WISDOM 12: Important Tips */}
      <div className="max-w-6xl mx-auto px-6">
        <TipPlaceholder number={12} variant="green" />
      </div>
      
      {/* CTA: Final Consultation Call to Action */}
      <section className="py-16 glass-card-primary">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-black mb-6 text-center leading-tight"
              style={{ fontFamily: 'Arial Black, Arial, sans-serif' }}>
            <span className="block text-black dark:text-white">Ready to Start Your Polish</span>
            <span className="block text-blue-800 dark:text-blue-400">Citizenship Journey?</span>
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Get expert guidance from our team of legal professionals with over 20 years of experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://polishcitizenship.typeform.com/to/PS5ecU"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary px-8 py-4 text-lg font-semibold"
            >
              Start Free Assessment
            </a>
            <a 
              href="/dashboard"
              className="btn btn-primary px-8 py-4 text-lg font-semibold"
            >
              Access Client Portal
            </a>
          </div>
        </div>
      </section>
      
      <div id="contact">
        <ContactForm />
      </div>
      
      <Footer />
      
      {/* Additional Features */}
      <SEOOptimization />
      
      {/* AI Chatbot Assistant removed per user request */}
    </div>
  );
});

export default Home;
