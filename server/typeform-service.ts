import { z } from 'zod';

// TypeForm API response schemas
const TypeFormFieldSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  ref: z.string().optional(),
  properties: z.object({}).optional(),
});

const TypeFormFormSchema = z.object({
  id: z.string(),
  title: z.string(),
  workspace: z.object({
    href: z.string(),
  }).optional(),
  theme: z.object({
    href: z.string(),
  }).optional(),
  _links: z.object({
    display: z.string(),
  }).optional(),
  fields: z.array(TypeFormFieldSchema).optional(),
});

const TypeFormResponseAnswerSchema = z.object({
  field: z.object({
    id: z.string(),
    type: z.string(),
    ref: z.string().optional(),
  }),
  type: z.string(),
  text: z.string().optional(),
  email: z.string().optional(),
  number: z.number().optional(),
  boolean: z.boolean().optional(),
  choice: z.object({
    label: z.string().optional(),
  }).optional(),
  choices: z.object({
    labels: z.array(z.string()),
  }).optional(),
});

const TypeFormResponseSchema = z.object({
  landing_id: z.string(),
  token: z.string(),
  response_id: z.string(),
  landed_at: z.string(),
  submitted_at: z.string(),
  answers: z.array(TypeFormResponseAnswerSchema).optional(),
  calculated: z.object({
    score: z.number(),
  }).optional(),
});

const TypeFormResponsesSchema = z.object({
  total_items: z.number(),
  page_count: z.number(),
  items: z.array(TypeFormResponseSchema),
});

export type TypeFormForm = z.infer<typeof TypeFormFormSchema>;
export type TypeFormResponse = z.infer<typeof TypeFormResponseSchema>;
export type TypeFormResponses = z.infer<typeof TypeFormResponsesSchema>;

export class TypeFormService {
  private baseUrl = 'https://api.typeform.com';
  private accessToken: string;

  constructor() {
    this.accessToken = process.env.TYPEFORM_ACCESS_TOKEN || '';
    if (!this.accessToken) {
      throw new Error('TYPEFORM_ACCESS_TOKEN environment variable is required');
    }
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`TypeForm API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Get all forms from TypeForm workspace
  async getForms(): Promise<TypeFormForm[]> {
    try {
      const data = await this.makeRequest('/forms?page_size=200');
      const validatedData = z.object({
        total_items: z.number(),
        page_count: z.number(),
        items: z.array(TypeFormFormSchema),
      }).parse(data);
      
      return validatedData.items;
    } catch (error) {
      console.error('Error fetching TypeForm forms:', error);
      throw error;
    }
  }

  // Get specific form details
  async getForm(formId: string): Promise<TypeFormForm> {
    try {
      const data = await this.makeRequest(`/forms/${formId}`);
      return TypeFormFormSchema.parse(data);
    } catch (error) {
      console.error(`Error fetching TypeForm form ${formId}:`, error);
      throw error;
    }
  }

  // Get responses for a specific form
  async getFormResponses(formId: string, options: {
    page_size?: number;
    since?: string;
    until?: string;
    completed?: boolean;
  } = {}): Promise<TypeFormResponses> {
    try {
      const params = new URLSearchParams({
        page_size: (options.page_size || 25).toString(),
        completed: (options.completed !== false).toString(),
        ...(options.since && { since: options.since }),
        ...(options.until && { until: options.until }),
      });

      const data = await this.makeRequest(`/forms/${formId}/responses?${params}`);
      return TypeFormResponsesSchema.parse(data);
    } catch (error) {
      console.error(`Error fetching responses for form ${formId}:`, error);
      throw error;
    }
  }

  // Analyze Polish Citizenship Test eligibility
  analyzeEligibilityFromResponse(response: TypeFormResponse): {
    eligibilityScore: number;
    eligibilityLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';
    recommendations: string[];
    documentRequirements: string[];
    estimatedTimeframe: string;
  } {
    const answers = response.answers || [];
    let eligibilityScore = 0;
    const recommendations: string[] = [];
    const documentRequirements: string[] = [];
    let estimatedTimeframe = '12-24 months';

    // Check for calculated score from TypeForm
    if (response.calculated?.score) {
      eligibilityScore = response.calculated.score;
    } else {
      // Fallback: analyze answers for Polish citizenship indicators
      answers.forEach(answer => {
        // Polish ancestor indicators
        if (answer.text?.toLowerCase().includes('poland') || 
            answer.text?.toLowerCase().includes('polish') ||
            answer.choice?.label?.toLowerCase().includes('poland')) {
          eligibilityScore += 25;
        }

        // Birth before 1951 indicator (high eligibility)
        if (answer.text?.includes('1951') || answer.text?.includes('1950') || 
            answer.text?.includes('194')) {
          eligibilityScore += 30;
        }

        // Document availability
        if (answer.choice?.label?.toLowerCase().includes('birth certificate') ||
            answer.choice?.label?.toLowerCase().includes('passport')) {
          eligibilityScore += 15;
        }

        // Multiple Polish ancestors
        if (answer.choices?.labels?.some(label => 
            label.toLowerCase().includes('grandfather') || 
            label.toLowerCase().includes('grandmother'))) {
          eligibilityScore += 20;
        }
      });
    }

    // Determine eligibility level
    let eligibilityLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';
    if (eligibilityScore >= 80) {
      eligibilityLevel = 'HIGH';
      estimatedTimeframe = '6-12 months';
      recommendations.push('Excellent chance of success');
      recommendations.push('Begin document collection immediately');
    } else if (eligibilityScore >= 60) {
      eligibilityLevel = 'MEDIUM';
      estimatedTimeframe = '9-18 months';
      recommendations.push('Good prospects with proper documentation');
      recommendations.push('Additional research may be beneficial');
    } else if (eligibilityScore >= 40) {
      eligibilityLevel = 'LOW';
      estimatedTimeframe = '12-24 months';
      recommendations.push('Challenging case requiring extensive documentation');
      recommendations.push('Consider professional genealogical research');
    } else {
      eligibilityLevel = 'VERY_LOW';
      estimatedTimeframe = '18-36 months';
      recommendations.push('Significant challenges identified');
      recommendations.push('Comprehensive legal consultation recommended');
    }

    // Standard document requirements
    documentRequirements.push('Polish ancestor birth certificate');
    documentRequirements.push('Polish ancestor passport or citizenship proof');
    documentRequirements.push('Your birth certificate');
    documentRequirements.push('Parent birth certificates');
    
    if (eligibilityLevel === 'MEDIUM' || eligibilityLevel === 'LOW') {
      documentRequirements.push('Marriage certificates for family chain');
      documentRequirements.push('Death certificates if applicable');
    }

    if (eligibilityLevel === 'LOW' || eligibilityLevel === 'VERY_LOW') {
      documentRequirements.push('Additional genealogical research');
      documentRequirements.push('Historical records from Polish archives');
    }

    return {
      eligibilityScore: Math.min(100, Math.max(0, eligibilityScore)),
      eligibilityLevel,
      recommendations,
      documentRequirements,
      estimatedTimeframe,
    };
  }

  // Find Polish Citizenship Test form (by title matching)
  async findPolishCitizenshipTestForm(): Promise<TypeFormForm | null> {
    try {
      const forms = await this.getForms();
      return forms.find(form => 
        form.title.toLowerCase().includes('polish') && 
        form.title.toLowerCase().includes('citizenship')
      ) || null;
    } catch (error) {
      console.error('Error finding Polish Citizenship Test form:', error);
      return null;
    }
  }

  // Extract client details from TypeForm response
  extractClientDetails(response: TypeFormResponse): {
    fullName: string;
    email: string;
    submissionDate: string;
    responseId: string;
  } {
    const answers = response.answers || [];
    let fullName = '';
    let email = '';

    answers.forEach(answer => {
      // Look for name fields (text answers)
      if (answer.type === 'text' && answer.text) {
        // Common name field patterns
        if (answer.field.ref?.toLowerCase().includes('name') || 
            answer.field.type === 'short_text' || 
            answer.field.type === 'long_text') {
          // If it looks like a name (contains letters and possibly spaces)
          if (/^[a-zA-Z\s]+$/.test(answer.text) && !fullName) {
            fullName = answer.text;
          }
        }
      }

      // Look for email fields
      if (answer.type === 'email' && answer.email) {
        email = answer.email;
      } else if (answer.type === 'text' && answer.text && answer.text.includes('@')) {
        email = answer.text;
      }
    });

    return {
      fullName: fullName || 'Name not provided',
      email: email || 'Email not provided',
      submissionDate: new Date(response.submitted_at).toLocaleDateString(),
      responseId: response.response_id,
    };
  }

  // Get all responses with detailed client information
  async getAllTestResponsesWithClientDetails(limit: number = 100): Promise<{
    form: TypeFormForm | null;
    responses: Array<TypeFormResponse & {
      clientDetails: {
        fullName: string;
        email: string;
        submissionDate: string;
        responseId: string;
      };
      eligibilityAnalysis: {
        eligibilityScore: number;
        eligibilityLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';
        recommendations: string[];
        documentRequirements: string[];
        estimatedTimeframe: string;
      };
    }>;
    analytics: {
      totalResponses: number;
      highEligibility: number;
      mediumEligibility: number;
      lowEligibility: number;
      veryLowEligibility: number;
    };
  }> {
    try {
      const form = await this.findPolishCitizenshipTestForm();
      
      if (!form) {
        return {
          form: null,
          responses: [],
          analytics: {
            totalResponses: 0,
            highEligibility: 0,
            mediumEligibility: 0,
            lowEligibility: 0,
            veryLowEligibility: 0,
          },
        };
      }

      const responsesData = await this.getFormResponses(form.id, {
        page_size: limit,
        completed: true,
      });

      // Analyze responses for eligibility distribution and add client details
      const analytics = {
        totalResponses: responsesData.total_items,
        highEligibility: 0,
        mediumEligibility: 0,
        lowEligibility: 0,
        veryLowEligibility: 0,
      };

      const enhancedResponses = responsesData.items.map(response => {
        const eligibilityAnalysis = this.analyzeEligibilityFromResponse(response);
        const clientDetails = this.extractClientDetails(response);

        switch (eligibilityAnalysis.eligibilityLevel) {
          case 'HIGH':
            analytics.highEligibility++;
            break;
          case 'MEDIUM':
            analytics.mediumEligibility++;
            break;
          case 'LOW':
            analytics.lowEligibility++;
            break;
          case 'VERY_LOW':
            analytics.veryLowEligibility++;
            break;
        }

        return {
          ...response,
          clientDetails,
          eligibilityAnalysis,
        };
      });

      return {
        form,
        responses: enhancedResponses,
        analytics,
      };
    } catch (error) {
      console.error('Error getting all test responses with client details:', error);
      throw error;
    }
  }

  // Get latest responses for Polish Citizenship Test
  async getLatestTestResponses(limit: number = 10): Promise<{
    form: TypeFormForm | null;
    responses: TypeFormResponse[];
    analytics: {
      totalResponses: number;
      highEligibility: number;
      mediumEligibility: number;
      lowEligibility: number;
      veryLowEligibility: number;
    };
  }> {
    try {
      const form = await this.findPolishCitizenshipTestForm();
      
      if (!form) {
        return {
          form: null,
          responses: [],
          analytics: {
            totalResponses: 0,
            highEligibility: 0,
            mediumEligibility: 0,
            lowEligibility: 0,
            veryLowEligibility: 0,
          },
        };
      }

      const responsesData = await this.getFormResponses(form.id, {
        page_size: limit,
        completed: true,
      });

      // Analyze responses for eligibility distribution
      const analytics = {
        totalResponses: responsesData.total_items,
        highEligibility: 0,
        mediumEligibility: 0,
        lowEligibility: 0,
        veryLowEligibility: 0,
      };

      responsesData.items.forEach(response => {
        const analysis = this.analyzeEligibilityFromResponse(response);
        switch (analysis.eligibilityLevel) {
          case 'HIGH':
            analytics.highEligibility++;
            break;
          case 'MEDIUM':
            analytics.mediumEligibility++;
            break;
          case 'LOW':
            analytics.lowEligibility++;
            break;
          case 'VERY_LOW':
            analytics.veryLowEligibility++;
            break;
        }
      });

      return {
        form,
        responses: responsesData.items,
        analytics,
      };
    } catch (error) {
      console.error('Error getting latest test responses:', error);
      throw error;
    }
  }
}