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
import { useTeam } from '@/shared/hooks/useTeam';

export default function AdminMeetingsPage() {
  const { meetings, createMeeting, deleteMeeting } = useMeetings();
  const { members } = useTeam();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingMeetingId, setDeletingMeetingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [agenda, setAgenda] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('18:00 - 19:00');
  const [host, setHost] = useState('Chapter Lead');
  const [mode, setMode] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
  const [meetLink, setMeetLink] = useState('https://meet.google.com/new');
  const [location, setLocation] = useState('');
  const [assignedInChargeId, setAssignedInChargeId] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const assignedMember = members.find((m) => m.id === assignedInChargeId);

    await createMeeting({
      title,
      agenda,
      date,
      time,
      mode,
      meetLink: mode === 'ONLINE' ? meetLink : undefined,
      location: mode === 'OFFLINE' ? location : undefined,
      host,
      attendeesCount: 0,
      assignedInCharge: assignedMember
        ? {
            id: assignedMember.id,
            name: assignedMember.name,
            email: assignedMember.email,
          }
        : undefined,
    });

    setTitle('');
    setAgenda('');
    setAssignedInChargeId('');
    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (!deletingMeetingId) return;
    setIsDeleting(true);
    try {
      await deleteMeeting(deletingMeetingId);
      setDeletingMeetingId(null);
    } catch (err) {
      console.error('Failed to delete meeting:', err);
    } finally {
      setIsDeleting(false);
    }
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 300px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-lg)',
                      background: meeting.mode === 'OFFLINE' ? 'rgba(52, 168, 83, 0.12)' : 'var(--md-warning-container)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: meeting.mode === 'OFFLINE' ? '#34A853' : 'var(--gdg-yellow)',
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={meeting.mode === 'OFFLINE' ? 'location_on' : 'videocam'} size={24} fill />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-main)' }}>
                        {meeting.title}
                      </span>
                      <Badge variant={meeting.status === 'LIVE_NOW' ? 'green' : meeting.status === 'CONCLUDED' ? 'gray' : 'blue'}>
                        {meeting.status}
                      </Badge>
                      <Badge variant={meeting.mode === 'OFFLINE' ? 'purple' : 'yellow'}>
                        {meeting.mode || 'ONLINE'}
                      </Badge>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8125rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span>{meeting.date}</span>
                      <span>•</span>
                      <span>{meeting.time}</span>
                      <span>•</span>
                      <span>Host: {meeting.host}</span>
                      {meeting.assignedInCharge && (
                        <>
                          <span>•</span>
                          <span style={{ color: 'var(--gdg-blue)', fontWeight: 500 }}>
                            In-Charge: {meeting.assignedInCharge.name}
                          </span>
                        </>
                      )}
                    </div>
                    {meeting.mode === 'OFFLINE' && meeting.location && (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icon name="place" size={14} />
                        <span>{meeting.location}</span>
                      </div>
                    )}
                    {meeting.agenda && (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {meeting.agenda}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <Link href={`/meetings/${meeting.id}`} style={{ textDecoration: 'none' }}>
                    <Button variant="outline" size="sm" leftIcon={<Icon name="fact_check" size={16} />}>
                      Details &amp; MoM
                    </Button>
                  </Link>
                  {meeting.meetLink && meeting.mode !== 'OFFLINE' && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Icon name="link" size={16} />}
                      onClick={() => window.open(meeting.meetLink, '_blank')}
                    >
                      Meet Link
                    </Button>
                  )}
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<Icon name="delete" size={16} />}
                    onClick={() => setDeletingMeetingId(meeting.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deletingMeetingId}
          onClose={() => setDeletingMeetingId(null)}
          title="Delete Meeting"
          icon="delete"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Are you sure you want to delete this meeting? This action cannot be undone and will permanently remove all attendance records and minutes of meeting (MoM) associated with it.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <Button variant="outline" type="button" onClick={() => setDeletingMeetingId(null)} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="danger" type="button" onClick={confirmDelete} isLoading={isDeleting}>
                Yes, Delete Meeting
              </Button>
            </div>
          </div>
        </Modal>

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

            {/* Online / Offline Mode */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                Meeting Mode
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setMode('ONLINE')}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-lg)',
                    border: mode === 'ONLINE' ? '2px solid var(--gdg-blue)' : '1px solid var(--border-color)',
                    background: mode === 'ONLINE' ? 'rgba(66, 133, 244, 0.08)' : 'var(--bg-card)',
                    color: mode === 'ONLINE' ? 'var(--gdg-blue)' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Icon name="videocam" size={18} />
                  Online
                </button>
                <button
                  type="button"
                  onClick={() => setMode('OFFLINE')}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-lg)',
                    border: mode === 'OFFLINE' ? '2px solid var(--gdg-green)' : '1px solid var(--border-color)',
                    background: mode === 'OFFLINE' ? 'rgba(52, 168, 83, 0.08)' : 'var(--bg-card)',
                    color: mode === 'OFFLINE' ? 'var(--gdg-green)' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <Icon name="location_on" size={18} />
                  Offline
                </button>
              </div>
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
              {mode === 'ONLINE' ? (
                <Input
                  label="Meet URL"
                  placeholder="https://meet.google.com/..."
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                  required
                />
              ) : (
                <Input
                  label="Venue / Room Location"
                  placeholder="e.g. Room 302, HIT Building"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              )}
            </div>

            {/* In-charge assignment for Attendance & MoM */}
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
                Assigned In-Charge (Attendance &amp; MoM)
              </label>
              <select
                value={assignedInChargeId}
                onChange={(e) => setAssignedInChargeId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  outline: 'none',
                }}
              >
                <option value="">-- Select Member In-Charge --</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.domain}) {member.leadTitle ? `[${member.leadTitle}]` : ''}
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                This member will have exclusive authorization to mark attendance and draft the Minutes of Meeting.
              </span>
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

