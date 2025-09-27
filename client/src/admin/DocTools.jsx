import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Scan, 
  FileText, 
  MapPin, 
  HelpCircle, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Copy,
  Download,
  Eye,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function DocTools({ caseId }) {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [mappingResult, setMappingResult] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState('');
  const [explanation, setExplanation] = useState(null);
  const [showFullText, setShowFullText] = useState(false);
  const { toast } = useToast();

  // OCR Mutation
  const ocrMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('document', file);
      
      const response = await fetch('/api/docs/ocr', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        let errorMessage = 'OCR processing failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || response.statusText || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setOcrResult(data);
      setShowFullText(false); // Reset text expansion state
      toast({
        title: t('docTools.ocrComplete'),
        description: t('docTools.ocrSuccessMessage')
      });
    },
    onError: (error) => {
      toast({
        title: t('docTools.ocrFailed'),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Mapping Mutation
  const mappingMutation = useMutation({
    mutationFn: async ({ text, target }) => {
      const response = await fetch('/api/docs/map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, target })
      });
      
      if (!response.ok) {
        let errorMessage = 'Mapping failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || response.statusText || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setMappingResult(data);
      toast({
        title: t('docTools.mappingComplete'),
        description: t('docTools.mappingSuccessMessage', { count: data.mappings?.fields?.length || 0 })
      });
    },
    onError: (error) => {
      toast({
        title: t('docTools.mappingFailed'),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Apply to Case Mutation
  const applyToCaseMutation = useMutation({
    mutationFn: async ({ caseId, target, fields }) => {
      const response = await fetch(`/api/cases/${caseId}/portal/drafts/${target.toLowerCase()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields })
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to apply to case';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || response.statusText || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: t('docTools.appliedToCase'),
        description: t('docTools.appliedToCaseMessage', { caseId })
      });
    },
    onError: (error) => {
      toast({
        title: t('docTools.applyFailed'),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Explanation Mutation
  const explanationMutation = useMutation({
    mutationFn: async (step) => {
      const response = await fetch('/api/docs/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ step })
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to fetch explanation';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || response.statusText || errorMessage;
        } catch {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setExplanation(data);
      toast({
        title: t('docTools.explanationLoaded'),
        description: t('docTools.explanationLoadedMessage', { title: data.explanation.title })
      });
    },
    onError: (error) => {
      toast({
        title: t('docTools.explanationFailed'),
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setOcrResult(null);
      setMappingResult(null);
    }
  };

  const handleOCR = () => {
    if (!selectedFile) {
      toast({
        title: t('docTools.noFileSelected'),
        description: t('docTools.noFileSelectedMessage'),
        variant: "destructive"
      });
      return;
    }
    
    ocrMutation.mutate(selectedFile);
  };

  const handleMapping = (target) => {
    if (!ocrResult?.ocr?.text) {
      toast({
        title: t('docTools.noTextAvailable'),
        description: t('docTools.noTextAvailableMessage'),
        variant: "destructive"
      });
      return;
    }
    
    mappingMutation.mutate({ text: ocrResult.ocr.text, target });
  };

  const handleExplanationRequest = () => {
    if (!selectedProcess) {
      toast({
        title: t('docTools.noProcessSelected'),
        description: t('docTools.noProcessSelectedMessage'),
        variant: "destructive"
      });
      return;
    }
    
    explanationMutation.mutate(selectedProcess);
  };

  const handleApplyToCase = () => {
    if (!mappingResult?.mappings?.fields || mappingResult.mappings.fields.length === 0) {
      toast({
        title: "No Mapping Data",
        description: "Please run field mapping first to generate data.",
        variant: "destructive"
      });
      return;
    }
    
    if (!caseId) {
      toast({
        title: "No Case ID",
        description: "Case ID is required to apply mapping data.",
        variant: "destructive"
      });
      return;
    }
    
    applyToCaseMutation.mutate({
      caseId: caseId,
      target: mappingResult.target,
      fields: mappingResult.mappings.fields
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard."
    });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'bg-green-500';
    if (confidence >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card data-testid="doc-tools">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('docTools.title', { caseId })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Section */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="document-upload">{t('docTools.uploadDocument')}</Label>
            <Input
              id="document-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.tiff,.doc,.docx"
              onChange={handleFileUpload}
              data-testid="input-file-upload"
            />
          </div>
          
          {selectedFile && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{selectedFile.name}</span>
              <Badge variant="secondary">{(selectedFile.size / 1024).toFixed(1)} KB</Badge>
            </div>
          )}
          
          <Button 
            onClick={handleOCR} 
            disabled={!selectedFile || ocrMutation.isPending}
            data-testid="button-ocr"
          >
            {ocrMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                {t('docTools.processingOCR')}
              </>
            ) : (
              <>
                <Scan className="h-4 w-4 mr-2" />
                {t('docTools.extractText')}
              </>
            )}
          </Button>
        </div>

        {/* OCR Results */}
        {ocrResult && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-medium">{t('docTools.ocrResults')}</span>
              <Badge>{ocrResult.ocr.language}</Badge>
            </div>
            
            <div className="relative">
              {(() => {
                const fullText = ocrResult.ocr.text;
                const isLongText = fullText.length > 2000;
                const displayText = showFullText || !isLongText ? fullText : fullText.substring(0, 2000);
                
                return (
                  <>
                    <Textarea
                      value={displayText}
                      readOnly
                      className="min-h-32"
                      data-testid="textarea-ocr-result"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(ocrResult.ocr.text)}
                        data-testid="button-copy-ocr"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    {isLongText && (
                      <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          {showFullText ? 
                            t('docTools.showingFullText', { count: fullText.length.toLocaleString() }) : 
                            t('docTools.showingPartialText', { count: fullText.length.toLocaleString() })
                          }
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setShowFullText(!showFullText)}
                          data-testid="button-toggle-text"
                        >
                          {showFullText ? t('buttons.showLess') : t('buttons.showMore')}
                        </Button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Mapping Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={() => handleMapping('POA')}
                disabled={mappingMutation.isPending}
                data-testid="button-map-poa"
              >
                {mappingMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <MapPin className="h-4 w-4 mr-2" />
                )}
                {t('docTools.mapToPOA')}
              </Button>
              <Button 
                onClick={() => handleMapping('OBY')}
                disabled={mappingMutation.isPending}
                data-testid="button-map-oby"
              >
                {mappingMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <MapPin className="h-4 w-4 mr-2" />
                )}
                {t('docTools.mapToOBY')}
              </Button>
            </div>
          </div>
        )}

        {/* Mapping Results */}
        {mappingResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-medium">{mappingResult.target} Field Mapping Results</span>
                <Badge variant="secondary">{mappingResult.totalMatches} matches</Badge>
              </div>
              
              {/* Apply to Case Button */}
              <Button 
                onClick={handleApplyToCase}
                disabled={applyToCaseMutation.isPending || !mappingResult.mappings?.fields?.length}
                variant="default"
                data-testid="button-apply-to-case"
              >
                {applyToCaseMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('docTools.applying')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('docTools.applyToCase')}
                  </>
                )}
              </Button>
            </div>
            
            <div className="space-y-3">
              {mappingResult.mappings?.fields && mappingResult.mappings.fields.length > 0 ? (
                mappingResult.mappings.fields.map((field, index) => (
                  <div 
                    key={index} 
                    className="p-3 border rounded-md space-y-2"
                    data-testid={`mapping-field-${index}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{field.code}</Badge>
                        <span className="font-medium text-sm">Extracted Value</span>
                      </div>
                      <Badge className={`${getConfidenceColor(field.confidence)} text-white`}>
                        {field.confidence}%
                      </Badge>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium">Value: </span>
                      <span className="font-mono bg-muted px-1 rounded">{field.value}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  {t('docTools.noFieldMatches')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Process Explanations */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span className="font-medium">{t('docTools.processExplanations')}</span>
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedProcess} onValueChange={setSelectedProcess}>
              <SelectTrigger data-testid="select-process">
                <SelectValue placeholder={t('docTools.selectProcess')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="umiejscowienie">Umiejscowienie (Record Locating)</SelectItem>
                <SelectItem value="uzupelnienie">Uzupełnienie (Document Completion)</SelectItem>
                <SelectItem value="obywatelstwo">Obywatelstwo (Citizenship Process)</SelectItem>
                <SelectItem value="sprostowanie">Sprostowanie (Record Corrections)</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleExplanationRequest}
              disabled={!selectedProcess || explanationMutation.isPending}
              data-testid="button-get-explanation"
            >
              {explanationMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Eye className="h-4 w-4 mr-2" />
              )}
              {t('docTools.getExplanation')}
            </Button>
          </div>
        </div>

        {/* Explanation Results */}
        {explanation && (
          <div className="space-y-4 p-4 bg-muted rounded-md">
            <h3 className="font-bold text-lg">{explanation.explanation.title}</h3>
            <p className="text-sm">{explanation.explanation.description}</p>
            
            <div className="space-y-3">
              <div>
                <h4 className="font-medium mb-2">Process Details:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {explanation.explanation.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Typical Timeframe:</h4>
                  <p className="text-sm text-blue-600">{explanation.explanation.timeframe}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Requirements:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {explanation.explanation.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}