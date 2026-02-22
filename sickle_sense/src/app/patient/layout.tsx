'use client';

import React, { useState } from 'react';
import { Header, Sidebar } from '@/components';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const sidebarWidth = isSidebarCollapsed ? '80px' : '280px';

  return (
    <div className="patient-shell">
      <Sidebar
        userRole="patient"
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className="patient-main">
        <Header
          title="Patient Dashboard"
          userRole="patient"
          onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main className="patient-content">
          {children}
        </main>
      </div>

      <style jsx>{`
        .patient-shell {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background-color: #f9fafb;
        }

        .patient-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .patient-content {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
        }
      `}</style>
      <style jsx global>{`
        body { margin: 0; }
      `}</style>
    </div>
  );
} 