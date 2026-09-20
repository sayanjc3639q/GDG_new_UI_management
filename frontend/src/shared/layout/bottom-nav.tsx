'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/shared/components/ui/icon';

// Primary dock navigation items with rich squircle icon tile aesthetics (matching Google/iOS dock)
const dockItems = [
  {
    label: 'Dashboard',
    href: '/',
    iconName: 'dashboard',
    gradient: 'linear-gradient(135deg, #1a73e8, #0d47a1)', // Google Blue
    shadow: '0 6px 16px rgba(26, 115, 232, 0.35)',
  },
  {
    label: 'Calendar',
    href: '/calendar',
    iconName: 'calendar_month',
    gradient: 'linear-gradient(135deg, #f29900, #e37400)', // Google Amber/Orange
    shadow: '0 6px 16px rgba(242, 153, 0, 0.35)',
  },
  {
    label: 'Tasks',
    href: '/tasks',
    iconName: 'task_alt',
    gradient: 'linear-gradient(135deg, #a142f4, #681da8)', // Purple / Deliverables
    shadow: '0 6px 16px rgba(161, 66, 244, 0.35)',
  },
  {
    label: 'Meetings',
    href: '/meetings',
    iconName: 'videocam',
    gradient: 'linear-gradient(135deg, #34a853, #188038)', // Google Green
    shadow: '0 6px 16px rgba(52, 168, 83, 0.35)',
  },
  {
    label: 'All Apps',
    href: '/all',
    iconName: 'grid_view',
    gradient: 'linear-gradient(135deg, #ea4335, #c5221f)', // Google Red
    shadow: '0 6px 16px rgba(234, 67, 53, 0.35)',
  },
];

export const BottomNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <div className="mobile-dock-wrapper">
      <nav className="mobile-dock-container">
        {dockItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-dock-item ${isActive ? 'is-active' : ''}`}
              aria-label={item.label}
              title={item.label}
            >
              <div
                className="mobile-dock-squircle"
                style={{
                  background: item.gradient,
                  boxShadow: isActive ? item.shadow : '0 3px 8px rgba(0, 0, 0, 0.15)',
                  transform: isActive ? 'scale(1.08)' : 'scale(1)',
                }}
              >
                <Icon name={item.iconName} size={22} color="#ffffff" fill={isActive} />
              </div>
              {isActive && <div className="mobile-dock-active-dot" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

