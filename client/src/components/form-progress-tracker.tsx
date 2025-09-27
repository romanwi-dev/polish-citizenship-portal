import React from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FormSection {
  id: string;
  name: string;
  fields: string[];
  required?: boolean;
}

interface FormProgressTrackerProps {
  sections: FormSection[];
  formData: Record<string, any>;
  className?: string;
}

export function FormProgressTracker({ sections, formData, className }: FormProgressTrackerProps) {
  const calculateSectionProgress = (section: FormSection) => {
    const filledFields = section.fields.filter(field => {
      const value = formData[field];
      return value && value.toString().trim() !== '';
    });
    return Math.round((filledFields.length / section.fields.length) * 100);
  };

  const calculateOverallProgress = () => {
    const totalFields = sections.reduce((sum, section) => sum + section.fields.length, 0);
    const filledFields = sections.reduce((sum, section) => {
      const filled = section.fields.filter(field => {
        const value = formData[field];
        return value && value.toString().trim() !== '';
      });
      return sum + filled.length;
    }, 0);
    return Math.round((filledFields / totalFields) * 100);
  };

  const overallProgress = calculateOverallProgress();

  return (
    <div className={cn("space-y-4 p-4 bg-white rounded-lg border", className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Form Progress</h3>
          <span className="text-sm font-medium text-gray-600">{overallProgress}% Complete</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      <div className="space-y-3">
        {sections.map((section) => {
          const progress = calculateSectionProgress(section);
          const isComplete = progress === 100;
          
          return (
            <div key={section.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-sm font-medium",
                  isComplete ? "text-green-700" : "text-gray-700"
                )}>
                  {section.name}
                  {section.required && <span className="text-red-500 ml-1">*</span>}
                </span>
                <span className={cn(
                  "text-xs",
                  isComplete ? "text-green-600" : "text-gray-500"
                )}>
                  {progress}%
                </span>
              </div>
              <Progress 
                value={progress} 
                className={cn(
                  "h-1",
                  isComplete && "bg-green-100"
                )}
              />
            </div>
          );
        })}
      </div>

      <div className="pt-2 border-t">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span>Required sections</span>
          <div className="w-2 h-2 bg-green-500 rounded-full ml-4"></div>
          <span>Complete</span>
        </div>
      </div>
    </div>
  );
}