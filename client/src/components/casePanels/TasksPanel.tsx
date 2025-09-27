import React from 'react';
import { Settings, Clock, Plus, FileText, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { IOS26Card, IOS26CardHeader, IOS26CardBody } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TasksPanelProps {
  caseId: string;
}

// ActionButton component - mobile-optimized
const ActionButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost'; size?: 'sm' | 'md' | 'lg' }>(({ children, variant = "primary", size = "md", className = "", ...props }, ref) => {
  const btnVariants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "hover:bg-accent hover:text-accent-foreground",
  };
  
  const sizeVariants = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-6 py-3 text-lg"
  };
  
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
        "min-h-[44px] min-w-[44px]", // Touch target optimization for mobile
        btnVariants[variant],
        sizeVariants[size],
        "transition-all duration-200 hover:scale-105 active:scale-95",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

ActionButton.displayName = 'ActionButton';

export default function TasksPanel({ caseId }: TasksPanelProps) {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <IOS26Card strong={true}>
        <IOS26CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Quick Actions</h3>
          </div>
        </IOS26CardHeader>
        <IOS26CardBody>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ActionButton variant="primary" className="w-full" data-testid="button-create-usc-task">
              <Plus className="h-4 w-4 mr-2" />
              Create USC Task
            </ActionButton>
            <ActionButton variant="secondary" className="w-full" data-testid="button-draft-oby">
              <FileText className="h-4 w-4 mr-2" />
              Draft OBY
            </ActionButton>
            <ActionButton variant="ghost" className="w-full" data-testid="button-generate-docs">
              <Download className="h-4 w-4 mr-2" />
              Generate Documents
            </ActionButton>
          </div>
        </IOS26CardBody>
      </IOS26Card>

      {/* Active Tasks */}
      <IOS26Card strong={true}>
        <IOS26CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Active Tasks</h3>
          </div>
        </IOS26CardHeader>
        <IOS26CardBody>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h5 className="font-medium">Birth Certificate Request</h5>
                <p className="text-sm text-muted-foreground">Registry Office: Warsaw</p>
              </div>
              <Badge variant="outline">In Progress</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h5 className="font-medium">Marriage Certificate Request</h5>
                <p className="text-sm text-muted-foreground">Registry Office: Krakow</p>
              </div>
              <Badge variant="outline">Pending</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h5 className="font-medium">Family Tree Completion</h5>
                <p className="text-sm text-muted-foreground">Missing Polish Grandparent details</p>
              </div>
              <Badge variant="outline" className="bg-amber-500/20 text-amber-400">Priority</Badge>
            </div>
          </div>
        </IOS26CardBody>
      </IOS26Card>
    </div>
  );
}