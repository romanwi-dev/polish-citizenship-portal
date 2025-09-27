import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Award, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CitizenshipTestButtonProps {
  className?: string;
  variant?: 'default' | 'hero' | 'compact';
  showIcon?: boolean;
  text?: string;
}

export const CitizenshipTestButton = memo(function CitizenshipTestButton({
  className,
  variant = 'default',
  showIcon = false,
  text = "POLISH CITIZENSHIP TEST"
}: CitizenshipTestButtonProps) {
  
  // Match the reference button styling exactly
  const buttonClassName = cn(
    "animated-gradient-btn w-full sm:w-auto mx-auto block h-16 sm:h-14 px-6 sm:px-8 text-lg sm:text-xl font-bold text-white bg-red-800 hover:bg-red-900 transition-all duration-300 transform hover:scale-105 hover:shadow-xl rounded-lg",
    className
  );

  return (
    <div className="relative text-center bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 p-8 rounded-2xl border border-gray-200 shadow-lg backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-2xl"></div>
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-3 text-gray-900">Ready to Check Your Eligibility?</h3>
        <p className="text-gray-700 mb-6">Take the most comprehensive Polish citizenship by descent test available online</p>
        <a 
          href="https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          <Button 
            size="lg"
            className={buttonClassName}
          >
            POLISH CITIZENSHIP TEST
          </Button>
        </a>
      </div>
    </div>
  );
});

// Alternative calm version - matching the reference button styling exactly
export const CitizenshipTestButtonCalm = memo(function CitizenshipTestButtonCalm({
  className,
  size = 'default',
  text = "POLISH CITIZENSHIP TEST"
}: {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  text?: string;
}) {
  // Match the reference button styling exactly
  const buttonClassName = cn(
    "animated-gradient-btn w-full sm:w-auto mx-auto block h-16 sm:h-14 px-6 sm:px-8 text-lg sm:text-xl font-bold text-white bg-red-800 hover:bg-red-900 transition-all duration-300 transform hover:scale-105 hover:shadow-xl rounded-lg",
    className
  );

  return (
    <div className="relative text-center bg-gradient-to-br from-emerald-100 via-cyan-50 to-blue-100 p-8 rounded-2xl border border-gray-200 shadow-lg backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-cyan-400/10 to-blue-400/10 rounded-2xl"></div>
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-3 text-gray-900">Ready to Check Your Eligibility?</h3>
        <p className="text-gray-700 mb-6">Take the most comprehensive Polish citizenship by descent test available online</p>
        <a 
          href="https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block"
        >
          <Button 
            size="lg"
            className={buttonClassName}
          >
            POLISH CITIZENSHIP TEST
          </Button>
        </a>
      </div>
    </div>
  );
});

export default CitizenshipTestButton;