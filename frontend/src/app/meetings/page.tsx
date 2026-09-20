'use client';

import React, { useEffect, useState } from 'react';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Modal } from '@/shared/components/ui/modal';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Icon } from '@/shared/components/ui/icon';
import { useMeetings } from '@/shared/hooks/useMeetings';
import { useAuth } from '@/shared/context/auth-context';
import { MeetingsService, Meeting } from '@/modules/meetings/meetings.service';

interface CustomMeeting extends Meeting {
  category?: string;
  starred?: boolean;
}

export default function MeetingsPage() {
  const { user } = useAuth();
  const canManageMeetings = Boolean(
    user && (user.role === 'DEVELOPER' || user.role === 'LEAD' || user.role === 'DOMAIN_SENIOR')
  );
  const { meetings: storeMeetings, createMeeting: createMeetingAction } = useMeetings();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<CustomMeeting | null>(null);
  const [filterTab, setFilterTab] = useState<'ALL' | 'UPCOMING' | 'LIVE_NOW' | 'CONCLUDED'>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Small Calendar Month State
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());

  // Form State
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('18:00 – 19:00');
  const [meetLink, setMeetLink] = useState('https://meet.google.com/new');
  const [host, setHost] = useState('Chapter Lead');
  const [category, setCategory] = useState('Core Team & Chapter Leads');

  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());

  const toggleStar = (id: string) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const meetings: CustomMeeting[] = storeMeetings.map((m) => ({
    ...m,
    category: (m as any).category || 'Core Team & Chapter Leads',
    starred: starredIds.has(m.id),
  }));

  const handleCopy = (id: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      await createMeetingAction({
        title,
        agenda,
        date,
        time,
        meetLink,
        host,
      });

      setTitle('');
      setAgenda('');
      setIsScheduleOpen(false);
    } catch (err) {
      console.error('Failed to create meeting:', err);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Filter Chips Bar with Create Meeting Action */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                    padding: '6px 16px',
                    borderRadius: 'var(--radius-full)',
                    background: isActive ? 'var(--md-primary-container)' : 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    color: isActive ? 'var(--md-on-primary-container)' : 'var(--text-muted)',
                    fontWeight: 500,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  className="m3-interactive"
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {selectedDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  📅 Date: {selectedDate}
                </span>
                <button
                  onClick={() => setSelectedDate('')}
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--md-primary)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Clear Date
                </button>
              </div>
            )}

            {canManageMeetings && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Icon name="video_call" size={16} />}
                onClick={() => setIsScheduleOpen(true)}
              >
                Create Meeting
              </Button>
            )}
          </div>
        </div>


        {/* Main Layout: Left Meeting Cards List + Right Sticky Calendar (Hidden on Mobile) */}
        <div className="meetings-layout-container">
          {/* Left Side: Meeting Cards */}
          <div className="meetings-list-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Scheduled Syncs ({filteredMeetings.length})
              </span>
            </div>

            {filteredMeetings.length === 0 ? (
              <EmptyState
                title="No Meetings Found"
                description={
                  canManageMeetings
                    ? 'There are no scheduled meetings matching your selected date or filter.'
                    : 'There are currently no scheduled meetings.'
                }
                actionLabel={canManageMeetings ? 'Create Meeting' : undefined}
                onAction={canManageMeetings ? () => setIsScheduleOpen(true) : undefined}
                icon="videocam"
              />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '16px',
                }}
              >
                {filteredMeetings.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '18px 20px',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                    className="m3-interactive"
                  >
                    {/* Top Row: Status Pill, Time & Star */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {m.status === 'LIVE_NOW' && (
                          <Badge variant="green">Live Now</Badge>
                        )}
                        {m.status === 'UPCOMING' && (
                          <Badge variant="blue">Upcoming</Badge>
                        )}
                        {m.status === 'CONCLUDED' && (
                          <Badge variant="gray">Completed</Badge>
                        )}

                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            fontWeight: 500,
                          }}
                        >
                          <Icon name="schedule" size={14} />
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
                          display: 'flex',
                          alignItems: 'center',
                          padding: '2px',
                        }}
                        aria-label="Star meeting"
                      >
                        <Icon
                          name={m.starred ? 'star' : 'star_outline'}
                          size={18}
                          fill={m.starred}
                          color={m.starred ? 'var(--gdg-yellow)' : 'var(--text-subtle)'}
                        />
                      </button>
                    </div>

                    {/* Category Tag */}
                    {m.category && (
                      <div>
                        <Badge variant="purple" size="sm">
                          {m.category}
                        </Badge>
                      </div>
                    )}

                    {/* Meeting Title & Description */}
                    <div>
                      <h3
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 600,
                          color: 'var(--text-main)',
                          letterSpacing: '-0.01em',
                          marginBottom: '4px',
                        }}
                      >
                        {m.title}
                      </h3>
                      <p
                        style={{
                          fontSize: '0.8125rem',
                          color: 'var(--text-muted)',
                          lineHeight: 1.4,
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {m.agenda}
                      </p>
                    </div>

                    {/* Google Meet Link Container */}
                    <div
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                        <Icon name="videocam" size={16} color="var(--md-primary)" />
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--md-primary)',
                            fontWeight: 500,
                            fontFamily: 'var(--font-mono)',
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
                          color: 'var(--md-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '2px',
                          flexShrink: 0,
                        }}
                      >
                        <Icon name={copiedId === m.id ? 'check' : 'content_copy'} size={16} />
                      </button>
                    </div>

                    {/* Bottom Action Buttons */}
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
                        leftIcon={<Icon name="info" size={16} />}
                        onClick={() => setSelectedMeeting(m)}
                      >
                        Details
                      </Button>

                      <a href={m.meetLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <Button
                          variant="primary"
                          size="sm"
                          leftIcon={<Icon name="videocam" size={16} />}
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

          {/* Right Side: Sticky Fixed Calendar Sidebar (Hidden on Mobile) */}
          <div className="meetings-calendar-sidebar">
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)',
                padding: '20px',
                boxShadow: 'var(--shadow-sm)',
                width: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '14px',
                }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                  {monthNames[currentMonth]} {currentYear}
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={handlePrevMonth}
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-full)',
                      width: '30px',
                      height: '30px',
                      cursor: 'pointer',
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    className="m3-interactive"
                    aria-label="Previous month"
                  >
                    <Icon name="chevron_left" size={16} />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-full)',
                      width: '30px',
                      height: '30px',
                      cursor: 'pointer',
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    className="m3-interactive"
                    aria-label="Next month"
                  >
                    <Icon name="chevron_right" size={16} />
                  </button>
                </div>
              </div>

              {/* Days Header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  textAlign: 'center',
                  marginBottom: '6px',
                }}
              >
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <span key={d} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {d}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
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
                        padding: '8px 0',
                        fontSize: '0.8125rem',
                        fontWeight: isSelected ? 600 : 400,
                        color: isSelected ? 'var(--md-on-primary)' : 'var(--text-main)',
                        background: isSelected ? 'var(--md-primary)' : 'transparent',
                        borderRadius: 'var(--radius-full)',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.15s ease',
                      }}
                      className={!isSelected ? 'm3-interactive' : ''}
                    >
                      {dayNum}
                      {hasMeeting && !isSelected && (
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '3px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: 'var(--md-primary)',
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Meeting Modal */}
        <Modal
          isOpen={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
          title="Create New Meeting"
          icon="video_call"
        >
          <form onSubmit={handleCreateMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Meeting Title"
              placeholder="e.g. Developers MEET"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Input
              label="Track / Category Tag"
              placeholder="e.g. Core Team & Chapter Leads"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
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
                  padding: '10px 14px',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-main)',
                  outline: 'none',
                  borderRadius: 'var(--radius-sm)',
                  resize: 'vertical',
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <Button type="button" variant="secondary" onClick={() => setIsScheduleOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Meeting
              </Button>
            </div>
          </form>
        </Modal>

        {/* Meeting Details Modal */}
        {selectedMeeting && (
          <Modal
            isOpen={!!selectedMeeting}
            onClose={() => setSelectedMeeting(null)}
            title={selectedMeeting.title}
            icon="event_note"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <Badge variant="purple">
                  {selectedMeeting.category || 'General Sync'}
                </Badge>
              </div>

              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Agenda &amp; Discussion
                </h4>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                  {selectedMeeting.agenda}
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  background: 'var(--bg-elevated)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date &amp; Time</span>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '2px' }}>
                    📅 {selectedMeeting.date}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    ⏰ {selectedMeeting.time}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Host &amp; Attendance</span>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '2px' }}>
                    👤 {selectedMeeting.host}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    👥 {selectedMeeting.attendeesCount} Members Expected
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <Button variant="secondary" onClick={() => setSelectedMeeting(null)}>
                  Close
                </Button>
                <a href={selectedMeeting.meetLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" leftIcon={<Icon name="videocam" size={18} />}>
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
