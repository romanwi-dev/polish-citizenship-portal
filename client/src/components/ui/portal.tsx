import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
  container?: Element | null;
}

export function Portal({ children, container }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const [portalContainer, setPortalContainer] = useState<Element | null>(null);

  useEffect(() => {
    let targetContainer = container;
    
    if (!targetContainer) {
      // Create or get the default portal container
      let defaultContainer = document.getElementById('portal-root');
      if (!defaultContainer) {
        defaultContainer = document.createElement('div');
        defaultContainer.id = 'portal-root';
        defaultContainer.style.position = 'absolute';
        defaultContainer.style.top = '0';
        defaultContainer.style.left = '0';
        defaultContainer.style.zIndex = '9999';
        defaultContainer.style.pointerEvents = 'none';
        document.body.appendChild(defaultContainer);
      }
      targetContainer = defaultContainer;
    }

    setPortalContainer(targetContainer);
    setMounted(true);

    return () => {
      // Clean up if it's an empty default container
      if (!container && targetContainer && targetContainer.id === 'portal-root' && !targetContainer.hasChildNodes()) {
        document.body.removeChild(targetContainer);
      }
    };
  }, [container]);

  if (!mounted || !portalContainer) {
    return null;
  }

  return createPortal(children, portalContainer);
}