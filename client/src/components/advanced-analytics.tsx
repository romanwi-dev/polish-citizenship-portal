import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Clock,
  Users,
  FileText,
  Activity,
  PieChart
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface AnalyticsData {
  documentProgress: Array<{ name: string; completed: number; pending: number }>;
  timelineData: Array<{ month: string; progress: number }>;
  categoryBreakdown: Array<{ category: string; value: number; color: string }>;
  activityMetrics: {
    documentsUploaded: number;
    messagesExchanged: number;
    avgResponseTime: string;
    completionRate: number;
  };
}

export default function AdvancedAnalytics({ userId = "demo-user" }: { userId?: string }) {
  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['/api/analytics', userId],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const result = await response.json();
      return result.data || sampleData;
    }
  });

  const sampleData: AnalyticsData = {
    documentProgress: [
      { name: "Personal", completed: 8, pending: 2 },
      { name: "Ancestral", completed: 5, pending: 5 },
      { name: "Legal", completed: 3, pending: 4 },
      { name: "Translation", completed: 6, pending: 1 }
    ],
    timelineData: [
      { month: "Jan", progress: 15 },
      { month: "Feb", progress: 35 },
      { month: "Mar", progress: 45 },
      { month: "Apr", progress: 55 },
      { month: "May", progress: 65 },
      { month: "Jun", progress: 72 }
    ],
    categoryBreakdown: [
      { category: "Documents", value: 40, color: "#3b82f6" },
      { category: "Archives", value: 25, color: "#10b981" },
      { category: "Translation", value: 20, color: "#f59e0b" },
      { category: "Legal", value: 15, color: "#8b5cf6" }
    ],
    activityMetrics: {
      documentsUploaded: 22,
      messagesExchanged: 47,
      avgResponseTime: "2.5 hours",
      completionRate: 72
    }
  };

  const data = analyticsData || sampleData;

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Advanced Analytics
          </CardTitle>
          <Select defaultValue="6months">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden">
        <Tabs defaultValue="overview" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="flex-1">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Metrics Cards */}
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Documents</p>
                    <p className="text-2xl font-bold">{data.activityMetrics.documentsUploaded}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completion</p>
                    <p className="text-2xl font-bold">{data.activityMetrics.completionRate}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>
            
            {/* Category Breakdown Pie Chart */}
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={data.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.categoryBreakdown.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          {/* Documents Tab */}
          <TabsContent value="documents" className="flex-1">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.documentProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          {/* Timeline Tab */}
          <TabsContent value="timeline" className="flex-1">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="progress" 
                    stroke="#3b82f6" 
                    name="Progress %"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          {/* Activity Tab */}
          <TabsContent value="activity" className="flex-1">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Messages Exchanged</span>
                  </div>
                  <p className="text-2xl font-bold">{data.activityMetrics.messagesExchanged}</p>
                  <p className="text-sm text-muted-foreground">Last 30 days</p>
                </div>
                
                <div className="p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Avg Response Time</span>
                  </div>
                  <p className="text-2xl font-bold">{data.activityMetrics.avgResponseTime}</p>
                  <p className="text-sm text-muted-foreground">From legal team</p>
                </div>
              </div>
              
              {/* Recent Activity List */}
              <div>
                <h3 className="font-semibold mb-3">Recent Activity</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Document uploaded</span>
                    </div>
                    <Badge variant="outline">2 hours ago</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Family member added</span>
                    </div>
                    <Badge variant="outline">1 day ago</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Milestone reached</span>
                    </div>
                    <Badge variant="outline">3 days ago</Badge>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}