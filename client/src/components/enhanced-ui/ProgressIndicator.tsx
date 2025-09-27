import React from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'pending';
  icon?: React.ReactNode;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep: string;
  className?: string;
}

export function ProgressIndicator({ steps, currentStep, className = '' }: ProgressIndicatorProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className={`heritage-card p-6 ${className}`}>
      {/* Overall Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-polish-navy">Application Progress</h3>
          <span className="text-sm font-semibold text-polish-gold">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <div className="heritage-progress">
          <div 
            className="heritage-progress-fill" 
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Details */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = step.status === 'completed';
          const isCurrent = step.status === 'current';
          const isPending = step.status === 'pending';

          return (
            <div
              key={step.id}
              className={`flex items-start gap-4 p-4 rounded-lg transition-all duration-300 ${
                isCurrent 
                  ? 'bg-gradient-to-r from-polish-gold/10 to-polish-gold/5 border-l-4 border-polish-gold' 
                  : isCompleted 
                    ? 'bg-gradient-to-r from-polish-emerald/10 to-polish-emerald/5 border-l-4 border-polish-emerald'
                    : 'bg-gray-50 border-l-4 border-gray-200'
              }`}
            >
              {/* Step Icon */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted 
                  ? 'bg-polish-emerald text-white' 
                  : isCurrent 
                    ? 'bg-polish-gold text-polish-navy animate-pulse' 
                    : 'bg-gray-300 text-gray-500'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : isCurrent ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold ${
                  isCurrent ? 'text-polish-navy' : isCompleted ? 'text-polish-emerald' : 'text-gray-600'
                }`}>
                  {step.title}
                </h4>
                <p className={`text-sm mt-1 ${
                  isCurrent ? 'text-polish-navy/80' : 'text-gray-500'
                }`}>
                  {step.description}
                </p>
                {isCurrent && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-polish-gold rounded-full animate-ping" />
                    <span className="text-xs font-medium text-polish-gold">In Progress</span>
                  </div>
                )}
              </div>

              {/* Step Number */}
              <div className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                isCompleted 
                  ? 'bg-polish-emerald text-white' 
                  : isCurrent 
                    ? 'bg-polish-gold text-polish-navy' 
                    : 'bg-gray-300 text-gray-600'
              }`}>
                {index + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* Completion Message */}
      {progressPercentage === 100 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-polish-emerald to-polish-emerald/80 rounded-lg text-white">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6" />
            <div>
              <h4 className="font-bold">Application Complete!</h4>
              <p className="text-sm opacity-90">Ready to generate your Polish citizenship documents.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressIndicator;