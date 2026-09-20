'use client';

import React, { memo, useState } from 'react';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Icon } from '@/shared/components/ui/icon';
import Link from 'next/link';
import { useTasks } from '@/shared/hooks/useTasks';
import { useTeam } from '@/shared/hooks/useTeam';
import { useAuth } from '@/shared/context/auth-context';
import { Task } from '@/modules/tasks/tasks.service';

const TaskRow = memo(function TaskRow({
  task,
}: {
  task: Task;
  onToggle: (id: string, status: Task['status']) => void;
}) {
  const isDone = task.status === 'COMPLETED' || task.status === 'ACCEPTED';

  const getStatusBadge = (s: Task['status']) => {
    switch (s) {
      case 'COMPLETED':
        return <Badge variant="green">Completed</Badge>;
      case 'ACCEPTED':
        return <Badge variant="green" style={{ background: '#0a5323', color: '#fff' }}>Accepted</Badge>;
      case 'SUBMITTED':
        return <Badge variant="purple">Under Review</Badge>;
      case 'REJECTED':
        return <Badge variant="red">Needs Revision</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="blue">In Progress</Badge>;
      case 'TODO':
      default:
        return <Badge variant="gray">To Do</Badge>;
    }
  };

  return (
    <div
      style={{
        padding: '16px 20px',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        background: isDone ? 'var(--bg-elevated)' : 'var(--bg-input)',
        opacity: isDone ? 0.8 : 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        transition: 'all 0.2s ease',
      }}
      className="m3-interactive"
    >
      {/* Left: Task Details */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '260px' }}>
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
            {task.assignedBy && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gdg-blue)' }}>
                <Icon name="assignment_ind" size={14} color="var(--gdg-blue)" />
                By: {task.assignedBy}
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
        {getStatusBadge(task.status)}
        <Link href="/tasks">
          <Button variant="secondary" size="sm">
            Open Task
          </Button>
        </Link>
      </div>
    </div>
  );
});

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, isLoading, toggleTaskStatus, updateTaskStatus } = useTasks();
  const { members } = useTeam();

  // State to track member selections for unassigned task assignment
  const [selectedAssignees, setSelectedAssignees] = useState<{ [taskId: string]: string }>({});
  const [isAssigning, setIsAssigning] = useState<{ [taskId: string]: boolean }>({});

  const userName = user?.name || 'Member';
  const isHigherRole = user?.role === 'DEVELOPER' || user?.role === 'LEAD' || user?.role === 'DOMAIN_SENIOR';

  // 1. In dashboard: Filter tasks specifically assigned to the logged-in profile
  const myTasks = React.useMemo(() => {
    if (!user) return [];
    return tasks
      .filter((t) => {
        const assigneeLower = (t.assignee || '').toLowerCase();
        const userNameLower = (user.name || '').toLowerCase();
        const userEmailLower = (user.email || '').toLowerCase();
        // Do not include unassigned tasks in myTasks
        if (assigneeLower === 'unassigned' || assigneeLower.includes('unassigned')) return false;
        return (
          assigneeLower.includes(userNameLower) ||
          (user.email && assigneeLower.includes(userEmailLower))
        );
      })
      .sort((a, b) => {
        const isADone = a.status === 'COMPLETED' || a.status === 'ACCEPTED';
        const isBDone = b.status === 'COMPLETED' || b.status === 'ACCEPTED';
        if (isADone && !isBDone) return 1;
        if (!isADone && isBDone) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [tasks, user]);

  // 2. Unassigned Tasks Delegation for Domain Senior / Higher members
  const unassignedTasks = React.useMemo(() => {
    if (!user || !isHigherRole) return [];
    return tasks.filter((t) => {
      const isUnassigned =
        !t.assignee ||
        t.assignee === 'UNASSIGNED' ||
        t.assignee.toLowerCase().includes('unassigned');

      if (!isUnassigned) return false;

      // Developer & Lead can see unassigned tasks across all domains
      if (user.role === 'DEVELOPER' || user.role === 'LEAD') return true;

      // Domain Senior sees unassigned tasks matching their domain
      return t.domain === user.domain;
    });
  }, [tasks, user, isHigherRole]);

  // 3. Tasks assigned by the current user that have been submitted by members and are pending review
  const tasksToReview = React.useMemo(() => {
    if (!user || !isHigherRole) return [];

    return tasks.filter((t) => {
      const isSubmitted = t.status === 'SUBMITTED';
      const assignedByLower = (t.assignedBy || '').toLowerCase();
      const userNameLower = (user.name || '').toLowerCase();
      const isAssignedByMe = assignedByLower.includes(userNameLower);
      return isSubmitted && (user.role === 'DEVELOPER' || isAssignedByMe);
    });
  }, [tasks, user, isHigherRole]);

  // Handle Domain Senior assigning a member to an unassigned task
  const handleAssignMemberToTask = async (taskId: string, domainName: string) => {
    const memberId = selectedAssignees[taskId];
    if (!memberId) {
      alert('Please choose a member from the dropdown to assign.');
      return;
    }

    const assignedMember = members.find((m) => m.id === memberId);
    if (!assignedMember) return;

    setIsAssigning((prev) => ({ ...prev, [taskId]: true }));
    try {
      const assigneeStr = `${assignedMember.name} (${assignedMember.leadTitle || assignedMember.role || 'Member'})`;
      await updateTaskStatus(taskId, 'TODO', {
        assignee: assigneeStr,
      });

      // Clear selection
      setSelectedAssignees((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
    } catch (err) {
      console.error('Failed to assign task to member:', err);
      alert('Failed to assign task.');
    } finally {
      setIsAssigning((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Welcome Card */}
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
              Welcome, {userName}
            </h2>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                marginTop: '6px',
                marginBottom: 0,
              }}
            >
              {user?.role === 'DOMAIN_SENIOR'
                ? `Domain Senior for ${user.domain || 'Chapter'}. Manage domain deliverables and assigned tasks.`
                : 'Here are the tasks and deliverables assigned directly to your profile.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link href="/calendar">
              <Button variant="secondary" size="sm" leftIcon={<Icon name="calendar_month" size={16} />}>
                Calendar
              </Button>
            </Link>
            <Link href="/tasks">
              <Button variant="primary" size="sm" leftIcon={<Icon name="checklist" size={16} />}>
                All Tasks
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. Unassigned Domain Tasks Section for Domain Seniors / Higher members */}
        {unassignedTasks.length > 0 && (
          <Card
            style={{
              padding: '0',
              overflow: 'hidden',
              borderRadius: 'var(--radius-xl)',
              border: '1.5px solid rgba(251, 188, 4, 0.4)',
              background: 'linear-gradient(180deg, rgba(251, 188, 4, 0.04) 0%, var(--bg-card) 100%)',
            }}
          >
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid var(--border-color)',
                background: 'rgba(251, 188, 4, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: '#fbbc04',
                    color: '#202124',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="person_add" size={18} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Unassigned Domain Deliverables ({unassignedTasks.length})
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Scheduled by leadership without an assigned member. Pick a domain member to delegate.
                  </span>
                </div>
              </div>

              <Badge variant="yellow" style={{ fontWeight: 700 }}>
                Requires Senior Assignment
              </Badge>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {unassignedTasks.map((t) => {
                const availableDomainMembers = members.filter(
                  (m) => !t.domain || m.domain === t.domain
                );

                return (
                  <div
                    key={t.id}
                    style={{
                      padding: '16px 20px',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-card)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Badge variant="purple">{t.domain}</Badge>
                          <Badge variant={t.priority === 'HIGH' ? 'red' : 'yellow'}>
                            {t.priority} Priority
                          </Badge>
                          <span style={{ fontSize: '0.75rem', color: 'var(--gdg-red)', fontWeight: 600 }}>
                            Due: {t.dueDate}
                          </span>
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                          {t.title}
                        </span>
                        {t.description && (
                          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                            {t.description}
                          </p>
                        )}
                        {t.assignedBy && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--gdg-blue)', marginTop: '4px', display: 'block' }}>
                            Scheduled by: {t.assignedBy}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delegation Row: Dropdown & Assign Button */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'var(--bg-elevated)',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                        Assign to Member:
                      </span>

                      <select
                        value={selectedAssignees[t.id] || ''}
                        onChange={(e) =>
                          setSelectedAssignees((prev) => ({ ...prev, [t.id]: e.target.value }))
                        }
                        style={{
                          flex: '1 1 200px',
                          height: '38px',
                          background: 'var(--bg-input)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0 12px',
                          color: 'var(--text-main)',
                          fontSize: '0.8125rem',
                          outline: 'none',
                        }}
                      >
                        <option value="">-- Select Member from {t.domain} ({availableDomainMembers.length}) --</option>
                        {availableDomainMembers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} &bull; {m.role} {m.leadTitle ? `(${m.leadTitle})` : ''}
                          </option>
                        ))}
                      </select>

                      <Button
                        variant="primary"
                        size="sm"
                        leftIcon={<Icon name="how_to_reg" size={16} />}
                        disabled={!selectedAssignees[t.id] || isAssigning[t.id]}
                        onClick={() => handleAssignMemberToTask(t.id, t.domain)}
                      >
                        {isAssigning[t.id] ? 'Assigning...' : 'Assign Member'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* 3. Review Alert Banner for Higher Member who assigned tasks that were submitted */}
        {tasksToReview.length > 0 && (
          <div
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-xl)',
              background: 'linear-gradient(135deg, rgba(161, 66, 244, 0.12) 0%, rgba(26, 115, 232, 0.12) 100%)',
              border: '1px solid rgba(161, 66, 244, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--md-primary-container)',
                  color: 'var(--gdg-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="rate_review" size={22} color="var(--gdg-blue)" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {tasksToReview.length} Task Submission{tasksToReview.length > 1 ? 's' : ''} Ready for Review
                </h4>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                  Members have submitted work for tasks you assigned. Review, accept, or request revisions.
                </span>
              </div>
            </div>

            <Link href="/tasks">
              <Button variant="primary" size="sm" leftIcon={<Icon name="visibility" size={16} />}>
                Review Submissions
              </Button>
            </Link>
          </div>
        )}

        {/* My Tasks Section */}
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
              <Icon name="assignment" size={20} color="var(--gdg-blue)" />
              <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                My Assigned Tasks ({myTasks.length})
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
              {myTasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'ACCEPTED').length} Active
            </span>
          </div>

          <div style={{ padding: '20px' }}>
            {isLoading && myTasks.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading your tasks...
              </div>
            ) : myTasks.length === 0 ? (
              <EmptyState
                title="No Tasks Assigned to You"
                description="You currently have no tasks assigned to your profile."
                actionLabel="Browse All Tasks"
                onAction={() => (window.location.href = '/tasks')}
                icon="task_alt"
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {myTasks.map((task) => (
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
