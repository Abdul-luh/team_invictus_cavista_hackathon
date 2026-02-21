 'use client';

import React from 'react';
import { Header, Sidebar } from '@/components';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="shell">
        <Sidebar userRole="patient" />
        <div className="main">
          {/* Header will show page title when pages set it via Header props inside content; default here */}
          <Header title="Patient Area" userRole="patient" />
          <div className="content">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
