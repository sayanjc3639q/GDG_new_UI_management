'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Modal } from '@/shared/components/ui/modal';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Icon } from '@/shared/components/ui/icon';
import { EventsService, GDGEvent, EventType } from '@/modules/events';
import { MeetingsService, Meeting } from '@/modules/meetings/meetings.service';
import { useTasks } from '@/shared/hooks/useTasks';
import { useTeam } from '@/shared/hooks/useTeam';
import { useAuth } from '@/shared/context/auth-context';
import { CHAPTER_DOMAINS } from '@/app/tasks/page';
import Link from 'next/link';

export default function CalendarPage() {
  const { user } = useAuth();
  const { tasks, createTask, refreshTasks } = useTasks();
  const { members } = useTeam();

  // Navigation Date state
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 8, 20)); // Default to Sept 2026
  const [selectedDateStr, setSelectedDateStr] = useState('2026-09-20');

  // Loaded Items
  const [events, setEvents] = useState<GDGEvent[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [scheduleType, setScheduleType] = useState<'TASK' | 'MEETING' | 'EVENT'>('TASK');

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDomain, setTaskDomain] = useState<string>(CHAPTER_DOMAINS[0]);
  const [taskPriority, setTaskPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [taskDueDate, setTaskDueDate] = useState(selectedDateStr);
  const [assigneeChoice, setAssigneeChoice] = useState<'UNASSIGNED' | 'MEMBER'>('UNASSIGNED');
  const [selectedMemberId, setSelectedMemberId] = useState('');

  // Meeting Form State
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingAgenda, setMeetingAgenda] = useState('');
  const [meetingDate, setMeetingDate] = useState(selectedDateStr);
  const [meetingTime, setMeetingTime] = useState('18:00');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/gdg-chapter');

  // Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState(selectedDateStr);
  const [eventTime, setEventTime] = useState('17:00');
  const [eventType, setEventType] = useState<EventType>('WORKSHOP');
  const [eventLocation, setEventLocation] = useState('Campus Auditorium');
  const [eventCapacity, setEventCapacity] = useState(100);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load backend data
  const loadData = async () => {
    setIsLoadingEvents(true);
    try {
      const [eventsData, meetingsData] = await Promise.all([
        EventsService.getEvents().catch(() => []),
        MeetingsService.getMeetings().catch(() => []),
      ]);
      setEvents(eventsData);
      setMeetings(meetingsData);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update modal dates when selectedDateStr changes
  useEffect(() => {
    setTaskDueDate(selectedDateStr);
    setMeetingDate(selectedDateStr);
    setEventDate(selectedDateStr);
  }, [selectedDateStr]);

  // Calendar Math
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthLabel = `${monthNames[month]} ${year}`;

  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  // Monday as first day: 0=Mo, 1=Tu, 2=We, 3=Th, 4=Fr, 5=Sa, 6=Su
  const startDayOffset = (firstDayOfMonth + 6) % 7;

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date(2026, 8, 20); // Sync to context date
    setCurrentDate(today);
    setSelectedDateStr('2026-09-20');
  };

  // Group items by date string (YYYY-MM-DD)
  const itemsByDate = useMemo(() => {
    const map = new Map<string, { tasks: typeof tasks; meetings: Meeting[]; events: GDGEvent[] }>();

    const getEntry = (dStr: string) => {
      const clean = dStr.slice(0, 10);
      if (!map.has(clean)) {
        map.set(clean, { tasks: [], meetings: [], events: [] });
      }
      return map.get(clean)!;
    };

    tasks.forEach((t) => {
      if (t.dueDate) {
        getEntry(t.dueDate).tasks.push(t);
      }
    });

    meetings.forEach((m) => {
      if (m.date) {
        getEntry(m.date).meetings.push(m);
      }
    });

    events.forEach((e) => {
      if (e.startDate) {
        getEntry(e.startDate).events.push(e);
      }
    });

    return map;
  }, [tasks, meetings, events]);

  // Items for selected date
  const selectedDayItems = useMemo(() => {
    return itemsByDate.get(selectedDateStr) || { tasks: [], meetings: [], events: [] };
  }, [itemsByDate, selectedDateStr]);

  const totalSelectedCount =
    selectedDayItems.tasks.length +
    selectedDayItems.meetings.length +
    selectedDayItems.events.length;

  // Domain members for task assignment in modal
  const domainMembers = useMemo(() => {
    return members.filter((m) => !taskDomain || m.domain === taskDomain);
  }, [members, taskDomain]);

  // Submission Handlers
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (scheduleType === 'TASK') {
        let assigneeName = 'UNASSIGNED';
        if (assigneeChoice === 'MEMBER' && selectedMemberId) {
          const m = members.find((mem) => mem.id === selectedMemberId);
          if (m) {
            assigneeName = `${m.name} (${m.leadTitle || m.role})`;
          }
        }

        const assignerInfo = user
          ? `${user.name} (${user.leadTitle || user.role})`
          : 'Leadership Team';

        await createTask({
          title: taskTitle,
          description: taskDesc,
          domain: taskDomain,
          priority: taskPriority,
          dueDate: taskDueDate,
          assignee: assigneeName,
          assignedBy: assignerInfo,
        });

        refreshTasks();
        setTaskTitle('');
        setTaskDesc('');
      } else if (scheduleType === 'MEETING') {
        const created = await MeetingsService.createMeeting({
          title: meetingTitle,
          agenda: meetingAgenda,
          date: meetingDate,
          time: meetingTime,
          meetLink: meetingLink,
          host: user?.name || 'Chapter Lead',
        });
        setMeetings((prev) => [created, ...prev]);
        setMeetingTitle('');
        setMeetingAgenda('');
      } else if (scheduleType === 'EVENT') {
        const created = await EventsService.createEvent({
          title: eventTitle,
          description: eventDesc || 'Scheduled via Calendar',
          startDate: eventDate,
          type: eventType,
          location: eventLocation,
          capacity: eventCapacity,
        });
        setEvents((prev) => [created, ...prev]);
        setEventTitle('');
        setEventDesc('');
      }

      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Failed to schedule item:', err);
      alert('Failed to save schedule. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeBadge = (type: EventType) => {
    switch (type) {
      case 'WORKSHOP':
        return <Badge variant="blue">Workshop</Badge>;
      case 'STUDY_JAM':
        return <Badge variant="yellow">Study Jam</Badge>;
      case 'HACKATHON':
        return <Badge variant="red">Hackathon</Badge>;
      case 'TECH_TALK':
        return <Badge variant="green">Tech Talk</Badge>;
      default:
        return <Badge variant="purple">{type}</Badge>;
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'HIGH':
        return <Badge variant="red">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="yellow">Medium</Badge>;
      case 'LOW':
      default:
        return <Badge variant="blue">Low</Badge>;
    }
  };

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Month Navigation & Controls & Add Schedule Action */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '16px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: 'var(--shadow-sm)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--md-primary-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--md-primary)',
              }}
            >
              <Icon name="calendar_month" size={20} fill />
            </span>
            <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-main)' }}>
              {monthLabel}
            </span>

            <div style={{ display: 'flex', gap: '8px', marginLeft: '4px' }}>
              <button
                onClick={handlePrevMonth}
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                className="m3-interactive"
                aria-label="Previous month"
              >
                <Icon name="chevron_left" size={20} />
              </button>
              <button
                onClick={handleNextMonth}
                style={{
                  width: '36px',
                  height: '36px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                className="m3-interactive"
                aria-label="Next month"
              >
                <Icon name="chevron_right" size={20} />
              </button>
              <button
                onClick={handleToday}
                style={{
                  padding: '0 14px',
                  height: '36px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--text-main)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                className="m3-interactive"
              >
                Today
              </button>
            </div>
          </div>

          <Button
            variant="primary"
            leftIcon={<Icon name="add" size={18} />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Schedule
          </Button>
        </div>

        {/* Calendar Grid & Scheduled Items Breakdown */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* Calendar Month Grid */}
          <Card style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                {monthLabel} Overview
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Select a date to inspect tasks &amp; events
              </span>
            </div>

            {/* Days of week header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '8px',
                textAlign: 'center',
                fontSize: '0.8125rem',
                marginBottom: '10px',
              }}
            >
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                <div key={d} style={{ padding: '6px 0', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days Matrix */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '8px',
                textAlign: 'center',
              }}
            >
              {/* Offset blank cells */}
              {Array.from({ length: startDayOffset }).map((_, idx) => (
                <div key={`offset-${idx}`} style={{ aspectRatio: '1', opacity: 0 }} />
              ))}

              {/* Days in Month */}
              {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map((day) => {
                const dayStr = String(day).padStart(2, '0');
                const mStr = String(month + 1).padStart(2, '0');
                const thisDateStr = `${year}-${mStr}-${dayStr}`;

                const isSelected = thisDateStr === selectedDateStr;
                const isToday = thisDateStr === '2026-09-20'; // Reference date

                const dayData = itemsByDate.get(thisDateStr);
                const taskCount = dayData ? dayData.tasks.length : 0;
                const meetingCount = dayData ? dayData.meetings.length : 0;
                const eventCount = dayData ? dayData.events.length : 0;
                const totalCount = taskCount + meetingCount + eventCount;

                return (
                  <div
                    key={day}
                    style={{
                      aspectRatio: '1',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'visible',
                    }}
                  >
                    <button
                      onClick={() => setSelectedDateStr(thisDateStr)}
                      style={{
                        width: '100%',
                        height: '100%',
                        maxWidth: '44px',
                        maxHeight: '44px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isSelected
                          ? 'linear-gradient(135deg, #1a73e8 0%, #4285f4 100%)'
                          : isToday
                          ? 'rgba(66, 133, 244, 0.12)'
                          : totalCount > 0
                          ? 'var(--bg-elevated)'
                          : 'transparent',
                        color: isSelected
                          ? '#ffffff'
                          : isToday
                          ? 'var(--gdg-blue)'
                          : 'var(--text-main)',
                        fontWeight: isSelected || isToday ? 700 : totalCount > 0 ? 600 : 500,
                        borderRadius: '50%',
                        border: isSelected
                          ? 'none'
                          : isToday
                          ? '2px solid #4285f4'
                          : totalCount > 0
                          ? '1px solid var(--border-color)'
                          : '1px solid transparent',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isSelected
                          ? '0 4px 14px rgba(66, 133, 244, 0.45)'
                          : 'none',
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                        outline: 'none',
                        padding: 0,
                      }}
                      className={!isSelected ? 'm3-interactive' : ''}
                      title={`${thisDateStr}: ${totalCount} items scheduled`}
                    >
                      <span style={{ fontSize: '0.875rem', lineHeight: 1 }}>{day}</span>

                      {/* Dot Category Indicators below day */}
                      {totalCount > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '5px',
                            display: 'flex',
                            gap: '3px',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {taskCount > 0 && (
                            <span
                              style={{
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                background: isSelected ? '#ffffff' : 'var(--gdg-red)',
                                boxShadow: isSelected ? 'none' : '0 1px 2px rgba(234, 67, 53, 0.4)',
                              }}
                            />
                          )}
                          {meetingCount > 0 && (
                            <span
                              style={{
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                background: isSelected ? '#ffffff' : 'var(--gdg-green)',
                                boxShadow: isSelected ? 'none' : '0 1px 2px rgba(52, 168, 83, 0.4)',
                              }}
                            />
                          )}
                          {eventCount > 0 && (
                            <span
                              style={{
                                width: '4px',
                                height: '4px',
                                borderRadius: '50%',
                                background: isSelected ? '#ffffff' : 'var(--gdg-blue)',
                                boxShadow: isSelected ? 'none' : '0 1px 2px rgba(66, 133, 244, 0.4)',
                              }}
                            />
                          )}
                        </div>
                      )}
                    </button>

                    {/* Superscript Task / Schedule Count Badge floating cleanly on top-right */}
                    {totalCount > 0 && (
                      <sup
                        style={{
                          position: 'absolute',
                          top: '2px',
                          right: '2px',
                          transform: 'translate(20%, -20%)',
                          background: isSelected
                            ? '#ea4335'
                            : taskCount > 0
                            ? '#ea4335'
                            : meetingCount > 0
                            ? '#34a853'
                            : '#4285f4',
                          color: '#ffffff',
                          borderRadius: 'var(--radius-full)',
                          minWidth: '18px',
                          height: '18px',
                          padding: '0 4px',
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.35)',
                          border: '2px solid var(--bg-card)',
                          zIndex: 10,
                          pointerEvents: 'none',
                        }}
                      >
                        {totalCount}
                      </sup>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                marginTop: '22px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gdg-red)' }} />
                <span>Tasks Due</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gdg-green)' }} />
                <span>Meetings</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gdg-blue)' }} />
                <span>Events</span>
              </div>
            </div>
          </Card>

          {/* Side Panel: Scheduled Items for Selected Date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-xl)',
                padding: '14px 20px',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 600 }}>
                  Selected Date
                </span>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  {selectedDateStr}
                </h3>
              </div>
              <Badge variant="blue" style={{ fontWeight: 700 }}>
                {totalSelectedCount} Schedule{totalSelectedCount === 1 ? '' : 's'}
              </Badge>
            </div>

            {totalSelectedCount === 0 ? (
              <EmptyState
                title={`No Schedules for ${selectedDateStr}`}
                description="No tasks, meetings, or events fall on this date. Click below to schedule a session or task."
                actionLabel="Schedule on this Day"
                onAction={() => setIsAddModalOpen(true)}
                icon="event_busy"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 1. Tasks Scheduled on this Day */}
                {selectedDayItems.tasks.map((t) => (
                  <Card
                    key={`task-${t.id}`}
                    style={{
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      borderRadius: 'var(--radius-lg)',
                      borderLeft: '4px solid var(--gdg-red)',
                    }}
                    className="m3-interactive"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <Badge variant="red" style={{ fontSize: '0.6875rem' }}>TASK</Badge>
                          <Badge variant="purple" style={{ fontSize: '0.6875rem' }}>{t.domain}</Badge>
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                          {t.title}
                        </span>
                      </div>
                      {getPriorityBadge(t.priority)}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '0.8125rem',
                        color: 'var(--text-muted)',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span>
                        Assignee: <strong>{t.assignee}</strong>
                      </span>
                      {t.assignee === 'UNASSIGNED' && (
                        <span style={{ color: 'var(--gdg-yellow)', fontWeight: 600 }}>
                          (Pending Domain Senior Assignment)
                        </span>
                      )}
                    </div>
                  </Card>
                ))}

                {/* 2. Meetings Scheduled on this Day */}
                {selectedDayItems.meetings.map((m) => (
                  <Card
                    key={`meeting-${m.id}`}
                    style={{
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      borderRadius: 'var(--radius-lg)',
                      borderLeft: '4px solid var(--gdg-green)',
                    }}
                    className="m3-interactive"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Badge variant="green" style={{ fontSize: '0.6875rem' }}>MEETING</Badge>
                        <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                          {m.title}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--gdg-green)', fontWeight: 600 }}>
                        {m.time}
                      </span>
                    </div>

                    {m.agenda && (
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: 0 }}>
                        {m.agenda}
                      </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                        Host: {m.host}
                      </span>
                      {m.meetLink && (
                        <a
                          href={m.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            fontSize: '0.8125rem',
                            color: 'var(--gdg-blue)',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            textDecoration: 'none',
                          }}
                        >
                          <Icon name="video_camera_front" size={16} />
                          Join Meeting
                        </a>
                      )}
                    </div>
                  </Card>
                ))}

                {/* 3. Events Scheduled on this Day */}
                {selectedDayItems.events.map((evt) => (
                  <Card
                    key={`event-${evt.id}`}
                    style={{
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      borderRadius: 'var(--radius-lg)',
                      borderLeft: '4px solid var(--gdg-blue)',
                    }}
                    className="m3-interactive"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Badge variant="blue" style={{ fontSize: '0.6875rem' }}>EVENT</Badge>
                        <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                          {evt.title}
                        </span>
                      </div>
                      {getTypeBadge(evt.type)}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '14px',
                        fontSize: '0.8125rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icon name="location_on" size={15} color="var(--gdg-red)" />
                        <span>{evt.location}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icon name="group" size={15} color="var(--gdg-green)" />
                        <span>{evt.capacity} Capacity</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Multi-Type Unified Add Schedule Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Schedule Session / Task"
          icon="event_note"
        >
          {/* Schedule Category Switcher */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '6px',
              background: 'var(--bg-elevated)',
              padding: '4px',
              borderRadius: 'var(--radius-full)',
              marginBottom: '16px',
            }}
          >
            {(['TASK', 'MEETING', 'EVENT'] as const).map((type) => {
              const active = scheduleType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setScheduleType(type)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: active ? 'var(--md-primary)' : 'transparent',
                    color: active ? 'var(--md-on-primary)' : 'var(--text-muted)',
                    fontWeight: active ? 700 : 500,
                    fontSize: '0.8125rem',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Icon
                    name={type === 'TASK' ? 'task_alt' : type === 'MEETING' ? 'video_call' : 'celebration'}
                    size={16}
                  />
                  <span>{type === 'TASK' ? 'Task' : type === 'MEETING' ? 'Meeting' : 'Event'}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* TYPE 1: TASK FORM */}
            {scheduleType === 'TASK' && (
              <>
                <Input
                  label="Task Deliverable Title"
                  placeholder="e.g. Design DevFest Poster & Badges"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                    Task Details &amp; Scope
                  </label>
                  <textarea
                    placeholder="Provide details or guidelines for this task..."
                    rows={2}
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      color: 'var(--text-main)',
                      fontSize: '0.875rem',
                      fontFamily: 'var(--font-main)',
                      outline: 'none',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                      Target Domain
                    </label>
                    <select
                      value={taskDomain}
                      onChange={(e) => {
                        setTaskDomain(e.target.value);
                        setSelectedMemberId('');
                      }}
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
                      {CHAPTER_DOMAINS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                      Priority
                    </label>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value as any)}
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
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Due Date"
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  required
                />

                {/* Assignment Mode (Unassigned vs Direct Member) */}
                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Assignee Option
                  </span>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                      <input
                        type="radio"
                        name="assignChoice"
                        checked={assigneeChoice === 'UNASSIGNED'}
                        onChange={() => setAssigneeChoice('UNASSIGNED')}
                      />
                      <span>Leave Unassigned (Domain Senior to assign)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8125rem', cursor: 'pointer', color: 'var(--text-main)' }}>
                      <input
                        type="radio"
                        name="assignChoice"
                        checked={assigneeChoice === 'MEMBER'}
                        onChange={() => setAssigneeChoice('MEMBER')}
                      />
                      <span>Assign Direct Member</span>
                    </label>
                  </div>

                  {assigneeChoice === 'MEMBER' && (
                    <select
                      value={selectedMemberId}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      required
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
                      <option value="">-- Select Member from {taskDomain} --</option>
                      {domainMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.role}) - {m.domain}
                        </option>
                      ))}
                    </select>
                  )}

                  {assigneeChoice === 'UNASSIGNED' && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--gdg-yellow)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icon name="info" size={14} color="var(--gdg-yellow)" />
                      <span>
                        This task will show up in the Domain Senior&apos;s dashboard delegation pool for &quot;{taskDomain}&quot;.
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* TYPE 2: MEETING FORM */}
            {scheduleType === 'MEETING' && (
              <>
                <Input
                  label="Meeting Title"
                  placeholder="e.g. Core Team Sprint Sync"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  required
                />

                <Input
                  label="Agenda"
                  placeholder="e.g. Discuss DevFest registrations and venue logistics"
                  value={meetingAgenda}
                  onChange={(e) => setMeetingAgenda(e.target.value)}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Input
                    label="Date"
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    required
                  />
                  <Input
                    label="Time"
                    placeholder="e.g. 06:30 PM"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Google Meet / Venue Link"
                  placeholder="https://meet.google.com/..."
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  required
                />
              </>
            )}

            {/* TYPE 3: EVENT FORM */}
            {scheduleType === 'EVENT' && (
              <>
                <Input
                  label="Event Title"
                  placeholder="e.g. Google Cloud Study Jam 2026"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Input
                    label="Date"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                  />
                  <Input
                    label="Time Window"
                    placeholder="e.g. 05:00 PM - 07:00 PM"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                      Event Type
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as EventType)}
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
                      <option value="WORKSHOP">Workshop</option>
                      <option value="STUDY_JAM">Study Jam</option>
                      <option value="HACKATHON">Hackathon</option>
                      <option value="TECH_TALK">Tech Talk</option>
                      <option value="DEV_FEST">DevFest</option>
                    </select>
                  </div>

                  <Input
                    label="Location / Venue"
                    placeholder="e.g. Auditorium / Main Hall"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Capacity"
                  type="number"
                  value={String(eventCapacity)}
                  onChange={(e) => setEventCapacity(Number(e.target.value) || 100)}
                  required
                />
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Add to Calendar'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
