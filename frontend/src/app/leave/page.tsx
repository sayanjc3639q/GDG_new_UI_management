'use client';

import React, { useEffect, useState } from 'react';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Modal } from '@/shared/components/ui/modal';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Icon } from '@/shared/components/ui/icon';
import { useLeaves } from '@/shared/hooks/useLeaves';
import { LeaveType, LeaveStatus } from '@/modules/leaves/leaves.service';

export default function LeaveApplicationPage() {
  const {
    filteredLeaves: applications,
    isLoading,
    createLeave,
    updateLeaveStatus,
  } = useLeaves();

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [applicantName, setApplicantName] = useState('Chapter Lead');
  const [applicantRole, setApplicantRole] = useState('Lead');
  const [leaveType, setLeaveType] = useState<LeaveType>('EXAM_PREPARATION');
  const [startDate, setStartDate] = useState('2026-09-23');
  const [endDate, setEndDate] = useState('2026-09-25');
  const [reason, setReason] = useState('');
  const [handoverPerson, setHandoverPerson] = useState('Co-Lead');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    try {
      await createLeave({
        applicantName,
        applicantRole,
        leaveType,
        startDate,
        endDate,
        reason,
        handoverPerson,
      });

      setReason('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to submit leave application:', err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: LeaveStatus) => {
    try {
      await updateLeaveStatus(id, newStatus);
    } catch (err) {
      console.error('Failed to update leave status:', err);
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Top Action Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '12px',
          }}
        >
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
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
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
                      <span style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                        {app.applicantName}
                      </span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>({app.applicantRole})</span>
                      {getStatusBadge(app.status)}
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '4px', lineHeight: 1.5 }}>
                      {app.reason}
                    </p>
                  </div>

                  {/* Applicant Status Pill */}
                  <div>
                    {getStatusBadge(app.status)}
                  </div>
                </div>

                {/* Meta details */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '18px',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--border-color)',
                    fontSize: '0.8125rem',
                    color: 'var(--text-muted)',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon name="person" size={16} color="var(--text-subtle)" />
                    <span>
                      Handover to: <strong style={{ color: 'var(--text-main)' }}>{app.handoverPerson}</strong>
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Submit Leave Request"
          icon="event_busy"
        >
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Your Name"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                required
              />
              <Input
                label="Role"
                value={applicantRole}
                onChange={(e) => setApplicantRole(e.target.value)}
                required
              />
            </div>

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

            <Input
              label="Temporary Task Handover Person"
              placeholder="e.g. Co-Lead"
              value={handoverPerson}
              onChange={(e) => setHandoverPerson(e.target.value)}
              required
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Submit Request
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
