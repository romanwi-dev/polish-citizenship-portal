import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Trophy, 
  Star, 
  Target, 
  Award,
  Medal,
  Crown,
  Zap,
  TrendingUp,
  Lock,
  CheckCircle2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface Milestone {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: "document" | "process" | "payment" | "special";
  points: number;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  totalRequired?: number;
}

export default function MilestoneAchievements({ userId = "demo-user" }: { userId?: string }) {
  // Fetch milestones
  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['/api/milestones', userId],
    queryFn: async () => {
      const response = await fetch(`/api/milestones/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch milestones');
      const result = await response.json();
      return result.data || [];
    }
  });

  const getMilestoneIcon = (icon: string, isUnlocked: boolean) => {
    const iconClass = `h-6 w-6 ${isUnlocked ? 'text-yellow-500' : 'text-gray-400'}`;
    switch (icon) {
      case "trophy":
        return <Trophy className={iconClass} />;
      case "star":
        return <Star className={iconClass} />;
      case "medal":
        return <Medal className={iconClass} />;
      case "crown":
        return <Crown className={iconClass} />;
      case "award":
        return <Award className={iconClass} />;
      case "zap":
        return <Zap className={iconClass} />;
      default:
        return <Target className={iconClass} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "document":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "process":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "payment":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "special":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Sample milestones if no data
  const displayMilestones = milestones.length > 0 ? milestones : [
    {
      id: "1",
      title: "First Steps",
      description: "Complete your initial consultation",
      category: "process",
      points: 100,
      icon: "trophy",
      isUnlocked: true,
      unlockedAt: new Date("2024-01-15"),
      progress: 1,
      totalRequired: 1
    },
    {
      id: "2",
      title: "Document Hunter",
      description: "Upload 5 required documents",
      category: "document",
      points: 250,
      icon: "star",
      isUnlocked: true,
      unlockedAt: new Date("2024-02-01"),
      progress: 5,
      totalRequired: 5
    },
    {
      id: "3",
      title: "Halfway There",
      description: "Reach 50% application completion",
      category: "process",
      points: 500,
      icon: "medal",
      isUnlocked: false,
      progress: 35,
      totalRequired: 50
    },
    {
      id: "4",
      title: "Archive Explorer",
      description: "Complete archive research phase",
      category: "special",
      points: 750,
      icon: "crown",
      isUnlocked: false,
      progress: 0,
      totalRequired: 1
    },
    {
      id: "5",
      title: "Application Hero",
      description: "Submit your complete application",
      category: "process",
      points: 1000,
      icon: "award",
      isUnlocked: false,
      progress: 0,
      totalRequired: 1
    }
  ];

  const totalPoints = displayMilestones
    .filter((m: any) => m.isUnlocked)
    .reduce((sum: number, m: any) => sum + m.points, 0);

  const unlockedCount = displayMilestones.filter((m: any) => m.isUnlocked).length;

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievements
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {totalPoints}
              </p>
              <p className="text-xs text-muted-foreground">Total Points</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">
                {unlockedCount}/{displayMilestones.length}
              </p>
              <p className="text-xs text-muted-foreground">Unlocked</p>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-[480px]">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading achievements...
            </div>
          ) : (
            <div className="grid gap-4">
              {displayMilestones.map((milestone: any) => (
                <div
                  key={milestone.id}
                  className={`p-4 rounded-lg border transition-all ${
                    milestone.isUnlocked
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-300 dark:border-yellow-700'
                      : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${
                      milestone.isUnlocked 
                        ? 'bg-yellow-100 dark:bg-yellow-900' 
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      {milestone.isUnlocked ? (
                        getMilestoneIcon(milestone.icon, true)
                      ) : (
                        <Lock className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold ${
                          milestone.isUnlocked ? '' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {milestone.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge className={getCategoryColor(milestone.category)}>
                            {milestone.category}
                          </Badge>
                          <Badge variant={milestone.isUnlocked ? "default" : "secondary"}>
                            {milestone.points} pts
                          </Badge>
                        </div>
                      </div>
                      
                      <p className={`text-sm mb-3 ${
                        milestone.isUnlocked 
                          ? 'text-muted-foreground' 
                          : 'text-gray-400 dark:text-gray-500'
                      }`}>
                        {milestone.description}
                      </p>
                      
                      {milestone.isUnlocked && milestone.unlockedAt ? (
                        <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Unlocked {format(new Date(milestone.unlockedAt), 'MMM d, yyyy')}</span>
                        </div>
                      ) : milestone.progress !== undefined && milestone.totalRequired ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              {milestone.progress}/{milestone.totalRequired}
                            </span>
                          </div>
                          <Progress 
                            value={(milestone.progress / milestone.totalRequired) * 100} 
                            className="h-2"
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Bonus Section */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950 dark:to-pink-950 rounded-lg border border-purple-300 dark:border-purple-700">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-full">
                    <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </div>
                  <h3 className="font-semibold">Next Milestone</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Complete 2 more document uploads to unlock "Document Master" achievement and earn 300 bonus points!
                </p>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}