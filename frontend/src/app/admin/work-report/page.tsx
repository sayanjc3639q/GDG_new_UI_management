'use client';

import React from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Icon } from '@/shared/components/ui/icon';
import { useTasks } from '@/shared/hooks/useTasks';
import { useTeam } from '@/shared/hooks/useTeam';

export default function AdminWorkReportPage() {
  const { tasks } = useTasks();
  const { members } = useTeam();

  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const totalTasks = tasks.length || 1;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  const domainMetrics = [
    { domain: 'AI/ML', total: 4, completed: 3, lead: 'John Doe', color: 'var(--gdg-blue)' },
    { domain: 'Web & Cloud', total: 5, completed: 4, lead: 'Jane Smith', color: 'var(--gdg-green)' },
    { domain: 'Cybersecurity', total: 2, completed: 2, lead: 'Alex Chen', color: 'var(--gdg-red)' },
    { domain: 'Design & UI/UX', total: 3, completed: 3, lead: 'Sarah Jenkins', color: 'var(--gdg-yellow)' },
  ];

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
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
              Chapter Sprint Deliverables &amp; Work Report
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            leftIcon={<Icon name="download" size={16} />}
            onClick={() => window.print()}
          >
            Export Report
          </Button>
        </div>

        {/* High-level Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <Card style={{ padding: '20px', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Completion Rate</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gdg-green)' }}>{completionRate}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {completedTasks} of {totalTasks} deliverables done
            </div>
          </Card>

          <Card style={{ padding: '20px', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Active Core Team</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gdg-blue)' }}>{members.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Across 5 technical tracks
            </div>
          </Card>

          <Card style={{ padding: '20px', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Sprint Status</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--gdg-yellow)' }}>On Schedule</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Next milestone: DevFest prep
            </div>
          </Card>
        </div>

        {/* Domain Breakdown */}
        <Card style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px' }}>
            Domain Output Breakdown
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {domainMetrics.map((dm) => {
              const pct = Math.round((dm.completed / dm.total) * 100);
              return (
                <div
                  key={dm.domain}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{dm.domain}</span>
                      <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Lead: {dm.lead}</span>
                    </div>
                    <Badge variant="blue">{dm.completed}/{dm.total} completed ({pct}%)</Badge>
                  </div>
                  {/* Progress bar */}
                  <div
                    style={{
                      height: '6px',
                      background: 'var(--border-color)',
                      borderRadius: 'var(--radius-full)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: dm.color,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
