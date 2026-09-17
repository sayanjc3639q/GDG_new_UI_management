'use client';

import React, { useState } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { CheckCircle, QrCode, AlertCircle } from 'lucide-react';
import { Rsvp } from '../rsvp.types';

interface CheckInDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckIn: (ticketCode: string) => Promise<Rsvp>;
}

export const CheckInDialog: React.FC<CheckInDialogProps> = ({ isOpen, onClose, onCheckIn }) => {
  const [ticketCode, setTicketCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successRsvp, setSuccessRsvp] = useState<Rsvp | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketCode) return;

    try {
      setIsLoading(true);
      setError(null);
      const res = await onCheckIn(ticketCode.trim().toUpperCase());
      setSuccessRsvp(res);
      setTicketCode('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Check-in failed. Please verify the code.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setSuccessRsvp(null);
    setError(null);
    setTicketCode('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={resetState} title="Event Ticket Verification & Check-in">
      {successRsvp ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', padding: '12px 0' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(52, 168, 83, 0.15)',
              border: '1px solid rgba(52, 168, 83, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34A853',
            }}
          >
            <CheckCircle size={32} />
          </div>

          <div>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f3f4f6' }}>
              Check-In Successful!
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '4px' }}>
              Attendee: <strong style={{ color: '#ffffff' }}>{successRsvp.userName}</strong> ({successRsvp.userEmail})
            </p>
            <p style={{ fontSize: '0.8125rem', color: '#81c995', marginTop: '4px' }}>
              Ticket: {successRsvp.ticketCode} • Verified at {new Date().toLocaleTimeString()}
            </p>
          </div>

          <Button variant="primary" onClick={() => setSuccessRsvp(null)} style={{ marginTop: '12px' }}>
            Verify Another Ticket
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              background: 'rgba(66, 133, 244, 0.08)',
              border: '1px solid rgba(66, 133, 244, 0.2)',
              borderRadius: '10px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <QrCode size={28} color="#4285F4" />
            <div style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>
              Scan the QR badge or enter the attendee&apos;s <strong>GDG-XXXXXX</strong> code below to verify admission.
            </div>
          </div>

          <Input
            label="Ticket Code"
            placeholder="e.g. GDG-HIT843"
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value)}
            autoFocus
            required
          />

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(234, 67, 53, 0.12)',
                border: '1px solid rgba(234, 67, 53, 0.3)',
                color: '#f28b82',
                fontSize: '0.8125rem',
              }}
            >
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={resetState}>
              Close
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Confirm Admission
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
