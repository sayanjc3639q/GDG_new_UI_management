'use client';

import React, { memo } from 'react';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Icon } from '@/shared/components/ui/icon';
import Link from 'next/link';
import { useTasks } from '@/shared/hooks/useTasks';
import { Task } from '@/modules/tasks/tasks.service';

const TaskRow = memo(function TaskRow({
  task,
  onToggle,
}: {
  task: Task;
  onToggle: (id: string, status: Task['status']) => void;
}) {
  const isDone = task.status === 'COMPLETED';

  return (
    <div
      style={{
        padding: '16px 20px',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        background: isDone ? 'var(--bg-elevated)' : 'var(--bg-input)',
        opacity: isDone ? 0.75 : 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        transition: 'all 0.2s ease',
      }}
      className="m3-interactive"
    >
      {/* Left: Checkbox & Task Details */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '260px' }}>
        <button
          onClick={() => onToggle(task.id, task.status)}
          title={isDone ? 'Mark incomplete' : 'Mark complete'}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            border: isDone ? 'none' : '2px solid var(--border-color)',
            background: isDone ? 'var(--gdg-green)' : 'transparent',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            marginTop: '2px',
            flexShrink: 0,
            padding: 0,
          }}
        >
          {isDone && <Icon name="check" size={16} />}
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span
            style={{
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: isDone ? 'var(--text-muted)' : 'var(--text-main)',
              textDecoration: isDone ? 'line-through' : 'none',
            }}
          >
            {task.title}
          </span>
          {task.description && (
            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--text-muted)',
                lineHeight: 1.4,
              }}
            >
              {task.description}
            </span>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '4px',
              flexWrap: 'wrap',
              fontSize: '0.75rem',
              color: 'var(--text-subtle)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gdg-red)', fontWeight: 600 }}>
              <Icon name="event" size={14} color="var(--gdg-red)" />
              Deadline: {task.dueDate}
            </span>
            {task.domain && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icon name="category" size={14} />
                {task.domain}
              </span>
            )}
            {task.assignee && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Icon name="person" size={14} />
                {task.assignee}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Badges & Quick Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Badge variant={task.priority === 'HIGH' ? 'red' : task.priority === 'MEDIUM' ? 'yellow' : 'blue'}>
          {task.priority === 'HIGH' ? 'High' : task.priority === 'MEDIUM' ? 'Medium' : 'Low'}
        </Badge>
        <Badge variant={task.status === 'COMPLETED' ? 'green' : task.status === 'IN_PROGRESS' ? 'blue' : 'gray'}>
          {task.status === 'COMPLETED' ? 'Completed' : task.status === 'IN_PROGRESS' ? 'In Progress' : 'To Do'}
        </Badge>
        <Link href="/tasks">
          <Button variant="secondary" size="sm">
            Open
          </Button>
        </Link>
      </div>
    </div>
  );
});

export default function DashboardPage() {
  const { upcomingTasks, isLoading, toggleTaskStatus } = useTasks();
  const username = 'Sayan'; // Active user

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Simple Welcome Card */}
        <div
          style={{
            padding: '24px 28px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Welcome, {username}
            </h2>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                marginTop: '6px',
                marginBottom: 0,
              }}
            >
              Here are your upcoming tasks and deadlines.
            </p>
          </div>

          <Link href="/tasks">
            <Button variant="primary" size="sm" leftIcon={<Icon name="checklist" size={16} />}>
              View All Tasks
            </Button>
          </Link>
        </div>

        {/* Upcoming Tasks & Deadlines Section */}
        <Card style={{ padding: '0', overflow: 'hidden', borderRadius: 'var(--radius-xl)' }}>
          <div
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--bg-elevated)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="event_upcoming" size={20} color="var(--gdg-blue)" />
              <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                Upcoming Tasks & Deadlines
              </span>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-subtle)',
                background: 'var(--bg-card)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--border-color)',
                fontWeight: 600,
              }}
            >
              {upcomingTasks.filter((t) => t.status !== 'COMPLETED').length} Pending
            </span>
          </div>

          <div style={{ padding: '20px' }}>
            {isLoading && upcomingTasks.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading tasks...
              </div>
            ) : upcomingTasks.length === 0 ? (
              <EmptyState
                title="No Upcoming Tasks"
                description="You have no pending tasks or upcoming deadlines."
                actionLabel="Create Task"
                onAction={() => (window.location.href = '/tasks')}
                icon="task_alt"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {upcomingTasks.map((task) => (
                  <TaskRow key={task.id} task={task} onToggle={toggleTaskStatus} />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
