'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Icon } from '@/shared/components/ui/icon';
import { useLeaves } from '@/shared/hooks/useLeaves';
import { LeaveStatus } from '@/modules/leaves/leaves.service';

export default function AdminLeavePage() {
  const {
    leaves,
    filteredLeaves,
    filter,
    setFilter,
    updateLeaveStatus,
    isLoading,
  } = useLeaves();

  const handleStatusChange = async (id: string, newStatus: LeaveStatus) => {
    try {
      await updateLeaveStatus(id, newStatus);
    } catch (err) {
      console.error('Failed to update status:', err);
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

  const pendingCount = leaves.filter((l) => l.status === 'PENDING').length;
  const approvedCount = leaves.filter((l) => l.status === 'APPROVED').length;
  const rejectedCount = leaves.filter((l) => l.status === 'REJECTED').length;

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Top Header & Filter Chips */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            background: 'var(--bg-card)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Applications', count: leaves.length },
              { id: 'PENDING', label: 'Pending Review', count: pendingCount },
              { id: 'APPROVED', label: 'Approved', count: approvedCount },
              { id: 'REJECTED', label: 'Rejected', count: rejectedCount },
            ].map((tab) => {
              const isActive = filter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: isActive ? 'var(--md-primary-container)' : 'var(--bg-elevated)',
                    color: isActive ? 'var(--md-on-primary-container)' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                  className="m3-interactive"
                >
                  <span>{tab.label}</span>
                  <Badge variant={isActive ? 'blue' : 'gray'} style={{ fontSize: '0.6875rem', padding: '0 6px' }}>
                    {tab.count}
                  </Badge>
                </button>
              );
            })}
          </div>

          <Link href="/admin">
            <Button variant="secondary" size="sm" leftIcon={<Icon name="arrow_back" size={16} />}>
              Back to Admin
            </Button>
          </Link>
        </div>

        {/* Applications List with Lead Review Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredLeaves.length === 0 ? (
            <EmptyState
              title="No Applications"
              description="There are no leave applications matching this filter."
              icon="assignment"
            />
          ) : (
            filteredLeaves.map((app) => (
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

                  {/* Admin Approve & Reject Action Buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {app.status !== 'APPROVED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Icon name="check_circle" size={16} fill />}
                        onClick={() => handleStatusChange(app.id, 'APPROVED')}
                      >
                        Approve
                      </Button>
                    )}
                    {app.status !== 'REJECTED' && (
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<Icon name="cancel" size={16} fill />}
                        onClick={() => handleStatusChange(app.id, 'REJECTED')}
                      >
                        Reject
                      </Button>
                    )}
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
                      Handover: <strong style={{ color: 'var(--text-main)' }}>{app.handoverPerson}</strong>
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
