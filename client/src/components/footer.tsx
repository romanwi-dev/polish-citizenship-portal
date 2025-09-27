import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Instagram, 
  Linkedin,
  Youtube,
  ArrowRight,
  CheckCircle,
  ChevronUp
} from "lucide-react";
import logoImage from "@assets/polishcitizenship.pl -  EMAIL LOGO_1755227766291.png";

export default function Footer() {
  const [location] = useLocation();
  
  const scrollToSection = (sectionId: string) => {
    // If we're not on the home page, navigate there first
    if (location !== '/') {
      window.location.href = `/#${sectionId}`;
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <footer className="relative bg-slate-800 border-t border-slate-700 -mt-4">
      {/* Mobile-First Design */}
      <div className="px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Company Logo & Description */}
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <img 
                src={logoImage} 
                alt="PolishCitizenship.pl" 
                className="h-12 w-auto"
              />
            </div>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
              Expert legal services for Polish citizenship by descent. 
              Helping families reconnect with their Polish heritage.
            </p>
          </div>

          {/* Navigation Grid - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Services Column */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white border-b border-blue-400 pb-2">Services</h4>
              <div className="space-y-3">
                <button 
                  onClick={() => scrollToSection("services")} 
                  className="flex items-center w-full p-3 text-gray-300 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-all text-left"
                >
                  <CheckCircle className="h-4 w-4 mr-3 text-blue-400" />
                  Citizenship Services
                </button>
                <button 
                  onClick={() => scrollToSection("process")} 
                  className="flex items-center w-full p-3 text-gray-300 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-all text-left"
                >
                  <ArrowRight className="h-4 w-4 mr-3 text-blue-400" />
                  Application Process
                </button>
                <button 
                  onClick={() => scrollToSection("testimonials")} 
                  className="flex items-center w-full p-3 text-gray-300 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-all text-left"
                >
                  <CheckCircle className="h-4 w-4 mr-3 text-blue-400" />
                  Success Stories
                </button>
              </div>
            </div>

            {/* Resources Column */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white border-b border-blue-400 pb-2">Resources</h4>
              <div className="space-y-3">
                <Link href="/typeform" className="flex items-center w-full p-3 text-gray-300 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-all">
                  <ArrowRight className="h-4 w-4 mr-3 text-blue-400" />
                  Eligibility Test
                </Link>
                <Link href="/documents" className="flex items-center w-full p-3 text-gray-300 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-all">
                  <ArrowRight className="h-4 w-4 mr-3 text-blue-400" />
                  Documents Guide
                </Link>
                <Link href="/polish-citizenship" className="flex items-center w-full p-3 text-gray-300 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-all">
                  <ArrowRight className="h-4 w-4 mr-3 text-blue-400" />
                  Citizenship Application
                </Link>
              </div>
            </div>

            {/* Legal Column */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white border-b border-blue-400 pb-2">Legal</h4>
              <div className="space-y-3">
                <Link href="/polish-passport" className="flex items-center w-full p-3 text-gray-300 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-all">
                  <ArrowRight className="h-4 w-4 mr-3 text-blue-400" />
                  Polish Passport
                </Link>
                <Link href="/law" className="flex items-center w-full p-3 text-gray-300 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-all">
                  <ArrowRight className="h-4 w-4 mr-3 text-blue-400" />
                  Legal Services
                </Link>
                <Link href="/privacy" className="flex items-center w-full p-3 text-gray-300 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-all">
                  <ArrowRight className="h-4 w-4 mr-3 text-blue-400" />
                  Privacy Policy
                </Link>
              </div>
            </div>

            {/* Contact Column */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white border-b border-blue-400 pb-2">Contact</h4>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-slate-700 rounded-lg">
                  <Phone className="h-5 w-5 text-blue-400 mr-3" />
                  <span className="text-gray-300 font-medium">+48 123 456 789</span>
                </div>
                <div className="flex items-center p-3 bg-slate-700 rounded-lg">
                  <Mail className="h-5 w-5 text-blue-400 mr-3" />
                  <span className="text-gray-300 font-medium text-sm">info@polishcitizenship.pl</span>
                </div>
                <div className="flex items-center p-3 bg-slate-700 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-400 mr-3" />
                  <span className="text-gray-300 font-medium">Warsaw, Poland</span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media & Copyright */}
          <div className="border-t border-slate-600 pt-6 space-y-6">
            <div className="flex justify-center gap-4">
              <a href="#" className="p-3 bg-slate-700 hover:bg-slate-600 text-blue-400 rounded-lg transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="p-3 bg-slate-700 hover:bg-slate-600 text-blue-400 rounded-lg transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="p-3 bg-slate-700 hover:bg-slate-600 text-blue-400 rounded-lg transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href="#" className="p-3 bg-slate-700 hover:bg-slate-600 text-blue-400 rounded-lg transition-colors">
                <Youtube className="h-6 w-6" />
              </a>
            </div>
            
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                &copy; 2025 PolishCitizenship.pl. All rights reserved.
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm">
                <Link href="/terms" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Terms of Service
                </Link>
                <span className="text-gray-500">•</span>
                <Link href="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}