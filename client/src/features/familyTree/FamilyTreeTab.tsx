import React, { useState, useEffect, useCallback } from 'react';
import { TreeView } from './TreeView';
import { TreeForm } from './TreeForm';
import { FamilyTreeData, createEmptyFamilyTree } from './types';
import { validateEligibility, generateCAPItems } from './eligibilityLogic';
import { mapFamilyTreeToPDFFields, getSampleMapping } from './pdfMapper';
import { fillPDFTemplate, downloadPDF, previewPDF } from '@/lib/pdf';
import { useCaseStore } from '@/stores/caseStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Download, Eye, FileText, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface FamilyTreeTabProps {
  caseId: string;
  className?: string;
}

export const FamilyTreeTab: React.FC<FamilyTreeTabProps> = ({ caseId, className }) => {
  const { caseById, updateCase } = useCaseStore();
  const { toast } = useToast();
  const [familyTreeData, setFamilyTreeData] = useState<FamilyTreeData>(createEmptyFamilyTree());
  const [isExporting, setIsExporting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<'tree' | 'form'>('tree');

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load family tree data from case
  useEffect(() => {
    const caseData = caseById[caseId];
    if (caseData?.familyTree) {
      setFamilyTreeData(caseData.familyTree);
    } else {
      setFamilyTreeData(createEmptyFamilyTree());
    }
  }, [caseId, caseById]);

  // Auto-save on data change (debounced)
  const handleDataChange = useCallback((newData: FamilyTreeData) => {
    setFamilyTreeData(newData);
    
    // Debounced save to store
    const timeoutId = setTimeout(() => {
      updateCase(caseId, { familyTree: newData });
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [caseId, updateCase]);

  // Export to PDF
  const handleExportPDF = useCallback(async (preview: boolean = false) => {
    setIsExporting(true);
    
    try {
      const fieldMapping = mapFamilyTreeToPDFFields(familyTreeData);
      const caseCode = caseById[caseId]?.id || caseId;
      
      const result = await fillPDFTemplate({
        templatePath: '/assets/pdf/new-FAMILY_TREE.pdf',
        fieldMapping,
        filename: `FAMILY_TREE_${caseCode}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.pdf`
      });

      if (result.success && result.blob) {
        if (preview) {
          previewPDF(result.blob);
          toast({
            title: "PDF Preview",
            description: "Family tree PDF opened in new tab"
          });
        } else {
          downloadPDF(result.blob, result.filename);
          toast({
            title: "PDF Downloaded",
            description: `Family tree exported as ${result.filename}`
          });
        }
      } else {
        throw new Error(result.error || 'PDF export failed');
      }
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : 'Failed to export PDF',
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  }, [familyTreeData, caseId, caseById, toast]);

  // Generate eligibility status
  const eligibility = validateEligibility(familyTreeData);
  const capItems = generateCAPItems(familyTreeData);

  // Render mobile accordion view
  if (isMobile) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Eligibility Status */}
        <div className="pc-card p-4">
          <div className="flex items-center gap-3 mb-3">
            {eligibility.isEligible ? (
              <CheckCircle className="h-5 w-5 text-[var(--pc-success)]" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-[var(--pc-danger)]" />
            )}
            <h3 className="font-semibold text-[var(--pc-text-primary)]">
              Eligibility Status
            </h3>
          </div>
          
          <div className={cn(
            "px-3 py-2 rounded-lg text-sm font-medium",
            eligibility.isEligible 
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          )}>
            {eligibility.isEligible ? "ELIGIBLE" : `${eligibility.blockers.length} BLOCKERS`}
          </div>

          {eligibility.blockers.length > 0 && (
            <div className="mt-3 space-y-1">
              {eligibility.blockers.map((blocker, index) => (
                <div key={index} className="text-sm text-[var(--pc-danger)] flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {blocker}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <div className="pc-card p-2">
          <div className="flex gap-1">
            <button
              onClick={() => setMobileExpandedSection('tree')}
              className={cn(
                "flex-1 py-2 px-3 rounded text-sm font-medium transition-colors",
                mobileExpandedSection === 'tree'
                  ? "bg-[var(--pc-info)] text-white"
                  : "text-[var(--pc-text-dim)] hover:text-[var(--pc-text-primary)]"
              )}
            >
              Tree View
            </button>
            <button
              onClick={() => setMobileExpandedSection('form')}
              className={cn(
                "flex-1 py-2 px-3 rounded text-sm font-medium transition-colors",
                mobileExpandedSection === 'form'
                  ? "bg-[var(--pc-info)] text-white"
                  : "text-[var(--pc-text-dim)] hover:text-[var(--pc-text-primary)]"
              )}
            >
              Data Form
            </button>
          </div>
        </div>

        {/* Content */}
        {mobileExpandedSection === 'tree' ? (
          <TreeView data={familyTreeData} className="min-h-[400px]" />
        ) : (
          <div className="pc-card p-4">
            <TreeForm 
              data={familyTreeData} 
              onChange={handleDataChange}
              className="max-h-[500px]"
            />
          </div>
        )}

        {/* Export Actions */}
        <div className="pc-card p-4">
          <h4 className="font-semibold text-[var(--pc-text-primary)] mb-3">Export PDF</h4>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportPDF(true)}
              disabled={isExporting}
              className="pc-btn pc-btn--ghost pc-btn--icon flex-1"
              data-testid="button-preview-pdf"
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
            <button
              onClick={() => handleExportPDF(false)}
              disabled={isExporting}
              className="pc-btn pc-btn--primary pc-btn--icon flex-1"
              data-testid="button-download-pdf"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop two-column layout
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-6 h-full", className)}>
      {/* Left Column: Tree View */}
      <div className="space-y-4">
        {/* Eligibility Status */}
        <div className="pc-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {eligibility.isEligible ? (
                <CheckCircle className="h-5 w-5 text-[var(--pc-success)]" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-[var(--pc-danger)]" />
              )}
              <h3 className="font-semibold text-[var(--pc-text-primary)]">
                Eligibility Status
              </h3>
            </div>
            
            <div className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              eligibility.isEligible 
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            )}>
              {eligibility.isEligible ? "ELIGIBLE" : `${eligibility.blockers.length} BLOCKERS`}
            </div>
          </div>

          {eligibility.blockers.length > 0 && (
            <div className="space-y-2">
              {eligibility.blockers.map((blocker, index) => (
                <div key={index} className="text-sm text-[var(--pc-danger)] flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {blocker}
                </div>
              ))}
            </div>
          )}

          {eligibility.warnings.length > 0 && (
            <div className="mt-3 space-y-2">
              {eligibility.warnings.map((warning, index) => (
                <div key={index} className="text-sm text-[var(--pc-warn)] flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {warning}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tree Visualization */}
        <TreeView data={familyTreeData} className="flex-1" />

        {/* Export Actions */}
        <div className="pc-card p-4">
          <h4 className="font-semibold text-[var(--pc-text-primary)] mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Export Family Tree PDF
          </h4>
          <div className="flex gap-3">
            <button
              onClick={() => handleExportPDF(true)}
              disabled={isExporting}
              className="pc-btn pc-btn--ghost pc-btn--icon"
              data-testid="button-preview-pdf"
            >
              <Eye className="h-4 w-4" />
              Preview PDF
            </button>
            <button
              onClick={() => handleExportPDF(false)}
              disabled={isExporting}
              className="pc-btn pc-btn--primary pc-btn--icon"
              data-testid="button-download-pdf"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>
          {isExporting && (
            <div className="mt-2 text-sm text-[var(--pc-text-dim)]">
              Generating PDF...
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Data Form */}
      <div className="pc-card p-4 bg-[var(--pc-panel)] h-fit">
        <h3 className="text-lg font-semibold text-[var(--pc-text-primary)] mb-4">
          Family Tree Data
        </h3>
        <TreeForm 
          data={familyTreeData} 
          onChange={handleDataChange}
          className="max-h-[600px]"
        />
      </div>
    </div>
  );
};