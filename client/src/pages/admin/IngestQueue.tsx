import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  Users, 
  Download, 
  Plus,
  Link as LinkIcon,
  X,
  RefreshCw,
  Folder,
  Clock
} from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast'
import { formatDate } from '@/lib/dateFormat';
import { apiRequest } from '@/lib/queryClient';

interface IngestQueueItem {
  id: string;
  folderPath: string;
  folderName: string;
  caseId: string | null;
  clientName: string | null;
  clientEmail: string | null;
  contentHash: string;
  fileCount: number;
  fileList: any[];
  status: 'pending' | 'linked' | 'created' | 'ignored';
  linkedToCaseId: string | null;
  processedBy: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Status badge color mapping
function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    case 'linked': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'created': return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'ignored': return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}

export default function IngestQueue() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Local state for actions
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IngestQueueItem | null>(null);
  const [linkCaseId, setLinkCaseId] = useState('');

  // Fetch ingest queue
  const { data: queueData, isLoading, error } = useQuery({
    queryKey: ['/api/ingest/queue'],
    queryFn: async () => {
      const response = await fetch('/api/ingest/queue');
      if (!response.ok) throw new Error('Failed to fetch ingest queue');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Manual sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/ingest/sync', 'POST', {});
    },
    onSuccess: (data) => {
      toast({
        title: "Sync Complete",
        description: `Processed ${data.processed} new items from Dropbox`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ingest/queue'] });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync from Dropbox",
        variant: "destructive",
      });
    },
  });

  // Create case mutation
  const createCaseMutation = useMutation({
    mutationFn: async (queueId: string) => {
      return apiRequest(`/api/ingest/${queueId}/create-case`, 'POST', {
        userId: 'admin-user' // TODO: Get from auth context
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Case Created",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ingest/queue'] });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create case",
        variant: "destructive",
      });
    },
  });

  // Link case mutation
  const linkCaseMutation = useMutation({
    mutationFn: async ({ queueId, caseId }: { queueId: string; caseId: string }) => {
      return apiRequest(`/api/ingest/${queueId}/link-case`, 'POST', {
        caseId,
        userId: 'admin-user' // TODO: Get from auth context
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Case Linked",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ingest/queue'] });
      setIsLinkDialogOpen(false);
      setLinkCaseId('');
      setSelectedItem(null);
    },
    onError: (error: any) => {
      toast({
        title: "Linking Failed",
        description: error.message || "Failed to link case",
        variant: "destructive",
      });
    },
  });

  // Ignore mutation
  const ignoreMutation = useMutation({
    mutationFn: async (queueId: string) => {
      return apiRequest(`/api/ingest/${queueId}/ignore`, 'POST', {
        userId: 'admin-user' // TODO: Get from auth context
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Item Ignored",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ingest/queue'] });
    },
    onError: (error: any) => {
      toast({
        title: "Action Failed",
        description: error.message || "Failed to ignore item",
        variant: "destructive",
      });
    },
  });

  const handleBack = () => {
    setLocation('/admin/cases');
  };

  const handleManualSync = () => {
    syncMutation.mutate();
  };

  const handleCreateCase = (item: IngestQueueItem) => {
    createCaseMutation.mutate(item.id);
  };

  const handleLinkCase = (item: IngestQueueItem) => {
    setSelectedItem(item);
    setIsLinkDialogOpen(true);
  };

  const handleIgnore = (item: IngestQueueItem) => {
    ignoreMutation.mutate(item.id);
  };

  const handleLinkSubmit = () => {
    if (selectedItem && linkCaseId.trim()) {
      linkCaseMutation.mutate({ 
        queueId: selectedItem.id, 
        caseId: linkCaseId.trim() 
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load ingest queue</p>
          <Button onClick={handleBack} variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Cases
          </Button>
        </div>
      </div>
    );
  }

  const queueItems = queueData?.items || [];
  const pendingItems = queueItems.filter((item: IngestQueueItem) => item.status === 'pending');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="gap-2"
              data-testid="button-back-to-cases"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Cases
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text)]">
                Dropbox Ingest Queue
              </h1>
              <p className="text-[var(--text-subtle)]">
                Manage auto-imported folders from Dropbox /CASES
              </p>
            </div>
          </div>
          
          <Button
            onClick={handleManualSync}
            disabled={syncMutation.isPending}
            className="gap-2"
            data-testid="button-sync-dropbox"
          >
            <RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            Sync from Dropbox Now
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Folder className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueItems.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-400">{pendingItems.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cases Created</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {queueItems.filter((item: IngestQueueItem) => item.status === 'created').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cases Linked</CardTitle>
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {queueItems.filter((item: IngestQueueItem) => item.status === 'linked').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Queue Items */}
        <div className="space-y-4">
          {queueItems.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Folder className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-[var(--text)] mb-2">No Items in Queue</h3>
                <p className="text-[var(--text-subtle)] text-center mb-6">
                  No folders have been detected in Dropbox /CASES yet.
                  <br />
                  Click "Sync from Dropbox Now" to check for new folders.
                </p>
                <Button onClick={handleManualSync} disabled={syncMutation.isPending}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                  Sync Now
                </Button>
              </CardContent>
            </Card>
          ) : (
            queueItems.map((item: IngestQueueItem) => (
              <Card key={item.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Folder className="h-5 w-5 text-[var(--text-subtle)]" />
                      <div>
                        <CardTitle className="text-lg">{item.folderName}</CardTitle>
                        <CardDescription className="text-sm">
                          {item.folderPath} • {item.fileCount} files
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Extracted Info */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Extracted Information</Label>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-muted-foreground">Case ID:</span>{' '}
                          <span className="font-mono">{item.caseId || 'Not detected'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Client Name:</span>{' '}
                          <span>{item.clientName || 'Not detected'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>{' '}
                          <span>{item.clientEmail || 'Not detected'}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Processing Info */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Processing Details</Label>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-muted-foreground">Created:</span>{' '}
                          <span>{formatDate(item.createdAt)} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {item.processedAt && (
                          <div>
                            <span className="text-muted-foreground">Processed:</span>{' '}
                            <span>{formatDate(item.processedAt)} {new Date(item.processedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        )}
                        {item.linkedToCaseId && (
                          <div>
                            <span className="text-muted-foreground">Linked to:</span>{' '}
                            <span className="font-mono">{item.linkedToCaseId}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Actions</Label>
                      <div className="flex flex-wrap gap-2">
                        {item.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleCreateCase(item)}
                              disabled={createCaseMutation.isPending}
                              className="gap-1"
                              data-testid={`button-create-case-${item.id}`}
                            >
                              <Plus className="h-3 w-3" />
                              Create Case
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLinkCase(item)}
                              disabled={linkCaseMutation.isPending}
                              className="gap-1"
                              data-testid={`button-link-case-${item.id}`}
                            >
                              <LinkIcon className="h-3 w-3" />
                              Link to Existing
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleIgnore(item)}
                              disabled={ignoreMutation.isPending}
                              className="gap-1"
                              data-testid={`button-ignore-${item.id}`}
                            >
                              <X className="h-3 w-3" />
                              Ignore
                            </Button>
                          </>
                        )}
                        {item.status !== 'pending' && (
                          <span className="text-sm text-muted-foreground px-3 py-1 bg-muted rounded">
                            {item.status === 'created' && 'Case has been created'}
                            {item.status === 'linked' && 'Linked to existing case'}
                            {item.status === 'ignored' && 'Marked as ignored'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Link Case Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link to Existing Case</DialogTitle>
            <DialogDescription>
              Enter the Case ID to link this Dropbox folder to an existing case.
              Documents will be attached and a timeline event will be created.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="caseId">Case ID</Label>
              <Input
                id="caseId"
                value={linkCaseId}
                onChange={(e) => setLinkCaseId(e.target.value)}
                placeholder="e.g., ABC123"
                className="font-mono"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsLinkDialogOpen(false);
                  setLinkCaseId('');
                  setSelectedItem(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleLinkSubmit}
                disabled={!linkCaseId.trim() || linkCaseMutation.isPending}
              >
                Link Case
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}