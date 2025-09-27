import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2, 
  HelpCircle,
  FileText,
  Users,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mic,
  MicOff,
  Volume2
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface AIDashboardAssistantProps {
  currentStep?: number;
  completedSteps?: number[];
  dashboardData?: {
    processedDocuments?: any[];
    clientData?: any;
    familyTreeData?: any;
    generatedPDFs?: any[];
  };
}

export function AIDashboardAssistant({ 
  currentStep = 1, 
  completedSteps = [],
  dashboardData = {}
}: AIDashboardAssistantProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initial welcome message based on current state
  useEffect(() => {
    const welcomeMessage = generateWelcomeMessage(currentStep, completedSteps);
    setMessages([{
      id: '1',
      type: 'system',
      content: welcomeMessage,
      timestamp: new Date()
    }]);
  }, [currentStep, completedSteps]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateWelcomeMessage = (step: number, completed: number[]): string => {
    const stepNames = {
      1: t('caseDetail.documents'),
      2: t('caseDetail.clientInfo'), 
      3: t('tree.title'),
      4: t('docTools.processDocument')
    };

    if (completed.includes(4)) {
      return t('aiAssistant.congratulations');
    }

    const currentStepName = stepNames[step as keyof typeof stepNames] || t('common.loading');
    const completedCount = completed.length;

    return `${t('aiAssistant.welcome')} ${t('aiAssistant.currentStep', { step, stepName: currentStepName })} ${t('aiAssistant.completedSteps', { count: completedCount })} 

${t('aiAssistant.canHelp')}
• ${t('aiAssistant.helpOptions.documents')}
• ${t('aiAssistant.helpOptions.forms')}
• ${t('aiAssistant.helpOptions.naming')}
• ${t('aiAssistant.helpOptions.troubleshooting')}
• ${t('aiAssistant.helpOptions.process')}

${t('aiAssistant.howCanIHelp')}`;
  };

  const getContextualHelp = (): string[] => {
    const suggestions: string[] = [];
    
    if (currentStep === 1) {
      suggestions.push(t('aiAssistant.suggestions.step1.documents'));
      suggestions.push(t('aiAssistant.suggestions.step1.processing'));
      suggestions.push(t('aiAssistant.suggestions.step1.languages'));
    }
    
    if (currentStep === 2) {
      suggestions.push(t('aiAssistant.suggestions.step2.naming'));
      suggestions.push(t('aiAssistant.suggestions.step2.birthPlace'));
      suggestions.push(t('aiAssistant.suggestions.step2.citizenship'));
    }
    
    if (currentStep === 3) {
      suggestions.push(t('aiAssistant.suggestions.step3.family'));
      suggestions.push(t('aiAssistant.suggestions.step3.missingInfo'));
      suggestions.push(t('aiAssistant.suggestions.step3.polishParent'));
    }
    
    if (currentStep === 4) {
      suggestions.push(t('aiAssistant.suggestions.step4.documents'));
      suggestions.push(t('aiAssistant.suggestions.step4.poa'));
      suggestions.push(t('aiAssistant.suggestions.step4.nextSteps'));
    }

    return suggestions;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      type: 'assistant',
      content: t('aiAssistant.thinking'),
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Send message to AI assistant API
      const response = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage.trim(),
          currentStep,
          completedSteps,
          dashboardData,
          context: 'polish-citizenship-dashboard'
        })
      });

      if (!response.ok) {
        throw new Error(t('aiAssistant.error'));
      }

      const aiResponse = await response.json();

      // Remove typing indicator and add real response
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      const assistantMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: aiResponse.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('AI Assistant error:', error);
      
      // Remove typing indicator and show error
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: t('aiAssistant.error'),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Voice recognition setup with Polish language support
  const initVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      
      // Auto-detect language preference for speech recognition
      const currentLanguage = localStorage.getItem('preferred-language') || 
                              (navigator.language?.toLowerCase().startsWith('pl') ? 'pl' : 'en');
      recognition.lang = currentLanguage === 'pl' ? 'pl-PL' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  };

  const startVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    } else {
      initVoiceRecognition();
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Set voice language based on user preference
      const currentLanguage = localStorage.getItem('preferred-language') || 
                              (navigator.language?.toLowerCase().startsWith('pl') ? 'pl' : 'en');
      utterance.lang = currentLanguage === 'pl' ? 'pl-PL' : 'en-US';
      
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    initVoiceRecognition();
  }, []);

  if (isMinimized) {
    return (
      <div className="hidden">
        <Button
          onClick={() => setIsMinimized(false)}
          className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <Bot className="h-6 w-6 text-white" />
        </Button>
      </div>
    );
  }

  return (
    <div className="hidden">
      <Card className="h-full flex flex-col shadow-2xl border-2 border-blue-200">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Assistant
            </CardTitle>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                Step {currentStep}/4
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(true)}
                className="h-8 w-8 p-0 hover:bg-blue-500"
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-2 max-w-[85%] ${
                    message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : message.type === 'system'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-white'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : message.type === 'system' ? (
                        <HelpCircle className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    
                    <div className={`rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.type === 'system'
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {message.isTyping ? (
                        <div className="flex items-center gap-1">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Thinking...</span>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                      <p className={`text-xs mt-1 opacity-70`}>
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Quick Suggestions */}
          {!isLoading && messages.length <= 2 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <p className="text-xs text-gray-600 mb-2">{t('common.help')}:</p>
              <div className="flex flex-wrap gap-1">
                {getContextualHelp().slice(0, 2).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('aiAssistant.typePlaceholder')}
                className="flex-1 text-base h-10 bg-gray-50 border-gray-200 focus:border-blue-400"
                disabled={isLoading}
              />
              <Button
                onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                disabled={isLoading}
                variant={isListening ? "destructive" : "outline"}
                size="sm"
                className="h-10 w-10 p-0"
                title={isListening ? t('aiAssistant.listening') : t('aiAssistant.voiceMode')}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 h-10 px-4"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {/* Voice controls */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="voice-responses"
                  checked={isVoiceMode}
                  onChange={(e) => setIsVoiceMode(e.target.checked)}
                  className="rounded w-3 h-3"
                />
                <label htmlFor="voice-responses" className="flex items-center gap-1 cursor-pointer">
                  <Volume2 className="h-3 w-3" />
                  {t('aiAssistant.voiceMode')}
                </label>
              </div>
              {isListening && (
                <span className="text-blue-600 animate-pulse">🎤 {t('aiAssistant.listening')}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}