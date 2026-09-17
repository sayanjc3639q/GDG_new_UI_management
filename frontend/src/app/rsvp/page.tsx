'use client';

import React, { useEffect, useState } from 'react';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { QrCode, Search, CheckCircle2, Clock } from 'lucide-react';
import { Rsvp, RsvpService, CheckInDialog } from '@/modules/rsvp';

export default function RsvpPage() {
  const [rsvps, setRsvps] = useState<Rsvp[]>([]);
  const [search, setSearch] = useState('');
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);

  useEffect(() => {
    RsvpService.getRsvps().then(setRsvps);
  }, []);

  const handleCheckIn = async (code: string) => {
    const updated = await RsvpService.checkIn(code);
    setRsvps((prev) => prev.map((r) => (r.ticketCode === updated.ticketCode ? updated : r)));
    return updated;
  };

  const filteredRsvps = rsvps.filter(
    (r) =>
      r.userName.toLowerCase().includes(search.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      r.ticketCode.toLowerCase().includes(search.toLowerCase()) ||
      (r.eventName && r.eventName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>RSVP &amp; Attendance Registry</h1>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '4px' }}>
              Real-time admission tracking and verified attendee ticket ledger.
            </p>
          </div>

          <Button
            variant="primary"
            leftIcon={<QrCode size={18} />}
            onClick={() => setIsCheckInOpen(true)}
          >
            Live Ticket Check-in
          </Button>
        </div>

        {/* Search */}
        <div style={{ width: '320px' }}>
          <Input
            placeholder="Search by name, email, or ticket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>

        {/* Table */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#9ca3af',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  <th style={{ padding: '14px 20px' }}>Ticket Code</th>
                  <th style={{ padding: '14px 20px' }}>Attendee</th>
                  <th style={{ padding: '14px 20px' }}>Event</th>
                  <th style={{ padding: '14px 20px' }}>Status</th>
                  <th style={{ padding: '14px 20px' }}>Check-in Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredRsvps.map((rsvp) => (
                  <tr
                    key={rsvp.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      transition: 'background 0.15s',
                    }}
                  >
                    <td style={{ padding: '16px 20px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#8ab4f8' }}>
                      {rsvp.ticketCode}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: 600, color: '#f3f4f6' }}>{rsvp.userName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{rsvp.userEmail}</div>
                    </td>
                    <td style={{ padding: '16px 20px', color: '#cbd5e1' }}>
                      {rsvp.eventName || 'Google Cloud Study Jam'}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {rsvp.status === 'ATTENDED' ? (
                        <Badge variant="green">
                          <CheckCircle2 size={12} />
                          Attended
                        </Badge>
                      ) : (
                        <Badge variant="blue">
                          <Clock size={12} />
                          Confirmed
                        </Badge>
                      )}
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '0.8125rem', color: '#9ca3af' }}>
                      {rsvp.checkedInAt
                        ? new Date(rsvp.checkedInAt).toLocaleTimeString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Check-In Modal */}
        <CheckInDialog
          isOpen={isCheckInOpen}
          onClose={() => setIsCheckInOpen(false)}
          onCheckIn={handleCheckIn}
        />
      </div>
    </DashboardShell>
  );
}
