import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

export default function MobileSheet({ open, onClose, children, title }: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => setMounted(true), []);
  useLockBodyScroll(open);
  
  if (!mounted || !open) return null;
  
  const el = (
    <div className="sheet-backdrop" onClick={onClose} data-testid="sheet">
      <div className="edit-sheet" role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>
        <div className="edit-sheet__header">
          <div className="edit-sheet__title">{title ?? "Edit"}</div>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="edit-sheet__scroll" ref={scrollRef}>{children}</div>
      </div>
    </div>
  );
  
  return createPortal(el, document.body);
}