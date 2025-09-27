import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  FileText, 
  Clock,
  Award,
  AlertTriangle,
  XCircle,
  Flag,
  User,
  Mail
} from 'lucide-react';
import { POLISH_CITIZENSHIP_TEST_QUESTIONS, type TestQuestion, type TestAnswer } from '../../../shared/citizenship-test-schema';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface TestResult {
  eligibilityScore: number;
  eligibilityLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';
  recommendations: string[];
  documentRequirements: string[];
  estimatedTimeframe: string;
  responseId: string;
}

const EligibilityBadge: React.FC<{ level: string; score: number }> = ({ level, score }) => {
  const config = {
    HIGH: { 
      color: 'bg-green-500/20 text-green-800 border-green-300', 
      icon: CheckCircle,
      description: 'Excellent eligibility' 
    },
    MEDIUM: { 
      color: 'bg-yellow-500/20 text-yellow-800 border-yellow-300', 
      icon: Award,
      description: 'Good eligibility with documentation needed' 
    },
    LOW: { 
      color: 'bg-orange-500/20 text-orange-800 border-orange-300', 
      icon: AlertTriangle,
      description: 'Possible eligibility with significant research required' 
    },
    VERY_LOW: { 
      color: 'bg-red-500/20 text-red-800 border-red-300', 
      icon: XCircle,
      description: 'Low eligibility - alternative options recommended' 
    },
  };

  const { color, icon: Icon, description } = config[level as keyof typeof config] || config.VERY_LOW;

  return (
    <div className="text-center">
      <Badge className={`${color} font-bold text-lg px-4 py-2 mb-2`}>
        <Icon className="w-5 h-5 mr-2" />
        {level.replace('_', ' ')} ELIGIBILITY
      </Badge>
      <div className="text-2xl font-bold text-gray-900 mb-1">{score}% Score</div>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
};

export const CitizenshipTest: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const { toast } = useToast();

  const currentQuestion = POLISH_CITIZENSHIP_TEST_QUESTIONS[currentQuestionIndex];
  const totalQuestions = POLISH_CITIZENSHIP_TEST_QUESTIONS.length;
  const progress = (currentQuestionIndex / (totalQuestions - 1)) * 100;

  // Submit test mutation
  const submitTestMutation = useMutation({
    mutationFn: async (data: { fullName: string; email: string; answers: TestAnswer[] }) => {
      const response = await fetch('/api/citizenship-test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await response.json();
    },
    onSuccess: (response: any) => {
      setTestResult(response.data);
      setIsCompleted(true);
      toast({
        title: "Test Completed!",
        description: "Your eligibility assessment has been processed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit test. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnswer = (value: any) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitTest();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitTest = () => {
    // Convert answers to TestAnswer format
    const formattedAnswers: TestAnswer[] = POLISH_CITIZENSHIP_TEST_QUESTIONS
      .filter(q => q.type !== 'welcome' && answers[q.id] !== undefined)
      .map(question => {
        const answer = answers[question.id];
        let answerType: TestAnswer['answerType'] = 'text';
        let score = 0;

        // Determine answer type and calculate score
        if (question.type === 'email') {
          answerType = 'email';
        } else if (question.type === 'multiple_choice' || question.type === 'yes_no') {
          answerType = 'choice';
          const selectedChoice = question.choices?.find(c => c.id === answer);
          score = selectedChoice?.score || 0;
        } else if (question.type === 'text') {
          answerType = 'text';
          // Give small scores for text answers based on content
          if (typeof answer === 'string' && answer.toLowerCase().includes('poland')) {
            score = 5;
          }
        }

        return {
          questionId: question.id,
          questionText: question.title,
          answerType,
          answer: answer,
          score,
        };
      });

    submitTestMutation.mutate({
      fullName: answers.full_name || '',
      email: answers.email || '',
      answers: formattedAnswers,
    });
  };

  const canProceed = () => {
    if (!currentQuestion.required) return true;
    return answers[currentQuestion.id] !== undefined && answers[currentQuestion.id] !== '';
  };

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  if (isCompleted && testResult) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Results Header */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-blue-900 mb-4">
              Your Polish Citizenship Eligibility Assessment
            </CardTitle>
            <EligibilityBadge level={testResult.eligibilityLevel} score={testResult.eligibilityScore} />
          </CardHeader>
        </Card>

        {/* Detailed Results */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <CheckCircle className="w-5 h-5 mr-2" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {testResult.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <ArrowRight className="w-4 h-4 mr-2 mt-1 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Document Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blue-900">
                <FileText className="w-5 h-5 mr-2" />
                Document Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {testResult.documentRequirements.map((doc, index) => (
                  <li key={index} className="flex items-start">
                    <FileText className="w-4 h-4 mr-2 mt-1 text-orange-500 flex-shrink-0" />
                    <span className="text-gray-700">{doc}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-blue-900">
              <Clock className="w-5 h-5 mr-2" />
              Estimated Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-lg font-semibold text-gray-900">{testResult.estimatedTimeframe}</p>
              <p className="text-sm text-gray-600 mt-2">
                This estimate is based on your current documentation and case complexity.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Ready to Start Your Journey?</CardTitle>
            <CardDescription>
              Based on your assessment, we can help you navigate the Polish citizenship process.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Button 
                size="lg" 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => window.location.href = '/consultation'}
              >
                <User className="w-5 h-5 mr-2" />
                Schedule Consultation
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-green-600 text-green-700 hover:bg-green-50"
                onClick={() => window.location.href = '/dashboard'}
              >
                <FileText className="w-5 h-5 mr-2" />
                Access Dashboard
              </Button>
            </div>
            <p className="text-sm text-gray-600 text-center">
              Response ID: {testResult.responseId} - Keep this for your records
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-blue-900">Polish Citizenship Test</h1>
          <Badge variant="outline" className="text-sm">
            {currentQuestionIndex + 1} of {totalQuestions}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-gray-600 mt-2">
          Complete assessment for personalized eligibility analysis
        </p>
      </div>

      {/* Question Card */}
      <Card className="mb-8">
        <CardHeader>
          {currentQuestion.type === 'welcome' ? (
            <div className="text-center space-y-4">
              <Flag className="w-16 h-16 mx-auto text-red-600" />
              <CardTitle className="text-3xl font-bold text-blue-900">
                {currentQuestion.title}
              </CardTitle>
              <CardDescription className="text-lg">
                {currentQuestion.description}
              </CardDescription>
            </div>
          ) : (
            <>
              <CardTitle className="text-xl text-blue-900">
                {currentQuestion.title}
              </CardTitle>
              {currentQuestion.description && (
                <CardDescription className="text-base">
                  {currentQuestion.description}
                </CardDescription>
              )}
            </>
          )}
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentQuestion.type === 'welcome' ? (
            <div className="text-center">
              <Button 
                size="lg" 
                onClick={nextQuestion}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                Start Assessment
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          ) : currentQuestion.type === 'text' ? (
            <div className="space-y-2">
              <Label htmlFor={currentQuestion.id} className="text-base font-medium">
                Your Answer {currentQuestion.required && <span className="text-red-500">*</span>}
              </Label>
              {currentQuestion.id === 'ancestor_details' ? (
                <Textarea
                  id={currentQuestion.id}
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="e.g., Jan Kowalski, born 1920 in Kraków, my grandfather..."
                  className="min-h-[100px]"
                />
              ) : (
                <Input
                  id={currentQuestion.id}
                  type="text"
                  value={answers[currentQuestion.id] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder={
                    currentQuestion.id === 'full_name' ? 'Enter your complete legal name' :
                    currentQuestion.id === 'email' ? 'your.email@example.com' :
                    currentQuestion.id === 'birth_country' ? 'e.g., United States' :
                    currentQuestion.id === 'current_citizenship' ? 'e.g., American' :
                    currentQuestion.id === 'emigration_year' ? 'e.g., 1925' :
                    'Enter your answer'
                  }
                  className="text-base"
                />
              )}
            </div>
          ) : currentQuestion.type === 'email' ? (
            <div className="space-y-2">
              <Label htmlFor={currentQuestion.id} className="text-base font-medium flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                Email Address {currentQuestion.required && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id={currentQuestion.id}
                type="email"
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                placeholder="your.email@example.com"
                className="text-base"
              />
            </div>
          ) : (currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'yes_no') && currentQuestion.choices ? (
            <div className="space-y-2">
              <Label className="text-base font-medium">
                Select your answer {currentQuestion.required && <span className="text-red-500">*</span>}
              </Label>
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={handleAnswer}
                className="space-y-3"
              >
                {currentQuestion.choices.map((choice) => (
                  <div key={choice.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value={choice.id} id={choice.id} />
                    <Label 
                      htmlFor={choice.id} 
                      className="flex-1 text-base cursor-pointer"
                    >
                      {choice.label}
                    </Label>
                    {choice.score > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        +{choice.score}
                      </Badge>
                    )}
                  </div>
                ))}
              </RadioGroup>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
          className="flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        <Button
          onClick={nextQuestion}
          disabled={!canProceed() || submitTestMutation.isPending}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white"
        >
          {submitTestMutation.isPending ? (
            'Processing...'
          ) : isLastQuestion ? (
            <>
              Complete Assessment
              <CheckCircle className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};