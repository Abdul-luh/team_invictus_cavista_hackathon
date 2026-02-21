'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { ShieldPlus, ChevronLeft, ChevronRight } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: string; // emoji or simple string icon
  badge?: number;
}

interface SidebarProps {
  userRole: 'patient' | 'caregiver';
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ userRole, isCollapsed, onToggle }: SidebarProps) => {
  const pathname = usePathname();
  // notifications logic can stay here or be lifted; keeping as is for simplicity
  // For brevity, we'll keep the notifications logic unchanged

  const patientNav: NavItem[] = [
    { label: 'Dashboard', href: '/patient/dashboard', icon: '📊' },
    { label: 'Daily Check-in', href: '/patient/checkin', icon: '📋' },
    { label: 'Health History', href: '/patient/history', icon: '📈' },
    { label: 'Appointments', href: '/patient/appointments', icon: '📅' },
    { label: 'Caregivers', href: '/patient/caregivers', icon: '🤝' },
    { label: 'Resources', href: '/patient/resources', icon: '📚' },
    { label: 'Tasks', href: '/patient/tasks', icon: '✅', badge: 0 }, // replace with actual badge logic
    { label: 'Pharmacy', href: '/patient/pharmarcy', icon: '✅', badge: 0 }, // replace with actual badge logic
  ];

  const caregiverNav: NavItem[] = [
    { label: 'Dashboard', href: '/caregiver/dashboard', icon: '📊' },
    { label: 'Patients', href: '/caregiver/patients', icon: '👥' },
    { label: 'Notifications', href: '/caregiver/notifications', icon: '🔔' },
    { label: 'Appointments', href: '/caregiver/appointments', icon: '📅' },
    { label: 'Health Records', href: '/caregiver/records', icon: '📁' },
  ];

  const navItems = userRole === 'patient' ? patientNav : caregiverNav;

  return (
    <>
      <style>{`
        .sidebar {
          width: ${isCollapsed ? '80px' : '280px'};
          background: white;
          border-right: 1px solid #e5e7eb;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          z-index: 100;
        }

        .sidebar-header {
          padding: 1.5rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: ${isCollapsed ? 'center' : 'space-between'};
          border-bottom: 1px solid #f3f4f6;
          height: 80px;
        }

        .logo-area {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #0369a1;
        }

        .logo-text {
          font-weight: 800;
          font-size: 1.1rem;
          display: ${isCollapsed ? 'none' : 'block'};
        }

        .nav-section {
          flex: 1;
          padding: 1.5rem 0.75rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          margin-bottom: 0.5rem;
          border-radius: 10px;
          text-decoration: none;
          color: #64748b;
          transition: all 0.2s;
          justify-content: ${isCollapsed ? 'center' : 'flex-start'};
        }

        .nav-item:hover {
          background: #f8fafc;
          color: #0f172a;
        }

        .nav-item.active {
          background: #f0f9ff;
          color: #0284c7;
          font-weight: 600;
        }

        .nav-label {
          display: ${isCollapsed ? 'none' : 'block'};
          font-size: 0.9375rem;
        }

        .nav-badge {
          background: #ef4444;
          color: white;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: auto;
          display: ${isCollapsed ? 'none' : 'block'};
        }

        .sidebar-footer {
          padding: 1.5rem 1rem;
          border-top: 1px solid #f3f4f6;
        }

        .collapse-toggle {
          cursor: pointer;
          background: none;
          border: none;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-area">
            <ShieldPlus size={28} strokeWidth={2.5} />
            <span className="logo-text">SickleSense</span>
          </div>
          <button className="collapse-toggle" onClick={onToggle}>
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="nav-section">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1'}}>
              <span style={{ fontSize: 16 }}>👤</span>
            </div>
            {!isCollapsed && <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>My Account</span>}
          </div>
        </div>
      </aside>
    </>
  );
};