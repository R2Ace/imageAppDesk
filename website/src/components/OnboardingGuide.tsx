import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Épure! ✨',
    description: 'Let us show you how to get the most out of our file conversion app.',
    targetSelector: 'body',
    position: 'top'
  },
  {
    id: 'download',
    title: 'Get Started',
    description: 'Click here to download Épure. We automatically detect your operating system.',
    targetSelector: '[data-tour="download-button"]',
    position: 'bottom'
  },
  {
    id: 'demo',
    title: 'Try Before You Buy',
    description: 'Test our file conversion right in your browser with this interactive demo.',
    targetSelector: '[data-tour="interactive-demo"]',
    position: 'top'
  },
  {
    id: 'features',
    title: 'Key Features',
    description: 'Épure offers lightning-fast processing, complete privacy, and supports images, audio, and documents.',
    targetSelector: '[data-tour="features"]',
    position: 'top'
  },
  {
    id: 'pricing',
    title: 'One-Time Purchase',
    description: 'No subscriptions! Pay once, use forever. Currently 10% off our regular price.',
    targetSelector: '[data-tour="pricing"]',
    position: 'top'
  }
];

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const currentStepData = onboardingSteps[currentStep];

  useEffect(() => {
    if (!isOpen || !currentStepData) return;

    const updateTooltipPosition = () => {
      const targetElement = document.querySelector(currentStepData.targetSelector);
      if (!targetElement) return;

      const rect = targetElement.getBoundingClientRect();
      let x = 0;
      let y = 0;

      switch (currentStepData.position) {
        case 'top':
          x = rect.left + rect.width / 2;
          y = rect.top - 20;
          break;
        case 'bottom':
          x = rect.left + rect.width / 2;
          y = rect.bottom + 20;
          break;
        case 'left':
          x = rect.left - 20;
          y = rect.top + rect.height / 2;
          break;
        case 'right':
          x = rect.right + 20;
          y = rect.top + rect.height / 2;
          break;
      }

      setTooltipPosition({ x, y });
    };

    updateTooltipPosition();
    window.addEventListener('resize', updateTooltipPosition);
    window.addEventListener('scroll', updateTooltipPosition);

    return () => {
      window.removeEventListener('resize', updateTooltipPosition);
      window.removeEventListener('scroll', updateTooltipPosition);
    };
  }, [currentStep, isOpen, currentStepData]);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Track completion
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track('Onboarding Completed', {
        steps_completed: currentStep + 1,
        total_steps: onboardingSteps.length
      });
    }

    // Save completion state
    localStorage.setItem('epure_onboarding_completed', 'true');
    onClose();
  };

  const skipTour = () => {
    // Track skip
    if (typeof window !== 'undefined' && (window as any).mixpanel) {
      (window as any).mixpanel.track('Onboarding Skipped', {
        step_when_skipped: currentStep + 1,
        total_steps: onboardingSteps.length
      });
    }

    localStorage.setItem('epure_onboarding_completed', 'true');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Spotlight effect */}
          {currentStepData.targetSelector !== 'body' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none z-50"
              style={{
                background: `radial-gradient(circle at ${tooltipPosition.x}px ${tooltipPosition.y}px, transparent 100px, rgba(0,0,0,0.7) 200px)`
              }}
            />
          )}

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed z-50 bg-white rounded-xl shadow-2xl p-6 max-w-sm"
            style={{
              left: tooltipPosition.x - 150, // Center the tooltip
              top: tooltipPosition.y + (currentStepData.position === 'top' ? -100 : 20),
              transform: currentStepData.position === 'top' ? 'translateY(-100%)' : 'none'
            }}
          >
            {/* Arrow */}
            <div
              className={`absolute w-4 h-4 bg-white transform rotate-45 ${
                currentStepData.position === 'top' ? 'bottom-[-8px] left-1/2 -translate-x-1/2' :
                currentStepData.position === 'bottom' ? 'top-[-8px] left-1/2 -translate-x-1/2' :
                currentStepData.position === 'left' ? 'right-[-8px] top-1/2 -translate-y-1/2' :
                'left-[-8px] top-1/2 -translate-y-1/2'
              }`}
            />

            <div className="relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">
                    {currentStep + 1} of {onboardingSteps.length}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={skipTour}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <h3 className="font-bold text-lg mb-2">{currentStepData.title}</h3>
              <p className="text-muted-foreground mb-6">{currentStepData.description}</p>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="text-muted-foreground"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                <div className="flex gap-2">
                  {onboardingSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentStep ? 'bg-primary' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>

                <Button
                  onClick={nextStep}
                  size="sm"
                  className="bg-primary text-white"
                >
                  {currentStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* Skip option */}
              <div className="text-center mt-4">
                <button
                  onClick={skipTour}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip tour
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OnboardingGuide;
