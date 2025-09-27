import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

// Voice Assistant Input Component for Polish Citizenship Forms
export function VoiceAssistant({ onResult, field, placeholder = "Click to speak..." }) {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const recognitionRef = useRef(null);

  // Check if Web Speech API is supported
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US'; // Can be switched to 'pl-PL' for Polish
      recognitionRef.current.maxAlternatives = 3;
      
      // Event handlers
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        toast({
          title: "Listening...",
          description: "Speak clearly into your microphone",
        });
      };
      
      recognitionRef.current.onresult = (event) => {
        const result = event.results[event.results.length - 1];
        const spokenText = result[0].transcript;
        const confidenceLevel = result[0].confidence;
        
        setTranscript(spokenText);
        setConfidence(confidenceLevel);
        
        // Only process final results with reasonable confidence
        if (result.isFinal && confidenceLevel > 0.6) {
          const validatedText = validateAndCleanInput(spokenText, field);
          if (validatedText) {
            onResult(validatedText);
            toast({
              title: "Voice input accepted",
              description: `"${validatedText}" has been entered`,
            });
          } else {
            toast({
              title: "Input not recognized",
              description: "Please try speaking more clearly or type manually",
              variant: "destructive",
            });
          }
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        let errorMessage = "Voice input failed";
        switch (event.error) {
          case 'network':
            errorMessage = "Network connection required for voice input";
            break;
          case 'not-allowed':
            errorMessage = "Microphone access denied. Please allow microphone permissions.";
            break;
          case 'no-speech':
            errorMessage = "No speech detected. Please try again.";
            break;
          default:
            errorMessage = `Voice input error: ${event.error}`;
        }
        
        toast({
          title: "Voice Input Error",
          description: errorMessage,
          variant: "destructive",
        });
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [field, onResult, toast]);

  // Validate and clean input based on field type
  const validateAndCleanInput = (text, fieldType) => {
    const cleaned = text.trim().toLowerCase();
    
    switch (fieldType) {
      case 'name':
        // Names should only contain letters, spaces, and common name characters
        const namePattern = /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-\'\.]{2,50}$/;
        const capitalizedName = text.trim().replace(/\b\w/g, l => l.toUpperCase());
        return namePattern.test(capitalizedName) ? capitalizedName : null;
        
      case 'email':
        // Basic email validation from speech
        const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
        const emailMatch = text.match(emailPattern);
        return emailMatch ? emailMatch[0].toLowerCase() : null;
        
      case 'phone':
        // Extract numbers from speech
        const phoneNumbers = text.replace(/\D/g, '');
        return phoneNumbers.length >= 9 ? phoneNumbers : null;
        
      case 'date':
        // Simple date recognition (month day year)
        const datePattern = /(\d{1,2})[\/\-\s](\d{1,2})[\/\-\s](\d{4})/;
        const dateMatch = text.match(datePattern);
        if (dateMatch) {
          const [, month, day, year] = dateMatch;
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return null;
        
      case 'address':
        // Addresses can contain various characters
        const addressPattern = /^[a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\,\.\-\/]{5,200}$/;
        const capitalizedAddress = text.trim().replace(/\b\w/g, l => l.toUpperCase());
        return addressPattern.test(capitalizedAddress) ? capitalizedAddress : null;
        
      case 'city':
        // City names should only contain letters and basic punctuation
        const cityPattern = /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-\'\.]{2,50}$/;
        const capitalizedCity = text.trim().replace(/\b\w/g, l => l.toUpperCase());
        return cityPattern.test(capitalizedCity) ? capitalizedCity : null;
        
      case 'country':
        // Country names validation
        const countryPattern = /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\-\'\.]{2,50}$/;
        const capitalizedCountry = text.trim().replace(/\b\w/g, l => l.toUpperCase());
        return countryPattern.test(capitalizedCountry) ? capitalizedCountry : null;
        
      default:
        // General text validation - remove excessive whitespace and basic cleanup
        const generalPattern = /^[a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s\,\.\-\!\/]{1,500}$/;
        const cleanedText = text.trim().replace(/\s+/g, ' ');
        return generalPattern.test(cleanedText) ? cleanedText : null;
    }
  };

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setConfidence(0);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <VolumeX className="h-4 w-4" />
        <span>Voice input not supported in this browser</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2" data-testid="voice-assistant">
      <Button
        type="button"
        variant={isListening ? "destructive" : "outline"}
        size="sm"
        onClick={isListening ? stopListening : startListening}
        className="min-w-[120px] transition-all duration-200"
        data-testid="button-voice-input"
      >
        {isListening ? (
          <>
            <MicOff className="h-4 w-4 mr-2" />
            Stop
          </>
        ) : (
          <>
            <Mic className="h-4 w-4 mr-2" />
            Speak
          </>
        )}
      </Button>
      
      {isListening && (
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-gray-600 dark:text-gray-300">Listening...</span>
        </div>
      )}
      
      {transcript && (
        <div className="flex items-center gap-2 text-sm">
          {confidence > 0.8 ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : confidence > 0.6 ? (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <span className="text-gray-600 dark:text-gray-300 max-w-[200px] truncate">
            "{transcript}"
          </span>
          <span className="text-xs text-gray-400">
            {Math.round(confidence * 100)}%
          </span>
        </div>
      )}
    </div>
  );
}

// Enhanced Form Field with Voice Input
export function VoiceEnabledInput({ 
  type = "text", 
  field, 
  value, 
  onChange, 
  placeholder,
  className = "",
  ...props 
}) {
  const handleVoiceResult = (voiceText) => {
    onChange({ target: { value: voiceText } });
  };

  return (
    <div className="voice-enabled-input-wrapper">
      <div className="flex gap-2 items-center">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`flex-1 ${className}`}
          data-testid={`input-${field}`}
          {...props}
        />
        <VoiceAssistant 
          onResult={handleVoiceResult}
          field={field}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

export default VoiceAssistant;