import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Send, 
  Paperclip, 
  Search,
  Filter,
  MoreVertical,
  Archive,
  Star,
  Reply,
  Forward
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Message {
  id: string;
  userId: string;
  senderName: string;
  senderRole: "client" | "lawyer" | "admin";
  subject: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  hasAttachment: boolean;
  isStarred?: boolean;
  category: "general" | "documents" | "legal" | "payment";
}

export default function SecureMessaging({ userId = "demo-user" }: { userId?: string }) {
  const { toast } = useToast();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("inbox");

  // Fetch messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['/api/messages', userId],
    queryFn: async () => {
      const response = await fetch(`/api/messages/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: Partial<Message>) => {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', userId] });
      setNewMessage("");
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully."
      });
    }
  });

  // Mark message as read
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'PUT'
      });
      if (!response.ok) throw new Error('Failed to mark message as read');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', userId] });
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    sendMessageMutation.mutate({
      userId,
      senderName: "Client",
      senderRole: "client",
      subject: "New Message",
      content: newMessage,
      timestamp: new Date(),
      isRead: false,
      hasAttachment: false,
      category: "general"
    });
  };

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsReadMutation.mutate(message.id);
    }
  };

  const filteredMessages = messages.filter((msg: Message) => {
    const matchesSearch = msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         msg.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "inbox") return matchesSearch && !msg.isStarred;
    if (activeTab === "starred") return matchesSearch && msg.isStarred;
    if (activeTab === "sent") return matchesSearch && msg.senderRole === "client";
    return matchesSearch;
  });

  const unreadCount = messages.filter((msg: Message) => !msg.isRead).length;

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">
            Secure Messages
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
          <Button variant="outline" size="sm">
            <Archive className="h-4 w-4 mr-1" />
            Archive
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="flex h-full">
          {/* Message List */}
          <div className="w-1/3 border-r flex flex-col">
            <div className="p-3 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="inbox">Inbox</TabsTrigger>
                <TabsTrigger value="sent">Sent</TabsTrigger>
                <TabsTrigger value="starred">Starred</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="flex-1 mt-0">
                <ScrollArea className="h-[400px]">
                  {isLoading ? (
                    <div className="p-4 text-center text-muted-foreground">Loading messages...</div>
                  ) : filteredMessages.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">No messages found</div>
                  ) : (
                    <div className="divide-y">
                      {filteredMessages.map((message: Message) => (
                        <div
                          key={message.id}
                          onClick={() => handleSelectMessage(message)}
                          className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                            !message.isRead ? 'bg-blue-50 dark:bg-blue-950' : ''
                          } ${selectedMessage?.id === message.id ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {message.senderName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className={`text-sm ${!message.isRead ? 'font-semibold' : ''}`}>
                                  {message.senderName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(message.timestamp), 'MMM d')}
                                </span>
                              </div>
                              <p className={`text-sm truncate ${!message.isRead ? 'font-medium' : 'text-muted-foreground'}`}>
                                {message.subject}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Message Content */}
          <div className="flex-1 flex flex-col">
            {selectedMessage ? (
              <>
                {/* Message Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {selectedMessage.senderName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{selectedMessage.subject}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{selectedMessage.senderName}</span>
                          <span>•</span>
                          <span>{format(new Date(selectedMessage.timestamp), 'MMM d, yyyy h:mm a')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Reply className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Forward className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <ScrollArea className="flex-1 p-4">
                  <div className="prose dark:prose-invert max-w-none">
                    <p>{selectedMessage.content}</p>
                  </div>
                </ScrollArea>

                {/* Reply Area */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your reply..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button variant="ghost" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a message to view
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}