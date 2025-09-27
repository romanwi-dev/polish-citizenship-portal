import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { hacSubmit, HAC_TYPES } from '@/lib/hac';
import { queryClient } from '@/lib/queryClient';
import { Settings, Send, Loader2 } from 'lucide-react';

// Complete status/stage enum based on all values used in the system
const STAGE_STATUS_VALUES = [
  'INTAKE',
  'USC_IN_FLIGHT', 
  'OBY_DRAFT',
  'OBY_DRAFTING',
  'USC_READY',
  'OBY_SUBMITTABLE',
  'OBY_SUBMITTED',
  'OBY_FILED',
  'DECISION',
  'DECISION_RECEIVED',
  'CLOSED'
] as const;

// Helper function to safely map unknown status values to a valid enum value
const mapToValidStatus = (status) => {
  if (!status || typeof status !== 'string') return 'INTAKE';
  const upperStatus = status.toUpperCase().trim();
  return STAGE_STATUS_VALUES.includes(upperStatus) ? upperStatus : 'INTAKE';
};

// Form validation schema
const caseSettingsSchema = z.object({
  preferredLanguage: z.enum(['EN', 'PL']).default('EN'),
  processing: z.enum(['standard', 'expedited', 'vip', 'vip+']).default('standard'),
  difficulty: z.number().min(1).max(10).default(5),
  clientScore: z.union([z.coerce.number().min(0).max(100), z.literal('')]),
  stage: z.enum(STAGE_STATUS_VALUES).default('INTAKE')
});

export default function CaseSettings({ caseId }) {
  const { t } = useTranslation();
  const { toast } = useToast();

  // Load current case values - use same endpoint as CaseDetail
  const { data: caseData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/case', caseId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/case/${caseId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch case data');
      }
      const result = await response.json();
      return result.case;
    },
    enabled: !!caseId
  });

  // Form setup with react-hook-form and zod validation
  const form = useForm({
    resolver: zodResolver(caseSettingsSchema),
    defaultValues: {
      preferredLanguage: 'EN',
      processing: 'standard',
      difficulty: 5,
      clientScore: '',
      stage: 'INTAKE'
    }
  });

  // Initialize form data when case data loads with improved status/stage mapping
  useEffect(() => {
    if (caseData) {
      // Safely map status/stage with priority: status > stage > default
      const currentStatus = caseData.status || caseData.stage;
      const mappedStatus = mapToValidStatus(currentStatus);
      
      // Log a warning if we had to map an unknown status value
      if (currentStatus && currentStatus !== mappedStatus) {
        console.warn(`Unknown status '${currentStatus}' mapped to '${mappedStatus}' for case ${caseId}`);
      }
      
      form.reset({
        preferredLanguage: caseData.preferredLanguage || 'EN',
        processing: caseData.processing || 'standard',
        difficulty: caseData.difficulty || 5,
        clientScore: caseData.clientScore ?? '', // Use nullish coalescing to preserve 0 values
        stage: mappedStatus
      });
    }
  }, [caseData, form, caseId]);

  // HAC submission mutation
  const hacMutation = useMutation({
    mutationFn: async (payload) => {
      return await hacSubmit(caseId, HAC_TYPES.CASE_PATCH, payload);
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Sent to HAC for approval'
      });
      // FIXED: Invalidate multiple query keys to refresh all related data
      queryClient.invalidateQueries({ queryKey: ['/api/admin/case', caseId] });
      queryClient.invalidateQueries({ queryKey: ['/api/cases', caseId] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/cases'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: `Failed to submit to HAC: ${error.message}`,
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (data) => {
    const payload = {
      preferredLanguage: data.preferredLanguage,
      processing: data.processing, // FIXED: Use 'processing' field name consistently
      difficulty: data.difficulty,
      clientScore: data.clientScore === '' ? null : data.clientScore, // Map empty string to null
      stage: data.stage
    };

    hacMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Case Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-muted-foreground">Loading case settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Case Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            Failed to load case settings: {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Case Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Preferred Language */}
              <FormField
                control={form.control}
                name="preferredLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Language</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} data-testid="select-preferred-language">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EN">English (EN)</SelectItem>
                        <SelectItem value="PL">Polish (PL)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Processing Tier - FIXED: Use 'processing' field name */}
              <FormField
                control={form.control}
                name="processing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Processing Tier</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} data-testid="select-processing-tier">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="expedited">Expedited</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="vip+">VIP+</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Difficulty Slider */}
              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Difficulty: {field.value}/10
                    </FormLabel>
                    <FormControl>
                      <div className="px-3">
                        <Slider
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          max={10}
                          min={1}
                          step={1}
                          className="w-full"
                          data-testid="slider-difficulty"
                        />
                      </div>
                    </FormControl>
                    <div className="flex justify-between text-xs text-muted-foreground px-3">
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                      <span>6</span>
                      <span>7</span>
                      <span>8</span>
                      <span>9</span>
                      <span>10</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Client Score */}
              <FormField
                control={form.control}
                name="clientScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Score (0-100)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        min="0"
                        max="100"
                        placeholder="Enter score"
                        data-testid="input-client-score"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Stage/State */}
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Stage/State</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} data-testid="select-stage">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INTAKE">Intake</SelectItem>
                        <SelectItem value="USC_IN_FLIGHT">USC In Flight</SelectItem>
                        <SelectItem value="OBY_DRAFT">OBY Draft</SelectItem>
                        <SelectItem value="OBY_DRAFTING">OBY Drafting</SelectItem>
                        <SelectItem value="USC_READY">USC Ready</SelectItem>
                        <SelectItem value="OBY_SUBMITTABLE">OBY Submittable</SelectItem>
                        <SelectItem value="OBY_SUBMITTED">OBY Submitted</SelectItem>
                        <SelectItem value="OBY_FILED">OBY Filed</SelectItem>
                        <SelectItem value="DECISION">Decision</SelectItem>
                        <SelectItem value="DECISION_RECEIVED">Decision Received</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={hacMutation.isPending}
                className="flex items-center gap-2"
                data-testid="button-send-to-hac"
              >
                {hacMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {hacMutation.isPending ? 'Sending...' : 'Send to HAC'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}