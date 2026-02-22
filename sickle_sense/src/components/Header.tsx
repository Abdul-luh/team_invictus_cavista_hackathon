'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { NotificationBell } from './NotificationBell';
import { User, Settings, LogOut, Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  userRole: 'patient' | 'caregiver';
  onMenuClick?: () => void;
}

export const Header = ({ title, userRole, onMenuClick }: HeaderProps) => {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        setUserName(userData.name || userData.full_name || (userRole === 'patient' ? 'Amina Okonkwo' : 'Dr. Smith'));
        setUserEmail(userData.email || (userData.name ? `${userData.name.toLowerCase().replace(' ', '.')}@sicklesense.com` : 'user@sicklesense.com'));
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }

    // Update time every minute
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [userRole]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/auth');
  };

  return (
    <>
      <style>{`
        .header {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(22, 163, 74, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
          height: 72px;
          display: flex;
          align-items: center;
        }

        .header-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .brand-logo {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 800;
          font-size: 1.4rem;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.2);
          font-family: 'Sora', sans-serif;
        }

        .title-section {
          display: flex;
          flex-direction: column;
        }

        .title {
          font-family: 'Sora', sans-serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: #111827;
          letter-spacing: -0.02em;
        }

        .subtitle {
          font-size: 0.75rem;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-weight: 400;
        }

        .time-badge {
          font-weight: 600;
          color: #16a34a;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .date-display {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.875rem;
          background: #f0fdf4;
          border-radius: 10px;
          border: 1px solid rgba(22, 163, 74, 0.1);
          color: #15803d;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .user-menu {
          position: relative;
        }

        .user-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.375rem 0.375rem 0.375rem 0.875rem;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .user-button:hover {
          border-color: #16a34a;
          background: white;
          box-shadow: 0 4px 12px rgba(22, 163, 74, 0.08);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.2;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #111827;
        }

        .user-role-badge {
          font-size: 0.7rem;
          color: #16a34a;
          font-weight: 500;
          text-transform: capitalize;
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 0.75rem);
          right: 0;
          width: 260px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
          border: 1px solid rgba(0, 0, 0, 0.05);
          overflow: hidden;
          animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 1000;
        }

        .dropdown-header {
          padding: 1.25rem;
          background: #f9fafb;
          border-bottom: 1px solid #f3f4f6;
        }

        .dropdown-user-name {
          font-weight: 700;
          color: #111827;
          font-size: 1rem;
        }

        .dropdown-user-email {
          font-size: 0.75rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1.25rem;
          color: #374151;
          font-size: 0.9375rem;
          font-weight: 500;
          transition: all 0.2s;
          cursor: pointer;
          width: 100%;
          border: none;
          background: none;
          text-align: left;
        }

        .dropdown-item:hover {
          background: #f0fdf4;
          color: #16a34a;
        }

        .dropdown-item.logout {
          color: #dc2626;
          border-top: 1px solid #f3f4f6;
        }

        .dropdown-item.logout:hover {
          background: #fef2f2;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .header-container { padding: 0 1rem; }
          .date-display, .user-info { display: none; }
          .title { font-size: 1rem; }
          .menu-button { display: flex; }
        }

        .menu-button {
          display: none;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          background: white;
          color: #111827;
          cursor: pointer;
        }
      `}</style>

      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <button className="menu-button" onClick={onMenuClick}>
              <Menu size={20} />
            </button>
            <div className="title-section">
              {/* <h1 className="title">{title}</h1> */}
              <div className="subtitle">
                {/* <span>Healthy Progress</span> */}
                <span className="time-badge">· {currentTime}</span>
              </div>
            </div>
          </div>

          <div className="header-right">
            {/* Date Display */}
            <div className="date-display">
              <span>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>

            {/* Notification Bell */}
            <NotificationBell />

            {/* User Menu */}
            <div className="user-menu">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="user-button"
              >
                <div className="user-avatar">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{userName}</span>
                  <span className="user-role-badge">{userRole}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {showMenu && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-user-name">{userName}</div>
                    <div className="dropdown-user-email">{userEmail}</div>
                  </div>

                  <button className="dropdown-item" onClick={() => {
                    setShowMenu(false);
                    router.push(`/${userRole}/profile`);
                  }}>
                    <User size={18} /> My Profile
                  </button>
                  <button className="dropdown-item" onClick={() => {
                    setShowMenu(false);
                    router.push(`/${userRole}/settings`);
                  }}>
                    <Settings size={18} /> Settings
                  </button>

                  <button className="dropdown-item logout" onClick={handleLogout}>
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};