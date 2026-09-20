'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Modal } from '@/shared/components/ui/modal';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Icon } from '@/shared/components/ui/icon';
import { useEvents } from '@/shared/hooks/useEvents';
import { EventType } from '@/modules/events/events.types';

export default function AdminEventsPage() {
  const { events, createEvent } = useEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('2026-10-15');
  const [location, setLocation] = useState('Main Auditorium & YouTube Live');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<EventType>('WORKSHOP');
  const [capacity, setCapacity] = useState(250);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    await createEvent({
      title,
      startDate,
      location,
      description,
      type,
      capacity: Number(capacity),
      tags: ['GDG', type],
    });
    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            background: 'var(--bg-card)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/admin"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              <Icon name="arrow_back" size={18} />
              <span>Back to Admin</span>
            </Link>
            <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }} />
            <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-main)' }}>
              Manage Chapter Events &amp; Workshops
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Icon name="add" size={18} />}
            onClick={() => setIsModalOpen(true)}
          >
            Create Event
          </Button>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <EmptyState
            title="No Events Found"
            description="There are currently no events in the database. Publish a new workshop or hackathon."
            actionLabel="Create Event"
            onAction={() => setIsModalOpen(true)}
            icon="event"
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {events.map((evt) => (
            <Card
              key={evt.id}
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                borderRadius: 'var(--radius-xl)',
              }}
              className="m3-interactive"
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <Badge variant="blue">{evt.type}</Badge>
                  <Badge variant={evt.status === 'UPCOMING' ? 'green' : 'gray'}>{evt.status}</Badge>
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
                  {evt.title}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  {evt.description}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '14px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="calendar_today" size={16} color="var(--gdg-blue)" />
                  <span>{new Date(evt.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="place" size={16} color="var(--gdg-red)" />
                  <span>{evt.location}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="group" size={16} color="var(--gdg-green)" />
                  <span>Capacity: {evt.capacity} seats</span>
                </div>
              </div>
            </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create New Chapter Event"
          icon="event"
        >
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Event Title"
              placeholder="e.g. Google Cloud Study Jam 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-main)' }}>Event Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as EventType)}
                  style={{
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.875rem',
                  }}
                >
                  <option value="WORKSHOP">Workshop</option>
                  <option value="HACKATHON">Hackathon</option>
                  <option value="TECH_TALK">Tech Talk</option>
                  <option value="STUDY_JAM">Study Jam</option>
                  <option value="DEV_FEST">DevFest</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Location / Venue"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
              <Input
                label="Max Capacity"
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                required
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-main)' }}>Description</label>
              <textarea
                rows={3}
                placeholder="Event description and target audience..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Publish Event
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
