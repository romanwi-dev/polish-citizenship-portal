import { lazy } from 'react';

// Lazy load all heavy components to reduce initial bundle size
export const LazyApplicantDetailsForm = lazy(() => import('@/components/applicant-details'));
export const LazyPolishCitizenshipApplication = lazy(() => import('@/components/polish-citizenship-application'));
export const LazyDocumentChecklist = lazy(() => import('@/components/document-checklist'));
export const LazyDocumentUpload = lazy(() => import('@/components/document-upload').then(m => ({ default: m.DocumentUpload })));
export const LazyDocumentProcessingCard = lazy(() => import('@/components/DocumentProcessingCard').then(m => ({ default: m.DocumentProcessingCard })));
export const LazyCaseProgressTracker = lazy(() => import('@/components/case-progress-tracker'));
export const LazyFinancialDashboard = lazy(() => import('@/components/financial-dashboard'));
export const LazyQuickActionsWidget = lazy(() => import('@/components/quick-actions-widget'));
export const LazySecureMessaging = lazy(() => import('@/components/secure-messaging'));
export const LazySmartAlerts = lazy(() => import('@/components/smart-alerts'));
export const LazyInteractiveTimeline = lazy(() => import('@/components/interactive-timeline'));
export const LazyMilestoneAchievements = lazy(() => import('@/components/milestone-achievements'));
export const LazyPersonalNotes = lazy(() => import('@/components/personal-notes'));
export const LazyFamilyPortal = lazy(() => import('@/components/family-portal'));
export const LazyDocumentScanner = lazy(() => import('@/components/document-scanner'));
export const LazyAdvancedAnalytics = lazy(() => import('@/components/advanced-analytics'));

// Lazy load heavy pages
export const LazyDashboard = lazy(() => import('@/pages/dashboard'));
export const LazyTestimonials = lazy(() => import('@/pages/testimonials'));
export const LazyDocuments = lazy(() => import('@/pages/documents'));
export const LazyEUBenefits = lazy(() => import('@/pages/eu-benefits'));
export const LazyLaw = lazy(() => import('@/pages/law'));
export const LazyFAQ = lazy(() => import('@/pages/faq'));
export const LazyGallery = lazy(() => import('@/pages/gallery'));
export const LazyPerformanceDashboard = lazy(() => import('@/pages/performance-dashboard'));