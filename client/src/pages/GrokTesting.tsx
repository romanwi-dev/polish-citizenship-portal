import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Loader2, Sparkles, Eye, FileText, MessageSquare } from "lucide-react";

interface GrokResponse {
  success: boolean;
  message?: string;
  response?: string;
  analysis?: string;
  content?: string;
  model?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  models?: string[];
}

export default function GrokTesting() {
  const [testResult, setTestResult] = useState<GrokResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [chatResponse, setChatResponse] = useState<GrokResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentAnalysis, setDocumentAnalysis] = useState<GrokResponse | null>(null);
  const [contentType, setContentType] = useState('');
  const [contentRequirements, setContentRequirements] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GrokResponse | null>(null);

  const testGrokConnection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/grok/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      setTestResult({
        success: false,
        message: `Connection failed: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const askGrokAdvice = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/grok/citizenship-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          context: { testingMode: true }
        })
      });
      const data = await response.json();
      setChatResponse(data);
    } catch (error) {
      setChatResponse({
        success: false,
        message: `Failed to get advice: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeDocument = async () => {
    if (!selectedFile) return;
    
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('documentType', 'passport');
    
    try {
      const response = await fetch('/api/grok/analyze-document', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setDocumentAnalysis(data);
    } catch (error) {
      setDocumentAnalysis({
        success: false,
        message: `Analysis failed: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateContent = async () => {
    if (!contentType.trim() || !contentRequirements.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/grok/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType,
          requirements: contentRequirements
        })
      });
      const data = await response.json();
      setGeneratedContent(data);
    } catch (error) {
      setGeneratedContent({
        success: false,
        message: `Generation failed: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ResultCard = ({ result, title }: { result: GrokResponse | null, title: string }) => {
    if (!result) return null;
    
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600" />
            )}
            {title} Result
          </CardTitle>
          {result.model && (
            <CardDescription>
              Model: <Badge variant="secondary">{result.model}</Badge>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-mono">
                {result.message || result.response || result.analysis || result.content}
              </p>
            </div>
            
            {result.usage && (
              <div className="text-xs text-gray-600">
                <p>Token Usage: {result.usage.totalTokens} total ({result.usage.promptTokens} prompt + {result.usage.completionTokens} completion)</p>
              </div>
            )}
            
            {result.models && (
              <div>
                <p className="text-sm font-semibold mb-2">Available Models:</p>
                <div className="flex flex-wrap gap-1">
                  {result.models.map(model => (
                    <Badge key={model} variant="outline">{model}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-8 w-8 text-blue-600" />
          Grok AI Integration Testing
        </h1>
        <p className="text-gray-600">
          Test your xAI Grok integration with various capabilities including text generation, image analysis, and citizenship advice.
        </p>
      </div>

      <Tabs defaultValue="connection" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connection">Connection Test</TabsTrigger>
          <TabsTrigger value="chat">Citizenship Advice</TabsTrigger>
          <TabsTrigger value="vision">Document Analysis</TabsTrigger>
          <TabsTrigger value="content">Content Generation</TabsTrigger>
        </TabsList>

        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Connection Test
              </CardTitle>
              <CardDescription>
                Test your Grok API connection and verify available models.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={testGrokConnection} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Test Grok Connection
              </Button>
              
              <ResultCard result={testResult} title="Connection Test" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Citizenship Advice
              </CardTitle>
              <CardDescription>
                Ask Grok questions about Polish citizenship by descent.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  placeholder="Ask about Polish citizenship requirements, documents, etc."
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && askGrokAdvice()}
                />
              </div>
              
              <Button 
                onClick={askGrokAdvice} 
                disabled={isLoading || !question.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <MessageSquare className="h-4 w-4 mr-2" />
                )}
                Get Grok Advice
              </Button>
              
              <ResultCard result={chatResponse} title="Citizenship Advice" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vision">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Document Analysis
              </CardTitle>
              <CardDescription>
                Upload an image or document for Grok Vision analysis.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)}KB)
                  </p>
                )}
              </div>
              
              <Button 
                onClick={analyzeDocument} 
                disabled={isLoading || !selectedFile}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Analyze with Grok Vision
              </Button>
              
              <ResultCard result={documentAnalysis} title="Document Analysis" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Generation
              </CardTitle>
              <CardDescription>
                Generate creative content for your platform using Grok.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  placeholder="Content type (e.g., blog post, FAQ, marketing copy)"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                />
              </div>
              
              <div>
                <Textarea
                  placeholder="Describe the requirements for the content..."
                  value={contentRequirements}
                  onChange={(e) => setContentRequirements(e.target.value)}
                  rows={3}
                />
              </div>
              
              <Button 
                onClick={generateContent} 
                disabled={isLoading || !contentType.trim() || !contentRequirements.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                Generate Content with Grok
              </Button>
              
              <ResultCard result={generatedContent} title="Generated Content" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}