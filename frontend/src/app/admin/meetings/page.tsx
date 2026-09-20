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
import { useMeetings } from '@/shared/hooks/useMeetings';

export default function AdminMeetingsPage() {
  const { meetings, createMeeting } = useMeetings();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [date, setDate] = useState('2026-09-24');
  const [time, setTime] = useState('18:00 - 19:00');
  const [host, setHost] = useState('Chapter Lead');
  const [meetLink, setMeetLink] = useState('https://meet.google.com/new');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    await createMeeting({
      title,
      agenda,
      date,
      time,
      meetLink,
      host,
      attendeesCount: 0,
    });
    setTitle('');
    setAgenda('');
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
              Manage Chapter Meetings &amp; Syncs
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Icon name="video_call" size={18} />}
            onClick={() => setIsModalOpen(true)}
          >
            Schedule Meeting
          </Button>
        </div>

        {/* Meetings List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {meetings.length === 0 ? (
            <EmptyState
              title="No Meetings Scheduled"
              description="No chapter syncs or meetings found in the database. Schedule one using the button above."
              actionLabel="Schedule Meeting"
              onAction={() => setIsModalOpen(true)}
              icon="videocam"
            />
          ) : (
            meetings.map((meeting) => (
            <Card
              key={meeting.id}
              style={{
                padding: '20px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                borderRadius: 'var(--radius-xl)',
              }}
              className="m3-interactive"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--md-warning-container)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--gdg-yellow)',
                  }}
                >
                  <Icon name="videocam" size={24} fill />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>
                      {meeting.title}
                    </span>
                    <Badge variant={meeting.status === 'LIVE_NOW' ? 'green' : 'blue'}>
                      {meeting.status}
                    </Badge>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <span>{meeting.date}</span>
                    <span>•</span>
                    <span>{meeting.time}</span>
                    <span>•</span>
                    <span>Host: {meeting.host}</span>
                  </div>
                  {meeting.agenda && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {meeting.agenda}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {meeting.meetLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Icon name="link" size={16} />}
                    onClick={() => window.open(meeting.meetLink, '_blank')}
                  >
                    Open Link
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

        {/* Schedule Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Schedule Chapter Sync / Meeting"
          icon="videocam"
        >
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Meeting Title"
              placeholder="e.g., Weekly Core Team Sync"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
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
                placeholder="18:00 - 19:00"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Host / Facilitator"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                required
              />
              <Input
                label="Meet URL"
                placeholder="https://meet.google.com/..."
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
              />
            </div>
            <Input
              label="Agenda / Notes"
              placeholder="Discussion items..."
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Schedule
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
