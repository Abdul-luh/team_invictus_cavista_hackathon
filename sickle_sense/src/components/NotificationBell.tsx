'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: 'task' | 'alert' | 'reminder';
  title: string;
  message: string;
  taskId?: string;
  read: boolean;
  timestamp: Date;
}

export const NotificationBell = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load notifications
    const loadNotifications = () => {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        const notifs = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n: Notification) => !n.read).length);
      } else {
        // Create sample notifications
        const sampleNotifs: Notification[] = [
          {
            id: '1',
            type: 'task',
            title: '💧 Hydration Reminder',
            message: 'Time to drink 500ml of water',
            taskId: '1',
            read: false,
            timestamp: new Date(),
          },
          {
            id: '2',
            type: 'task',
            title: '💊 Medication Due',
            message: 'Take your Hydroxyurea now',
            taskId: '2',
            read: false,
            timestamp: new Date(),
          },
          {
            id: '3',
            type: 'reminder',
            title: '🌡️ Temperature Check',
            message: 'Record your body temperature',
            taskId: '5',
            read: false,
            timestamp: new Date(),
          },
        ];
        setNotifications(sampleNotifs);
        setUnreadCount(3);
        localStorage.setItem('notifications', JSON.stringify(sampleNotifs));
      }
    };

    loadNotifications();

    // Set up periodic checks for task reminders
    const interval = setInterval(() => {
      checkForReminders();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Handle click outside to close dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const checkForReminders = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Check for task times and create notifications
    const taskReminders = [
      { hour: 8, minute: 0, taskId: '1', title: '💧 Morning Hydration' },
      { hour: 8, minute: 30, taskId: '2', title: '💊 Morning Medication' },
      { hour: 12, minute: 0, taskId: '3', title: '💧 Mid-day Hydration' },
      { hour: 14, minute: 0, taskId: '4', title: '😴 Rest Period' },
      { hour: 16, minute: 0, taskId: '5', title: '🌡️ Temperature Check' },
      { hour: 20, minute: 0, taskId: '6', title: '💊 Evening Medication' },
    ];

    taskReminders.forEach(reminder => {
      if (reminder.hour === currentHour && reminder.minute === currentMinute) {
        const newNotification: Notification = {
          id: `notif_${Date.now()}`,
          type: 'task',
          title: `⏰ ${reminder.title}`,
          message: `It's time for your ${reminder.title.toLowerCase()} task`,
          taskId: reminder.taskId,
          read: false,
          timestamp: new Date(),
        };

        setNotifications(prev => {
          const updated = [newNotification, ...prev];
          localStorage.setItem('notifications', JSON.stringify(updated));
          return updated;
        });
        setUnreadCount(prev => prev + 1);
      }
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    const updated = notifications.map(n =>
      n.id === notification.id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    setUnreadCount(prev => Math.max(0, prev - 1));
    localStorage.setItem('notifications', JSON.stringify(updated));

    // Navigate to task if applicable
    if (notification.taskId) {
      setShowDropdown(false);
      router.push('/patient/tasks');
    }
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    setUnreadCount(0);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task': return '✅';
      case 'alert': return '⚠️';
      case 'reminder': return '🔔';
      default: return '📌';
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((new Date().getTime() - timestamp.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <>
      <style>{`
        .notification-container {
          position: relative;
          display: inline-block;
        }

        .notification-bell {
          background: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
          font-size: 1.25rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .notification-bell:hover {
          transform: scale(1.05);
          background: #f7fafc;
        }

        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          min-width: 20px;
          height: 20px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          animation: pulse 2s infinite;
        }

        .notification-dropdown {
          position: absolute;
          top: 50px;
          right: 0;
          width: 360px;
          background: white;
          border-radius: 1rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          z-index: 1000;
          animation: slideDown 0.2s ease;
        }

        .notification-header {
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .notification-header h3 {
          font-weight: 600;
          color: #2d3748;
          margin: 0;
        }

        .mark-read {
          background: none;
          border: none;
          color: #667eea;
          font-size: 0.875rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }

        .mark-read:hover {
          background: #f7fafc;
        }

        .notification-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .notification-item {
          padding: 1rem;
          display: flex;
          gap: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid #f7fafc;
        }

        .notification-item:hover {
          background: #f7fafc;
        }

        .notification-item.unread {
          background: #ebf8ff;
        }

        .notification-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #f7fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }

        .notification-content {
          flex: 1;
        }

        .notification-title {
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.25rem;
          font-size: 0.9375rem;
        }

        .notification-message {
          color: #718096;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .notification-time {
          color: #a0aec0;
          font-size: 0.75rem;
        }

        .empty-notifications {
          padding: 2rem;
          text-align: center;
          color: #718096;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
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

        @media (max-width: 480px) {
          .notification-dropdown {
            width: 300px;
            right: -100px;
          }
        }
      `}</style>

      <div className="notification-container" ref={dropdownRef}>
        <button 
          className="notification-bell"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          🔔
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>

        {showDropdown && (
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  className="mark-read"
                  onClick={markAllAsRead}
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="notification-list">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">
                        {notification.title}
                      </div>
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      <div className="notification-time">
                        {getTimeAgo(notification.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-notifications">
                  No notifications
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};