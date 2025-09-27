import React from 'react';
import { Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { IOS26Card, IOS26CardHeader, IOS26CardBody } from '@/components/ui/card';
import { formatDate } from '@/lib/dateFormat';

interface TimelinePanelProps {
  caseId: string;
}

export default function TimelinePanel({ caseId }: TimelinePanelProps) {
  const { data: timeline } = useQuery({
    queryKey: ['case-timeline', caseId],
    queryFn: async () => {
      const response = await apiRequest(`/api/timeline-events/${caseId}`);
      return response.data || [];
    }
  });

  return (
    <IOS26Card strong={true}>
      <IOS26CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Timeline</h3>
        </div>
      </IOS26CardHeader>
      <IOS26CardBody>
        <div className="space-y-4">
          {timeline?.length ? (
            timeline.map((event: any, index: number) => (
              <div key={event.id || index} className="flex items-start gap-4 pb-4 border-b border-border/30 last:border-0">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {event.completedDate ? formatDate(event.completedDate) : 'Pending'}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">No timeline events found</p>
          )}
        </div>
      </IOS26CardBody>
    </IOS26Card>
  );
}