'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Modal } from '@/shared/components/ui/modal';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Icon } from '@/shared/components/ui/icon';
import { useMeetings } from '@/shared/hooks/useMeetings';
import { useTeam } from '@/shared/hooks/useTeam';
import { useAuth } from '@/shared/context/auth-context';
import { Meeting } from '@/modules/meetings/meetings.service';

export default function MeetingsPage() {
  const { user } = useAuth();
  const canManageMeetings = Boolean(
    user && (user.role === 'DEVELOPER' || user.role === 'LEAD' || user.role === 'DOMAIN_SENIOR')
  );

  const { meetings, createMeeting: createMeetingAction } = useMeetings();
  const { members } = useTeam();

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<'ACTIVE' | 'CONCLUDED' | 'ALL'>('ACTIVE');
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
  const [meetingMode, setMeetingMode] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
  const [meetLink, setMeetLink] = useState('https://meet.google.com/new');
  const [location, setLocation] = useState('Campus Room 302');
  const [host, setHost] = useState(user?.name || 'Chapter Lead');
  const [selectedInChargeId, setSelectedInChargeId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = (id: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) return;

    setIsSubmitting(true);
    try {
      let assignedInCharge: { id: string; name: string; email?: string } | undefined;
      if (selectedInChargeId) {
        const found = members.find((m) => m.id === selectedInChargeId);
        if (found) {
          assignedInCharge = {
            id: found.id,
            name: `${found.name} (${found.leadTitle || found.role})`,
            email: found.email,
          };
        }
      }

      await createMeetingAction({
        title,
        agenda,
        date,
        time,
        mode: meetingMode,
        meetLink: meetingMode === 'ONLINE' ? meetLink : undefined,
        location: meetingMode === 'OFFLINE' ? location : undefined,
        host,
        assignedInCharge,
      });

      setTitle('');
      setAgenda('');
      setSelectedInChargeId('');
      setIsScheduleOpen(false);
    } catch (err) {
      console.error('Failed to create meeting:', err);
      alert('Failed to create meeting.');
    } finally {
      setIsSubmitting(false);
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

  // Helper to check if a meeting has concluded
  const isMeetingConcluded = (m: Meeting) => {
    if (m.status === 'CONCLUDED') return true;
    try {
      const timePart = (m.time || '18:00').split(' ')[0];
      const meetingDateTime = new Date(`${m.date} ${timePart}`);
      if (!isNaN(meetingDateTime.getTime())) {
        const twoHoursMs = 2 * 60 * 60 * 1000;
        return Date.now() > meetingDateTime.getTime() + twoHoursMs;
      }
    } catch {}
    return false;
  };

  // Filter Logic: Auto-remove / filter out concluded meetings in active view
  const activeMeetings = useMemo(() => {
    return meetings.filter((m) => !isMeetingConcluded(m));
  }, [meetings]);

  const pastMeetings = useMemo(() => {
    return meetings.filter((m) => isMeetingConcluded(m));
  }, [meetings]);

  const filteredMeetings = useMemo(() => {
    let list: Meeting[] = [];
    if (filterTab === 'ACTIVE') list = activeMeetings;
    else if (filterTab === 'CONCLUDED') list = pastMeetings;
    else list = meetings;

    if (selectedDate) {
      list = list.filter((m) => m.date === selectedDate);
    }

    return list;
  }, [filterTab, activeMeetings, pastMeetings, meetings, selectedDate]);

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Filter Chips Bar with Create Meeting Action */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '14px 20px',
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
              { id: 'ACTIVE', label: 'Active & Upcoming', count: activeMeetings.length, color: 'var(--gdg-blue)' },
              { id: 'CONCLUDED', label: 'Concluded / Past', count: pastMeetings.length, color: 'var(--text-muted)' },
              { id: 'ALL', label: 'All Sessions', count: meetings.length, color: 'var(--gdg-green)' },
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
                    fontWeight: 600,
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
                leftIcon={<Icon name="video_call" size={18} />}
                onClick={() => setIsScheduleOpen(true)}
              >
                Create Meeting
              </Button>
            )}
          </div>
        </div>

        {/* Main Layout: Left Meeting Cards List + Right Calendar Widget */}
        <div className="meetings-layout-container">
          {/* Left Side: Meeting Cards */}
          <div className="meetings-list-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {filterTab === 'ACTIVE' ? 'Upcoming & Live Meetings' : filterTab === 'CONCLUDED' ? 'Past Meetings' : 'All Meetings'} ({filteredMeetings.length})
              </span>
            </div>

            {filteredMeetings.length === 0 ? (
              <EmptyState
                title="No Meetings Found"
                description={
                  canManageMeetings
                    ? 'No scheduled meetings matching this filter. Schedule a new online sync or offline meeting.'
                    : 'There are currently no active meetings.'
                }
                actionLabel={canManageMeetings ? 'Create Meeting' : undefined}
                onAction={canManageMeetings ? () => setIsScheduleOpen(true) : undefined}
                icon="videocam"
              />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
                  gap: '16px',
                }}
              >
                {filteredMeetings.map((m) => {
                  const isConcluded = isMeetingConcluded(m);

                  return (
                    <div
                      key={m.id}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-xl)',
                        padding: '20px',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '14px',
                        opacity: isConcluded ? 0.75 : 1,
                      }}
                      className="m3-interactive"
                    >
                      {/* Top Row: Mode Badge & Time */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Badge variant={m.mode === 'ONLINE' ? 'blue' : 'green'}>
                            {m.mode === 'ONLINE' ? 'Online' : 'Offline'}
                          </Badge>
                          {m.status === 'LIVE_NOW' && <Badge variant="green">Live Now</Badge>}
                          {isConcluded && <Badge variant="gray">Concluded</Badge>}
                        </div>

                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            fontWeight: 600,
                          }}
                        >
                          <Icon name="schedule" size={14} />
                          {m.time}
                        </span>
                      </div>

                      {/* Title & Agenda */}
                      <div>
                        <h3
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            color: 'var(--text-main)',
                            letterSpacing: '-0.01em',
                            margin: '0 0 6px 0',
                          }}
                        >
                          {m.title}
                        </h3>
                        {m.agenda && (
                          <p
                            style={{
                              fontSize: '0.8125rem',
                              color: 'var(--text-muted)',
                              lineHeight: 1.45,
                              margin: 0,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {m.agenda}
                          </p>
                        )}
                      </div>

                      {/* Online Meet Link / Offline Location Box */}
                      {m.mode === 'ONLINE' && m.meetLink ? (
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
                            <Icon name="videocam" size={16} color="var(--gdg-blue)" />
                            <span
                              style={{
                                fontSize: '0.75rem',
                                color: 'var(--gdg-blue)',
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
                            onClick={() => handleCopy(m.id, m.meetLink!)}
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
                            <Icon name={copiedId === m.id ? 'check' : 'content_copy'} size={16} />
                          </button>
                        </div>
                      ) : m.location ? (
                        <div
                          style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '0.8125rem',
                            color: 'var(--text-main)',
                          }}
                        >
                          <Icon name="location_on" size={16} color="var(--gdg-red)" />
                          <span style={{ fontWeight: 500 }}>{m.location}</span>
                        </div>
                      ) : null}

                      {/* In-Charge Member Badge */}
                      {m.assignedInCharge && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--gdg-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Icon name="badge" size={14} color="var(--gdg-blue)" />
                          <span>In-Charge: <strong>{m.assignedInCharge.name}</strong></span>
                        </div>
                      )}

                      {/* Bottom Action Row: Details (Attendance & MoM) + Join Button */}
                      <div
                        style={{
                          borderTop: '1px solid var(--border-color)',
                          paddingTop: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                          📅 {m.date}
                        </span>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link href={`/meetings/${m.id}`}>
                            <Button
                              variant="secondary"
                              size="sm"
                              leftIcon={<Icon name="checklist" size={16} />}
                            >
                              Attendance &amp; MoM
                            </Button>
                          </Link>

                          {m.mode === 'ONLINE' && m.meetLink && (
                            <a href={m.meetLink} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                              <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<Icon name="videocam" size={16} />}
                              >
                                Join
                              </Button>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Side: Sticky Mini Calendar Widget */}
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

        {/* Schedule Meeting Modal (Constrained Viewport, Online/Offline, In-Charge Selection) */}
        <Modal
          isOpen={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
          title="Create New Meeting"
          icon="video_call"
        >
          <form onSubmit={handleCreateMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Meeting Title"
              placeholder="e.g. Core Team Sprint Sync"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Meeting Mode Switcher: Online vs Offline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                Meeting Mode
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  background: 'var(--bg-elevated)',
                  padding: '4px',
                  borderRadius: 'var(--radius-full)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setMeetingMode('ONLINE')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    background: meetingMode === 'ONLINE' ? 'var(--md-primary)' : 'transparent',
                    color: meetingMode === 'ONLINE' ? 'var(--md-on-primary)' : 'var(--text-muted)',
                    fontWeight: meetingMode === 'ONLINE' ? 700 : 500,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Icon name="videocam" size={16} />
                  <span>Online (Google Meet)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMeetingMode('OFFLINE')}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    background: meetingMode === 'OFFLINE' ? 'var(--md-primary)' : 'transparent',
                    color: meetingMode === 'OFFLINE' ? 'var(--md-on-primary)' : 'var(--text-muted)',
                    fontWeight: meetingMode === 'OFFLINE' ? 700 : 500,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Icon name="location_on" size={16} />
                  <span>Offline (In-Person)</span>
                </button>
              </div>
            </div>

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

            {meetingMode === 'ONLINE' ? (
              <Input
                label="Google Meet Link"
                placeholder="https://meet.google.com/..."
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                required
              />
            ) : (
              <Input
                label="Venue / Room Location"
                placeholder="e.g. Campus Auditorium / Room 302"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            )}

            {/* Assign Member in Charge for Attendance & MoM */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                Assign In-Charge Member (Attendance &amp; MoM)
              </label>
              <select
                value={selectedInChargeId}
                onChange={(e) => setSelectedInChargeId(e.target.value)}
                style={{
                  width: '100%',
                  height: '42px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 12px',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              >
                <option value="">-- Choose Assigned Member for Attendance &amp; MoM --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} &bull; {m.role} {m.leadTitle ? `(${m.leadTitle})` : ''} - {m.domain || 'General'}
                  </option>
                ))}
              </select>
            </div>

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
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Meeting'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
