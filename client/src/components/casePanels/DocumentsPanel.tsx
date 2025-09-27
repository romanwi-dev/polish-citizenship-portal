import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { IOS26Card, IOS26CardBody } from '@/components/ui/card';
import { DocumentsDropboxSidebar } from '@/features/ingest/DocumentsDropboxSidebar';
import { ReviewDrawer } from '@/features/ingest/ReviewDrawer';
import { cn } from '@/lib/utils';

interface CaseData {
  documents?: { [key: string]: any };
}

interface DocumentsPanelProps {
  caseId: string;
  caseData: CaseData;
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

export default function DocumentsPanel({ caseId, caseData }: DocumentsPanelProps) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  
  const documents = Array.from({ length: 12 }, (_, i) => ({
    id: `doc-${i + 1}`,
    name: `Document ${i + 1}`,
    status: caseData.documents?.[`doc${i + 1}`]?.status || 'pending'
  }));

  return (
    <div className="flex gap-6">
      {/* Main Documents Grid */}
      <div className="flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <IOS26Card key={doc.id} strong={true}>
              <IOS26CardBody>
                <div className="flex items-center justify-between p-4">
                  <div>
                    <h4 className="font-medium">{doc.name}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={cn(
                        "w-3 h-3 rounded-full",
                        doc.status === 'completed' ? 'bg-green-500' :
                        doc.status === 'uploaded' ? 'bg-amber-500' :
                        'bg-red-500'
                      )} />
                      <span className="text-sm text-muted-foreground capitalize">{doc.status}</span>
                    </div>
                  </div>
                  <ActionButton variant="ghost" size="sm" data-testid={`button-upload-${doc.id}`}>
                    <Upload className="h-4 w-4" />
                  </ActionButton>
                </div>
              </IOS26CardBody>
            </IOS26Card>
          ))}
        </div>
      </div>
      
      {/* Dropbox Ingest Sidebar */}
      <DocumentsDropboxSidebar 
        caseId={caseId}
        onReviewSuggestion={setSelectedSuggestion}
      />
      
      {/* Review Drawer */}
      {selectedSuggestion && (
        <ReviewDrawer
          suggestionId={selectedSuggestion}
          onClose={() => setSelectedSuggestion(null)}
        />
      )}
    </div>
  );
}