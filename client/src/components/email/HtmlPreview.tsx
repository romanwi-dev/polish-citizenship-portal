import React, { useState, useMemo, forwardRef } from 'react';
import type { EmailTemplate } from '@/types/emailTemplates';
// Button import removed - using ActionButton component for unified styling
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Copy, 
  Smartphone, 
  Monitor, 
  Eye,
  AlertTriangle,
  FileText 
} from 'lucide-react';

// Original ActionButton component for unified styling
const ActionButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
  }
>(({ variant = 'secondary', size = 'md', className = '', children, ...props }, ref) => {
  const baseClasses = 'btn touch-target transition-all duration-200 hover:scale-105';
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary', 
    ghost: 'btn-ghost'
  };
  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'px-4 py-2',
    lg: 'text-lg px-6 py-3'
  };

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

ActionButton.displayName = 'ActionButton';

interface HtmlPreviewProps {
  template: EmailTemplate;
}

export function HtmlPreview({ template }: HtmlPreviewProps) {
  const [isMobileView, setIsMobileView] = useState(false);
  const { toast } = useToast();

  // Sanitize HTML by removing script tags and dangerous attributes
  const sanitizedHtml = useMemo(() => {
    let html = template.html;
    
    // Remove script tags
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    // Remove dangerous event handlers (basic sanitization)
    html = html.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
    
    // Remove external resource loading by replacing src with data-src for images
    html = html.replace(/\ssrc\s*=\s*["']https?:\/\/[^"']*["']/gi, (match) => {
      return match.replace('src=', 'data-original-src=');
    });
    
    return html;
  }, [template.html]);

  const copyToClipboard = async (content: string, type: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: `${type} copied!`,
        description: `${type} content has been copied to your clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy content to clipboard.",
        variant: "destructive",
      });
    }
  };

  const viewportStyles = isMobileView 
    ? { width: '375px', height: '812px' }
    : { width: '100%', minHeight: '600px' };

  return (
    <div className="h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {template.name}
            </h3>
            <div className="flex flex-wrap gap-1 mt-1">
              {template.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Copy Buttons */}
            <ActionButton
              size="sm"
              onClick={() => copyToClipboard(template.html, 'HTML')}
              data-testid="copy-html-preview"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy HTML
            </ActionButton>
            
            <ActionButton
              size="sm"
              variant="secondary"
              onClick={() => copyToClipboard(template.text, 'Plain Text')}
              data-testid="copy-plain-preview"
            >
              <FileText className="h-3 w-3 mr-1" />
              Copy Plain
            </ActionButton>
          </div>
        </div>

        {/* Device Toggle */}
        <div className="flex items-center gap-2">
          <ActionButton
            size="sm"
            variant={!isMobileView ? "primary" : "secondary"}
            onClick={() => setIsMobileView(false)}
            data-testid="desktop-view"
          >
            <Monitor className="h-3 w-3 mr-1" />
            Desktop
          </ActionButton>
          <ActionButton
            size="sm"
            variant={isMobileView ? "primary" : "secondary"}
            onClick={() => setIsMobileView(true)}
            data-testid="mobile-view"
          >
            <Smartphone className="h-3 w-3 mr-1" />
            Mobile
          </ActionButton>
          
          {isMobileView && (
            <Badge variant="secondary" className="text-xs">
              375×812
            </Badge>
          )}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Preview Mode:</strong> External images and scripts are disabled for security. 
            Paste into Apple Mail by copying from Safari render for full functionality.
          </div>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-950">
        <div 
          className={`mx-auto bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-300 ${
            isMobileView ? 'border border-zinc-200' : ''
          }`}
          style={viewportStyles}
        >
          <div 
            className="email-preview-content overflow-auto h-full"
            style={{ 
              background: 'white',
              ...(!isMobileView && { padding: '20px' })
            }}
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            data-testid="email-preview-frame"
          />
        </div>
      </div>

      {/* Footer Note */}
      <div className="p-3 bg-blue-50 dark:bg-blue-900/10 border-t border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Tip:</strong> Copy the HTML above, then open Safari, paste into a new tab to render properly, 
            and copy from there into Apple Mail for best results.
          </p>
        </div>
      </div>
    </div>
  );
}