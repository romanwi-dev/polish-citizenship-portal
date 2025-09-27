import React from 'react';
import { CheckCircle, Clock, Save, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  error?: string;
  className?: string;
}

export function ProgressIndicator({ status, lastSaved, error, className }: ProgressIndicatorProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'saving':
        return <Save className="h-4 w-4 animate-pulse text-blue-500" />;
      case 'saved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return lastSaved 
          ? `Saved at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : 'Saved';
      case 'error':
        return error || 'Save failed';
      default:
        return 'Auto-save enabled';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'saving':
        return 'text-blue-600';
      case 'saved':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className={cn("flex items-center gap-2 text-sm", getStatusColor(), className)}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
    </div>
  );
}