import { useState, useEffect } from 'react';

const ONBOARDING_STORAGE_KEY = 'polish-citizenship-onboarding-completed';
const ONBOARDING_SKIPPED_KEY = 'polish-citizenship-onboarding-skipped';

export function useOnboarding() {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    // Check if user has completed or skipped onboarding
    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    const hasSkippedOnboarding = localStorage.getItem(ONBOARDING_SKIPPED_KEY) === 'true';
    
    // DISABLE ONBOARDING - auto-skip to prevent dark screen overlay issues
    localStorage.setItem(ONBOARDING_SKIPPED_KEY, 'true');
    setShouldShowOnboarding(false);
    setIsOnboardingOpen(false);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    localStorage.removeItem(ONBOARDING_SKIPPED_KEY);
    setIsOnboardingOpen(false);
    setShouldShowOnboarding(false);
  };

  const skipOnboarding = () => {
    localStorage.setItem(ONBOARDING_SKIPPED_KEY, 'true');
    setIsOnboardingOpen(false);
    setShouldShowOnboarding(false);
  };

  const restartOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    localStorage.removeItem(ONBOARDING_SKIPPED_KEY);
    setShouldShowOnboarding(true);
    setIsOnboardingOpen(true);
  };

  const closeOnboarding = () => {
    setIsOnboardingOpen(false);
  };

  return {
    shouldShowOnboarding,
    isOnboardingOpen,
    completeOnboarding,
    skipOnboarding: closeOnboarding, // Skip is same as close for now
    restartOnboarding,
    closeOnboarding
  };
}