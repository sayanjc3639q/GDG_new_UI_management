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
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';
import { EventsService, GDGEvent, CreateEventDto, EventType } from '@/modules/events';

export default function CalendarPage() {
  const [currentMonth] = useState('September 2026');
  const [events, setEvents] = useState<GDGEvent[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-09-20');
  const [newEventTime, setNewEventTime] = useState('17:00');
  const [newEventType, setNewEventType] = useState<EventType>('WORKSHOP');
  const [newEventLocation, setNewEventLocation] = useState('Campus Auditorium');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const data = await EventsService.getEvents();
      setEvents(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;

    try {
      const created = await EventsService.createEvent({
        title: newEventTitle,
        description: 'Scheduled via Calendar',
        startDate: newEventDate,
        type: newEventType,
        location: newEventLocation,
        capacity: 100,
      });

      setEvents([created, ...events]);
      setNewEventTitle('');
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Failed to create calendar event:', err);
    }
  };

  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

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

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Operations Calendar</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
              Schedule, track, and sync GDG chapter activities and internal milestones.
            </p>
          </div>

          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Schedule
          </Button>
        </div>

        {/* Month Navigation & Controls */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CalendarIcon size={18} color="var(--gdg-blue)" />
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
              {currentMonth}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              style={{
                padding: '6px 10px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              style={{
                padding: '6px 10px',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Calendar Grid & Events List Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Month Mini Grid */}
          <Card style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '16px' }}>
              September 2026 Overview
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '4px',
                textAlign: 'center',
                fontSize: '0.75rem',
              }}
            >
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
                <div key={d} style={{ padding: '6px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {d}
                </div>
              ))}

              {daysInMonth.map((day) => {
                const isToday = day === 17;
                return (
                  <div
                    key={day}
                    style={{
                      aspectRatio: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isToday ? 'var(--gdg-blue)' : 'transparent',
                      color: isToday ? '#ffffff' : 'var(--text-main)',
                      fontWeight: isToday ? 700 : 400,
                      border: '1px solid var(--border-subtle)',
                      position: 'relative',
                    }}
                  >
                    <span>{day}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Scheduled Sessions List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Scheduled Events ({events.length})
            </h3>

            {events.length === 0 ? (
              <EmptyState
                title="No Events Scheduled"
                description="Nothing to see here yet. Add a workshop or study jam to the calendar."
                actionLabel="Add Schedule"
                onAction={() => setIsAddModalOpen(true)}
                icon={<CalendarIcon size={20} />}
              />
            ) : (
              events.map((evt) => (
                <Card key={evt.id} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                      {evt.title}
                    </span>
                    {getTypeBadge(evt.type)}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} color="var(--gdg-blue)" />
                      <span>{evt.startDate}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="var(--gdg-red)" />
                      <span>{evt.location}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={13} color="var(--gdg-green)" />
                      <span>{evt.capacity} Capacity</span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Modal to Add Schedule */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Schedule New Session">
          <form onSubmit={handleAddEvent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input
              label="Session Title"
              placeholder="e.g. Google Cloud Study Jam 2026"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Date"
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                required
              />
              <Input
                label="Time Window"
                placeholder="e.g. 05:00 PM - 07:00 PM"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Schedule Type
                </label>
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value as EventType)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    padding: '9px 12px',
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
                label="Venue / Link"
                placeholder="e.g. Auditorium / Meet"
                value={newEventLocation}
                onChange={(e) => setNewEventLocation(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Add to Calendar
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
