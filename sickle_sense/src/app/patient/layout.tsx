'use client';

import React, { useState } from 'react';
import { Header, Sidebar } from '@/components';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const sidebarWidth = isSidebarCollapsed ? '80px' : '280px';

  return (
    <div className="shell" style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      <Sidebar 
        userRole="patient" 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      {/* Main content area – margin adjusts with sidebar width */}
      <div 
        className="main" 
        style={{ 
          flex: 1, 
          marginLeft: sidebarWidth,
          display: 'flex', 
          flexDirection: 'column',
          transition: 'margin-left 0.3s ease'
        }}
      >
        <Header title="Patient Dashboard" userRole="patient" />
        
        <main className="content" style={{ padding: '2rem', flex: 1 }}>
          {children}
        </main>
      </div>

      <style jsx global>{`
        body { margin: 0; }
      `}</style>
    </div>
  );
} 