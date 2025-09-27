import React from 'react';
import { User, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Badge } from '@/components/ui/badge';
import { IOS26Card, IOS26CardHeader, IOS26CardBody } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CaseData {
  id: string;
  client?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  state?: string;
  tier?: string;
  processing?: string;
  age?: number;
}

interface OverviewPanelProps {
  caseData: CaseData;
}

function getProcessingColor(processing: string): string {
  switch (processing?.toLowerCase()) {
    case 'tier1': return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'tier2': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'tier3': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    case 'rush': return 'bg-red-500/20 text-red-400 border border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}

function getStateColor(state: string): string {
  switch (state?.toLowerCase()) {
    case 'intake': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'usc_in_flight': return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
    case 'oby_drafting': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    case 'usc_ready': return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'oby_submittable': return 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30';
    case 'oby_submitted': return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';
    case 'decision_received': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}

export default function OverviewPanel({ caseData }: OverviewPanelProps) {
  const caseId = caseData.id;
  
  // Fetch family tree data for overview
  const { data: familyTreeData } = useQuery({
    queryKey: ['family-tree', caseId],
    queryFn: async () => {
      const response = await apiRequest(`/api/admin/cases/${caseId}/family-tree`);
      return response || {};
    }
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Client Information */}
      <IOS26Card strong={true}>
        <IOS26CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Client Information</h3>
          </div>
        </IOS26CardHeader>
        <IOS26CardBody>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-base">{caseData.client?.name || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-base">{caseData.client?.email || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="text-base">{caseData.client?.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Address</label>
              <p className="text-base">{caseData.client?.address || 'Not provided'}</p>
            </div>
          </div>
        </IOS26CardBody>
      </IOS26Card>

      {/* Case Progress */}
      <IOS26Card strong={true}>
        <IOS26CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Case Progress</h3>
          </div>
        </IOS26CardHeader>
        <IOS26CardBody>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Current State</label>
              <Badge className={cn("mt-1", getStateColor(caseData.state))}>
                {caseData.state || 'Unknown'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Processing Tier</label>
              <Badge className={cn("mt-1", getProcessingColor(caseData.tier || caseData.processing))}>
                {caseData.tier || caseData.processing || 'Unknown'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Case Age</label>
              <p className="text-base">{caseData.age || 0} days</p>
            </div>
          </div>
        </IOS26CardBody>
      </IOS26Card>

      {/* Family Tree Summary */}
      <IOS26Card strong={true}>
        <IOS26CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Family Tree Summary</h3>
          </div>
        </IOS26CardHeader>
        <IOS26CardBody>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Applicant</label>
              <p className="text-base">
                {familyTreeData?.applicantAndSpouse?.applicantFirstName || familyTreeData?.applicantAndSpouse?.applicantFamilyName 
                  ? `${familyTreeData.applicantAndSpouse.applicantFirstName} ${familyTreeData.applicantAndSpouse.applicantFamilyName}`.trim()
                  : 'Not provided'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Polish Parent</label>
              <p className="text-base">
                {familyTreeData?.polishParentAndSpouse?.parentFirstName || familyTreeData?.polishParentAndSpouse?.parentFamilyName
                  ? `${familyTreeData.polishParentAndSpouse.parentFirstName} ${familyTreeData.polishParentAndSpouse.parentFamilyName}`.trim()
                  : 'Not provided'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Polish Grandparent</label>
              <p className="text-base">
                {familyTreeData?.polishGrandparentAndSpouse?.grandparentFirstName || familyTreeData?.polishGrandparentAndSpouse?.grandparentFamilyName
                  ? `${familyTreeData.polishGrandparentAndSpouse.grandparentFirstName} ${familyTreeData.polishGrandparentAndSpouse.grandparentFamilyName}`.trim()
                  : 'Not provided'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Badge className="mt-1">
                {familyTreeData && Object.keys(familyTreeData).length > 0 ? 'Complete' : 'Incomplete'}
              </Badge>
            </div>
          </div>
        </IOS26CardBody>
      </IOS26Card>
    </div>
  );
}