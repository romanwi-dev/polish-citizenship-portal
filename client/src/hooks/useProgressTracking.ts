import { useState, useEffect } from 'react';

export interface ApplicationStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  requiredDocuments?: string[];
  estimatedDuration?: string;
  dependencies?: string[];
}

export interface ProgressData {
  currentStep: string;
  completedSteps: string[];
  totalSteps: number;
  progressPercentage: number;
  estimatedCompletion?: Date;
  milestones: {
    id: string;
    title: string;
    completedAt?: Date;
    isMajor: boolean;
  }[];
}

const defaultSteps: ApplicationStep[] = [
  {
    id: 'eligibility',
    title: 'Eligibility Assessment',
    description: 'Determine if you qualify for Polish citizenship by descent',
    status: 'pending',
    estimatedDuration: '1-2 days'
  },
  {
    id: 'documentation',
    title: 'Document Collection',
    description: 'Gather required historical documents and certificates',
    status: 'pending',
    requiredDocuments: ['Birth certificates', 'Marriage certificates', 'Military records'],
    estimatedDuration: '2-8 weeks',
    dependencies: ['eligibility']
  },
  {
    id: 'translation',
    title: 'Document Translation',
    description: 'Translate documents to Polish with certified translations',
    status: 'pending',
    estimatedDuration: '1-2 weeks',
    dependencies: ['documentation']
  },
  {
    id: 'application',
    title: 'Application Submission',
    description: 'Submit completed application to Polish authorities',
    status: 'pending',
    estimatedDuration: '1 week',
    dependencies: ['translation']
  },
  {
    id: 'processing',
    title: 'Government Processing',
    description: 'Wait for Polish government to process your application',
    status: 'pending',
    estimatedDuration: '6-18 months',
    dependencies: ['application']
  },
  {
    id: 'decision',
    title: 'Decision & Certificate',
    description: 'Receive citizenship decision and certificate',
    status: 'pending',
    estimatedDuration: '2-4 weeks',
    dependencies: ['processing']
  }
];

export function useProgressTracking() {
  const [steps, setSteps] = useState<ApplicationStep[]>(defaultSteps);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);

  useEffect(() => {
    // Load progress from localStorage
    try {
      const saved = localStorage.getItem('applicationProgress');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSteps(parsed.steps || defaultSteps);
        setProgressData(parsed.progressData);
      }
    } catch (error) {
      console.error('Failed to load progress data:', error);
    }
  }, []);

  useEffect(() => {
    // Calculate progress data
    const completedSteps = steps.filter(step => step.status === 'completed');
    const currentStep = steps.find(step => step.status === 'in-progress')?.id || 
                      steps.find(step => step.status === 'pending')?.id || '';
    
    const newProgressData: ProgressData = {
      currentStep,
      completedSteps: completedSteps.map(step => step.id),
      totalSteps: steps.length,
      progressPercentage: Math.round((completedSteps.length / steps.length) * 100),
      milestones: [
        { id: 'eligibility', title: 'Eligibility Confirmed', isMajor: false },
        { id: 'documentation', title: 'Documents Collected', isMajor: true },
        { id: 'application', title: 'Application Submitted', isMajor: true },
        { id: 'decision', title: 'Citizenship Granted', isMajor: true }
      ]
    };

    setProgressData(newProgressData);

    // Save to localStorage
    try {
      localStorage.setItem('applicationProgress', JSON.stringify({
        steps,
        progressData: newProgressData
      }));
    } catch (error) {
      console.error('Failed to save progress data:', error);
    }
  }, [steps]);

  const updateStepStatus = (stepId: string, status: ApplicationStep['status']) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  const completeStep = (stepId: string) => {
    updateStepStatus(stepId, 'completed');
    
    // Auto-start next step if dependencies are met
    const currentStepIndex = steps.findIndex(step => step.id === stepId);
    if (currentStepIndex < steps.length - 1) {
      const nextStep = steps[currentStepIndex + 1];
      const dependenciesMet = !nextStep.dependencies || 
        nextStep.dependencies.every(dep => 
          steps.find(step => step.id === dep)?.status === 'completed'
        );
      
      if (dependenciesMet) {
        updateStepStatus(nextStep.id, 'in-progress');
      }
    }
  };

  const resetProgress = () => {
    setSteps(defaultSteps);
    localStorage.removeItem('applicationProgress');
  };

  return {
    steps,
    progressData,
    updateStepStatus,
    completeStep,
    resetProgress
  };
}