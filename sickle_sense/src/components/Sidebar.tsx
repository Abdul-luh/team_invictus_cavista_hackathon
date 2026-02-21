'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

interface SidebarProps {
  userRole: 'patient' | 'caregiver';
}

export const Sidebar = ({ userRole }: SidebarProps) => {
  const pathname = usePathname();

  const patientNav: NavItem[] = [
    { label: 'Dashboard', href: '/patient/dashboard', icon: '📊' },
    { label: 'Daily Check-in', href: '/patient/checkin', icon: '📋' },
    { label: 'Health History', href: '/patient/history', icon: '📈' },
    { label: 'Appointments', href: '/patient/appointments', icon: '📅' },
    { label: 'Caregivers', href: '/patient/caregivers', icon: '🤝' },
    { label: 'Resources', href: '/patient/resources', icon: '📚' },
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
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6 sticky top-0">
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-green-600 text-white font-semibold'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
              {isActive && (
                <span className="ml-auto text-lg">→</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
