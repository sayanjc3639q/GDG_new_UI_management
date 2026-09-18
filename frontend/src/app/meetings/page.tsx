'use client';

import React, { useEffect, useState } from 'react';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Modal } from '@/shared/components/ui/modal';
import { EmptyState } from '@/shared/components/ui/empty-state';
import {
  Video,
  Plus,
  Clock,
  Users,
  ExternalLink,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  Info,
  Calendar as CalendarIcon,
  Filter,
} from 'lucide-react';
import { MeetingsService, Meeting } from '@/modules/meetings/meetings.service';

interface CustomMeeting extends Meeting {
  category?: string;
  starred?: boolean;
}

const INITIAL_MEETINGS: CustomMeeting[] = [
  {
    id: 'm1',
    title: 'Developers MEET',
    agenda: 'Monthly sync with all chapter developers to review Q3 sprint progress and tech stack upgrades.',
    date: '2026-08-23',
    time: '18:30 – 19:30',
    meetLink: 'https://meet.google.com/gdg-devs-sync',
    attendeesCount: 15,
    host: 'Sayan Maity',
    status: 'LIVE_NOW',
    category: 'Core Team & Chapter Leads',
    starred: true,
  },
  {
    id: 'm2',
    title: 'Web & Cloud Architecture Review',
    agenda: 'Discussing Next.js 15 migration, microservices architecture, and cloud deployment pipelines.',
    date: '2026-08-23',
    time: '16:00 – 17:00',
    meetLink: 'https://meet.google.com/gdg-hit-web',
    attendeesCount: 12,
    host: 'Arindam Roy',
    status: 'UPCOMING',
    category: 'Web & Cloud Track',
    starred: false,
  },
  {
    id: 'm3',
    title: 'AI & Machine Learning Standup',
    agenda: 'Weekly sync on LLM fine-tuning, RAG pipeline evaluation, and dataset prep.',
    date: '2026-08-24',
    time: '14:00 – 15:00',
    meetLink: 'https://meet.google.com/gdg-aiml-sync',
    attendeesCount: 18,
    host: 'Priya Sharma',
    status: 'UPCOMING',
    category: 'AI & ML Track',
    starred: true,
  },
  {
    id: 'm4',
    title: 'Design System Retrospective',
    agenda: 'Reviewing component library tokens, color palettes, and mobile responsiveness guidelines.',
    date: '2026-08-22',
    time: '11:00 – 12:00',
    meetLink: 'https://meet.google.com/gdg-design-retro',
    attendeesCount: 9,
    host: 'Rohit Sengupta',
    status: 'CONCLUDED',
    category: 'Design & Open Source',
    starred: false,
  },
];

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<CustomMeeting[]>(INITIAL_MEETINGS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<CustomMeeting | null>(null);
  const [filterTab, setFilterTab] = useState<'ALL' | 'UPCOMING' | 'LIVE_NOW' | 'CONCLUDED'>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-23');

  // Small Calendar Month State
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(7); // August (0-indexed: 7)

  // Form State
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [date, setDate] = useState('2026-08-23');
  const [time, setTime] = useState('18:00 – 19:00');
  const [meetLink, setMeetLink] = useState('https://meet.google.com/gdg-new-sync');
  const [host, setHost] = useState('Chapter Lead');
  const [category, setCategory] = useState('Core Team & Chapter Leads');

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const data = await MeetingsService.getMeetings();
      if (data && data.length > 0) {
        setMeetings(
          data.map((m) => ({
            ...m,
            category: 'Core Team & Chapter Leads',
            starred: false,
          }))
        );
      }
    } catch {
      // Fallback to initial meetings
    }
  };

  const toggleStar = (id: string) => {
    setMeetings((prev) =>
      prev.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m))
    );
  };

  const handleCopy = (id: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newMeeting: CustomMeeting = {
      id: `m-${Date.now()}`,
      title,
      agenda: agenda || 'General team sync and discussion.',
      date,
      time,
      meetLink: meetLink || 'https://meet.google.com/new',
      host: host || 'Chapter Member',
      status: 'UPCOMING',
      attendeesCount: 10,
      category,
      starred: false,
    };

    try {
      await MeetingsService.createMeeting({
        title,
        agenda,
        date,
        time,
        meetLink,
        host,
      });
    } catch {
      // Local fallback
    }

    setMeetings([newMeeting, ...meetings]);
    setTitle('');
    setAgenda('');
    setIsScheduleOpen(false);
  };

  // Calendar Helpers
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const formatDayString = (day: number) => {
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    return `${currentYear}-${mStr}-${dStr}`;
  };

  // Filter Logic
  const filteredMeetings = meetings.filter((m) => {
    if (filterTab !== 'ALL' && m.status !== filterTab) return false;
    if (selectedDate && m.date !== selectedDate) return false;
    return true;
  });

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Top Header Row */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div>
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
                marginBottom: '4px',
                display: 'inline-block',
              }}
            >
              Operations &amp; Syncs
            </span>
            <h1 style={{ fontSize: '1.625rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', margin: 0 }}>
              MEETINGS
            </h1>
          </div>

          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => setIsScheduleOpen(true)}
            style={{ borderRadius: '10px', padding: '9px 18px', fontWeight: 700 }}
          >
            Create Meeting
          </Button>
        </div>

        {/* Top Horizontal Filter Tabs Row (All Meetings, Upcoming, Ongoing, Completed) */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '10px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: '6px' }}>
              Filter:
            </span>

            {[
              { id: 'ALL', label: 'All Meetings', count: meetings.length, color: 'var(--gdg-blue)' },
              { id: 'UPCOMING', label: 'Upcoming', count: meetings.filter((m) => m.status === 'UPCOMING').length, color: '#1a73e8' },
              { id: 'LIVE_NOW', label: 'Ongoing / Live', count: meetings.filter((m) => m.status === 'LIVE_NOW').length, color: 'var(--gdg-green)' },
              { id: 'CONCLUDED', label: 'Completed', count: meetings.filter((m) => m.status === 'CONCLUDED').length, color: 'var(--text-muted)' },
            ].map((tab) => {
              const isActive = filterTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id as any)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    background: isActive ? 'var(--bg-elevated)' : 'transparent',
                    border: isActive ? '1px solid var(--border-color)' : '1px solid transparent',
                    color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: tab.color,
                    }}
                  />
                  <span>{tab.label}</span>
                  <Badge variant={isActive ? 'blue' : 'gray'} style={{ fontSize: '0.6875rem', padding: '1px 6px' }}>
                    {tab.count}
                  </Badge>
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                📅 Date: {selectedDate}
              </span>
              <button
                onClick={() => setSelectedDate('')}
                style={{ fontSize: '0.75rem', color: 'var(--gdg-blue)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
              >
                Clear Date
              </button>
            </div>
          )}
        </div>

        {/* Main Split Grid: Left Small Calendar + Right Compact Meeting Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', alignItems: 'start' }}>
          
          {/* Left Side: Small Interactive Calendar (Compact & Rounded) */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
              maxWidth: '330px',
              width: '100%',
              justifySelf: 'start',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontWeight: 800, fontSize: '0.875rem', color: 'var(--text-main)' }}>
                {monthNames[currentMonth]} {currentYear}
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={handlePrevMonth}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '3px 6px',
                    cursor: 'pointer',
                    color: 'var(--text-main)',
                    display: 'flex',
                  }}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={handleNextMonth}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    padding: '3px 6px',
                    cursor: 'pointer',
                    color: 'var(--text-main)',
                    display: 'flex',
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Days Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '6px' }}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <span key={d} style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {d}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px', textAlign: 'center' }}>
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = formatDayString(dayNum);
                const isSelected = selectedDate === dateStr;
                const hasMeeting = meetings.some((m) => m.date === dateStr);

                return (
                  <button
                    key={dayNum}
                    onClick={() => setSelectedDate(isSelected ? '' : dateStr)}
                    style={{
                      padding: '6px 0',
                      fontSize: '0.75rem',
                      fontWeight: isSelected ? 800 : 500,
                      color: isSelected ? '#ffffff' : 'var(--text-main)',
                      background: isSelected ? 'var(--gdg-blue)' : 'transparent',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {dayNum}
                    {hasMeeting && !isSelected && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '2px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: 'var(--gdg-blue)',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Side: Compact Responsive Meeting Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                SCHEDULED MEETINGS ({filteredMeetings.length})
              </span>
            </div>

            {filteredMeetings.length === 0 ? (
              <EmptyState
                title="No Meetings Found"
                description="There are no scheduled meetings matching your selected date or filter."
                actionLabel="Create Meeting"
                onAction={() => setIsScheduleOpen(true)}
                icon={<Video size={20} />}
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '14px' }}>
                {filteredMeetings.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '14px',
                      padding: '14px 16px',
                      boxShadow: '0 3px 10px rgba(0, 0, 0, 0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    {/* Top Row: Status Pill, Time Interval & Star Button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        {m.status === 'LIVE_NOW' && (
                          <span
                            style={{
                              background: 'rgba(52, 168, 83, 0.12)',
                              color: '#2b8a3e',
                              border: '1px solid rgba(52, 168, 83, 0.3)',
                              padding: '2px 8px',
                              borderRadius: '16px',
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#34A853' }} />
                            Live Now
                          </span>
                        )}

                        {m.status === 'UPCOMING' && (
                          <span
                            style={{
                              background: 'rgba(66, 133, 244, 0.12)',
                              color: '#1a73e8',
                              border: '1px solid rgba(66, 133, 244, 0.3)',
                              padding: '2px 8px',
                              borderRadius: '16px',
                              fontSize: '0.6875rem',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#4285F4' }} />
                            Upcoming
                          </span>
                        )}

                        {m.status === 'CONCLUDED' && (
                          <span
                            style={{
                              background: 'var(--bg-elevated)',
                              color: 'var(--text-muted)',
                              border: '1px solid var(--border-color)',
                              padding: '2px 8px',
                              borderRadius: '16px',
                              fontSize: '0.6875rem',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--text-muted)' }} />
                            Completed
                          </span>
                        )}

                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          <Clock size={12} />
                          {m.time}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleStar(m.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: m.starred ? 'var(--gdg-yellow)' : 'var(--text-subtle)',
                          padding: '2px',
                        }}
                      >
                        <Star size={16} fill={m.starred ? 'var(--gdg-yellow)' : 'none'} />
                      </button>
                    </div>

                    {/* Category Tag */}
                    {m.category && (
                      <div>
                        <span
                          style={{
                            background: 'rgba(168, 85, 247, 0.08)',
                            color: '#9333ea',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            display: 'inline-block',
                          }}
                        >
                          {m.category}
                        </span>
                      </div>
                    )}

                    {/* Meeting Title & Description */}
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.01em', marginBottom: '4px' }}>
                        {m.title}
                      </h3>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.4, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {m.agenda}
                      </p>
                    </div>

                    {/* Compact Google Meet Link Box */}
                    <div
                      style={{
                        background: 'rgba(66, 133, 244, 0.08)',
                        border: '1px solid rgba(66, 133, 244, 0.2)',
                        borderRadius: '10px',
                        padding: '6px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                        <Video size={14} color="var(--gdg-blue)" style={{ flexShrink: 0 }} />
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--gdg-blue)',
                            fontWeight: 600,
                            fontFamily: 'monospace',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {m.meetLink}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopy(m.id, m.meetLink)}
                        title="Copy Meet Link"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--gdg-blue)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '2px',
                          flexShrink: 0,
                        }}
                      >
                        {copiedId === m.id ? <Check size={14} color="var(--gdg-green)" /> : <Copy size={14} />}
                      </button>
                    </div>

                    {/* Bottom Action Buttons: Details & Join */}
                    <div
                      style={{
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '10px',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '8px',
                      }}
                    >
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Info size={13} />}
                        onClick={() => setSelectedMeeting(m)}
                        style={{ borderRadius: '8px', fontWeight: 600, padding: '5px 12px', fontSize: '0.75rem' }}
                      >
                        Details
                      </Button>

                      <a href={m.meetLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Video size={13} />}
                          style={{ borderRadius: '8px', fontWeight: 700, padding: '5px 14px', fontSize: '0.75rem' }}
                        >
                          Join
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Schedule Meeting Modal */}
        <Modal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} title="Create New Meeting">
          <form onSubmit={handleCreateMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input
              label="Meeting Title"
              placeholder="e.g. Developers MEET"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Track / Category Tag
              </label>
              <input
                placeholder="e.g. Core Team & Chapter Leads"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  padding: '9px 12px',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  borderRadius: '8px',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Description / Agenda
              </label>
              <textarea
                placeholder="Key sync topics and discussion points..."
                rows={3}
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  padding: '9px 12px',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  outline: 'none',
                  borderRadius: '8px',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <Input
                label="Time Interval"
                placeholder="18:30 – 19:30"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

            <Input
              label="Google Meet Link"
              placeholder="https://meet.google.com/..."
              value={meetLink}
              onChange={(e) => setMeetLink(e.target.value)}
              required
            />

            <Input
              label="Host Organizer"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              required
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <Button type="button" variant="secondary" onClick={() => setIsScheduleOpen(false)} style={{ borderRadius: '10px' }}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" style={{ borderRadius: '10px' }}>
                Create Meeting
              </Button>
            </div>
          </form>
        </Modal>

        {/* Meeting Details Modal */}
        {selectedMeeting && (
          <Modal isOpen={!!selectedMeeting} onClose={() => setSelectedMeeting(null)} title={selectedMeeting.title}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span
                  style={{
                    background: 'rgba(168, 85, 247, 0.1)',
                    color: '#9333ea',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: '16px',
                  }}
                >
                  {selectedMeeting.category || 'General Sync'}
                </span>
              </div>

              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Agenda &amp; Discussion
                </h4>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  {selectedMeeting.agenda}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-elevated)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date &amp; Time</span>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '2px' }}>
                    📅 {selectedMeeting.date}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    ⏰ {selectedMeeting.time}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Host &amp; Attendance</span>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '2px' }}>
                    👤 {selectedMeeting.host}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    👥 {selectedMeeting.attendeesCount} Members Expected
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <Button variant="secondary" onClick={() => setSelectedMeeting(null)} style={{ borderRadius: '10px' }}>
                  Close
                </Button>
                <a href={selectedMeeting.meetLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" leftIcon={<Video size={16} />} style={{ borderRadius: '10px' }}>
                    Join Google Meet
                  </Button>
                </a>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardShell>
  );
}
