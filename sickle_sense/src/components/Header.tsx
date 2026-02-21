'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { NotificationBell } from './NotificationBell';

interface HeaderProps {
  title: string;
  userRole: 'patient' | 'caregiver';
}

export const Header = ({ title, userRole }: HeaderProps) => {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserName(userData.name || (userRole === 'patient' ? 'John Doe' : 'Dr. Smith'));
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
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    router.push('/auth');
  };

  return (
    <>
      <style>{`
        .header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(226, 232, 240, 0.6);
          position: sticky;
          top: 0;
          z-index: 40;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
        }

        .header-container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 0.75rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .brand-logo {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.25rem;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          transition: transform 0.2s ease;
        }

        .brand-logo:hover {
          transform: scale(1.05);
        }

        .title-section {
          display: flex;
          flex-direction: column;
        }

        .title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a202c;
          line-height: 1.2;
          margin: 0;
        }

        .subtitle {
          font-size: 0.75rem;
          color: #718096;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .time-badge {
          background: #f7fafc;
          padding: 0.125rem 0.5rem;
          border-radius: 1rem;
          font-size: 0.7rem;
          color: #4a5568;
          font-weight: 500;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .date-display {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #f7fafc;
          border-radius: 2rem;
          border: 1px solid #e2e8f0;
        }

        .date-icon {
          color: #667eea;
          font-size: 1rem;
        }

        .date-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: #4a5568;
        }

        .user-menu {
          position: relative;
        }

        .user-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem 0.5rem 0.5rem 1rem;
          background: linear-gradient(135deg, #f7fafc 0%, #ffffff 100%);
          border: 1px solid #e2e8f0;
          border-radius: 2rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .user-button:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
          transform: translateY(-1px);
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1a202c;
        }

        .user-role-badge {
          font-size: 0.7rem;
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
          padding: 0.125rem 0.5rem;
          border-radius: 1rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .dropdown-arrow {
          color: #a0aec0;
          transition: transform 0.2s ease;
        }

        .user-button:hover .dropdown-arrow {
          transform: translateY(2px);
          color: #667eea;
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          width: 240px;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          overflow: hidden;
          animation: slideDown 0.2s ease;
          z-index: 50;
        }

        .dropdown-header {
          padding: 1rem;
          background: linear-gradient(135deg, #f7fafc 0%, #ffffff 100%);
          border-bottom: 1px solid #e2e8f0;
        }

        .dropdown-user-name {
          font-weight: 600;
          color: #1a202c;
          font-size: 0.9375rem;
        }

        .dropdown-user-email {
          font-size: 0.75rem;
          color: #718096;
          margin-top: 0.25rem;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: #4a5568;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          cursor: pointer;
          width: 100%;
          border: none;
          background: none;
          text-align: left;
        }

        .dropdown-item:hover {
          background: #f7fafc;
          color: #667eea;
        }

        .dropdown-item.logout {
          color: #e53e3e;
          border-top: 1px solid #e2e8f0;
        }

        .dropdown-item.logout:hover {
          background: #fff5f5;
        }

        .item-icon {
          font-size: 1.1rem;
          width: 20px;
        }

        .divider {
          height: 1px;
          background: #e2e8f0;
          margin: 0.5rem 0;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .header-container {
            padding: 0.75rem 1rem;
          }

          .date-display {
            display: none;
          }

          .title {
            font-size: 1.25rem;
          }

          .user-info {
            display: none;
          }

          .user-button {
            padding: 0.5rem;
          }

          .user-avatar {
            width: 40px;
            height: 40px;
          }
        }

        @media (max-width: 480px) {
          .brand-logo {
            width: 36px;
            height: 36px;
            font-size: 1rem;
          }

          .title {
            font-size: 1rem;
          }

          .subtitle {
            display: none;
          }
        }
      `}</style>

      <header className="header">
        <div className="header-container">


          <div className="header-right">
            {/* Date Display */}
            <div className="date-display">
              <span className="date-icon">📅</span>
              <span className="date-text">
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
                <svg 
                  className="dropdown-arrow" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {showMenu && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-user-name">{userName}</div>
                    <div className="dropdown-user-email">
                      {userName.toLowerCase().replace(' ', '.')}@sicklesense.com
                    </div>
                  </div>

                    <button
                        onClick={() => {
                        setShowMenu(false);
                        router.push(userRole === 'patient' ? '/patient/profile' : '/caregiver/profile');
                        }}
                        className="dropdown-item"
                    >
                        <span className="item-icon">👤</span>
                        My Profile
                    </button>

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      router.push(userRole === 'patient' ? '/patient/settings' : '/caregiver/settings');
                    }}
                    className="dropdown-item"
                  >
                    <span className="item-icon">⚙️</span>
                    Settings
                  </button>

                  {userRole === 'caregiver' && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        router.push('/caregiver/analytics');
                      }}
                      className="dropdown-item"
                    >
                      <span className="item-icon">📊</span>
                      Analytics
                    </button>
                  )}

                  <div className="divider" />

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      router.push(userRole === 'patient' ? '/patient/help' : '/caregiver/help');
                    }}
                    className="dropdown-item"
                  >
                    <span className="item-icon">❓</span>
                    Help & Support
                  </button>

                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout"
                  >
                    <span className="item-icon">🚪</span>
                    Logout
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