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
  Users,
  UserX,
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/shared/lib/api-client';

interface DashboardStats {
  tasksCount: number;
  meetingsCount: number;
  leavesCount: number;
  eventsCount: number;
  membersCount?: number;
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
    tasksCount: 14,
    meetingsCount: 8,
    leavesCount: 3,
    eventsCount: 4,
    membersCount: 42,
  });
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const [upcomingMeetings, setUpcomingMeetings] = useState<UpcomingMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    async function loadDashboard() {
      try {
        const response = await apiClient.get<any>('/dashboard/stats');
        if (response.success && response.data) {
          const apiStats = response.data.stats || {};
          setStats({
            tasksCount: apiStats.tasksCount ?? 14,
            meetingsCount: apiStats.meetingsCount ?? 8,
            leavesCount: apiStats.leavesCount ?? 3,
            eventsCount: apiStats.eventsCount ?? 4,
            membersCount: apiStats.membersCount ?? 42,
          });
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
        // Backend empty / fallback mock data
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const statCards = [
    {
      title: 'Total Active Members',
      badge: 'Active Roster',
      value: (stats.membersCount || 42).toString(),
      unit: 'Members Active',
      percentage: '92%',
      progress: 92,
      color: 'var(--gdg-blue)',
      bgTint: 'rgba(66, 133, 244, 0.1)',
      icon: <Users size={18} color="var(--gdg-blue)" />,
      footerLeft: 'Lead: Sayan Maity',
      footerRight: `${stats.membersCount || 42} Members`,
      href: '/team',
    },
    {
      title: 'Members on Leave',
      badge: 'Leave Logs',
      value: (stats.leavesCount || 3).toString(),
      unit: 'On Leave Today',
      percentage: '15%',
      progress: 15,
      color: 'var(--gdg-red)',
      bgTint: 'rgba(234, 67, 53, 0.1)',
      icon: <UserX size={18} color="var(--gdg-red)" />,
      footerLeft: 'Status: Pending Review',
      footerRight: `${stats.leavesCount || 3} Logs`,
      href: '/leave',
    },
    {
      title: 'Active Tasks',
      badge: 'Sprint Tasks',
      value: (stats.tasksCount || 14).toString(),
      unit: 'Sprints Active',
      percentage: '85%',
      progress: 85,
      color: 'var(--gdg-green)',
      bgTint: 'rgba(52, 168, 83, 0.1)',
      icon: <CheckSquare size={18} color="var(--gdg-green)" />,
      footerLeft: 'Tracked Items',
      footerRight: `${stats.tasksCount || 14} Tasks`,
      href: '/tasks',
    },
    {
      title: 'Scheduled Meetings',
      badge: 'Team Syncs',
      value: (stats.meetingsCount || 8).toString(),
      unit: 'Syncs Scheduled',
      percentage: '78%',
      progress: 78,
      color: 'var(--gdg-yellow)',
      bgTint: 'rgba(251, 188, 4, 0.15)',
      icon: <Video size={18} color="var(--gdg-yellow)" />,
      footerLeft: 'Google Meet Sessions',
      footerRight: `${stats.meetingsCount || 8} Active`,
      href: '/meetings',
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
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'var(--gdg-blue)',
                  background: 'rgba(66, 133, 244, 0.1)',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                GDG HIT Chapter
              </span>
            </div>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>
              Welcome back, GDG HIT Member! 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px', fontWeight: 500 }}>
              📅 {currentDate || 'Loading date...'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link href="/tasks">
              <Button variant="primary" leftIcon={<Plus size={16} />} style={{ borderRadius: '10px' }}>
                Create Task
              </Button>
            </Link>
            <Link href="/meetings">
              <Button variant="secondary" leftIcon={<Video size={16} />} style={{ borderRadius: '10px' }}>
                Launch Meet
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid - 4 GDG Styled Cards with Rounded Corners */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
          {statCards.map((stat, idx) => (
            <Link key={idx} href={stat.href} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '20px',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'pointer',
                  height: '100%',
                }}
              >
                {/* Top Accent Color Bar */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: stat.color,
                  }}
                />

                {/* Card Top Row: Pill Badge & Icon */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: stat.color,
                      background: stat.bgTint,
                      padding: '4px 12px',
                      borderRadius: '20px',
                    }}
                  >
                    {stat.badge}
                  </span>
                  <div
                    style={{
                      padding: '8px',
                      background: 'var(--bg-elevated)',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </div>
                </div>

                {/* Card Main Stat */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                      <span style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
                        {stat.value}
                      </span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        {stat.unit}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {stat.percentage}
                    </span>
                  </div>

                  {/* Horizontal Progress Accent Bar */}
                  <div
                    style={{
                      height: '6px',
                      width: '100%',
                      background: 'var(--bg-elevated)',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      marginTop: '12px',
                      marginBottom: '14px',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${stat.progress}%`,
                        backgroundColor: stat.color,
                        borderRadius: '10px',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Card Footer Divider & Meta Info */}
                <div
                  style={{
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.75rem',
                    color: 'var(--text-subtle)',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{stat.footerLeft}</span>
                  <span>{stat.footerRight}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Two-column operational section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Active Tasks Panel */}
          <Card style={{ padding: '0', overflow: 'hidden', borderRadius: '16px' }}>
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
                <CheckSquare size={16} color="var(--gdg-green)" />
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
                        borderRadius: '10px',
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
          <Card style={{ padding: '0', overflow: 'hidden', borderRadius: '16px' }}>
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
                <Video size={16} color="var(--gdg-yellow)" />
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
                        borderRadius: '10px',
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
