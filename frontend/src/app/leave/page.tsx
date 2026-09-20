'use client';

import React, { useState } from 'react';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Modal } from '@/shared/components/ui/modal';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Icon } from '@/shared/components/ui/icon';
import { useLeaves } from '@/shared/hooks/useLeaves';
import { useAuth } from '@/shared/context/auth-context';
import { LeaveType, LeaveStatus } from '@/modules/leaves/leaves.service';

export default function LeaveApplicationPage() {
  const { user } = useAuth();
  const {
    filteredLeaves: applications,
    createLeave,
  } = useLeaves();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [leaveType, setLeaveType] = useState<LeaveType>('EXAM_PREPARATION');
  const [startDate, setStartDate] = useState('2026-09-23');
  const [endDate, setEndDate] = useState('2026-09-25');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsSubmitting(true);
    try {
      await createLeave({
        applicantName: user?.name || 'Member',
        applicantRole: user?.leadTitle || user?.role || 'Member',
        leaveType,
        startDate,
        endDate,
        reason,
      });

      setReason('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to submit leave application:', err);
      alert('Failed to submit leave request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="green">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="red">Rejected</Badge>;
      case 'PENDING':
      default:
        return <Badge variant="yellow">Pending Review</Badge>;
    }
  };

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '960px', margin: '0 auto' }}>
        {/* Top Action Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '16px 24px',
            boxShadow: 'var(--shadow-sm)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Leave Applications
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Submit and track your academic, medical, or personal leave requests.
            </p>
          </div>

          <Button
            variant="primary"
            leftIcon={<Icon name="add" size={18} />}
            onClick={() => setIsModalOpen(true)}
          >
            Apply for Leave
          </Button>
        </div>

        {/* Applications List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {applications.length === 0 ? (
            <EmptyState
              title="No Leave Applications"
              description="Nothing to see here yet. Submit a leave request when you have exams, projects, or travel."
              actionLabel="Apply for Leave"
              onAction={() => setIsModalOpen(true)}
              icon="event_busy"
            />
          ) : (
            applications.map((app) => (
              <Card
                key={app.id}
                style={{
                  padding: '22px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderRadius: 'var(--radius-xl)',
                }}
                className="m3-interactive"
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                        {app.applicantName}
                      </span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>({app.applicantRole})</span>
                      {getStatusBadge(app.status)}
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '4px', lineHeight: 1.5 }}>
                      {app.reason}
                    </p>
                  </div>

                  <div>
                    {getStatusBadge(app.status)}
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
                    fontSize: '0.8125rem',
                    color: 'var(--text-muted)',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="calendar_month" size={16} color="var(--gdg-blue)" />
                    <span>
                      Duration: <strong>{app.startDate}</strong> to <strong>{app.endDate}</strong>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Badge variant="purple">{app.leaveType.replace('_', ' ')}</Badge>
                  </div>
                  {app.handoverPerson && app.handoverPerson !== 'None' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Icon name="person" size={16} color="var(--text-subtle)" />
                      <span>
                        Handover: <strong style={{ color: 'var(--text-main)' }}>{app.handoverPerson}</strong>
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Modal: Cleaned Up without redundant Name, Role, or Handover Person */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Submit Leave Request"
          icon="event_busy"
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                Reason Category
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                style={{
                  width: '100%',
                  height: '42px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 14px',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-main)',
                  outline: 'none',
                }}
              >
                <option value="EXAM_PREPARATION">Exam Preparation / Finals</option>
                <option value="ACADEMIC_PROJECT">Academic Major/Minor Project Viva</option>
                <option value="MEDICAL">Medical Leave / Health</option>
                <option value="PERSONAL">Personal / Family</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                Detailed Reason &amp; Impact
              </label>
              <textarea
                placeholder="Briefly state the reason for absence..."
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-main)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
