'use client';

import React, { useEffect, useState } from 'react';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { EmptyState } from '@/shared/components/ui/empty-state';
import {
  Calendar,
  CheckSquare,
  Video,
  FileText,
  ArrowRight,
  Clock,
  ExternalLink,
  Plus,
  Inbox,
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/shared/lib/api-client';

interface DashboardStats {
  tasksCount: number;
  meetingsCount: number;
  leavesCount: number;
  eventsCount: number;
}

interface RecentTask {
  id: string;
  title: string;
  due: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: string;
}

interface UpcomingMeeting {
  id: string;
  title: string;
  time: string;
  meetLink: string;
  attendees: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    tasksCount: 0,
    meetingsCount: 0,
    leavesCount: 0,
    eventsCount: 0,
  });
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await apiClient.get<any>('/dashboard/stats');
        if (response.success && response.data) {
          setStats(response.data.stats || { tasksCount: 0, meetingsCount: 0, leavesCount: 0, eventsCount: 0 });
          setRecentTasks(
            (response.data.recentTasks || []).map((t: any) => ({
              id: t.id,
              title: t.title,
              due: t.dueDate,
              priority: t.priority,
              status: t.status,
            }))
          );
          setUpcomingMeetings(
            (response.data.upcomingMeetings || []).map((m: any) => ({
              id: m.id,
              title: m.title,
              time: `${m.date} • ${m.time}`,
              meetLink: m.meetLink,
              attendees: m.attendeesCount || 5,
            }))
          );
        }
      } catch {
        // Backend empty / not seeded yet
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const statCards = [
    {
      title: 'Scheduled Meetings',
      value: stats.meetingsCount.toString(),
      subtitle: stats.meetingsCount === 0 ? 'No meetings scheduled' : `${stats.meetingsCount} active syncs`,
      icon: <Video size={20} color="var(--gdg-blue)" />,
      accent: 'blue' as const,
      href: '/meetings',
    },
    {
      title: 'Assigned Tasks',
      value: stats.tasksCount.toString(),
      subtitle: stats.tasksCount === 0 ? 'No tasks assigned' : `${stats.tasksCount} tracked tasks`,
      icon: <CheckSquare size={20} color="var(--gdg-yellow)" />,
      accent: 'yellow' as const,
      href: '/tasks',
    },
    {
      title: 'Leave Requests',
      value: stats.leavesCount.toString(),
      subtitle: stats.leavesCount === 0 ? 'No pending leaves' : `${stats.leavesCount} requests submitted`,
      icon: <FileText size={20} color="var(--gdg-red)" />,
      accent: 'red' as const,
      href: '/leave',
    },
    {
      title: 'Scheduled Sessions',
      value: stats.eventsCount.toString(),
      subtitle: stats.eventsCount === 0 ? 'No upcoming events' : `${stats.eventsCount} events planned`,
      icon: <Calendar size={20} color="var(--gdg-green)" />,
      accent: 'green' as const,
      href: '/calendar',
    },
  ];

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Top Header Banner */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderLeft: '4px solid var(--gdg-blue)',
            padding: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Badge variant="blue">OPERATIONS HUB</Badge>
              <Badge variant="gray">LIVE DATABASE</Badge>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              Chapter Operational Dashboard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
              Real-time overview of tasks, calendar schedules, leadership meetings, and member leave logs.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Link href="/tasks">
              <Button variant="primary" leftIcon={<Plus size={16} />}>
                Create Task
              </Button>
            </Link>
            <Link href="/meetings">
              <Button variant="secondary" leftIcon={<Video size={16} />}>
                Schedule Meeting
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {statCards.map((stat, idx) => (
            <Link key={idx} href={stat.href}>
              <Card accentColor={stat.accent} style={{ height: '100%', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      {stat.title}
                    </span>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                      {stat.value}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '6px', display: 'block' }}>
                      {stat.subtitle}
                    </span>
                  </div>
                  <div
                    style={{
                      padding: '8px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    {stat.icon}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Two-column operational section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Active Tasks Panel */}
          <Card style={{ padding: '0', overflow: 'hidden' }}>
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--bg-elevated)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={16} color="var(--gdg-yellow)" />
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                  Assigned Team Tasks
                </span>
              </div>
              <Link href="/tasks" style={{ fontSize: '0.75rem', color: 'var(--gdg-blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                All Tasks <ArrowRight size={12} />
              </Link>
            </div>

            <div style={{ padding: '16px' }}>
              {recentTasks.length === 0 ? (
                <EmptyState
                  title="No Tasks Available"
                  description="Nothing to see here yet. Create your first task to assign action items."
                  actionLabel="Create Task"
                  onAction={() => (window.location.href = '/tasks')}
                  icon={<CheckSquare size={20} />}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentTasks.map((t) => (
                    <div
                      key={t.id}
                      style={{
                        padding: '12px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-input)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                          {t.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> Due: {t.due}
                        </div>
                      </div>
                      <Badge variant={t.priority === 'HIGH' ? 'red' : t.priority === 'MEDIUM' ? 'yellow' : 'blue'}>
                        {t.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Today's Meetings Panel */}
          <Card style={{ padding: '0', overflow: 'hidden' }}>
            <div
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--bg-elevated)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Video size={16} color="var(--gdg-blue)" />
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                  Upcoming Meetings
                </span>
              </div>
              <Link href="/meetings" style={{ fontSize: '0.75rem', color: 'var(--gdg-blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                All Meetings <ArrowRight size={12} />
              </Link>
            </div>

            <div style={{ padding: '16px' }}>
              {upcomingMeetings.length === 0 ? (
                <EmptyState
                  title="No Meetings Scheduled"
                  description="Nothing to see here yet. Schedule your first sync or standup."
                  actionLabel="Schedule Meeting"
                  onAction={() => (window.location.href = '/meetings')}
                  icon={<Video size={20} />}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {upcomingMeetings.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        padding: '12px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-input)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                          {m.title}
                        </span>
                        <Badge variant="blue">{m.attendees} Members</Badge>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ⏰ {m.time}
                      </div>
                      <a
                        href={m.meetLink}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--gdg-blue)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '2px',
                          fontWeight: 600,
                        }}
                      >
                        Join via Google Meet <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
