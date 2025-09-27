import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AutoSaveOptions {
  data: any;
  saveFunction: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

interface AutoSaveStatus {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  error?: string;
}

export function useAutoSave({ data, saveFunction, delay = 2000, enabled = true }: AutoSaveOptions) {
  const [saveStatus, setSaveStatus] = useState<AutoSaveStatus>({ status: 'idle' });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const dataRef = useRef(data);
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled) return;

    // Check if data has actually changed
    if (JSON.stringify(data) === JSON.stringify(dataRef.current)) return;
    
    dataRef.current = data;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      if (!data || Object.keys(data).length === 0) return;

      setSaveStatus({ status: 'saving' });

      try {
        await saveFunction(data);
        setSaveStatus({ 
          status: 'saved', 
          lastSaved: new Date() 
        });

        // Show subtle success indicator
        toast({
          title: "Form Saved",
          description: "Your progress has been automatically saved",
          duration: 2000,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to save';
        setSaveStatus({ 
          status: 'error', 
          error: errorMessage 
        });

        toast({
          title: "Save Failed",
          description: errorMessage,
          variant: "destructive",
          duration: 3000,
        });
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, saveFunction, delay, enabled, toast]);

  return saveStatus;
}