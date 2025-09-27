// Layout Component - Updated: 2025-08-15 9:13 AM - Cache bust: force refresh
import { ReactNode, useState } from 'react';
import { MobileNavigationV3 } from './mobile-navigation-v3';


interface LayoutProps {
  children: ReactNode;
  showMobileNav?: boolean;
  topContent?: ReactNode;
}

export function Layout({ children, showMobileNav = true, topContent }: LayoutProps) {

  return (
    <>
      {topContent}
      {showMobileNav && (
        <MobileNavigationV3 />
      )}
      {children}
    </>
  );
}