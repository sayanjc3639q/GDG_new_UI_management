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
  FileText,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar as CalIcon,
} from 'lucide-react';
import { LeavesService, LeaveApplication, LeaveStatus, LeaveType } from '@/modules/leaves/leaves.service';

export default function LeaveApplicationPage() {
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [applicantName, setApplicantName] = useState('Chapter Lead');
  const [applicantRole, setApplicantRole] = useState('Lead');
  const [leaveType, setLeaveType] = useState<LeaveType>('EXAM_PREPARATION');
  const [startDate, setStartDate] = useState('2026-09-23');
  const [endDate, setEndDate] = useState('2026-09-25');
  const [reason, setReason] = useState('');
  const [handoverPerson, setHandoverPerson] = useState('Co-Lead');

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    setIsLoading(true);
    try {
      const data = await LeavesService.getLeaves();
      setApplications(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    try {
      const created = await LeavesService.createLeave({
        applicantName,
        applicantRole,
        leaveType,
        startDate,
        endDate,
        reason,
        handoverPerson,
      });

      setApplications([created, ...applications]);
      setReason('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to submit leave application:', err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: LeaveStatus) => {
    try {
      const updated = await LeavesService.updateStatus(id, newStatus);
      setApplications(applications.map((app) => (app.id === id ? updated : app)));
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
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Leave Applications</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
              Submit, track, and approve GDG organizing committee absence requests.
            </p>
          </div>

          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
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
              icon={<FileText size={20} />}
            />
          ) : (
            applications.map((app) => (
              <Card key={app.id} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
                        {app.applicantName}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({app.applicantRole})</span>
                      {getStatusBadge(app.status)}
                    </div>

                    <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '6px' }}>
                      {app.reason}
                    </p>
                  </div>

                  {/* Lead Review Actions */}
                  {app.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<CheckCircle2 size={14} color="var(--gdg-green)" />}
                        onClick={() => handleStatusChange(app.id, 'APPROVED')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<XCircle size={14} color="var(--gdg-red)" />}
                        onClick={() => handleStatusChange(app.id, 'REJECTED')}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
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
                    <CalIcon size={13} color="var(--gdg-blue)" />
                    <span>Duration: <strong>{app.startDate}</strong> to <strong>{app.endDate}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Badge variant="purple">{app.leaveType.replace('_', ' ')}</Badge>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <User size={13} />
                    <span>Handover to: <strong style={{ color: 'var(--text-main)' }}>{app.handoverPerson}</strong></span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Modal */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Leave Request">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Reason Category
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
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
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
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
                  padding: '9px 12px',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  outline: 'none',
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
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
