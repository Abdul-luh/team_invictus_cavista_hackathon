'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldPlus,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  ClipboardCheck,
  Calendar,
  TrendingUp,
  Pill,
  Users,
  Settings,
  Bell,
  FileText,
  User,
  LucideIcon
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
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
    { label: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
    { label: 'Daily Check-in', href: '/patient/checkin', icon: ClipboardCheck },
    { label: 'Appointments', href: '/patient/appointments', icon: Calendar },
    { label: 'Health Trends', href: '/patient/trends', icon: TrendingUp },
    { label: 'Pharmacy', href: '/patient/pharmarcy', icon: Pill },
    { label: 'Community', href: '/patient/community', icon: Users },
    { label: 'Settings', href: '/patient/settings', icon: Settings },
  ];

  const caregiverNav: NavItem[] = [
    { label: 'Dashboard', href: '/caregiver/dashboard', icon: LayoutDashboard },
    { label: 'Patients', href: '/caregiver/patients', icon: Users },
    { label: 'Notifications', href: '/caregiver/notifications', icon: Bell },
    { label: 'Appointments', href: '/caregiver/appointments', icon: Calendar },
    { label: 'Health Records', href: '/caregiver/records', icon: FileText },
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
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          z-index: 100;
          flex-shrink: 0;
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
          color: #16a34a;
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
          background: #f0fdf4;
          color: #111827;
        }

        .nav-item.active {
          background: #f0fdf4;
          color: #16a34a;
          font-weight: 600;
        }

        .nav-label {
          display: ${isCollapsed ? 'none' : 'block'};
          font-size: 0.9375rem;
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        .sidebar-footer {
          padding: 1.25rem;
          border-top: 1px solid #f3f4f6;
        }

        .footer-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          border-radius: 8px;
          transition: background 0.2s;
          cursor: pointer;
        }

        .footer-profile:hover {
          background: #f0fdf4;
        }

        .avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f0fdf4;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #16a34a;
          border: 1px solid #dcfce7;
        }

        .collapse-toggle {
          cursor: pointer;
          background: none;
          border: none;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .collapse-toggle:hover {
          color: #16a34a;
        }

        @media (max-width: 1024px) {
          .sidebar {
            width: ${isCollapsed ? '0px' : '280px'}; /* On mobile, we hide it completely when collapsed */
            overflow: hidden;
            position: absolute;
            left: 0;
            top: 0;
            bottom: 0;
            background: white;
            z-index: 1000;
          }
          .sidebar-overlay {
            display: ${isCollapsed ? 'none' : 'block'};
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
          }
        }
      `}</style>

      <div className="sidebar-overlay" onClick={onToggle} />
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-area">
            <ShieldPlus size={24} strokeWidth={2.5} />
            <span className="logo-text">SickleSense</span>
          </div>
          <button className="collapse-toggle" onClick={onToggle}>
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="nav-section">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className={`nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </span>
                <span className="nav-label">{item.label}</span>
                {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="footer-profile">
            <div className="avatar-circle">
              <User size={18} />
            </div>
            {!isCollapsed && <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>My Account</span>}
          </div>
        </div>
      </aside>
    </>
  );
};