import { useProgressTracking, type ApplicationStep } from '@/hooks/useProgressTracking';
import { CheckCircle, Circle, Clock, AlertCircle, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export function ProgressTracker() {
  const { steps, progressData, updateStepStatus, completeStep } = useProgressTracking();

  if (!progressData) return null;

  const getStepIcon = (status: ApplicationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-6 w-6 text-blue-500 animate-spin" />;
      case 'blocked':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <Circle className="h-6 w-6 text-gray-300" />;
    }
  };

  const getStatusColor = (status: ApplicationStep['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400';
      case 'in-progress': return 'text-blue-600 dark:text-blue-400';
      case 'blocked': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-500 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Application Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Overall Progress
              </span>
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                {progressData.progressPercentage}%
              </span>
            </div>
            <Progress value={progressData.progressPercentage} className="h-3" />
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>{progressData.completedSteps.length} of {progressData.totalSteps} steps completed</span>
              {progressData.estimatedCompletion && (
                <span>Est. completion: {progressData.estimatedCompletion.toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Milestones</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progressData.milestones.map((milestone) => {
              const isCompleted = progressData.completedSteps.includes(milestone.id);
              return (
                <div
                  key={milestone.id}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isCompleted
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300" />
                    )}
                    <div>
                      <p className={`font-medium ${isCompleted ? 'text-green-700 dark:text-green-300' : 'text-gray-700 dark:text-gray-300'}`}>
                        {milestone.title}
                      </p>
                      {milestone.isMajor && (
                        <Badge variant="secondary" className="text-xs mt-1">Major Milestone</Badge>
                      )}
                    </div>
                  </div>
                  {milestone.completedAt && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      Completed on {milestone.completedAt.toLocaleDateString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-3 top-6 w-0.5 h-16 bg-gray-200 dark:bg-gray-700" />
                )}
                
                <div className="flex items-start space-x-4">
                  <div className="relative z-10 bg-white dark:bg-gray-900 p-1">
                    {getStepIcon(step.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-medium ${getStatusColor(step.status)}`}>
                        {step.title}
                      </h3>
                      <Badge 
                        variant={step.status === 'completed' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {step.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      {step.description}
                    </p>
                    
                    {step.estimatedDuration && (
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                        Estimated duration: {step.estimatedDuration}
                      </p>
                    )}
                    
                    {step.requiredDocuments && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Required documents:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {step.requiredDocuments.map((doc, docIndex) => (
                            <Badge key={docIndex} variant="outline" className="text-xs">
                              {doc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {step.status === 'in-progress' && (
                      <div className="mt-4 flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => completeStep(step.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Mark Complete
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateStepStatus(step.id, 'blocked')}
                        >
                          Report Issue
                        </Button>
                      </div>
                    )}
                    
                    {step.status === 'pending' && step.dependencies && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          Waiting for: {step.dependencies.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}