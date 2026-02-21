'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
}

interface SidebarProps {
  userRole: 'patient' | 'caregiver';
}

export const Sidebar = ({ userRole }: SidebarProps) => {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [notifications, setNotifications] = useState(0);

  // Simulate fetching notification count
  useEffect(() => {
    if (userRole === 'patient') {
      // Check for pending tasks
      const pendingTasks = localStorage.getItem('pendingTasks');
      if (pendingTasks) {
        setNotifications(JSON.parse(pendingTasks).length);
      }
    }
  }, [userRole]);

  const patientNav: NavItem[] = [
    { label: 'Dashboard', href: '/patient/dashboard', icon: '📊' },
    { label: 'Daily Check-in', href: '/patient/checkin', icon: '📋' },
    { label: 'Health History', href: '/patient/history', icon: '📈' },
    { label: 'Appointments', href: '/patient/appointments', icon: '📅' },
    { label: 'Caregivers', href: '/patient/caregivers', icon: '🤝' },
    { label: 'Resources', href: '/patient/resources', icon: '📚' },
    { 
      label: 'Tasks', 
      href: '/patient/tasks', 
      icon: '✅',
      badge: notifications 
    },
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
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          border-right: 1px solid rgba(0, 0, 0, 0.05);
          min-height: 100vh;
          position: sticky;
          top: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          overflow-x: hidden;
          z-index: 50;
        }

        .sidebar-header {
          padding: 1.5rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          margin-bottom: 1.5rem;
        }

        .logo-area {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          overflow: hidden;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.25rem;
          font-weight: bold;
          flex-shrink: 0;
        }

        .logo-text {
          font-size: 1.25rem;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          white-space: nowrap;
          transition: opacity 0.3s ease;
        }

        .collapse-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #4a5568;
          flex-shrink: 0;
        }

        .collapse-btn:hover {
          background: #f7fafc;
          transform: scale(1.05);
        }

        .nav-section {
          flex: 1;
          padding: 0 0.75rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.875rem 1rem;
          margin: 0.25rem 0;
          border-radius: 12px;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          text-decoration: none;
          color: #4a5568;
        }

        .nav-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 3px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 0 3px 3px 0;
          transform: scaleY(0);
          transition: transform 0.2s ease;
        }

        .nav-item:hover::before {
          transform: scaleY(1);
        }

        .nav-item.active {
          background: linear-gradient(135deg, #667eea10 0%, #764ba210 100%);
          color: #667eea;
        }

        .nav-item.active::before {
          transform: scaleY(1);
        }

        .nav-item.active .nav-icon {
          color: #667eea;
        }

        .nav-icon {
          font-size: 1.25rem;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .nav-label {
          font-size: 0.9375rem;
          font-weight: 500;
          white-space: nowrap;
          transition: opacity 0.3s ease;
          flex: 1;
        }

        .nav-badge {
          background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          border-radius: 20px;
          min-width: 20px;
          text-align: center;
          animation: pulse 2s infinite;
          flex-shrink: 0;
        }

        .nav-arrow {
          font-size: 1rem;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .nav-item.active .nav-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        .sidebar-footer {
          padding: 1.5rem 0.75rem;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          margin-top: auto;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .user-info:hover {
          background: #f7fafc;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .user-details {
          overflow: hidden;
          transition: opacity 0.3s ease;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a202c;
          white-space: nowrap;
        }

        .user-role {
          font-size: 0.75rem;
          color: #718096;
          text-transform: capitalize;
          white-space: nowrap;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        /* Collapsed state styles */
        .sidebar.collapsed .logo-text,
        .sidebar.collapsed .nav-label,
        .sidebar.collapsed .user-details {
          opacity: 0;
          width: 0;
          margin: 0;
        }

        .sidebar.collapsed .nav-item {
          padding: 0.875rem;
          justify-content: center;
        }

        .sidebar.collapsed .nav-badge {
          position: absolute;
          top: 5px;
          right: 5px;
          font-size: 0.625rem;
          padding: 0.125rem 0.25rem;
          min-width: 16px;
        }

        .sidebar.collapsed .user-info {
          justify-content: center;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            transform: translateX(-100%);
          }

          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>

      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-area">
            <div className="logo-icon">SS</div>
            <span className="logo-text">SickleSense</span>
          </div>
          <button 
            className="collapse-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>

        <div className="nav-section">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="nav-badge">{item.badge}</span>
                )}
                {isActive && <span className="nav-arrow">→</span>}
              </Link>
            );
          })}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {userRole === 'patient' ? '👤' : '👥'}
            </div>
            <div className="user-details">
              <div className="user-name">
                {userRole === 'patient' ? 'John Doe' : 'Dr. Smith'}
              </div>
              <div className="user-role">{userRole}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};