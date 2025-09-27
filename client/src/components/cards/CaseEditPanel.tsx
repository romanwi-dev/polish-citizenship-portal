import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
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
import { CaseData } from '@/lib/api';

interface CaseEditPanelProps {
  isOpen: boolean;
  caseData: CaseData | null;
  mode: 'mobile' | 'desktop';
  onClose: () => void;
  onSave?: (updatedCase: CaseData) => void;
}

// Form validation schema matching CaseData structure
const caseFormSchema = z.object({
  name: z.string().min(1, 'Client name is required').max(100, 'Name too long'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  tier: z.enum(['VIP', 'GLOBAL', 'STANDARD', 'BASIC'], {
    required_error: 'Tier is required',
  }),
  stage: z.enum([
    'completed', 
    'in_progress', 
    'pending', 
    'stalled'
  ], {
    required_error: 'Stage is required',
  }),
  score: z.number().min(0, 'Minimum score is 0').max(100, 'Maximum score is 100'),
  ageMonths: z.number().min(0, 'Age cannot be negative'),
  additionalInfo: z.string().optional(),
});

type CaseFormData = z.infer<typeof caseFormSchema>;

// Animation variants for desktop and mobile
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

export const CaseEditPanel: React.FC<CaseEditPanelProps> = ({ 
  isOpen, 
  caseData, 
  mode, 
  onClose, 
  onSave 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDirty, setIsDirty] = useState(false);
  
  // Form setup with React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isValid, isSubmitting }
  } = useForm<CaseFormData>({
    resolver: zodResolver(caseFormSchema),
    defaultValues: {
      name: '',
      email: '',
      tier: 'STANDARD',
      stage: 'pending',
      score: 0,
      ageMonths: 0,
      additionalInfo: '',
    },
  });

  // Watch form changes to detect dirty state
  const watchedFields = watch();
  
  useEffect(() => {
    if (caseData && Object.keys(watchedFields).length > 0) {
      const hasChanges = Object.entries(watchedFields).some(([key, value]) => {
        switch (key) {
          case 'name': return value !== caseData.name;
          case 'email': return value !== caseData.email;
          case 'tier': return value !== caseData.tier;
          case 'stage': return value !== caseData.stage;
          case 'score': return value !== caseData.score;
          case 'ageMonths': return value !== caseData.ageMonths;
          case 'additionalInfo': return value !== (caseData as any).additionalInfo;
          default: return false;
        }
      });
      setIsDirty(hasChanges);
    }
  }, [watchedFields, caseData]);

  // Reset form when case data changes or panel opens
  useEffect(() => {
    if (caseData && isOpen) {
      reset({
        name: caseData.name,
        email: caseData.email,
        tier: caseData.tier as CaseFormData['tier'],
        stage: caseData.stage as CaseFormData['stage'],
        score: caseData.score,
        ageMonths: caseData.ageMonths,
        additionalInfo: (caseData as any).additionalInfo || '',
      });
      setIsDirty(false);
    }
  }, [caseData, isOpen, reset]);

  // Update case mutation with optimistic UI
  const updateCaseMutation = useMutation({
    mutationFn: async (data: CaseFormData) => {
      if (!caseData) throw new Error('No case data available');
      
      const response = await apiRequest('PATCH', `/api/admin/cases/${caseData.id}`, {
        name: data.name,
        email: data.email,
        tier: data.tier,
        stage: data.stage,
        score: data.score,
        ageMonths: data.ageMonths,
      });
      
      return response;
    },
    onSuccess: (response, variables) => {
      // Optimistic update of cache
      queryClient.setQueryData(['/api/admin/cases'], (oldData: any) => {
        if (!oldData?.cases) return oldData;
        return {
          ...oldData,
          cases: oldData.cases.map((c: CaseData) => 
            c.id === caseData!.id 
              ? {
                  ...c,
                  name: variables.name,
                  email: variables.email,
                  tier: variables.tier,
                  stage: variables.stage,
                  score: variables.score,
                  ageMonths: variables.ageMonths,
                  additionalInfo: variables.additionalInfo,
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
      
      // Invalidate queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cases'] });
      onSave?.(response);
      setIsDirty(false);
      onClose();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update case. Please try again.';
      
      toast({
        title: 'Update Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  });

  const handleSave = useCallback((data: CaseFormData) => {
    updateCaseMutation.mutate(data);
  }, [updateCaseMutation]);

  const handleClose = useCallback(() => {
    if (isDirty) {
      if (confirm('You have unsaved changes. Are you sure you want to close?')) {
        onClose();
        setIsDirty(false);
      }
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  // Don't render if not open
  if (!isOpen || !caseData) return null;

  // Desktop: fixed right column
  if (mode === 'desktop') {
    return createPortal(
      <AnimatePresence>
        <motion.div
          key="desktop-overlay"
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed inset-0 bg-black/50 z-50"
          onClick={handleClose}
        />
        <motion.div
          key="desktop-rail"
          variants={desktopRailVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed right-0 top-0 h-screen w-96 bg-white dark:bg-gray-900 shadow-xl z-50"
          style={{ willChange: 'transform' }}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Case</h3>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                data-testid="button-close-edit"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form - Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4">
              <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Client Name</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="Client full name"
                    className="mt-1"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="client@example.com"
                    className="mt-1"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="tier">Tier</Label>
                  <Select
                    value={watch('tier')}
                    onValueChange={(value) => setValue('tier', value as CaseFormData['tier'])}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIP">VIP</SelectItem>
                      <SelectItem value="GLOBAL">GLOBAL</SelectItem>
                      <SelectItem value="STANDARD">STANDARD</SelectItem>
                      <SelectItem value="BASIC">BASIC</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.tier && (
                    <p className="text-red-600 text-sm mt-1">{errors.tier.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="stage">Stage</Label>
                  <Select
                    value={watch('stage')}
                    onValueChange={(value) => setValue('stage', value as CaseFormData['stage'])}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="stalled">Stalled</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.stage && (
                    <p className="text-red-600 text-sm mt-1">{errors.stage.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="score">Score (%)</Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    max="100"
                    {...register('score', { valueAsNumber: true })}
                    className="mt-1"
                  />
                  {errors.score && (
                    <p className="text-red-600 text-sm mt-1">{errors.score.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="ageMonths">Age (Months)</Label>
                  <Input
                    id="ageMonths"
                    type="number"
                    min="0"
                    {...register('ageMonths', { valueAsNumber: true })}
                    className="mt-1"
                  />
                  {errors.ageMonths && (
                    <p className="text-red-600 text-sm mt-1">{errors.ageMonths.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="additionalInfo">Additional Information</Label>
                  <Textarea
                    id="additionalInfo"
                    {...register('additionalInfo')}
                    placeholder="Enter any additional notes or information..."
                    className="mt-1 min-h-[100px]"
                  />
                  {errors.additionalInfo && (
                    <p className="text-red-600 text-sm mt-1">{errors.additionalInfo.message}</p>
                  )}
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit(handleSave)}
                  disabled={!isDirty || !isValid || isSubmitting}
                  className={cn(
                    "flex-1 px-4 py-2 bg-blue-600 text-white rounded-md transition-colors flex items-center justify-center gap-2",
                    (!isDirty || !isValid || isSubmitting) 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "hover:bg-blue-700"
                  )}
                  data-testid="button-save-changes"
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
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>,
      document.body
    );
  }

  // Mobile: full-screen sheet
  return createPortal(
    <AnimatePresence>
      <motion.div
        key="mobile-overlay"
        variants={overlayVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 bg-black/50 z-50"
        onClick={handleClose}
      />
      <motion.div
        key="mobile-sheet"
        variants={mobileSheetVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-4 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-50 max-h-[90vh] min-h-[60vh] flex flex-col"
        style={{ willChange: 'transform' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Case</h3>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            data-testid="button-close-edit-mobile"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form - Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
            <div>
              <Label htmlFor="name-mobile" className="text-base">Client Name</Label>
              <Input
                id="name-mobile"
                {...register('name')}
                placeholder="Client full name"
                className="mt-2 text-base min-h-[44px]"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email-mobile" className="text-base">Email</Label>
              <Input
                id="email-mobile"
                type="email"
                {...register('email')}
                placeholder="client@example.com"
                className="mt-2 text-base min-h-[44px]"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="tier-mobile" className="text-base">Tier</Label>
              <Select
                value={watch('tier')}
                onValueChange={(value) => setValue('tier', value as CaseFormData['tier'])}
              >
                <SelectTrigger className="mt-2 text-base min-h-[44px]">
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="GLOBAL">GLOBAL</SelectItem>
                  <SelectItem value="STANDARD">STANDARD</SelectItem>
                  <SelectItem value="BASIC">BASIC</SelectItem>
                </SelectContent>
              </Select>
              {errors.tier && (
                <p className="text-red-600 text-sm mt-1">{errors.tier.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="stage-mobile" className="text-base">Stage</Label>
              <Select
                value={watch('stage')}
                onValueChange={(value) => setValue('stage', value as CaseFormData['stage'])}
              >
                <SelectTrigger className="mt-2 text-base min-h-[44px]">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="stalled">Stalled</SelectItem>
                </SelectContent>
              </Select>
              {errors.stage && (
                <p className="text-red-600 text-sm mt-1">{errors.stage.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="score-mobile" className="text-base">Score (%)</Label>
              <Input
                id="score-mobile"
                type="number"
                min="0"
                max="100"
                {...register('score', { valueAsNumber: true })}
                className="mt-2 text-base min-h-[44px]"
              />
              {errors.score && (
                <p className="text-red-600 text-sm mt-1">{errors.score.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="ageMonths-mobile" className="text-base">Age (Months)</Label>
              <Input
                id="ageMonths-mobile"
                type="number"
                min="0"
                {...register('ageMonths', { valueAsNumber: true })}
                className="mt-2 text-base min-h-[44px]"
              />
              {errors.ageMonths && (
                <p className="text-red-600 text-sm mt-1">{errors.ageMonths.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="additionalInfo-mobile" className="text-base">Additional Information</Label>
              <Textarea
                id="additionalInfo-mobile"
                {...register('additionalInfo')}
                placeholder="Enter any additional notes or information..."
                className="mt-2 text-base min-h-[100px]"
              />
              {errors.additionalInfo && (
                <p className="text-red-600 text-sm mt-1">{errors.additionalInfo.message}</p>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              onClick={handleSubmit(handleSave)}
              disabled={!isDirty || !isValid || isSubmitting}
              className={cn(
                "w-full px-4 py-3 bg-blue-600 text-white rounded-md transition-colors flex items-center justify-center gap-2 min-h-[44px]",
                (!isDirty || !isValid || isSubmitting) 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "hover:bg-blue-700"
              )}
              data-testid="button-save-changes-mobile"
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
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-full px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors min-h-[44px]"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};