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
} from 'lucide-react';
import { MeetingsService, Meeting } from '@/modules/meetings/meetings.service';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [date, setDate] = useState('2026-09-21');
  const [time, setTime] = useState('06:00 PM - 07:00 PM');
  const [meetLink, setMeetLink] = useState('https://meet.google.com/new');
  const [host, setHost] = useState('Chapter Lead');

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    setIsLoading(true);
    try {
      const data = await MeetingsService.getMeetings();
      setMeetings(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      const created = await MeetingsService.createMeeting({
        title,
        agenda,
        date,
        time,
        meetLink,
        host,
      });

      setMeetings([created, ...meetings]);
      setTitle('');
      setAgenda('');
      setIsScheduleOpen(false);
    } catch (err) {
      console.error('Failed to schedule meeting:', err);
    }
  };

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Leadership Meetings</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
              Coordinate internal core team syncs and external mentor review meetings.
            </p>
          </div>

          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => setIsScheduleOpen(true)}
          >
            Schedule Meeting
          </Button>
        </div>

        {/* Meeting Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {meetings.length === 0 ? (
            <EmptyState
              title="No Meetings Scheduled"
              description="Nothing to see here yet. Schedule your first team standup or planning session."
              actionLabel="Schedule Meeting"
              onAction={() => setIsScheduleOpen(true)}
              icon={<Video size={20} />}
            />
          ) : (
            meetings.map((m) => (
              <Card key={m.id} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>
                        {m.title}
                      </h3>
                      <Badge variant={m.status === 'LIVE_NOW' ? 'red' : 'blue'}>
                        {m.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    {m.agenda && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', maxWidth: '650px' }}>
                        {m.agenda}
                      </p>
                    )}
                  </div>

                  {/* Meet Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={copiedId === m.id ? <Check size={14} color="var(--gdg-green)" /> : <Copy size={14} />}
                      onClick={() => handleCopy(m.id, m.meetLink)}
                    >
                      {copiedId === m.id ? 'Copied' : 'Copy Link'}
                    </Button>

                    <a href={m.meetLink} target="_blank" rel="noreferrer">
                      <Button variant="primary" size="sm" rightIcon={<ExternalLink size={14} />}>
                        Join Meeting
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Meta details */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock size={13} color="var(--gdg-blue)" />
                    <span>{m.date} • {m.time}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Users size={13} color="var(--gdg-green)" />
                    <span>{m.attendeesCount} Expected Attendees</span>
                  </div>
                  <div>
                    Host: <strong style={{ color: 'var(--text-main)' }}>{m.host}</strong>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Modal */}
        <Modal isOpen={isScheduleOpen} onClose={() => setIsScheduleOpen(false)} title="Schedule New Leadership Meeting">
          <form onSubmit={handleCreateMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input
              label="Meeting Topic"
              placeholder="e.g. Hackathon Planning Sync"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Agenda &amp; Discussion Points
              </label>
              <textarea
                placeholder="Key decisions and updates..."
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
                placeholder="05:00 PM - 06:00 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

            <Input
              label="Google Meet URL"
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
              <Button type="button" variant="secondary" onClick={() => setIsScheduleOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Schedule
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
