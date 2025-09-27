import { createPortal } from "react-dom";
import { ReactNode } from "react";

interface PortalProps {
  children: ReactNode;
  container?: Element | null;
}

export default function Portal({ children, container }: PortalProps) {
  return createPortal(children, container || document.body);
}