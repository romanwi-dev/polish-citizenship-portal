import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, ArrowLeft, Sparkles, Heart, Flag, FileText, MessageCircle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  character: 'guide' | 'expert' | 'assistant';
  animation: 'bounce' | 'wave' | 'pulse' | 'spin';
  icon: typeof Sparkles;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Polish Citizenship Journey!',
    description: 'Hi there! I\'m your friendly guide. Let me show you around this powerful platform that will help you reclaim your Polish heritage and EU passport.',
    target: 'dashboard-welcome',
    position: 'bottom',
    character: 'guide',
    animation: 'wave',
    icon: Heart
  },
  {
    id: 'family-tree',
    title: 'Build Your Family Tree',
    description: 'Start here! Add your ancestors\' information to trace your Polish lineage. Our AI will help verify your eligibility for citizenship.',
    target: 'family-tree-card',
    position: 'right',
    character: 'expert',
    animation: 'pulse',
    icon: Flag
  },
  {
    id: 'document-processing',
    title: 'AI Document Processing',
    description: 'Upload photos of your documents! Our advanced AI reads text, translates Polish documents, and automatically fills your forms. It\'s like magic!',
    target: 'document-processing-card',
    position: 'left',
    character: 'assistant',
    animation: 'bounce',
    icon: Zap
  },
  {
    id: 'translator',
    title: 'Professional Translation Tools',
    description: 'Need to translate documents? Our AI translator specializes in legal Polish-English translation with 95% accuracy.',
    target: 'translator-nav',
    position: 'bottom',
    character: 'expert',
    animation: 'pulse',
    icon: MessageCircle
  },
  {
    id: 'client-details',
    title: 'Your Application Forms',
    description: 'All your Polish citizenship forms in one place. Data flows automatically from your family tree and document uploads.',
    target: 'client-details-card',
    position: 'top',
    character: 'guide',
    animation: 'bounce',
    icon: FileText
  },
  {
    id: 'case-manager',
    title: 'Expert Support',
    description: 'Schedule video calls with our legal experts. We\'ve helped thousands of people get their Polish citizenship successfully!',
    target: 'case-manager-card',
    position: 'left',
    character: 'expert',
    animation: 'wave',
    icon: Heart
  },
  {
    id: 'completion',
    title: 'You\'re All Set!',
    description: 'Amazing! You now know how to use all our tools. Start with your family tree, then upload documents. Your Polish passport awaits!',
    target: 'dashboard-center',
    position: 'bottom',
    character: 'guide',
    animation: 'spin',
    icon: Sparkles
  }
];

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingTour({ isOpen, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [characterPosition, setCharacterPosition] = useState({ x: 0, y: 0 });
  const targetElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        updateTargetPosition();
      }, 100);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    const handleResize = () => {
      if (isVisible) {
        updateTargetPosition();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isVisible, currentStep]);

  const updateTargetPosition = () => {
    const step = tourSteps[currentStep];
    const targetElement = document.querySelector(`[data-tour="${step.target}"]`) as HTMLElement;
    
    if (targetElement && typeof targetElement.getBoundingClientRect === 'function') {
      targetElementRef.current = targetElement;
      const rect = targetElement.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      // Add highlight to target element
      targetElement.style.position = 'relative';
      targetElement.style.zIndex = '9999';
      targetElement.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2)';
      targetElement.style.borderRadius = '8px';

      // Calculate character position based on step position
      let x = rect.left + scrollX;
      let y = rect.top + scrollY;

      switch (step.position) {
        case 'top':
          x = rect.left + rect.width / 2 - 200; // Center horizontally, offset for card width
          y = rect.top - 280; // Above target
          break;
        case 'bottom':
          x = rect.left + rect.width / 2 - 200;
          y = rect.bottom + 20;
          break;
        case 'left':
          x = rect.left - 420;
          y = rect.top + rect.height / 2 - 140;
          break;
        case 'right':
          x = rect.right + 20;
          y = rect.top + rect.height / 2 - 140;
          break;
      }

      // Ensure the tour card stays within viewport
      x = Math.max(20, Math.min(x, window.innerWidth - 420));
      y = Math.max(20, Math.min(y, window.innerHeight - 300));

      setCharacterPosition({ x, y });

      // Scroll target into view
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const clearHighlight = () => {
    if (targetElementRef.current) {
      targetElementRef.current.style.position = '';
      targetElementRef.current.style.zIndex = '';
      targetElementRef.current.style.boxShadow = '';
      targetElementRef.current.style.borderRadius = '';
    }
  };

  const nextStep = () => {
    clearHighlight();
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    clearHighlight();
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    clearHighlight();
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const completeTour = () => {
    clearHighlight();
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
      onClose();
    }, 300);
  };

  const step = tourSteps[currentStep];
  const IconComponent = step?.icon || Sparkles;

  if (!isOpen || !step) return null;

  const getCharacterEmoji = (character: string) => {
    switch (character) {
      case 'guide': return '👋';
      case 'expert': return '🤓';
      case 'assistant': return '🤖';
      default: return '😊';
    }
  };

  const getAnimationClass = (animation: string) => {
    switch (animation) {
      case 'bounce': return 'animate-bounce';
      case 'wave': return 'animate-pulse';
      case 'pulse': return 'animate-ping';
      case 'spin': return 'animate-spin';
      default: return '';
    }
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-20 z-[9998] pointer-events-none"
            onClick={skipTour}
            style={{ display: 'none', visibility: 'hidden', opacity: 0 }}
          />
        )}
      </AnimatePresence>

      {/* Tour Card */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              x: characterPosition.x,
              y: characterPosition.y
            }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed z-[9999] w-96"
            style={{
              left: 0,
              top: 0,
              transform: `translate(${characterPosition.x}px, ${characterPosition.y}px)`
            }}
          >
            <Card className="shadow-2xl border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
              <CardContent className="p-6">
                {/* Header with Character */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`text-3xl ${getAnimationClass(step.animation)}`}>
                      {getCharacterEmoji(step.character)}
                    </div>
                    <div>
                      <Badge variant="secondary" className="mb-1">
                        Step {currentStep + 1} of {tourSteps.length}
                      </Badge>
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <IconComponent className="w-5 h-5 mr-2 text-blue-600" />
                        {step.title}
                      </h3>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={skipTour}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {step.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(((currentStep + 1) / tourSteps.length) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <div className="flex space-x-2">
                    {currentStep > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={prevStep}
                      >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={skipTour}
                      className="text-gray-500"
                    >
                      Skip Tour
                    </Button>
                  </div>

                  <Button
                    onClick={nextStep}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {currentStep === tourSteps.length - 1 ? (
                      <>
                        Get Started
                        <Sparkles className="w-4 h-4 ml-2" />
                      </>
                    ) : (
                      <>
                        Next
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}