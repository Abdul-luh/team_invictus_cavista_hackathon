'use client';

import { useState, useEffect } from 'react';
import { Sidebar, Header } from '@/components';
import { usePathname } from 'next/navigation';

export default function CaregiverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  // Handle responsive collapse
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="caregiver-shell">
      <style>{`
        .caregiver-shell {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background-color: #f9fafb;
        }

        .caregiver-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
          height: 100vh;
          overflow-y: auto;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (max-width: 1024px) {
          .caregiver-shell {
            height: 100vh;
            overflow: hidden;
          }
          .caregiver-main {
            flex: 1;
            height: 100vh;
            overflow-y: auto;
          }
        }

        .caregiver-content {
          flex: 1;
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        @media (max-width: 640px) {
          .caregiver-content {
            padding: 1rem;
          }
        }
      `}</style>

      <Sidebar
        userRole="caregiver"
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />

      <main className="caregiver-main">
        <Header
          title={pathname === '/caregiver/dashboard' ? 'Dashboard' : 'Caregiver Portal'}
          userRole="caregiver"
          onMenuClick={() => setIsCollapsed(!isCollapsed)}
        />
        <div className="caregiver-content">
          {children}
        </div>
      </main>
    </div>
  );
}
