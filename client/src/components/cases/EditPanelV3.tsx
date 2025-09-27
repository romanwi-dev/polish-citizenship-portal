import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle, Loader2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import type { CaseData } from './CaseCardV3';

// ActionButton component matching AgentControlRoom styling
const ActionButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }>(({ children, variant = "primary", className = "", ...props }, ref) => {
  const btnVariants = {
    primary: "btn btn-primary",
    secondary: "btn",
    ghost: "btn btn-ghost",
  };
  
  return (
    <button
      ref={ref}
      className={cn(
        btnVariants[variant],
        "touch-target transition-all duration-200 hover:scale-105",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

ActionButton.displayName = 'ActionButton';

interface EditPanelV3Props {
  isOpen: boolean;
  caseData: CaseData | null;
  mode: 'mobile' | 'desktop';
  onClose: () => void;
  onSave?: (updatedCase: CaseData) => void;
}

// Form validation schema
const caseFormSchema = z.object({
  clientName: z.string().min(1, 'Client name is required').max(100, 'Name too long'),
  clientEmail: z.string().min(1, 'Email is required').email('Invalid email format'),
  tier: z.enum(['standard', 'expedited', 'vip', 'vip+'], {
    required_error: 'Processing tier is required',
  }),
  stage: z.enum([
    'INTAKE', 
    'USC_IN_FLIGHT', 
    'OBY_DRAFTING', 
    'USC_READY', 
    'OBY_SUBMITTABLE', 
    'OBY_SUBMITTED', 
    'DECISION_RECEIVED'
  ], {
    required_error: 'Stage is required',
  }),
  difficulty: z.number().min(1, 'Minimum difficulty is 1').max(10, 'Maximum difficulty is 10'),
  score: z.number().min(0, 'Minimum score is 0').max(100, 'Maximum score is 100'),
  lineage: z.string().min(1, 'Lineage information is required').max(200, 'Lineage too long'),
  notes: z.string().max(1000, 'Notes too long').optional(),
});

type CaseFormData = z.infer<typeof caseFormSchema>;

// Animation variants
const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

const mobileSheetVariants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 25, stiffness: 200 }
  },
  exit: { 
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: { duration: 0.2 }
  }
};

const desktopRailVariants = {
  initial: { x: '100%' },
  animate: { 
    x: 0,
    transition: { type: "spring", damping: 25, stiffness: 200 }
  },
  exit: { 
    x: '100%',
    transition: { duration: 0.2 }
  }
};

export default function EditPanelV3({ isOpen, caseData, mode, onClose, onSave }: EditPanelV3Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDirty, setIsDirty] = useState(false);
  
  // Form setup with React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isSubmitting }
  } = useForm<CaseFormData>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      clientName: '',
      clientEmail: '',
      tier: 'standard',
      stage: 'INTAKE',
      difficulty: 5,
      score: 0,
      lineage: '',
      notes: '',
    },
  });

  // Watch form changes to detect dirty state
  const watchedFields = watch();
  
  useEffect(() => {
    if (caseData && Object.keys(watchedFields).length > 0) {
      const hasChanges = Object.entries(watchedFields).some(([key, value]) => {
        switch (key) {
          case 'clientName': return value !== caseData.client.name;
          case 'clientEmail': return value !== caseData.client.email;
          case 'tier': return value !== caseData.processing;
          case 'stage': return value !== caseData.state;
          case 'difficulty': return value !== (caseData.difficulty || 5);
          case 'score': return value !== (caseData.clientScore || 0);
          case 'lineage': return value !== caseData.lineage;
          case 'notes': return value !== (caseData.notes || '');
          default: return false;
        }
      });
      setIsDirty(hasChanges);
    }
  }, [watchedFields, caseData]);

  // Lock body scroll on mobile
  useEffect(() => {
    if (isOpen && mode === 'mobile') {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, mode]);

  // Populate form when case data changes
  useEffect(() => {
    if (caseData && isOpen) {
      reset({
        clientName: caseData.client.name,
        clientEmail: caseData.client.email,
        tier: caseData.processing as CaseFormData['tier'],
        stage: caseData.state as CaseFormData['stage'],
        difficulty: caseData.difficulty || 5,
        score: caseData.clientScore || 0,
        lineage: caseData.lineage,
        notes: caseData.notes || '',
      });
      setIsDirty(false);
    }
  }, [caseData, isOpen, reset]);

  // Update case mutation
  const updateCaseMutation = useMutation({
    mutationFn: async (data: CaseFormData) => {
      if (!caseData) throw new Error('No case data available');
      
      console.log('Updating case with data:', data);
      
      // Make API request with ALL form fields - CORRECTED API CALL
      const response = await apiRequest('PATCH', `/api/admin/cases/${caseData.id}`, {
        caseManager: data.clientName,
        client_email: data.clientEmail,
        serviceLevel: data.tier,
        status: data.stage,
        progress: data.score,
        difficulty: data.difficulty,
        lineage: data.lineage,
        notes: data.notes,
      });
      
      return response;
    },
    onSuccess: (response, variables) => {
      console.log('Case update successful:', response);
      
      // Update cache with ALL submitted data
      queryClient.setQueryData(['/api/admin/cases'], (oldData: any) => {
        if (!oldData?.cases) return oldData;
        return {
          ...oldData,
          cases: oldData.cases.map((c: any) => 
            (c.caseId === caseData!.id || c.id === caseData!.id) 
              ? {
                  ...c,
                  caseManager: variables.clientName,
                  client_email: variables.clientEmail,
                  serviceLevel: variables.tier,
                  status: variables.stage,
                  progress: variables.score,
                  difficulty: variables.difficulty,
                  lineage: variables.lineage,
                  notes: variables.notes,
                  updatedAt: new Date().toISOString(),
                }
              : c
          ),
        };
      });
      
      toast({
        title: 'Case Updated',
        description: 'Case has been successfully updated.',
      });
      
      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cases'] });
      setIsDirty(false);
      onClose();
    },
    onError: (error: any) => {
      console.error('Case update failed:', error);
      
      // Show proper error message
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update case. Please try again.';
      
      toast({
        title: 'Update Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      // Don't close the panel so user can try again
    }
  });

  const handleSave = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Save button clicked - Form submission triggered');
    console.log('Form isValid:', isValid);
    console.log('Form errors:', errors);
    console.log('Form values:', watch());
    
    // Force validation and submission
    handleSubmit(
      (data) => {
        console.log('Form validation passed - Submitting data:', data);
        updateCaseMutation.mutate(data);
      },
      (errors) => {
        console.error('Form validation failed with errors:', errors);
        // Show validation errors in toast
        const firstError = Object.values(errors)[0]?.message;
        if (firstError) {
          toast({
            title: 'Validation Error',
            description: firstError,
            variant: 'destructive',
          });
        }
      }
    )();
  }, [handleSubmit, updateCaseMutation, isValid, errors, watch, toast]);

  const handleCancel = useCallback(() => {
    if (isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to cancel?')) {
        reset();
        setIsDirty(false);
        onClose();
      }
    } else {
      reset();
      onClose();
    }
  }, [isDirty, reset, onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  }, [handleCancel]);

  if (!isOpen || !caseData) return null;

  const portalTarget = document.getElementById('portal-root') || document.body;

  // Form content component with dark glass styling
  const FormContent = () => (
    <form className="space-y-6 p-6 glass-card-strong">
      {/* Header */}
      <div className="space-y-2 border-b border-border/20 pb-4">
        <h2 className="text-xl font-bold text-[var(--text)]">
          Edit Case {caseData.id.length > 10 ? `C-${caseData.id.slice(-8)}` : `C-${caseData.id}`}
        </h2>
        <p className="text-sm text-[var(--text-subtle)]">
          Update case information and settings
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-5">
        {/* Client Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[var(--text)] border-b border-border/20 pb-2">Case Information</h3>
          
          <div>
            <Label htmlFor="clientName" className="text-sm font-medium">
              Case Manager *
            </Label>
            <Controller
              name="clientName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="clientName"
                  placeholder="Enter case manager name"
                  className={cn(
                    "mt-1 glass-card-light border-border/30 bg-[var(--surface)] text-[var(--text)] h-12",
                    "focus:border-primary/50 transition-colors duration-200",
                    errors.clientName && "border-red-500"
                  )}
                  style={{ fontSize: '16px' }} // Prevent iOS zoom
                  data-testid="input-client-name"
                />
              )}
            />
            {errors.clientName && (
              <p className="text-sm text-red-600 mt-1">{errors.clientName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="clientEmail" className="text-sm font-medium">
              Client Email *
            </Label>
            <Controller
              name="clientEmail"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="clientEmail"
                  type="email"
                  placeholder="client@example.com"
                  className={cn(
                    "mt-1 glass-card-light border-border/30 bg-[var(--surface)] text-[var(--text)] h-12",
                    "focus:border-primary/50 transition-colors duration-200",
                    errors.clientEmail && "border-red-500"
                  )}
                  style={{ fontSize: '16px' }}
                  data-testid="input-client-email"
                />
              )}
            />
            {errors.clientEmail && (
              <p className="text-sm text-red-600 mt-1">{errors.clientEmail.message}</p>
            )}
          </div>
        </div>

        {/* Case Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[var(--text)] border-b border-border/20 pb-2">Case Settings</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tier" className="text-sm font-medium">
                Processing Tier *
              </Label>
              <Controller
                name="tier"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger 
                      className="mt-1 glass-card-light border-border/30 bg-[var(--surface)] text-[var(--text)] h-12 focus:border-primary/50" 
                      data-testid="select-tier"
                    >
                      <SelectValue placeholder="Select processing tier" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-border/50">
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="expedited">Expedited</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                      <SelectItem value="vip+">VIP+</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.tier && (
                <p className="text-sm text-red-600 mt-1">{errors.tier.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="stage" className="text-sm font-medium">
                Current Stage *
              </Label>
              <Controller
                name="stage"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger 
                      className="mt-1 glass-card-light border-border/30 bg-[var(--surface)] text-[var(--text)] h-12 focus:border-primary/50" 
                      data-testid="select-stage"
                    >
                      <SelectValue placeholder="Select current stage" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-border/50">
                      <SelectItem value="INTAKE">Intake</SelectItem>
                      <SelectItem value="USC_IN_FLIGHT">USC In Flight</SelectItem>
                      <SelectItem value="OBY_DRAFTING">OBY Drafting</SelectItem>
                      <SelectItem value="USC_READY">USC Ready</SelectItem>
                      <SelectItem value="OBY_SUBMITTABLE">OBY Submittable</SelectItem>
                      <SelectItem value="OBY_SUBMITTED">OBY Submitted</SelectItem>
                      <SelectItem value="DECISION_RECEIVED">Decision Received</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.stage && (
                <p className="text-sm text-red-600 mt-1">{errors.stage.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="difficulty" className="text-sm font-medium">
                Difficulty (1-10) *
              </Label>
              <Controller
                name="difficulty"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="difficulty"
                    type="number"
                    min="1"
                    max="10"
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    className={cn(
                      "mt-1 glass-card-light border-border/30 bg-[var(--surface)] text-[var(--text)] h-12",
                      "focus:border-primary/50 transition-colors duration-200",
                      errors.difficulty && "border-red-500"
                    )}
                    style={{ fontSize: '16px' }}
                    data-testid="input-difficulty"
                  />
                )}
              />
              {errors.difficulty && (
                <p className="text-sm text-red-600 mt-1">{errors.difficulty.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="score" className="text-sm font-medium">
                Client Score (0-100) *
              </Label>
              <Controller
                name="score"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="score"
                    type="number"
                    min="0"
                    max="100"
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    className={cn(
                      "mt-1 glass-card-light border-border/30 bg-[var(--surface)] text-[var(--text)] h-12",
                      "focus:border-primary/50 transition-colors duration-200",
                      errors.score && "border-red-500"
                    )}
                    style={{ fontSize: '16px' }}
                    data-testid="input-score"
                  />
                )}
              />
              {errors.score && (
                <p className="text-sm text-red-600 mt-1">{errors.score.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[var(--text)] border-b border-border/20 pb-2">Additional Information</h3>
          
          <div>
            <Label htmlFor="lineage" className="text-sm font-medium">
              Lineage Information *
            </Label>
            <Controller
              name="lineage"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="lineage"
                  placeholder="e.g., Polish ancestry through grandparents"
                  className={cn(
                    "mt-1 glass-card-light border-border/30 bg-[var(--surface)] text-[var(--text)] h-12",
                    "focus:border-primary/50 transition-colors duration-200",
                    errors.lineage && "border-red-500"
                  )}
                  style={{ fontSize: '16px' }}
                  data-testid="input-lineage"
                />
              )}
            />
            {errors.lineage && (
              <p className="text-sm text-red-600 mt-1">{errors.lineage.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium">
              Notes
            </Label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="notes"
                  placeholder="Enter additional notes about this case..."
                  rows={4}
                  className={cn(
                    "mt-1 resize-none glass-card-light border-border/30 bg-[var(--surface)] text-[var(--text)]",
                    "focus:border-primary/50 transition-colors duration-200",
                    errors.notes && "border-red-500"
                  )}
                  style={{ fontSize: '16px' }}
                  data-testid="textarea-notes"
                />
              )}
            />
            {errors.notes && (
              <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/20">
        <ActionButton
          type="button"
          onClick={handleSave}
          variant="primary"
          disabled={isSubmitting || !isValid}
          className="flex-1 gap-2 min-h-[48px] justify-center font-medium"
          data-testid="button-save-case"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </ActionButton>
        
        <ActionButton
          type="button"
          variant="ghost"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="flex-1 min-h-[48px] justify-center font-medium"
          data-testid="button-cancel-edit"
        >
          Cancel
        </ActionButton>
      </div>
    </form>
  );

  if (mode === 'mobile') {
    // Mobile: Full-screen modal from bottom
    return createPortal(
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              variants={overlayVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed inset-0 bg-black/50 z-40"
              onClick={handleBackdropClick}
            />
            
            {/* Mobile Full-Screen Modal */}
            <motion.div
              variants={mobileSheetVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-4 z-[1110] bg-white dark:bg-gray-900 rounded-2xl flex flex-col shadow-2xl border-2 border-gray-200 dark:border-gray-700"
              style={{ 
                backgroundColor: 'var(--background)',
                height: 'calc(100vh - 2rem)',
                top: '1rem',
                bottom: '1rem',
                left: '1rem',
                right: '1rem'
              }}
            >
              {/* Handle */}
              <div className="flex-shrink-0 flex justify-center py-3">
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>

              {/* Close Button */}
              <div className="flex-shrink-0 flex justify-end px-4 pb-2">
                <ActionButton
                  onClick={handleCancel}
                  variant="ghost"
                  className="rounded-full w-8 h-8 p-0"
                  data-testid="button-close-mobile"
                >
                  <X className="h-4 w-4" />
                </ActionButton>
              </div>

              {/* Scrollable Content - SOLID background for mobile */}
              <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900">
                <div className="p-6 bg-white dark:bg-gray-900">
                  <form className="space-y-6">
                    {/* Header */}
                    <div className="space-y-2 border-b border-gray-200 dark:border-gray-700 pb-4">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Edit Case {caseData.id.length > 10 ? `C-${caseData.id.slice(-8)}` : `C-${caseData.id}`}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Update case information and settings
                      </p>
                    </div>

                    {/* Form Fields with SOLID styling for mobile */}
                    <div className="space-y-5">
                      {/* Client Information */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Case Information</h3>
                        
                        <div>
                          <Label htmlFor="clientName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Case Manager *
                          </Label>
                          <Controller
                            name="clientName"
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id="clientName"
                                placeholder="Enter case manager name"
                                className={cn(
                                  "mt-1 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-12",
                                  "focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200",
                                  errors.clientName && "border-red-500"
                                )}
                                style={{ fontSize: '16px' }} // Prevent iOS zoom
                                data-testid="input-client-name"
                              />
                            )}
                          />
                          {errors.clientName && (
                            <p className="text-sm text-red-600 mt-1">{errors.clientName.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="clientEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Client Email *
                          </Label>
                          <Controller
                            name="clientEmail"
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id="clientEmail"
                                type="email"
                                placeholder="client@example.com"
                                className={cn(
                                  "mt-1 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-12",
                                  "focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200",
                                  errors.clientEmail && "border-red-500"
                                )}
                                style={{ fontSize: '16px' }}
                                data-testid="input-client-email"
                              />
                            )}
                          />
                          {errors.clientEmail && (
                            <p className="text-sm text-red-600 mt-1">{errors.clientEmail.message}</p>
                          )}
                        </div>
                      </div>

                      {/* Case Settings */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Case Settings</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="tier" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Processing Tier *
                            </Label>
                            <Controller
                              name="tier"
                              control={control}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger 
                                    className="mt-1 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-12 focus:border-blue-500 dark:focus:border-blue-400" 
                                    data-testid="select-tier"
                                  >
                                    <SelectValue placeholder="Select processing tier" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                                    <SelectItem value="standard">Standard</SelectItem>
                                    <SelectItem value="expedited">Expedited</SelectItem>
                                    <SelectItem value="vip">VIP</SelectItem>
                                    <SelectItem value="vip+">VIP+</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            {errors.tier && (
                              <p className="text-sm text-red-600 mt-1">{errors.tier.message}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="stage" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Current Stage *
                            </Label>
                            <Controller
                              name="stage"
                              control={control}
                              render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger 
                                    className="mt-1 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-12 focus:border-blue-500 dark:focus:border-blue-400" 
                                    data-testid="select-stage"
                                  >
                                    <SelectValue placeholder="Select current stage" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                                    <SelectItem value="INTAKE">Intake</SelectItem>
                                    <SelectItem value="USC_IN_FLIGHT">USC In Flight</SelectItem>
                                    <SelectItem value="OBY_DRAFTING">OBY Drafting</SelectItem>
                                    <SelectItem value="USC_READY">USC Ready</SelectItem>
                                    <SelectItem value="OBY_SUBMITTABLE">OBY Submittable</SelectItem>
                                    <SelectItem value="OBY_SUBMITTED">OBY Submitted</SelectItem>
                                    <SelectItem value="DECISION_RECEIVED">Decision Received</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            {errors.stage && (
                              <p className="text-sm text-red-600 mt-1">{errors.stage.message}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="difficulty" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Difficulty (1-10) *
                              </Label>
                              <Controller
                                name="difficulty"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    id="difficulty"
                                    type="number"
                                    min="1"
                                    max="10"
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                    className={cn(
                                      "mt-1 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-12",
                                      "focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200",
                                      errors.difficulty && "border-red-500"
                                    )}
                                    style={{ fontSize: '16px' }}
                                    data-testid="input-difficulty"
                                  />
                                )}
                              />
                              {errors.difficulty && (
                                <p className="text-sm text-red-600 mt-1">{errors.difficulty.message}</p>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="score" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Score (0-100) *
                              </Label>
                              <Controller
                                name="score"
                                control={control}
                                render={({ field }) => (
                                  <Input
                                    {...field}
                                    id="score"
                                    type="number"
                                    min="0"
                                    max="100"
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                    className={cn(
                                      "mt-1 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-12",
                                      "focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200",
                                      errors.score && "border-red-500"
                                    )}
                                    style={{ fontSize: '16px' }}
                                    data-testid="input-score"
                                  />
                                )}
                              />
                              {errors.score && (
                                <p className="text-sm text-red-600 mt-1">{errors.score.message}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Additional Information */}
                      <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">Additional Information</h3>
                        
                        <div>
                          <Label htmlFor="lineage" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Lineage Information *
                          </Label>
                          <Controller
                            name="lineage"
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                id="lineage"
                                placeholder="e.g., Polish ancestry through grandparents"
                                className={cn(
                                  "mt-1 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white h-12",
                                  "focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200",
                                  errors.lineage && "border-red-500"
                                )}
                                style={{ fontSize: '16px' }}
                                data-testid="input-lineage"
                              />
                            )}
                          />
                          {errors.lineage && (
                            <p className="text-sm text-red-600 mt-1">{errors.lineage.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Notes
                          </Label>
                          <Controller
                            name="notes"
                            control={control}
                            render={({ field }) => (
                              <Textarea
                                {...field}
                                id="notes"
                                placeholder="Enter additional notes about this case..."
                                rows={4}
                                className={cn(
                                  "mt-1 resize-none border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white",
                                  "focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200",
                                  errors.notes && "border-red-500"
                                )}
                                style={{ fontSize: '16px' }}
                                data-testid="textarea-notes"
                              />
                            )}
                          />
                          {errors.notes && (
                            <p className="text-sm text-red-600 mt-1">{errors.notes.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <ActionButton
                        type="button"
                        onClick={handleSave}
                        variant="primary"
                        disabled={isSubmitting || !isValid}
                        className="w-full h-12 justify-center font-medium bg-blue-600 hover:bg-blue-700 text-white"
                        data-testid="button-save-case"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </ActionButton>
                      
                      <ActionButton
                        type="button"
                        variant="ghost"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="w-full h-12 justify-center font-medium bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                        data-testid="button-cancel-edit"
                      >
                        Cancel
                      </ActionButton>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      portalTarget
    );
  } else {
    // Desktop: Right side column
    return createPortal(
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Light backdrop */}
            <motion.div
              variants={overlayVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="fixed inset-0 bg-black/20 z-40"
              onClick={handleBackdropClick}
            />
            
            {/* Right Side Panel */}
            <motion.div
              variants={desktopRailVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 w-[440px] max-w-[90vw] h-screen bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-bold text-foreground">Edit Case</h2>
                <ActionButton
                  onClick={handleCancel}
                  variant="ghost"
                  className="rounded-full w-8 h-8 p-0"
                  data-testid="button-close-desktop"
                >
                  <X className="h-4 w-4" />
                </ActionButton>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                <FormContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      portalTarget
    );
  }
}