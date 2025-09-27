import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { 
  Video, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Shield,
  UserCheck,
  RefreshCw,
  Eye,
  Mail,
  Phone,
  Trash2,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoTestimonial {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  location: string;
  title: string;
  description: string;
  caseDetails?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  verificationStatus: string;
  aiVerificationScore?: string;
  identityVerified?: boolean;
  identityVerificationMethod?: string;
  contactAvailable?: boolean;
  contactAvailableAfterConsultation?: boolean;
  isPublic?: boolean;
  approvedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export function AdminTestimonials() {
  const [selectedTestimonial, setSelectedTestimonial] = useState<VideoTestimonial | null>(null);
  const [reviewDialog, setReviewDialog] = useState<{ open: boolean; action: 'approve' | 'reject' | null }>({ open: false, action: null });
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // Fetch all testimonials
  const { data: testimonials = [], isLoading } = useQuery({
    queryKey: ['/api/admin/testimonials']
  });

  // Approve testimonial
  const approveMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      return await apiRequest('POST', `/api/admin/testimonials/${id}/approve`, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/testimonials'] });
      toast({ title: "Success", description: "Testimonial approved successfully" });
      setReviewDialog({ open: false, action: null });
      setReviewNotes("");
    }
  });

  // Reject testimonial
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason, notes }: { id: string; reason: string; notes: string }) => {
      return await apiRequest('POST', `/api/admin/testimonials/${id}/reject`, { reason, notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/testimonials'] });
      toast({ title: "Success", description: "Testimonial rejected" });
      setReviewDialog({ open: false, action: null });
      setReviewNotes("");
      setRejectionReason("");
    }
  });

  // Trigger verification
  const verifyMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('POST', `/api/admin/testimonials/${id}/verify`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/testimonials'] });
      toast({ title: "Success", description: "Verification triggered successfully" });
    }
  });

  // Verify identity
  const verifyIdentityMutation = useMutation({
    mutationFn: async ({ id, method }: { id: string; method: string }) => {
      return await apiRequest('POST', `/api/admin/testimonials/${id}/verify-identity`, { method });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/testimonials'] });
      toast({ title: "Success", description: "Identity verification initiated" });
    }
  });

  // Delete testimonial
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/admin/testimonials/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/testimonials'] });
      toast({ title: "Success", description: "Testimonial deleted" });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'ai_verified':
        return <Badge className="bg-blue-100 text-blue-800"><Shield className="h-3 w-3 mr-1" />AI Verified</Badge>;
      case 'manual_review':
        return <Badge className="bg-orange-100 text-orange-800"><AlertCircle className="h-3 w-3 mr-1" />Manual Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filterTestimonials = (status: string) => {
    const typedTestimonials = testimonials as VideoTestimonial[];
    if (status === 'all') return typedTestimonials;
    if (status === 'needs_review') return typedTestimonials.filter((t: VideoTestimonial) => 
      t.verificationStatus === 'pending' || t.verificationStatus === 'manual_review'
    );
    return typedTestimonials.filter((t: VideoTestimonial) => t.verificationStatus === status);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 md:space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-6 w-6" />
            Video Testimonials Management
          </CardTitle>
          <CardDescription>
            Review and manage client video testimonials with AI verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="needs_review" className="w-full">
            <TabsList className="grid w-full grid-cols-5 gap-2 md:gap-5">
              <TabsTrigger value="needs_review">Needs Review</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="ai_verified">AI Verified</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            {['needs_review', 'approved', 'rejected', 'ai_verified', 'all'].map(status => (
              <TabsContent key={status} value={status}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>AI Score</TableHead>
                      <TableHead>Identity</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filterTestimonials(status).map((testimonial: VideoTestimonial) => (
                      <TableRow key={testimonial.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{testimonial.clientName}</div>
                            <div className="text-sm text-gray-500">{testimonial.clientEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{testimonial.title}</TableCell>
                        <TableCell>{testimonial.location}</TableCell>
                        <TableCell>{getStatusBadge(testimonial.verificationStatus)}</TableCell>
                        <TableCell>
                          {testimonial.aiVerificationScore && (
                            <Badge variant="outline">{testimonial.aiVerificationScore}%</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {testimonial.identityVerified ? (
                            <Badge className="bg-green-100 text-green-800">
                              <UserCheck className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline">Unverified</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(testimonial.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setSelectedTestimonial(testimonial)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {testimonial.verificationStatus !== 'approved' && (
                                <DropdownMenuItem onClick={() => {
                                  setSelectedTestimonial(testimonial);
                                  setReviewDialog({ open: true, action: 'approve' });
                                }}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                              )}
                              {testimonial.verificationStatus !== 'rejected' && (
                                <DropdownMenuItem onClick={() => {
                                  setSelectedTestimonial(testimonial);
                                  setReviewDialog({ open: true, action: 'reject' });
                                }}>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => verifyMutation.mutate(testimonial.id)}>
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Re-verify
                              </DropdownMenuItem>
                              {!testimonial.identityVerified && (
                                <>
                                  <DropdownMenuItem onClick={() => verifyIdentityMutation.mutate({ id: testimonial.id, method: 'email' })}>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Verify Email
                                  </DropdownMenuItem>
                                  {testimonial.clientPhone && (
                                    <DropdownMenuItem onClick={() => verifyIdentityMutation.mutate({ id: testimonial.id, method: 'phone' })}>
                                      <Phone className="h-4 w-4 mr-2" />
                                      Verify Phone
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this testimonial?')) {
                                    deleteMutation.mutate(testimonial.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialog.open} onOpenChange={(open) => setReviewDialog({ open, action: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {reviewDialog.action === 'approve' ? 'Approve Testimonial' : 'Reject Testimonial'}
            </DialogTitle>
            <DialogDescription>
              {selectedTestimonial?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {reviewDialog.action === 'reject' && (
              <div>
                <Label htmlFor="reason">Rejection Reason *</Label>
                <Textarea
                  id="reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Reason for rejection..."
                  required
                />
              </div>
            )}
            <div>
              <Label htmlFor="notes">Review Notes</Label>
              <Textarea
                id="notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Additional notes..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReviewDialog({ open: false, action: null })}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (reviewDialog.action === 'approve' && selectedTestimonial) {
                    approveMutation.mutate({ id: selectedTestimonial.id, notes: reviewNotes });
                  } else if (reviewDialog.action === 'reject' && selectedTestimonial) {
                    rejectMutation.mutate({ id: selectedTestimonial.id, reason: rejectionReason, notes: reviewNotes });
                  }
                }}
                disabled={reviewDialog.action === 'reject' && !rejectionReason}
              >
                {reviewDialog.action === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      {selectedTestimonial && !reviewDialog.open && (
        <Dialog open={!!selectedTestimonial} onOpenChange={() => setSelectedTestimonial(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Testimonial Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Client Name</Label>
                  <p className="font-medium">{selectedTestimonial.clientName}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedTestimonial.clientEmail}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="font-medium">{selectedTestimonial.clientPhone || 'N/A'}</p>
                </div>
                <div>
                  <Label>Location</Label>
                  <p className="font-medium">{selectedTestimonial.location}</p>
                </div>
              </div>
              <div>
                <Label>Title</Label>
                <p className="font-medium">{selectedTestimonial.title}</p>
              </div>
              <div>
                <Label>Description</Label>
                <p className="text-sm">{selectedTestimonial.description}</p>
              </div>
              {selectedTestimonial.caseDetails && (
                <div>
                  <Label>Case Details</Label>
                  <p className="text-sm">{selectedTestimonial.caseDetails}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Verification Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedTestimonial.verificationStatus)}</div>
                </div>
                <div>
                  <Label>AI Score</Label>
                  <p className="font-medium">{selectedTestimonial.aiVerificationScore || 'N/A'}%</p>
                </div>
              </div>
              {selectedTestimonial.videoUrl && (
                <div>
                  <Label>Video URL</Label>
                  <p className="text-sm font-mono break-all">{selectedTestimonial.videoUrl}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}