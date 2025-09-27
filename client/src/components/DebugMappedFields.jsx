import { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Database, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function DebugMappedFields({ mappedFields = {} }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const fieldsArray = Object.entries(mappedFields);
  
  // Don't render if no fields
  if (fieldsArray.length === 0) {
    return null;
  }

  const handleCopyField = async (key, value) => {
    try {
      await navigator.clipboard.writeText(value || "");
      toast({
        title: "Copied to clipboard",
        description: `${key}: ${value || "—"}`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleCopyAll = async () => {
    try {
      const jsonData = JSON.stringify(mappedFields, null, 2);
      await navigator.clipboard.writeText(jsonData);
      toast({
        title: "All fields copied",
        description: `${fieldsArray.length} fields copied as JSON`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy all fields to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="debug-mapped-fields">
      {/* Accordion Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
        data-testid="button-debug-mapped-fields-toggle"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <Database className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            Debug: Mapped Fields ({fieldsArray.length})
          </span>
        </div>
      </button>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="border border-border/30 rounded-lg bg-card/50 backdrop-blur-sm">
          {/* Sticky Header with Actions */}
          <div className="sticky top-0 bg-card/90 backdrop-blur-sm border-b border-border/30 p-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {fieldsArray.length} fields
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAll}
                className="text-xs"
                data-testid="button-copy-all-fields"
              >
                <Download className="h-3 w-3 mr-1" />
                Copy All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="text-xs"
                data-testid="button-collapse-fields"
              >
                Collapse
              </Button>
            </div>
          </div>

          {/* Fields List */}
          <div className="debugList max-h-[360px] overflow-auto">
            {fieldsArray.map(([key, value]) => (
              <div
                key={key}
                className="debugRow grid grid-cols-[160px_1fr_44px] sm:grid-cols-[160px_1fr_44px] gap-2 items-center p-3 border-b border-border/20 last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                {/* Key */}
                <div className="text-xs font-mono text-muted-foreground uppercase truncate" title={key}>
                  {key}
                </div>
                
                {/* Value */}
                <div 
                  className="text-sm text-foreground truncate min-w-0" 
                  title={value || "—"}
                  style={{ textOverflow: "ellipsis" }}
                >
                  {value || "—"}
                </div>
                
                {/* Copy Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyField(key, value)}
                  className="w-10 h-8 p-0 hover:bg-muted"
                  data-testid={`button-copy-field-${key.toLowerCase().replace(/\s+/g, '-')}`}
                  title={`Copy ${key}`}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Custom CSS classes
const styles = `
.debug-mapped-fields {
  margin: 8px 0;
}

.debugList {
  max-height: 360px;
  overflow: auto;
}

.debugRow {
  display: grid;
  grid-template-columns: 160px 1fr 44px;
  gap: 8px;
  align-items: center;
}

@media (max-width: 480px) {
  .debugRow {
    grid-template-columns: 120px 1fr 44px;
  }
}
`;