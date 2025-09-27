import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation, useSearch } from 'wouter';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import SignaturePad from 'signature_pad';
import { saveAs } from 'file-saver';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  EyeOff, 
  FileText, 
  Download, 
  Save, 
  PenTool, 
  RefreshCw, 
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Printer,
  Upload,
  List,
  Settings
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Configure pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface PdfField {
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'combo';
  rect: [number, number, number, number];
  pageIndex: number;
  required: boolean;
  value?: string;
}

interface PdfFile {
  path: string;
  name: string;
  size: number;
  updatedAt: string;
  category: string;
}

interface FieldOverlay {
  field: PdfField;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function PdfWorkbench() {
  const [location, setLocation] = useLocation();
  const search = useSearch();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // URL params
  const searchParams = new URLSearchParams(search);
  const caseId = searchParams.get('case') || 'default';
  
  // PDF state
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [fields, setFields] = useState<PdfField[]>([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [fieldOverlays, setFieldOverlays] = useState<FieldOverlay[]>([]);
  
  // UI state
  const [maskSensitive, setMaskSensitive] = useState(true);
  const [showFieldList, setShowFieldList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const [leftPaneCollapsed, setLeftPaneCollapsed] = useState(false);
  
  // Autosave state
  const [isAutosaveEnabled, setIsAutosaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Fetch PDFs for case
  const { data: pdfsData, isLoading: loadingPdfs } = useQuery({
    queryKey: ['/api/cases', caseId, 'pdfs'],
    enabled: !!caseId
  });
  
  // Fetch autofill mapping
  const { data: autofillData } = useQuery({
    queryKey: ['/api/pdf/autofill-map'],
    queryFn: () => apiRequest('GET', `/api/pdf/autofill-map?caseId=${caseId}`)
  });
  
  // Fill PDF mutation (success/error handling moved to individual save functions)
  const fillPdfMutation = useMutation({
    mutationFn: async (data: { docId: string; data: Record<string, string>; maskPII: boolean; flatten: boolean; notes?: string }) => {
      return apiRequest('POST', `/api/pdf/${data.docId}/fill?caseId=${caseId}`, {
          data: data.data,
          maskPII: data.maskPII,
          flatten: data.flatten,
          notes: data.notes
        });
    },
    onSuccess: () => {
      // Invalidate queries but don't show toast here (handled in save functions)
      queryClient.invalidateQueries({ queryKey: ['/api/cases', caseId, 'pdfs'] });
    }
  });
  
  // Load PDF document
  const loadPdf = useCallback(async (pdfPath: string) => {
    if (!pdfPath) return;
    
    setIsLoading(true);
    // Reset state when loading new PDF
    setHasUnsavedChanges(false);
    setSaveStatus('idle');
    setLastSaved(null);
    
    try {
      // Attempt to load actual PDF from backend stream with correct contract
      const docId = pdfPath.split('/').pop()?.replace('.pdf', '') || 'unknown';
      const pdfUrl = `/api/pdf/${docId}/stream?caseId=${caseId}&path=${encodeURIComponent(pdfPath)}`;
      
      try {
        // Try to load actual PDF
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdfDoc = await loadingTask.promise;
        setPdfDocument(pdfDoc);
        setTotalPages(pdfDoc.numPages);
        setCurrentPage(1);
      } catch (pdfError) {
        // Fallback to mock for development if PDF loading fails
        console.warn('PDF loading failed, using mock data:', pdfError);
        setPdfDocument(null);
        setTotalPages(3);
        setCurrentPage(1);
      }
      
      // Load fields for this PDF
      const fieldsResponse = await apiRequest('GET', `/api/pdf/fields?caseId=${caseId}&path=${encodeURIComponent(pdfPath)}`);
      
      if (fieldsResponse.fields) {
        setFields(fieldsResponse.fields);
        // Initialize field values and mark as clean
        const initialValues: Record<string, string> = {};
        fieldsResponse.fields.forEach((field: PdfField) => {
          initialValues[field.name] = field.value || '';
        });
        setFieldValues(initialValues);
        setHasUnsavedChanges(false); // Clean state after loading
      }
      
      toast({
        title: "PDF Loaded",
        description: `Loaded ${fieldsResponse.fields?.length || 0} form fields`
      });
      
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast({
        title: "Error",
        description: "Failed to load PDF",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [caseId, toast]);
  
  // Render PDF page
  const renderPdfPage = useCallback(async (pageNum: number) => {
    if (!pdfDocument || !canvasRef.current) return;
    
    try {
      const page = await pdfDocument.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
      
      // Update field overlays for current page
      updateFieldOverlays(pageNum, viewport);
      
    } catch (error) {
      console.error('Error rendering PDF page:', error);
    }
  }, [pdfDocument, scale]);
  
  // Update field overlay positions
  const updateFieldOverlays = useCallback((pageNum: number, viewport: any) => {
    const pageFields = fields.filter(field => field.pageIndex === pageNum - 1);
    const overlays: FieldOverlay[] = pageFields.map(field => {
      // Convert PDF coordinates to canvas coordinates
      const [x1, y1, x2, y2] = field.rect;
      const canvasX = x1 * scale;
      const canvasY = viewport.height - (y2 * scale); // PDF Y is bottom-up
      const canvasWidth = (x2 - x1) * scale;
      const canvasHeight = (y2 - y1) * scale;
      
      return {
        field,
        x: canvasX,
        y: canvasY,
        width: canvasWidth,
        height: canvasHeight
      };
    });
    
    setFieldOverlays(overlays);
  }, [fields, scale]);
  
  // Auto-fill fields with autosave trigger
  const handleAutofill = useCallback(() => {
    if (!autofillData?.autofillMap) return;
    
    const newValues = { ...fieldValues };
    fields.forEach(field => {
      const mappedValue = autofillData.autofillMap[field.name];
      if (mappedValue) {
        newValues[field.name] = mappedValue;
      }
    });
    
    setFieldValues(newValues);
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
    
    toast({
      title: "Auto-fill Complete",
      description: "Form fields populated with case data"
    });
  }, [autofillData, fieldValues, fields, toast]);
  
  // Handle field value change with autosave trigger
  const handleFieldChange = useCallback((fieldName: string, value: string) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldName]: value.toUpperCase() // Names in CAPS as per user preference
    }));
    
    // Mark as unsaved and trigger autosave if enabled
    setHasUnsavedChanges(true);
    setSaveStatus('idle');
  }, []);
  
  // Enhanced save function with autosave tracking
  const handleSave = useCallback(async (flatten = false, isAutosave = false) => {
    if (!selectedPdf) return;
    
    const docId = selectedPdf.split('/').pop()?.replace('.pdf', '') || 'unknown';
    
    setSaveStatus('saving');
    
    try {
      await fillPdfMutation.mutateAsync({
        docId,
        data: fieldValues,
        maskPII: maskSensitive,
        flatten,
        notes: `${isAutosave ? 'Autosaved' : 'Saved'} from PDF Workbench ${flatten ? '(flattened)' : '(editable)'}`
      });
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      setSaveStatus('saved');
      
      if (!isAutosave) {
        toast({
          title: "Success",
          description: `PDF ${flatten ? 'flattened and ' : ''}saved successfully`
        });
      }
    } catch (error) {
      setSaveStatus('error');
      if (!isAutosave) {
        toast({
          title: "Error",
          description: "Failed to save PDF",
          variant: "destructive"
        });
      }
    }
  }, [selectedPdf, fieldValues, maskSensitive, fillPdfMutation, toast]);
  
  // Autosave functionality
  const performAutosave = useCallback(async () => {
    if (!isAutosaveEnabled || !hasUnsavedChanges || !selectedPdf || fillPdfMutation.isPending) {
      return;
    }
    
    try {
      await handleSave(false, true); // Save as draft, not flattened
    } catch (error) {
      console.error('Autosave failed:', error);
    }
  }, [isAutosaveEnabled, hasUnsavedChanges, selectedPdf, fillPdfMutation.isPending, handleSave]);
  
  // Initialize signature pad
  useEffect(() => {
    if (showSignatureDialog && signatureCanvasRef.current) {
      signaturePadRef.current = new SignaturePad(signatureCanvasRef.current, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
      });
    }
  }, [showSignatureDialog]);
  
  // Load initial PDF if specified in URL
  useEffect(() => {
    if (pdfsData?.pdfs?.length > 0 && !selectedPdf) {
      const firstPdf = pdfsData.pdfs[0];
      setSelectedPdf(firstPdf.path);
      loadPdf(firstPdf.path);
    }
  }, [pdfsData, selectedPdf, loadPdf]);
  
  // Autosave timer - saves every 30 seconds if there are unsaved changes
  useEffect(() => {
    if (!isAutosaveEnabled) return;
    
    const autosaveInterval = setInterval(() => {
      performAutosave();
    }, 30000); // 30 seconds
    
    return () => clearInterval(autosaveInterval);
  }, [isAutosaveEnabled, performAutosave]);
  
  // Reset save status after 3 seconds
  useEffect(() => {
    if (saveStatus === 'saved' || saveStatus === 'error') {
      const timeout = setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [saveStatus]);
  
  // Render page when document or page changes
  useEffect(() => {
    if (pdfDocument && currentPage) {
      renderPdfPage(currentPage);
    }
  }, [pdfDocument, currentPage, renderPdfPage]);
  
  const pdfs = pdfsData?.pdfs || [];
  
  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800" data-testid="pdf-workbench">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b shadow-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white" data-testid="title-workbench">
              PDF Workbench
            </h1>
            <Badge variant="secondary" data-testid="badge-case">
              Case: {caseId}
            </Badge>
            
            {/* Autosave Status */}
            <div className="flex items-center space-x-2 text-sm" data-testid="autosave-status">
              {saveStatus === 'saving' && (
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Saving...
                </Badge>
              )}
              {saveStatus === 'saved' && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <Save className="w-3 h-3 mr-1" />
                  Saved {lastSaved && `at ${lastSaved.toLocaleTimeString()}`}
                </Badge>
              )}
              {saveStatus === 'error' && (
                <Badge variant="outline" className="text-red-600 border-red-600">
                  Failed to save
                </Badge>
              )}
              {hasUnsavedChanges && saveStatus === 'idle' && (
                <Badge variant="outline" className="text-amber-600 border-amber-600">
                  Unsaved changes
                </Badge>
              )}
            </div>
          </div>
          
          {/* Toolbar */}
          <div className="flex items-center space-x-2">
            {/* Autosave Toggle */}
            <div className="flex items-center space-x-2 mr-4">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Autosave</span>
              <Switch
                checked={isAutosaveEnabled}
                onCheckedChange={setIsAutosaveEnabled}
                data-testid="switch-autosave"
              />
            </div>
            <Button
              onClick={handleAutofill}
              disabled={!autofillData?.autofillMap || !fields.length}
              className="glass-button"
              data-testid="button-autofill"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Autofill
            </Button>
            
            <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="glass-button" data-testid="button-signature">
                  <PenTool className="w-4 h-4 mr-2" />
                  Signature
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Signature</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <canvas
                    ref={signatureCanvasRef}
                    className="border border-gray-300 rounded w-full h-32"
                    width="400"
                    height="150"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => signaturePadRef.current?.clear()}
                      data-testid="button-clear-signature"
                    >
                      Clear
                    </Button>
                    <Button onClick={() => setShowSignatureDialog(false)} data-testid="button-add-signature">
                      Add Signature
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button
              onClick={() => handleSave(true)}
              disabled={fillPdfMutation.isPending}
              className="glass-button bg-blue-600 hover:bg-blue-700"
              data-testid="button-flatten-print"
            >
              <Printer className="w-4 h-4 mr-2" />
              Flatten & Print
            </Button>
            
            <Button
              onClick={() => handleSave(false)}
              disabled={fillPdfMutation.isPending}
              variant="outline"
              className={`glass-button ${hasUnsavedChanges ? 'ring-2 ring-amber-400' : ''}`}
              data-testid="button-save"
            >
              <Save className="w-4 h-4 mr-2" />
              {hasUnsavedChanges ? 'Save Changes' : 'Save'}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane - File List */}
        <div className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-r transition-all duration-300 ${
          leftPaneCollapsed ? 'w-12' : 'w-80'
        }`}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              {!leftPaneCollapsed && (
                <h3 className="font-semibold text-slate-800 dark:text-white" data-testid="text-files">Files</h3>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLeftPaneCollapsed(!leftPaneCollapsed)}
                data-testid="button-toggle-panel"
              >
                {leftPaneCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          {!leftPaneCollapsed && (
            <div className="p-4 space-y-2 overflow-y-auto h-full">
              {loadingPdfs ? (
                <div className="text-center py-8">
                  <Progress value={33} className="w-full" />
                  <p className="text-sm text-slate-600 mt-2">Loading files...</p>
                </div>
              ) : (
                pdfs.map((pdf, index) => (
                  <Card
                    key={pdf.path}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedPdf === pdf.path ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => {
                      setSelectedPdf(pdf.path);
                      loadPdf(pdf.path);
                    }}
                    data-testid={`card-pdf-${index}`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-3">
                        <FileText className="w-5 h-5 text-blue-600 mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-800 truncate" data-testid={`text-pdf-name-${index}`}>
                            {pdf.name}
                          </p>
                          <p className="text-xs text-slate-500" data-testid={`text-pdf-size-${index}`}>
                            {(pdf.size / 1024).toFixed(1)} KB
                          </p>
                          <Badge variant="outline" className="text-xs mt-1" data-testid={`badge-category-${index}`}>
                            {pdf.category}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Main Pane - PDF Viewer */}
        <div className="flex-1 flex flex-col">
          {selectedPdf ? (
            <>
              {/* PDF Controls */}
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage <= 1}
                        data-testid="button-prev-page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-medium" data-testid="text-page-info">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage >= totalPages}
                        data-testid="button-next-page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <Separator orientation="vertical" className="h-6" />
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                        data-testid="button-zoom-out"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </Button>
                      <span className="text-sm font-medium min-w-[60px] text-center" data-testid="text-zoom">
                        {Math.round(scale * 100)}%
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setScale(Math.min(3, scale + 0.1))}
                        data-testid="button-zoom-in"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">Mask Sensitive</span>
                      <Switch
                        checked={maskSensitive}
                        onCheckedChange={setMaskSensitive}
                        data-testid="switch-mask-sensitive"
                      />
                      {maskSensitive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFieldList(!showFieldList)}
                      data-testid="button-toggle-fields"
                    >
                      <List className="w-4 h-4 mr-2" />
                      Fields ({fields.length})
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* PDF Canvas Container */}
              <div className="flex-1 overflow-auto bg-gray-100 dark:bg-slate-700 p-4">
                <div className="relative inline-block bg-white shadow-lg rounded-lg overflow-hidden">
                  {isLoading ? (
                    <div className="w-full h-96 flex items-center justify-center">
                      <div className="text-center">
                        <Progress value={66} className="w-48 mb-4" />
                        <p className="text-slate-600">Loading PDF...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <canvas
                        ref={canvasRef}
                        className="block"
                        data-testid="canvas-pdf"
                      />
                      
                      {/* Field Overlays */}
                      <div
                        ref={overlayRef}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                        data-testid="overlay-fields"
                      >
                        {fieldOverlays.map((overlay, index) => (
                          <div
                            key={overlay.field.name}
                            className="absolute pointer-events-auto"
                            style={{
                              left: overlay.x,
                              top: overlay.y,
                              width: overlay.width,
                              height: overlay.height
                            }}
                          >
                            {overlay.field.type === 'text' && (
                              <Input
                                value={fieldValues[overlay.field.name] || ''}
                                onChange={(e) => handleFieldChange(overlay.field.name, e.target.value)}
                                className="w-full h-full text-sm border-2 border-blue-400 bg-white/90 font-semibold"
                                placeholder={overlay.field.name}
                                data-testid={`input-field-${overlay.field.name}`}
                              />
                            )}
                            {overlay.field.type === 'checkbox' && (
                              <input
                                type="checkbox"
                                checked={fieldValues[overlay.field.name] === 'true'}
                                onChange={(e) => handleFieldChange(overlay.field.name, e.target.checked ? 'true' : 'false')}
                                className="w-full h-full"
                                data-testid={`checkbox-field-${overlay.field.name}`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p className="text-lg font-medium">Select a PDF to get started</p>
                <p className="text-sm">Choose a file from the left panel to begin editing</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Pane - Field List (collapsible) */}
        {showFieldList && (
          <div className="w-80 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-l">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-slate-800 dark:text-white" data-testid="text-field-list">
                Form Fields
              </h3>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto h-full">
              {fields.map((field, index) => (
                <Card key={field.name} className="p-3" data-testid={`card-field-${index}`}>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm" data-testid={`text-field-name-${index}`}>
                        {field.name}
                      </span>
                      {field.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <Input
                      value={fieldValues[field.name] || ''}
                      onChange={(e) => handleFieldChange(field.name, e.target.value)}
                      placeholder={`Enter ${field.name}`}
                      className="text-sm"
                      data-testid={`input-field-list-${index}`}
                    />
                    <p className="text-xs text-slate-500">
                      Page {field.pageIndex + 1} • {field.type}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}