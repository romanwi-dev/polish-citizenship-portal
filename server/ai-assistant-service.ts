import OpenAI from "openai";
import { GrokAIService } from './grok-ai-service';

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AIAssistantRequest {
  message: string;
  currentStep: number;
  completedSteps: number[];
  dashboardData: {
    processedDocuments?: any[];
    clientData?: any;
    familyTreeData?: any;
    generatedPDFs?: any[];
  };
  context: string;
}

export interface AIAssistantResponse {
  message: string;
  suggestions?: string[];
  actionable?: {
    type: 'navigate' | 'highlight' | 'help';
    target?: string;
  };
}

export class AIAssistantService {
  /**
   * Process query with multiple AI providers (OpenAI, Grok)
   */
  static async processWithGrok(request: AIAssistantRequest): Promise<AIAssistantResponse> {
    try {
      const grokResponse = await GrokAIService.getCitizenshipAdvice(
        request.message,
        {
          currentStep: request.currentStep,
          completedSteps: request.completedSteps,
          dashboardData: request.dashboardData
        }
      );

      return {
        message: grokResponse.message,
        suggestions: [
          "Tell me more about this step",
          "What are the requirements?",
          "How does this affect my application?"
        ]
      };
    } catch (error) {
      console.error('Grok AI service error:', error);
      // Fallback to OpenAI
      return this.processUserQuery(request);
    }
  }

  /**
   * Processes user questions and provides contextual assistance
   */
  static async processUserQuery(request: AIAssistantRequest): Promise<AIAssistantResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(request);
      const userContext = this.buildUserContext(request);

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user", 
            content: `${userContext}\n\nUser question: ${request.message}`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000,
        temperature: 0.7
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        message: aiResponse.message || "I understand your question. Let me help you with that.",
        suggestions: aiResponse.suggestions || [],
        actionable: aiResponse.actionable
      };

    } catch (error) {
      console.error('AI Assistant service error:', error);
      return this.getFallbackResponse(request);
    }
  }

  /**
   * Builds comprehensive system prompt for the AI assistant
   */
  private static buildSystemPrompt(request: AIAssistantRequest): string {
    return `You are an expert AI assistant for Polish citizenship by descent applications. You help users navigate a 4-step dashboard process:

STEP 1: Document Processing
- Users upload main applicant documents (birth certificates, passports, marriage certificates)
- OCR extracts data, translates to Polish, matches PDF templates
- Documents automatically populate forms

STEP 2: Client Details  
- Personal information form for the main applicant
- Polish naming conventions: First names capitalized, surnames ALL CAPS
- Data syncs with Family Tree section

STEP 3: Family Tree
- 4-generation genealogy: YOU → PARENT → GRANDPARENTS → GREAT GRANDPARENTS  
- Polish parent marked in red (bloodline tracking)
- Real-time sync with Client Details

STEP 4: Generate Documents
- Creates legal PDFs: Power of Attorney, Family Tree, etc.
- Uses actual PDF templates for Polish authorities

KEY PRINCIPLES:
- Documents are ALWAYS the source of truth - they override manual input
- Polish naming conventions are critical for legal compliance
- Bloodline tracking determines citizenship eligibility
- All 4 generations may be needed for complete application

Your responses should be:
- Helpful and encouraging
- Technically accurate about Polish citizenship law
- Specific to the current step and user's progress
- Include actionable advice when possible

Always respond in JSON format:
{
  "message": "Your helpful response",
  "suggestions": ["Follow-up question 1", "Follow-up question 2"],
  "actionable": {
    "type": "navigate|highlight|help",
    "target": "specific-section-or-field"
  }
}`;
  }

  /**
   * Builds user context for personalized assistance
   */
  private static buildUserContext(request: AIAssistantRequest): string {
    const { currentStep, completedSteps, dashboardData } = request;
    
    let context = `Current Status:
- User is on Step ${currentStep}/4
- Completed steps: [${completedSteps.join(', ')}]`;

    // Add specific data context
    if (dashboardData.processedDocuments?.length) {
      context += `\n- Has processed ${dashboardData.processedDocuments.length} documents`;
    }

    if (dashboardData.clientData) {
      const clientFields = Object.keys(dashboardData.clientData).length;
      context += `\n- Client Details form has ${clientFields} fields filled`;
    }

    if (dashboardData.familyTreeData) {
      const treeFields = Object.keys(dashboardData.familyTreeData).length;
      context += `\n- Family Tree has ${treeFields} fields filled`;
    }

    if (dashboardData.generatedPDFs?.length) {
      context += `\n- Has generated ${dashboardData.generatedPDFs.length} PDF documents`;
    }

    return context;
  }

  /**
   * Provides fallback responses when AI service is unavailable
   */
  private static getFallbackResponse(request: AIAssistantRequest): AIAssistantResponse {
    const { currentStep } = request;
    
    const fallbackResponses = {
      1: {
        message: "For Document Processing, upload your birth certificate, passport, and parents' marriage certificate. The system will automatically extract and translate the information.",
        suggestions: [
          "What documents are required?",
          "How does OCR translation work?",
          "Can I upload multiple documents?"
        ]
      },
      2: {
        message: "In Client Details, fill in your personal information. Remember to use Polish naming conventions: first names with capital first letters, surnames in ALL CAPS.",
        suggestions: [
          "How should I format Polish names?",
          "What if I have multiple citizenships?",
          "How does data sync with Family Tree?"
        ]
      },
      3: {
        message: "The Family Tree tracks 4 generations to establish your Polish bloodline. Mark your Polish parent/grandparent in red - this determines your eligibility.",
        suggestions: [
          "How do I identify the Polish bloodline?",
          "What if I'm missing some family information?",
          "Which generation do I need for eligibility?"
        ]
      },
      4: {
        message: "Document Generation creates official PDFs for Polish authorities, including Power of Attorney forms and genealogical trees using your completed data.",
        suggestions: [
          "What documents will be created?",
          "How do I use the Power of Attorney?",
          "What are the next steps after generation?"
        ]
      }
    };

    return fallbackResponses[currentStep as keyof typeof fallbackResponses] || {
      message: "I'm here to help with your Polish citizenship application. Please ask me about any step in the process!",
      suggestions: ["What do I need to do next?", "How does this process work?"]
    };
  }

  /**
   * Gets contextual help suggestions based on current step and progress
   */
  static getContextualSuggestions(currentStep: number, completedSteps: number[]): string[] {
    const suggestions = [];
    
    if (currentStep === 1) {
      suggestions.push(
        "What documents do I need to upload?",
        "How does the document processing work?",
        "Can I upload documents in different languages?",
        "What happens after document upload?"
      );
    }
    
    if (currentStep === 2) {
      suggestions.push(
        "How should I format Polish names?",
        "What if I don't know my exact birth place?",
        "How do I handle multiple citizenships?",
        "Why does my data sync with Family Tree?"
      );
    }
    
    if (currentStep === 3) {
      suggestions.push(
        "How far back do I need to trace my family tree?",
        "What if I don't have information about great grandparents?",
        "Which parent should be marked as Polish?",
        "How do I establish the bloodline connection?"
      );
    }
    
    if (currentStep === 4) {
      suggestions.push(
        "What documents will be generated?",
        "How do I use the Power of Attorney forms?",
        "What are the next steps after document generation?",
        "Can I modify the documents after generation?"
      );
    }

    return suggestions;
  }
}