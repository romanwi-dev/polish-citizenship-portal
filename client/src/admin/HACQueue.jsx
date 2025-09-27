import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Shield,
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  FileText,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Printer
} from 'lucide-react';

export default function HACQueue() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [approver, setApprover] = useState('');
  const [expandedPayloads, setExpandedPayloads] = useState(new Set());

  // Fetch pending HAC requests
  const { data: pendingData, isLoading: pendingLoading, error: pendingError } = useQuery({
    queryKey: ['hac', 'pending'],
    queryFn: async () => {
      const response = await fetch('/api/hac/pending');
      if (!response.ok) {
        throw new Error('Failed to fetch pending HAC requests');
      }
      return response.json();
    },
    // DISABLED AUTO-REFRESH - prevents constant refreshing
    // refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Approve HAC request mutation
  const approveMutation = useMutation({
    mutationFn: async ({ requestId, approvedBy, comments }) => {
      const response = await fetch('/api/hac/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, approvedBy, comments }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve HAC request');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Applied",
        description: `HAC request has been approved and applied successfully.`,
      });
      queryClient.invalidateQueries(['hac', 'pending']);
      setApprovalDialogOpen(false);
      setSelectedRequest(null);
      setApprover('');
    },
    onError: (error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Decline HAC request mutation  
  const declineMutation = useMutation({
    mutationFn: async ({ requestId, declinedBy, reason }) => {
      const response = await fetch('/api/hac/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, declinedBy, reason }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to decline HAC request');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Request Declined",
        description: `HAC request has been declined and archived.`,
      });
      queryClient.invalidateQueries(['hac', 'pending']);
      setDeclineDialogOpen(false);
      setSelectedRequest(null);
      setDeclineReason('');
      setApprover('');
    },
    onError: (error) => {
      toast({
        title: "Decline Failed", 
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setApprovalDialogOpen(true);
  };

  const handleDecline = (request) => {
    setSelectedRequest(request);
    setDeclineDialogOpen(true);
  };

  const confirmApprove = () => {
    if (!selectedRequest) return;
    approveMutation.mutate({
      requestId: selectedRequest.id,
      approvedBy: approver.trim() || 'HAC Admin',
      comments: `Approved via HAC Queue at ${new Date().toISOString()}`
    });
  };

  const confirmDecline = () => {
    if (!selectedRequest || !declineReason.trim()) return;
    declineMutation.mutate({
      requestId: selectedRequest.id,
      declinedBy: approver.trim() || 'HAC Admin',
      reason: declineReason.trim()
    });
  };

  const togglePayload = (requestId) => {
    const newExpanded = new Set(expandedPayloads);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedPayloads(newExpanded);
  };

  const getTypeIcon = (type) => {
    // Normalize type to handle both uppercase and lowercase formats
    const normalizedType = type.toLowerCase();
    switch (normalizedType) {
      case 'case_update':
      case 'case_patch': return <FileText className="h-4 w-4" />;
      case 'tree_update':
      case 'tree_patch': return <FileText className="h-4 w-4" />;
      case 'document_update': return <FileText className="h-4 w-4" />;
      case 'status_change':
      case 'status_update': return <AlertTriangle className="h-4 w-4" />;
      case 'pricing_update': return <FileText className="h-4 w-4" />;
      case 'lineage_update': return <FileText className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type) => {
    // Normalize type to handle both uppercase and lowercase formats
    const normalizedType = type.toLowerCase();
    switch (normalizedType) {
      case 'case_update':
      case 'case_patch': return 'bg-blue-500';
      case 'tree_update':
      case 'tree_patch': return 'bg-green-500';
      case 'document_update': return 'bg-yellow-500';
      case 'status_change':
      case 'status_update': return 'bg-red-500';
      case 'pricing_update': return 'bg-purple-500';
      case 'lineage_update': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const pendingRequests = pendingData?.requests || [];

  const handlePrintHACSheet = () => {
    // Add print-specific classes
    document.body.classList.add('printing-hac-sheet');
    
    // Open print dialog
    window.print();
    
    // Remove print classes after printing
    setTimeout(() => {
      document.body.classList.remove('printing-hac-sheet');
    }, 1000);
  };

  return (
    <div 
      className="p-6 min-h-screen"
      style={{ backgroundColor: 'var(--hac-bg, #1a1a1a)' }}
      data-testid="hac-queue"
    >
      <div className="max-w-7xl mx-auto">
        {/* Print Header - Only visible when printing */}
        <div className="print-only print-header mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-black mb-2">HAC Decision Sheet</h1>
            <p className="text-lg text-black">Hierarchical Access Control Review</p>
            <p className="text-sm text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
          </div>
          <hr className="border-black mt-4" />
        </div>

        {/* Header */}
        <div className="mb-8 no-print">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">HAC Queue</h1>
              <Badge variant="outline" className="text-blue-300 border-blue-400">
                Hierarchical Access Control
              </Badge>
            </div>
            <Button
              variant="outline"
              onClick={handlePrintHACSheet}
              data-testid="button-export-hac-pdf"
              className="bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
            >
              <Printer className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
          <p className="text-gray-300">
            Review and approve critical changes to case data and family trees.
          </p>
        </div>

        {/* Print-Only Summary */}
        <div className="print-only mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-xl font-bold text-black mb-4">Queue Summary</h2>
              <div className="space-y-2">
                <div><strong>Total Pending Requests:</strong> {pendingRequests.length}</div>
                <div><strong>Review Date:</strong> {new Date().toLocaleDateString()}</div>
                <div><strong>Reviewed By:</strong> ________________</div>
                <div><strong>Review Time:</strong> ________________</div>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-black mb-4">Decision Summary</h2>
              <div className="space-y-2">
                <div><strong>Approved:</strong> _____ requests</div>
                <div><strong>Declined:</strong> _____ requests</div>
                <div><strong>Pending Review:</strong> _____ requests</div>
                <div><strong>Signature:</strong> ________________</div>
              </div>
            </div>
          </div>
          <div className="page-break"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 no-print">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400">Pending Requests</p>
                  <p className="text-2xl font-bold text-white" data-testid="pending-count">
                    {pendingLoading ? '...' : pendingRequests.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Auto-Refresh</p>
                  <p className="text-sm font-semibold text-green-400">Every 30s</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Security Level</p>
                  <p className="text-sm font-semibold text-blue-400">High</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pending HAC Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                <span className="ml-2 text-gray-300">Loading pending requests...</span>
              </div>
            ) : pendingError ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-400">Error loading requests: {pendingError.message}</p>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-gray-300">No pending HAC requests</p>
              </div>
            ) : (
              <>
                {/* Print-Only Requests List */}
                <div className="print-only space-y-6">
                  {pendingRequests.map((request, index) => (
                    <div key={request.id} className="border border-gray-300 rounded p-4 no-break">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h3 className="font-bold text-black">Request #{index + 1}</h3>
                          <p><strong>ID:</strong> {request.id}</p>
                          <p><strong>Case:</strong> {request.caseId}</p>
                          <p><strong>Type:</strong> {request.type.replace('_', ' ').toUpperCase()}</p>
                        </div>
                        <div>
                          <p><strong>Submitted By:</strong> {request.submittedBy}</p>
                          <p><strong>Date:</strong> {formatDate(request.submittedAt)}</p>
                          <p><strong>Size:</strong> {Math.round(request.fileSize / 1024)} KB</p>
                        </div>
                      </div>
                      <div className="border-t border-gray-300 pt-4 mt-4">
                        <h4 className="font-semibold text-black mb-2">Decision:</h4>
                        <div className="flex gap-8">
                          <label className="flex items-center gap-2">
                            <input type="checkbox" /> <strong>APPROVE</strong>
                          </label>
                          <label className="flex items-center gap-2">
                            <input type="checkbox" /> <strong>DECLINE</strong>
                          </label>
                        </div>
                        <div className="mt-4">
                          <p><strong>Comments:</strong></p>
                          <div className="border border-gray-300 h-20 mt-2"></div>
                        </div>
                        <div className="mt-4">
                          <p><strong>Reviewer Signature:</strong> ________________ <strong>Date:</strong> ________________</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 no-print">
                {pendingRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className="border border-gray-600 rounded-lg p-6 bg-gray-750"
                    data-testid={`hac-request-${request.id}`}
                  >
                    {/* Request Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(request.type)}
                        <div>
                          <p className="font-semibold text-white" data-testid={`request-id-${request.id}`}>
                            {request.id}
                          </p>
                          <p className="text-sm text-gray-400">
                            Case: {request.caseId} • {formatDate(request.submittedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={`${getTypeBadgeColor(request.type)} text-white`}
                          data-testid={`request-type-${request.id}`}
                        >
                          {request.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-yellow-300 border-yellow-400">
                          PENDING
                        </Badge>
                      </div>
                    </div>

                    {/* Request Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="text-gray-300">Submitted By</Label>
                        <p className="text-white">{request.submittedBy}</p>
                      </div>
                      <div>
                        <Label className="text-gray-300">File Size</Label>
                        <p className="text-white">{Math.round(request.fileSize / 1024)} KB</p>
                      </div>
                    </div>

                    {/* JSON Payload Preview */}
                    <div className="mb-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePayload(request.id)}
                        className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                        data-testid={`toggle-payload-${request.id}`}
                      >
                        {expandedPayloads.has(request.id) ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Hide Payload
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Show Payload
                          </>
                        )}
                      </Button>
                      
                      {expandedPayloads.has(request.id) && (
                        <div className="mt-2 p-4 bg-gray-900 rounded border border-gray-600">
                          <Label className="text-gray-300 text-sm">JSON Payload:</Label>
                          <pre 
                            className="text-sm text-gray-100 mt-2 overflow-x-auto"
                            data-testid={`payload-preview-${request.id}`}
                          >
                            {JSON.stringify(request.payload, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApprove(request)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        data-testid={`approve-btn-${request.id}`}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleDecline(request)}
                        variant="destructive"
                        data-testid={`decline-btn-${request.id}`}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Approval Dialog */}
        <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-600 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                Approve HAC Request
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                This will apply the changes and archive the request as approved.
              </DialogDescription>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Request ID</Label>
                  <p className="text-white font-mono">{selectedRequest.id}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Case ID</Label>
                  <p className="text-white">{selectedRequest.caseId}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Type</Label>
                  <p className="text-white">{selectedRequest.type}</p>
                </div>
                <div>
                  <Label htmlFor="approver">Approved By</Label>
                  <Input
                    id="approver"
                    value={approver}
                    onChange={(e) => setApprover(e.target.value)}
                    placeholder="Enter your name or ID"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setApprovalDialogOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmApprove}
                disabled={approveMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
                data-testid="confirm-approve-btn"
              >
                {approveMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Confirm Approval
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Decline Dialog */}
        <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-600 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-400" />
                Decline HAC Request
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Provide a reason for declining this request.
              </DialogDescription>
            </DialogHeader>
            
            {selectedRequest && (
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Request ID</Label>
                  <p className="text-white font-mono">{selectedRequest.id}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Case ID</Label>
                  <p className="text-white">{selectedRequest.caseId}</p>
                </div>
                <div>
                  <Label htmlFor="decline-approver">Declined By</Label>
                  <Input
                    id="decline-approver"
                    value={approver}
                    onChange={(e) => setApprover(e.target.value)}
                    placeholder="Enter your name or ID"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="decline-reason">Decline Reason *</Label>
                  <Textarea
                    id="decline-reason"
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="Explain why this request is being declined..."
                    required
                    className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDeclineDialogOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDecline}
                disabled={declineMutation.isPending || !declineReason.trim()}
                variant="destructive"
                data-testid="confirm-decline-btn"
              >
                {declineMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Confirm Decline
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}