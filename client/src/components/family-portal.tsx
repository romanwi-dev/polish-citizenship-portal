import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  Edit,
  Share2,
  Shield
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  email?: string;
  phone?: string;
  documentsRequired: number;
  documentsProvided: number;
  status: "active" | "pending" | "completed";
  accessLevel: "view" | "edit" | "admin";
  invitedAt?: Date;
  joinedAt?: Date;
}

export default function FamilyPortal({ userId = "demo-user" }: { userId?: string }) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [inviteData, setInviteData] = useState({
    name: "",
    email: "",
    relationship: "",
    accessLevel: "view" as FamilyMember["accessLevel"]
  });

  // Fetch family members
  const { data: familyMembers = [], isLoading } = useQuery({
    queryKey: ['/api/family-members', userId],
    queryFn: async () => {
      const response = await fetch(`/api/family-members/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch family members');
      const result = await response.json();
      return result.data || [];
    }
  });

  // Add family member mutation
  const addMemberMutation = useMutation({
    mutationFn: async (memberData: Partial<FamilyMember>) => {
      const response = await fetch('/api/family-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...memberData, userId })
      });
      if (!response.ok) throw new Error('Failed to add family member');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family-members', userId] });
      setShowInviteDialog(false);
      setInviteData({ name: "", email: "", relationship: "", accessLevel: "view" });
      toast({
        title: "Family Member Added",
        description: "An invitation has been sent to join the family portal."
      });
    }
  });

  // Update family member mutation
  const updateMemberMutation = useMutation({
    mutationFn: async ({ memberId, updates }: { memberId: string; updates: Partial<FamilyMember> }) => {
      const response = await fetch(`/api/family-members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update family member');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/family-members', userId] });
      toast({
        title: "Member Updated",
        description: "Family member information has been updated."
      });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getAccessIcon = (level: string) => {
    switch (level) {
      case "admin":
        return <Shield className="h-4 w-4 text-purple-500" />;
      case "edit":
        return <Edit className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  // Sample data if no real data
  const displayMembers = familyMembers.length > 0 ? familyMembers : [
    {
      id: "1",
      userId,
      name: "Maria Kowalska",
      relationship: "Mother",
      email: "maria.k@email.com",
      phone: "+48 123 456 789",
      documentsRequired: 5,
      documentsProvided: 5,
      status: "completed",
      accessLevel: "admin",
      joinedAt: new Date("2024-01-10")
    },
    {
      id: "2",
      userId,
      name: "Jan Kowalski",
      relationship: "Father",
      email: "jan.k@email.com",
      documentsRequired: 4,
      documentsProvided: 3,
      status: "active",
      accessLevel: "edit",
      joinedAt: new Date("2024-01-12")
    },
    {
      id: "3",
      userId,
      name: "Anna Kowalska",
      relationship: "Sister",
      email: "anna.k@email.com",
      documentsRequired: 3,
      documentsProvided: 0,
      status: "pending",
      accessLevel: "view",
      invitedAt: new Date("2024-02-01")
    }
  ];

  const activeMembersCount = displayMembers.filter((m: any) => m.status === "active" || m.status === "completed").length;
  const totalDocumentsRequired = displayMembers.reduce((sum: number, m: any) => sum + m.documentsRequired, 0);
  const totalDocumentsProvided = displayMembers.reduce((sum: number, m: any) => sum + m.documentsProvided, 0);

  return (
    <>
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Family Portal
            </CardTitle>
            <Button size="sm" onClick={() => setShowInviteDialog(true)}>
              <UserPlus className="h-4 w-4 mr-1" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="flex-1">
              <div className="space-y-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                    <div className="flex items-center justify-between">
                      <Users className="h-8 w-8 text-blue-500" />
                      <span className="text-2xl font-bold">{activeMembersCount}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Active Members</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950">
                    <div className="flex items-center justify-between">
                      <FileText className="h-8 w-8 text-green-500" />
                      <span className="text-2xl font-bold">{totalDocumentsProvided}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Documents Collected</p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950">
                    <div className="flex items-center justify-between">
                      <CheckCircle2 className="h-8 w-8 text-purple-500" />
                      <span className="text-2xl font-bold">
                        {Math.round((totalDocumentsProvided / totalDocumentsRequired) * 100)}%
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Completion Rate</p>
                  </div>
                </div>
                
                {/* Recent Activity */}
                <div>
                  <h3 className="font-semibold mb-3">Recent Activity</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Maria uploaded birth certificate</span>
                      <span className="text-xs text-muted-foreground ml-auto">2 hours ago</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <UserPlus className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Anna joined the family portal</span>
                      <span className="text-xs text-muted-foreground ml-auto">1 day ago</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900">
                      <FileText className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Jan completed document checklist</span>
                      <span className="text-xs text-muted-foreground ml-auto">3 days ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Members Tab */}
            <TabsContent value="members" className="flex-1">
              <ScrollArea className="h-[450px]">
                <div className="space-y-3">
                  {displayMembers.map((member: any) => (
                    <div
                      key={member.id}
                      className="p-4 rounded-lg border bg-white dark:bg-gray-950 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {member.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div>
                              <h3 className="font-semibold">{member.name}</h3>
                              <p className="text-sm text-muted-foreground">{member.relationship}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(member.status)}>
                                {member.status}
                              </Badge>
                              {getAccessIcon(member.accessLevel)}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            {member.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span>{member.email}</span>
                              </div>
                            )}
                            {member.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span>{member.phone}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Document Progress</span>
                              <span className="font-medium">
                                {member.documentsProvided}/{member.documentsRequired}
                              </span>
                            </div>
                            <Progress 
                              value={(member.documentsProvided / member.documentsRequired) * 100} 
                              className="h-2"
                            />
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedMember(member)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            {/* Documents Tab */}
            <TabsContent value="documents" className="flex-1">
              <ScrollArea className="h-[450px]">
                <div className="space-y-4">
                  {displayMembers.map((member: any) => (
                    <div key={member.id} className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {member.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {member.name}
                      </h4>
                      <div className="grid gap-2 pl-8">
                        <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-900">
                          <span className="text-sm">Birth Certificate</span>
                          {member.documentsProvided > 0 ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                        <div className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-900">
                          <span className="text-sm">Marriage Certificate</span>
                          {member.documentsProvided > 1 ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Invite Member Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Family Member</DialogTitle>
            <DialogDescription>
              Send an invitation to a family member to join your citizenship application portal.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={inviteData.name}
                onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            
            <div>
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                value={inviteData.relationship}
                onChange={(e) => setInviteData({ ...inviteData, relationship: e.target.value })}
                placeholder="e.g., Mother, Father, Sibling"
              />
            </div>
            
            <div>
              <Label htmlFor="access">Access Level</Label>
              <select
                id="access"
                value={inviteData.accessLevel}
                onChange={(e) => setInviteData({ ...inviteData, accessLevel: e.target.value as FamilyMember["accessLevel"] })}
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-950"
              >
                <option value="view">View Only</option>
                <option value="edit">Can Edit Documents</option>
                <option value="admin">Full Access</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => addMemberMutation.mutate({
                name: inviteData.name,
                email: inviteData.email,
                relationship: inviteData.relationship,
                accessLevel: inviteData.accessLevel,
                status: "pending",
                documentsRequired: 5,
                documentsProvided: 0,
                invitedAt: new Date()
              })}>
                Send Invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}