'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Icon } from '@/shared/components/ui/icon';
import { GoogleSpotlightCard } from '@/shared/components/ui/google-spotlight-card';

interface AdminBlock {
  id: string;
  title: string;
  description: string;
  iconName: string;
  iconColor: string;
  bgTint: string;
  href: string;
}

export default function AdminPage() {
  const adminBlocks: AdminBlock[] = [
    {
      id: 'members',
      title: 'Members',
      description: 'Manage chapter member roster, domain seniors, and roles.',
      iconName: 'group',
      iconColor: 'var(--gdg-blue)',
      bgTint: 'var(--md-primary-container)',
      href: '/admin/members',
    },
    {
      id: 'applications',
      title: 'Applications',
      description: 'Review, approve, and track absence and leave applications.',
      iconName: 'assignment',
      iconColor: 'var(--gdg-red)',
      bgTint: 'var(--md-error-container)',
      href: '/admin/leave',
    },
    {
      id: 'meetings',
      title: 'Meetings',
      description: 'Schedule and manage Google Meet syncs and tracks.',
      iconName: 'videocam',
      iconColor: 'var(--gdg-yellow)',
      bgTint: 'var(--md-warning-container)',
      href: '/admin/meetings',
    },
    {
      id: 'tasks',
      title: 'Tasks',
      description: 'Assign deliverables, monitor progress, and review submissions.',
      iconName: 'check_circle',
      iconColor: 'var(--gdg-green)',
      bgTint: 'var(--md-success-container)',
      href: '/admin/tasks',
    },
    {
      id: 'work-report',
      title: 'Work Report',
      description: 'Chapter deliverables overview and completion metrics.',
      iconName: 'assessment',
      iconColor: '#a855f7',
      bgTint: 'rgba(168, 85, 247, 0.12)',
      href: '/admin/work-report',
    },
    {
      id: 'notice',
      title: 'Notice',
      description: 'Broadcast chapter notices and announcements to all members.',
      iconName: 'campaign',
      iconColor: '#f97316',
      bgTint: 'rgba(249, 115, 22, 0.12)',
      href: '/admin/notice',
    },
    {
      id: 'events',
      title: 'Events',
      description: 'Plan, publish, and monitor workshops, hackathons, and study jams.',
      iconName: 'event',
      iconColor: 'var(--gdg-blue)',
      bgTint: 'var(--md-primary-container)',
      href: '/admin/events',
    },
  ];

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* 7 Dedicated Admin Blocks */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {adminBlocks.map((block) => (
            <Link key={block.id} href={block.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <GoogleSpotlightCard
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  borderRadius: 'var(--radius-xl)',
                  height: '100%',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-lg)',
                      background: block.bgTint,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: block.iconColor,
                    }}
                  >
                    <Icon name={block.iconName} size={26} fill />
                  </div>
                  <Icon name="arrow_forward" size={18} color="var(--text-subtle)" />
                </div>

                <div>
                  <h3
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      marginBottom: '6px',
                    }}
                  >
                    {block.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {block.description}
                  </p>
                </div>
              </GoogleSpotlightCard>
            </Link>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
