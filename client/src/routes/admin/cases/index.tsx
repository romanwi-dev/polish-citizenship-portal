import React from 'react';
import { CasesGrid } from './CasesGrid';

/**
 * Admin Cases page - displays the main cases grid
 */
export const AdminCasesPage: React.FC = () => {
  return (
    <section id="portal-cases" className="portal-scope">
      <div className="min-h-screen bg-[var(--pc-surface)] p-0 md:p-6">
        <div className="max-w-7xl mx-0 md:mx-auto">
          <CasesGrid />
        </div>
      </div>
    </section>
  );
};

export default AdminCasesPage;