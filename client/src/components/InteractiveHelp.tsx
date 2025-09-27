import { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  MessageCircle, 
  Video, 
  BookOpen, 
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Play,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  tags: string[];
}

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  videoUrl?: string;
  steps: string[];
}

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  lastUpdated: Date;
  readTime: string;
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: 'How long does the Polish citizenship process take?',
    answer: 'The Polish citizenship by descent process typically takes 6-18 months from application submission to receiving your citizenship certificate. This timeline can vary depending on document complexity and government processing times.',
    category: 'Process',
    helpful: 45,
    tags: ['timeline', 'citizenship', 'processing']
  },
  {
    id: '2',
    question: 'What documents do I need to prove Polish ancestry?',
    answer: 'You will need birth certificates, marriage certificates, and other vital records for your Polish ancestor and each generation connecting you to them. All documents must be official copies and may need translation.',
    category: 'Documents',
    helpful: 38,
    tags: ['documents', 'ancestry', 'requirements']
  },
  {
    id: '3',
    question: 'Can I use the AI document processing for all my papers?',
    answer: 'Our AI system can process most common document types including birth certificates, marriage certificates, and historical records. It works best with clear, legible documents and supports both Polish and English text.',
    category: 'Technology',
    helpful: 29,
    tags: ['AI', 'documents', 'processing']
  },
  {
    id: '4',
    question: 'How much does the complete service cost?',
    answer: 'Our service packages range from $2,500 for basic document review to $7,500 for full-service representation. Payment plans are available, and we offer a money-back guarantee if you\'re not eligible.',
    category: 'Pricing',
    helpful: 52,
    tags: ['cost', 'pricing', 'payment']
  }
];

const tutorials: Tutorial[] = [
  {
    id: '1',
    title: 'Getting Started with Your Family Tree',
    description: 'Learn how to build your genealogical tree and identify the documents you\'ll need.',
    duration: '8 minutes',
    difficulty: 'beginner',
    videoUrl: '#',
    steps: [
      'Create your account and access the Family Tree builder',
      'Add your personal information as the starting point',
      'Add your parents and their birth information',
      'Continue adding ancestors until you reach your Polish ancestor',
      'Identify missing documents and plan your research'
    ]
  },
  {
    id: '2',
    title: 'Using AI Document Processing',
    description: 'Discover how to use our AI-powered system to process and translate your documents.',
    duration: '6 minutes',
    difficulty: 'beginner',
    steps: [
      'Navigate to the Document Processing section',
      'Upload clear photos of your documents',
      'Review the AI-extracted information',
      'Make any necessary corrections',
      'Download the processed and translated documents'
    ]
  },
  {
    id: '3',
    title: 'Completing Your Citizenship Application',
    description: 'Step-by-step guide to filling out and submitting your Polish citizenship application.',
    duration: '12 minutes',
    difficulty: 'intermediate',
    steps: [
      'Gather all required documents and translations',
      'Access the citizenship application form',
      'Fill out personal and family information',
      'Upload supporting documents',
      'Review and submit your application'
    ]
  }
];

export function InteractiveHelp() {
  const [activeTab, setActiveTab] = useState<'faq' | 'tutorials' | 'articles'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFAQs, setFilteredFAQs] = useState(faqs);
  const [openFAQs, setOpenFAQs] = useState<string[]>([]);
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredFAQs(filtered);
    } else {
      setFilteredFAQs(faqs);
    }
  }, [searchQuery]);

  const toggleFAQ = (id: string) => {
    setOpenFAQs(prev =>
      prev.includes(id) ? prev.filter(faqId => faqId !== id) : [...prev, id]
    );
  };

  const markHelpful = (id: string) => {
    // In a real app, this would send feedback to the server
    console.log(`FAQ ${id} marked as helpful`);
  };

  return (
    <div className="space-y-6">
      {/* Help Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <span>Help Center</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => setShowChatbot(true)}
              className="flex items-center space-x-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat with Expert</span>
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6">
            {[
              { id: 'faq', label: 'FAQ', icon: HelpCircle },
              { id: 'tutorials', label: 'Tutorials', icon: Video },
              { id: 'articles', label: 'Articles', icon: BookOpen }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center space-x-2"
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      {activeTab === 'faq' && (
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <Collapsible key={faq.id}>
                  <CollapsibleTrigger
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full"
                  >
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-left">{faq.question}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {faq.category}
                        </Badge>
                      </div>
                      {openFAQs.includes(faq.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 border-l-4 border-blue-200 bg-blue-50 dark:bg-blue-900/20 ml-4 mt-2">
                      <p className="text-gray-700 dark:text-gray-300 mb-4">
                        {faq.answer}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {faq.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markHelpful(faq.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          Helpful ({faq.helpful})
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tutorials Section */}
      {activeTab === 'tutorials' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tutorials.map((tutorial) => (
            <Card key={tutorial.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                  <Badge 
                    variant={
                      tutorial.difficulty === 'beginner' ? 'default' :
                      tutorial.difficulty === 'intermediate' ? 'secondary' : 'destructive'
                    }
                    className="text-xs"
                  >
                    {tutorial.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {tutorial.description}
                </p>
                
                <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                  <span>⏱️ {tutorial.duration}</span>
                  <span>📋 {tutorial.steps.length} steps</span>
                </div>

                {tutorial.videoUrl && (
                  <Button className="w-full mb-4 flex items-center space-x-2">
                    <Play className="h-4 w-4" />
                    <span>Watch Video Tutorial</span>
                  </Button>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Tutorial Steps:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {tutorial.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Articles Section */}
      {activeTab === 'articles' && (
        <Card>
          <CardHeader>
            <CardTitle>Help Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Understanding Polish Citizenship Laws',
                'Document Requirements Guide',
                'Common Application Mistakes',
                'Processing Timeline Expectations',
                'After You Receive Citizenship',
                'Dual Citizenship Considerations'
              ].map((title, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{title}</h3>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    5 min read • Updated recently
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Modal */}
      {showChatbot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-5 w-5 text-blue-600" />
                  <span>Chat with Expert</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowChatbot(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Connect with our legal experts for personalized assistance
                    </p>
                  </div>
                </div>
                <Button className="w-full">
                  Start Live Chat
                </Button>
                <div className="text-xs text-gray-500 text-center">
                  Available Monday - Friday, 9 AM - 6 PM EST
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}