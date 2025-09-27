import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useBodyLock } from "@/hooks/useBodyLock";

export function MobileSheet({
  open,
  onClose,
  children,
  title
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  useBodyLock(open);
  
  if (!mounted || !open) return null;
  
  return createPortal(
    <div 
      className="sheet-backdrop" 
      onClick={onClose} 
      aria-hidden="true"
    >
      <div 
        className="edit-sheet editSheet" 
        role="dialog" 
        aria-modal="true" 
        onClick={e => e.stopPropagation()}
        data-testid="edit-sheet-overlay"
      >
        <div className="edit-sheet__header">
          <div className="edit-sheet__title">{title ?? "Edit"}</div>
          <button 
            className="btn-ghost" 
            aria-label="Close" 
            onClick={onClose}
            data-testid="button-close-mobile-sheet"
          >
            ✕
          </button>
        </div>
        <div className="edit-sheet__scroll editSheetContent" data-testid="edit-sheet-content">{children}</div>
      </div>
    </div>,
    document.body
  );
}