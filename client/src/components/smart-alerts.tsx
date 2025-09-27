import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Clock,
  Calendar,
  FileText,
  DollarSign,
  Settings,
  X,
  BellOff
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

interface Alert {
  id: string;
  userId: string;
  type: "info" | "warning" | "success" | "error";
  category: "document" | "payment" | "deadline" | "status" | "system";
  title: string;
  message: string;
  actionRequired: boolean;
  isRead: boolean;
  createdAt: Date;
  expiresAt?: Date;
  actions?: {
    label: string;
    action: string;
  }[];
}

interface AlertPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  documentAlerts: boolean;
  paymentAlerts: boolean;
  deadlineAlerts: boolean;
  statusAlerts: boolean;
}

export default function SmartAlerts({ userId = "demo-user" }: { userId?: string }) {
  const [activeTab, setActiveTab] = useState("all");
  const [preferences, setPreferences] = useState<AlertPreferences>({
    emailNotifications: true,
    smsNotifications: false,
    documentAlerts: true,
    paymentAlerts: true,
    deadlineAlerts: true,
    statusAlerts: true
  });

  // Fetch alerts
  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['/api/alerts', userId],
    queryFn: async () => {
      const response = await fetch(`/api/alerts/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch alerts');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Mark alert as read
  const markAsReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/alerts/${alertId}/read`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Failed to mark alert as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts', userId] });
    }
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "document":
        return <FileText className="h-4 w-4" />;
      case "payment":
        return <DollarSign className="h-4 w-4" />;
      case "deadline":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertVariant = (type: string): "default" | "destructive" | "outline" | "secondary" => {
    switch (type) {
      case "error":
        return "destructive";
      case "warning":
        return "secondary";
      case "success":
        return "outline";
      default:
        return "default";
    }
  };

  const filteredAlerts = alerts.filter((alert: Alert) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !alert.isRead;
    if (activeTab === "action") return alert.actionRequired;
    return alert.category === activeTab;
  });

  const unreadCount = alerts.filter((alert: Alert) => !alert.isRead).length;
  const actionRequiredCount = alerts.filter((alert: Alert) => alert.actionRequired).length;

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Smart Alerts
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-5 mx-4 mt-2">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="action">
              Action
              {actionRequiredCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 px-1 text-xs">
                  {actionRequiredCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="document">Docs</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="flex-1 mt-0">
            <ScrollArea className="h-[450px]">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading alerts...
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="p-8 text-center">
                  <BellOff className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No alerts to display</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {filteredAlerts.map((alert: Alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${
                        !alert.isRead ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-gray-950'
                      } hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getAlertIcon(alert.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-medium ${!alert.isRead ? 'font-semibold' : ''}`}>
                              {alert.title}
                            </h4>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => markAsReadMutation.mutate(alert.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {alert.message}
                          </p>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getAlertVariant(alert.type)} className="text-xs">
                              <span className="mr-1">{getCategoryIcon(alert.category)}</span>
                              {alert.category}
                            </Badge>
                            {alert.actionRequired && (
                              <Badge variant="destructive" className="text-xs">
                                Action Required
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(alert.createdAt), 'MMM d, h:mm a')}
                            </span>
                          </div>

                          {alert.actions && alert.actions.length > 0 && (
                            <div className="flex gap-2 mt-3">
                              {alert.actions.map((action, index) => (
                                <Button
                                  key={index}
                                  size="sm"
                                  variant={index === 0 ? "default" : "outline"}
                                  onClick={() => {
                                    markAsReadMutation.mutate(alert.id);
                                    // Handle action
                                  }}
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Alert Preferences */}
        <div className="border-t p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Alert Preferences</h4>
            <Button variant="ghost" size="sm">
              Manage
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="email-alerts"
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, emailNotifications: checked})
                }
              />
              <Label htmlFor="email-alerts" className="text-sm">Email Alerts</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="sms-alerts"
                checked={preferences.smsNotifications}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, smsNotifications: checked})
                }
              />
              <Label htmlFor="sms-alerts" className="text-sm">SMS Alerts</Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}