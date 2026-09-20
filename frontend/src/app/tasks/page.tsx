'use client';

import React, { useState, useMemo } from 'react';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Modal } from '@/shared/components/ui/modal';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Icon } from '@/shared/components/ui/icon';
import { useTasks } from '@/shared/hooks/useTasks';
import { useTeam } from '@/shared/hooks/useTeam';
import { useAuth } from '@/shared/context/auth-context';
import { Task } from '@/modules/tasks/tasks.service';

export const CHAPTER_DOMAINS = [
  'Web Developer',
  'App Developer',
  'Graphic Designer',
  'Video Editor',
  'Photographer',
  'Content Writer',
  'Public Relation Manager',
  'Technical Member',
] as const;

export default function TasksPage() {
  const { user } = useAuth();
  const { members } = useTeam();
  const {
    tasks,
    filter,
    searchQuery,
    setFilter,
    setSearch,
    createTask,
    toggleTaskStatus,
    updateTaskStatus,
  } = useTasks();

  const canManageTasks = Boolean(
    user && (user.role === 'DEVELOPER' || user.role === 'LEAD' || user.role === 'DOMAIN_SENIOR')
  );

  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDomain, setNewDomain] = useState<string>(CHAPTER_DOMAINS[0]);
  const [assigneeMode, setAssigneeMode] = useState<'unassigned' | 'member' | 'custom'>('member');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newAssigneeRole, setNewAssigneeRole] = useState('MEMBER');
  const [newPriority, setNewPriority] = useState<Task['priority']>('MEDIUM');
  const [newDueDate, setNewDueDate] = useState('2026-09-30');

  // Filter & Pin logged-in user's tasks to the top
  const sortedAndFilteredTasks = useMemo(() => {
    const isMyTask = (t: Task) => {
      if (!user) return false;
      const assigneeLower = (t.assignee || '').toLowerCase();
      const userNameLower = (user.name || '').toLowerCase();
      const userEmailLower = (user.email || '').toLowerCase();
      return (
        assigneeLower.includes(userNameLower) ||
        (user.email && assigneeLower.includes(userEmailLower))
      );
    };

    const matching = tasks.filter((task) => {
      const matchesFilter = filter === 'ALL' || task.status === filter;
      const matchesDomain =
        selectedDomainFilter === 'ALL' || task.domain === selectedDomainFilter;
      const matchesSearch =
        searchQuery === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.assignedBy && task.assignedBy.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesDomain && matchesSearch;
    });

    // Sort: 1) User's own tasks at the top, 2) Incomplete tasks before Completed, 3) Due Date
    return matching.sort((a, b) => {
      const aMine = isMyTask(a) ? 1 : 0;
      const bMine = isMyTask(b) ? 1 : 0;
      if (aMine !== bMine) return bMine - aMine; // own task on top

      const aDone = a.status === 'COMPLETED' || a.status === 'ACCEPTED';
      const bDone = b.status === 'COMPLETED' || b.status === 'ACCEPTED';
      if (aDone !== bDone) return aDone ? 1 : -1;

      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [tasks, filter, selectedDomainFilter, searchQuery, user]);

  // Overall Task Completion Progress
  const progressStats = useMemo(() => {
    const total = tasks.length;
    if (total === 0) return { total: 0, completed: 0, percent: 0 };
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    const percent = Math.round((completed / total) * 100);
    return { total, completed, percent };
  }, [tasks]);

  // Members filtered by currently selected domain in the creation modal
  const domainFilteredMembers = useMemo(() => {
    return members.filter((m) => !newDomain || m.domain === newDomain);
  }, [members, newDomain]);

  const handleSelectMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    if (!memberId) {
      setNewAssignee('');
      return;
    }
    const found = members.find((m) => m.id === memberId);
    if (found) {
      setNewAssignee(found.name);
      setNewAssigneeRole(found.leadTitle || found.role);
      if (found.domain && CHAPTER_DOMAINS.includes(found.domain as any)) {
        setNewDomain(found.domain);
      }
    }
  };

  const handleAssignToSelf = () => {
    if (!user) return;
    setAssigneeMode('custom');
    setNewAssignee(user.name);
    setNewAssigneeRole(user.leadTitle || user.role);
    if (user.domain && CHAPTER_DOMAINS.includes(user.domain as any)) {
      setNewDomain(user.domain);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    let assigneeValue = 'UNASSIGNED';
    if (assigneeMode === 'member' && selectedMemberId) {
      const found = members.find((m) => m.id === selectedMemberId);
      if (found) {
        assigneeValue = `${found.name} (${found.leadTitle || found.role})`;
      }
    } else if (assigneeMode === 'custom' && newAssignee) {
      assigneeValue = `${newAssignee} (${newAssigneeRole})`;
    } else if (assigneeMode === 'unassigned') {
      assigneeValue = 'UNASSIGNED';
    } else {
      alert('Please choose an assignee or select "Leave Unassigned".');
      return;
    }

    const assignerInfo = user
      ? `${user.name} (${user.leadTitle || user.role})`
      : 'Lead Admin (Organizer)';

    try {
      await createTask({
        title: newTitle,
        description: newDesc,
        assignee: assigneeValue,
        assignedBy: assignerInfo,
        domain: newDomain,
        priority: newPriority,
        dueDate: newDueDate,
      });

      setNewTitle('');
      setNewDesc('');
      setNewAssignee('');
      setSelectedMemberId('');
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  // Step 2: Member submits completed deliverable for review
  const handleMemberSubmit = async () => {
    if (!selectedTask) return;
    try {
      await updateTaskStatus(selectedTask.id, 'SUBMITTED', {
        submissionLink,
        submissionNotes,
        submittedAt: new Date(),
      } as any);
      setSelectedTask(null);
      setSubmissionNotes('');
      setSubmissionLink('');
    } catch (err) {
      console.error('Failed to submit task deliverable:', err);
    }
  };

  // Step 3: Higher member accepts submission with optional comment
  const handleAcceptSubmission = async (comment?: string) => {
    if (!selectedTask || !user) return;
    try {
      await updateTaskStatus(selectedTask.id, 'ACCEPTED', {
        reviewComment: comment || 'Accepted by Lead.',
        acceptedBy: `${user.name} (${user.leadTitle || user.role})`,
        acceptedAt: new Date(),
      } as any);
      setSelectedTask(null);
    } catch (err) {
      console.error('Failed to accept task submission:', err);
    }
  };

  // Step 3: Higher member rejects submission with required comment -> Member must resubmit
  const handleRejectSubmission = async (comment: string) => {
    if (!selectedTask || !user) return;
    if (!comment.trim()) {
      alert('Please provide a comment explaining why this submission needs revision.');
      return;
    }
    try {
      await updateTaskStatus(selectedTask.id, 'REJECTED', {
        reviewComment: comment,
        reviewedBy: `${user.name} (${user.leadTitle || user.role})`,
        reviewedAt: new Date(),
      } as any);
      setSelectedTask(null);
    } catch (err) {
      console.error('Failed to reject task submission:', err);
    }
  };

  // Step 4: Domain Senior / Lead / Developer marks accepted task as finally DONE
  const handleMarkAsDone = async () => {
    if (!selectedTask || !user) return;
    try {
      await updateTaskStatus(selectedTask.id, 'COMPLETED', {
        markedDoneBy: `${user.name} (${user.leadTitle || user.role})`,
        markedDoneAt: new Date(),
      } as any);
      setSelectedTask(null);
    } catch (err) {
      console.error('Failed to mark task as completed:', err);
    }
  };

  const getPriorityBadge = (p: Task['priority']) => {
    switch (p) {
      case 'HIGH':
        return <Badge variant="red">High Priority</Badge>;
      case 'MEDIUM':
        return <Badge variant="yellow">Medium</Badge>;
      case 'LOW':
      default:
        return <Badge variant="blue">Low</Badge>;
    }
  };

  const getStatusBadge = (s: Task['status']) => {
    switch (s) {
      case 'COMPLETED':
        return <Badge variant="green" style={{ background: '#137333', color: '#fff' }}>Completed &bull; Done</Badge>;
      case 'ACCEPTED':
        return <Badge variant="green">Accepted (Pending Final Done)</Badge>;
      case 'SUBMITTED':
        return <Badge variant="purple" style={{ background: 'linear-gradient(135deg, #a142f4, #681da8)', color: '#fff', border: 'none' }}>Under Review</Badge>;
      case 'REJECTED':
        return <Badge variant="red">Needs Resubmission</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="blue">In Progress</Badge>;
      case 'TODO':
      default:
        return <Badge variant="gray">To Do</Badge>;
    }
  };

  // Review Comment Dialog state
  const [reviewCommentInput, setReviewCommentInput] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Google theme workflow step indices: Assigned (0) -> Submitted (1) -> Reviewed (2) -> Completed (3)
  const getWorkflowStepIndex = (status: Task['status']) => {
    switch (status) {
      case 'TODO':
      case 'IN_PROGRESS':
        return 0; // Assigned / In Progress
      case 'SUBMITTED':
        return 1; // Submitted for review
      case 'ACCEPTED':
      case 'REJECTED':
        return 2; // Reviewed (Accepted / Rejected)
      case 'COMPLETED':
        return 3; // Completed & Done
      default:
        return 0;
    }
  };

  // Google Theme Work Path Stepper Component matching user's 2nd image
  const WorkPathStepper = ({ status, compact = false }: { status: Task['status']; compact?: boolean }) => {
    const currentStep = getWorkflowStepIndex(status);
    const isRejected = status === 'REJECTED';

    const steps = [
      { key: 'assigned', label: 'Assigned' },
      { key: 'submitted', label: 'Submitted' },
      { key: 'reviewed', label: isRejected ? 'Revision' : 'Reviewed' },
      { key: 'completed', label: 'Completed' },
    ];

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: compact ? '260px' : '100%',
          maxWidth: compact ? '280px' : '520px',
          position: 'relative',
          padding: compact ? '4px 0' : '10px 0',
        }}
      >
        {/* Background Connecting Line */}
        <div
          style={{
            position: 'absolute',
            top: compact ? '14px' : '18px',
            left: '16px',
            right: '16px',
            height: '3px',
            background: 'var(--border-color)',
            zIndex: 1,
            borderRadius: '2px',
          }}
        />
        {/* Active Connecting Progress Line */}
        <div
          style={{
            position: 'absolute',
            top: compact ? '14px' : '18px',
            left: '16px',
            width: `calc(${Math.min(currentStep, 3) * 33.33}% - 8px)`,
            height: '3px',
            background: isRejected ? '#ea4335' : '#4285f4',
            zIndex: 1,
            borderRadius: '2px',
            transition: 'width 0.3s ease',
          }}
        />

        {steps.map((step, idx) => {
          const isPassed = currentStep >= idx;
          const isCurrent = currentStep === idx;
          const isStepRejected = isRejected && idx === 2;

          let circleBg = 'var(--bg-card)';
          let circleBorder = 'var(--border-color)';
          let circleColor = 'var(--text-subtle)';

          if (isPassed) {
            circleBg = isStepRejected ? '#ea4335' : '#4285f4';
            circleBorder = isStepRejected ? '#ea4335' : '#4285f4';
            circleColor = '#ffffff';
          }

          return (
            <div
              key={step.key}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '5px',
                zIndex: 2,
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: compact ? '24px' : '30px',
                  height: compact ? '24px' : '30px',
                  borderRadius: '50%',
                  background: circleBg,
                  border: `2px solid ${circleBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: circleColor,
                  boxShadow: isCurrent ? '0 0 0 3px rgba(66, 133, 244, 0.25)' : 'none',
                  transition: 'all 0.25s ease',
                }}
              >
                {isPassed ? (
                  <Icon name={isStepRejected ? 'close' : 'check'} size={compact ? 15 : 18} />
                ) : (
                  <span style={{ fontSize: compact ? '10px' : '12px', fontWeight: 600 }}>{idx + 1}</span>
                )}
              </div>
              <span
                style={{
                  fontSize: compact ? '0.6875rem' : '0.8125rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent
                    ? isStepRejected
                      ? '#ea4335'
                      : 'var(--gdg-blue)'
                    : isPassed
                    ? 'var(--text-main)'
                    : 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header & Controls Bar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '16px 20px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {/* Status Quick Filter Tabs - scrollable horizontally on mobile without overflow */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px',
              alignItems: 'center',
              scrollbarWidth: 'none',
            }}
          >
            {(['ALL', 'TODO', 'IN_PROGRESS', 'SUBMITTED', 'REJECTED', 'ACCEPTED', 'COMPLETED'] as const).map((tab) => {
              const isActive = filter === tab;
              const count = tab === 'ALL' ? tasks.length : tasks.filter((t) => t.status === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab as any)}
                  style={{
                    padding: '6px 14px',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    borderRadius: 'var(--radius-full)',
                    background: isActive ? 'var(--md-primary-container)' : 'var(--bg-elevated)',
                    color: isActive ? 'var(--md-on-primary-container)' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                  className="m3-interactive"
                >
                  <span>{tab.replace('_', ' ')}</span>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      opacity: 0.8,
                      background: isActive ? 'var(--gdg-blue)' : 'var(--bg-card)',
                      color: isActive ? '#fff' : 'inherit',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 260px', flexWrap: 'wrap' }}>
              {/* Domain Filter Dropdown */}
              <select
                value={selectedDomainFilter}
                onChange={(e) => setSelectedDomainFilter(e.target.value)}
                style={{
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-elevated)',
                  color: 'var(--text-main)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  outline: 'none',
                  cursor: 'pointer',
                  flex: '0 0 auto',
                }}
              >
                <option value="ALL">All Domains (8)</option>
                {CHAPTER_DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              {/* Search Input */}
              <div style={{ flex: '1 1 180px', minWidth: '160px' }}>
                <Input
                  placeholder="Search tasks, assignee..."
                  value={searchQuery}
                  onChange={(e) => setSearch(e.target.value)}
                  leftIcon={<Icon name="search" size={16} />}
                />
              </div>
            </div>

            {/* Assign Task Modal Button for Seniors / Leads / Developers */}
            {canManageTasks && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Icon name="add_task" size={16} />}
                onClick={() => setIsAddModalOpen(true)}
                style={{ whiteSpace: 'nowrap' }}
              >
                Assign Task
              </Button>
            )}
          </div>
        </div>

        {/* Tasks List (Sorted with Logged Profile's own tasks on top) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {sortedAndFilteredTasks.length === 0 ? (
            <EmptyState
              title="No Tasks Found"
              description="No deliverables match your active filter and search query."
              actionLabel={canManageTasks ? 'Assign Task' : undefined}
              onAction={canManageTasks ? () => setIsAddModalOpen(true) : undefined}
              icon="checklist"
            />
          ) : (
            sortedAndFilteredTasks.map((t) => {
              const isMine =
                user &&
                ((t.assignee || '').toLowerCase().includes((user.name || '').toLowerCase()) ||
                  (user.email && (t.assignee || '').toLowerCase().includes(user.email.toLowerCase())));

              return (
                <Card
                  key={t.id}
                  style={{
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    borderRadius: 'var(--radius-xl)',
                    border: isMine ? '1.5px solid var(--gdg-blue)' : '1px solid var(--border-color)',
                    background: isMine ? 'rgba(26, 115, 232, 0.03)' : 'var(--bg-card)',
                  }}
                  className="m3-interactive"
                >
                  {/* Top Row: Title, Badges, and Action Button */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '12px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ flex: '1 1 240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
                        <span
                          style={{
                            fontWeight: 600,
                            fontSize: '1rem',
                            color: 'var(--text-main)',
                          }}
                        >
                          {t.title}
                        </span>
                        {isMine && (
                          <Badge variant="blue" style={{ fontSize: '0.6875rem', fontWeight: 700 }}>
                            Assigned to You
                          </Badge>
                        )}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '0.8125rem',
                          color: 'var(--text-muted)',
                          flexWrap: 'wrap',
                        }}
                      >
                        <span>
                          Assignee: <strong style={{ color: 'var(--text-main)' }}>{t.assignee}</strong>
                        </span>
                        {t.assignedBy && (
                          <span>
                            &bull; By: <span style={{ color: 'var(--gdg-blue)', fontWeight: 500 }}>{t.assignedBy}</span>
                          </span>
                        )}
                        <span>
                          &bull; Due: <span>{t.dueDate}</span>
                        </span>
                      </div>

                      {t.description && (
                        <div
                          style={{
                            fontSize: '0.8125rem',
                            color: 'var(--text-subtle)',
                            marginTop: '6px',
                            lineHeight: 1.4,
                          }}
                        >
                          {t.description}
                        </div>
                      )}

                      {/* Review Comment display if rejected/needs revision */}
                      {t.reviewComment && (
                        <div
                          style={{
                            marginTop: '8px',
                            padding: '6px 12px',
                            background: t.status === 'REJECTED' ? 'var(--md-error-container)' : 'var(--md-primary-container)',
                            color: t.status === 'REJECTED' ? 'var(--md-on-error-container)' : 'var(--md-on-primary-container)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Icon name="comment" size={14} />
                          <span>Review: {t.reviewComment}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <Badge variant="purple">{t.domain}</Badge>
                      {getPriorityBadge(t.priority)}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedTask(t);
                          setSubmissionLink(t.submissionLink || '');
                          setSubmissionNotes(t.submissionNotes || '');
                          setReviewCommentInput('');
                          setIsRejecting(false);
                        }}
                        style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
                      >
                        {t.status === 'SUBMITTED' && canManageTasks ? 'Review Work' : 'View Workflow'}
                      </Button>
                    </div>
                  </div>

                  {/* Bottom Row: Full Google Work Path Stepper */}
                  <div
                    style={{
                      background: 'var(--bg-elevated)',
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    <WorkPathStepper status={t.status} compact={false} />
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Modal: Create & Assign Task */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Assign New Task Deliverable"
          icon="add_task"
        >
          <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Assigner Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'var(--md-primary-container)',
                color: 'var(--md-on-primary-container)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="assignment_ind" size={18} color="var(--gdg-blue)" />
                <span>
                  Assigned by: <strong>{user?.name || 'Lead Admin'}</strong> (
                  {user?.leadTitle || user?.role || 'Organizer'})
                </span>
              </div>
              <Badge variant="blue">{user?.leadTitle || user?.role || 'LEAD'}</Badge>
            </div>

            <Input
              label="Task Title"
              placeholder="e.g. Build RSVP Scanner UI component"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                Task Details &amp; Scope
              </label>
              <textarea
                placeholder="Specify deliverables, milestones, and required links..."
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--font-main)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Domain & Priority Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  Domain Category (8 Chapter Domains)
                </label>
                <select
                  value={newDomain}
                  onChange={(e) => {
                    setNewDomain(e.target.value);
                    setSelectedMemberId('');
                    setNewAssignee('');
                  }}
                  style={{
                    width: '100%',
                    height: '42px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0 12px',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-main)',
                    outline: 'none',
                  }}
                >
                  {CHAPTER_DOMAINS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  Priority Level
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  style={{
                    width: '100%',
                    height: '42px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0 12px',
                    color: 'var(--text-main)',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--font-main)',
                    outline: 'none',
                  }}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>

            {/* Target Assignee from Member Roster */}
            <div
              style={{
                background: 'var(--bg-elevated)',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Assigned To Member (From Member Roster)
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setAssigneeMode('unassigned')}
                    style={{
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: assigneeMode === 'unassigned' ? 'var(--gdg-yellow)' : 'var(--bg-card)',
                      color: assigneeMode === 'unassigned' ? '#202124' : 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Unassigned (Senior to assign)
                  </button>
                  <button
                    type="button"
                    onClick={handleAssignToSelf}
                    style={{
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--gdg-blue)',
                      cursor: 'pointer',
                    }}
                  >
                    + Myself
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setAssigneeMode(assigneeMode === 'member' ? 'custom' : 'member')
                    }
                    style={{
                      padding: '3px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: 'transparent',
                      border: 'none',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    {assigneeMode === 'member' ? 'Custom' : 'From Roster'}
                  </button>
                </div>
              </div>

              {assigneeMode === 'unassigned' ? (
                <div style={{ fontSize: '0.8125rem', color: 'var(--gdg-yellow)', padding: '6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="info" size={16} color="var(--gdg-yellow)" />
                  <span>This deliverable will be placed in the Domain Senior delegation dashboard for <strong>{newDomain}</strong>.</span>
                </div>
              ) : assigneeMode === 'member' ? (
                <div>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => handleSelectMember(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      height: '42px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0 12px',
                      color: 'var(--text-main)',
                      fontSize: '0.875rem',
                      fontFamily: 'var(--font-main)',
                      outline: 'none',
                    }}
                  >
                    <option value="">-- Choose Member from {newDomain} or All --</option>
                    {domainFilteredMembers.length > 0 && (
                      <optgroup label={`${newDomain} Members (${domainFilteredMembers.length})`}>
                        {domainFilteredMembers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} &bull; {m.role} {m.leadTitle ? `(${m.leadTitle})` : ''} - {m.domain}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="All Chapter Members">
                      {members.map((m) => (
                        <option key={`all-${m.id}`} value={m.id}>
                          {m.name} &bull; {m.role} - {m.domain || 'General'}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
                  <Input
                    placeholder="Enter assignee full name..."
                    value={newAssignee}
                    onChange={(e) => setNewAssignee(e.target.value)}
                    required
                  />
                  <select
                    value={newAssigneeRole}
                    onChange={(e) => setNewAssigneeRole(e.target.value)}
                    style={{
                      height: '42px',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0 10px',
                      color: 'var(--text-main)',
                      fontSize: '0.8125rem',
                      outline: 'none',
                    }}
                  >
                    <option value="MEMBER">Member</option>
                    <option value="DOMAIN_SENIOR">Domain Senior</option>
                    <option value="LEAD">Lead</option>
                    <option value="DEVELOPER">Developer</option>
                  </select>
                </div>
              )}
            </div>

            <Input
              label="Due Date"
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              required
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
              <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Assign Task
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Comprehensive 4-Stage Task Workflow Dialog */}
        {selectedTask && (
          <Modal
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            title={selectedTask.title}
            icon="assignment"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Google Theme Work Path Stepper in Modal */}
              <div
                style={{
                  background: 'var(--bg-elevated)',
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Deliverable Work Path
                  </span>
                  {getPriorityBadge(selectedTask.priority)}
                </div>
                <WorkPathStepper status={selectedTask.status} compact={false} />
              </div>

              <div>
                <h4
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    marginBottom: '4px',
                  }}
                >
                  Task Description &amp; Scope
                </h4>
                <p
                  style={{
                    fontSize: '0.9375rem',
                    color: 'var(--text-main)',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {selectedTask.description || 'No description provided.'}
                </p>
              </div>

              {/* Task Metadata */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '12px',
                  background: 'var(--bg-sidebar)',
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>Assignee</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {selectedTask.assignee}
                  </span>
                </div>
                {selectedTask.assignedBy && (
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>Assigned By</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--gdg-blue)' }}>
                      {selectedTask.assignedBy}
                    </span>
                  </div>
                )}
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>Deadline</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {selectedTask.dueDate}
                  </span>
                </div>
              </div>

              {/* Existing Submission Proof if submitted */}
              {selectedTask.submissionLink && (
                <div
                  style={{
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    Submitted Deliverables:
                  </span>
                  <a
                    href={selectedTask.submissionLink.startsWith('http') ? selectedTask.submissionLink : `https://${selectedTask.submissionLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--gdg-blue)', textDecoration: 'underline', fontSize: '0.875rem', wordBreak: 'break-all' }}
                  >
                    {selectedTask.submissionLink}
                  </a>
                  {selectedTask.submissionNotes && (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-main)', marginTop: '4px' }}>
                      Notes: {selectedTask.submissionNotes}
                    </span>
                  )}
                </div>
              )}

              {/* Review Comment if rejected/accepted */}
              {selectedTask.reviewComment && (
                <div
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: selectedTask.status === 'REJECTED' ? 'var(--md-error-container)' : 'var(--md-primary-container)',
                    color: selectedTask.status === 'REJECTED' ? 'var(--md-on-error-container)' : 'var(--md-on-primary-container)',
                    fontSize: '0.8125rem',
                  }}
                >
                  <strong>Feedback from Reviewer:</strong> {selectedTask.reviewComment}
                </div>
              )}

              {/* WORKFLOW ACTION 1: Member Submit / Resubmit Deliverable (ONLY DESIGNATED ASSIGNEE CAN SUBMIT) */}
              {(selectedTask.status === 'TODO' || selectedTask.status === 'IN_PROGRESS' || selectedTask.status === 'REJECTED') && (
                (() => {
                  // Extract raw assignee name from strings like "Payal Rakshit (MEMBER)" or "Payal Rakshit"
                  const rawAssignee = (selectedTask.assignee || '')
                    .replace(/\s*\([^)]*\)/g, '')
                    .trim()
                    .toLowerCase();
                  const currentUserName = (user?.name || '').trim().toLowerCase();
                  const currentUserEmail = (user?.email || '').trim().toLowerCase();

                  const isAssignedToCurrentUser = Boolean(
                    user &&
                    rawAssignee.length > 0 &&
                    (
                      rawAssignee === currentUserName ||
                      currentUserName.includes(rawAssignee) ||
                      rawAssignee.includes(currentUserName) ||
                      (currentUserEmail && (selectedTask.assignee || '').toLowerCase().includes(currentUserEmail))
                    )
                  );

                  if (!isAssignedToCurrentUser) {
                    return (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          background: 'var(--bg-elevated)',
                          padding: '14px 16px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-muted)',
                          fontSize: '0.8125rem',
                        }}
                      >
                        <Icon name="lock" size={18} color="var(--text-subtle)" />
                        <span>
                          Only the designated assignee (<strong>{selectedTask.assignee}</strong>) can submit deliverables for this task.
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icon name="upload_file" size={18} color="var(--gdg-blue)" />
                        <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {selectedTask.status === 'REJECTED' ? 'Resubmit Work Deliverables' : 'Submit Completed Work'}
                        </h4>
                      </div>
                      <Input
                        label="Deliverable URL / Proof (GitHub PR, Figma, Drive)"
                        placeholder="https://github.com/my-repo/pull/1"
                        value={submissionLink}
                        onChange={(e) => setSubmissionLink(e.target.value)}
                        required
                      />
                      <Input
                        label="Deliverable Notes"
                        placeholder="Describe changes or notes for the lead reviewer..."
                        value={submissionNotes}
                        onChange={(e) => setSubmissionNotes(e.target.value)}
                      />
                      <Button
                        variant="primary"
                        onClick={handleMemberSubmit}
                        leftIcon={<Icon name="send" size={18} />}
                      >
                        Submit for Higher Member Review
                      </Button>
                    </div>
                  );
                })()
              )}

              {/* WORKFLOW ACTION 2: Higher Member Review (Accept or Reject with Comment) */}
              {selectedTask.status === 'SUBMITTED' && canManageTasks && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    background: 'var(--bg-elevated)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Lead / Higher Member Review
                  </h4>

                  {isRejecting ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <Input
                        label="Reason for Rejection / Revision Instructions"
                        placeholder="Explain what changes are needed before this can be approved..."
                        value={reviewCommentInput}
                        onChange={(e) => setReviewCommentInput(e.target.value)}
                        required
                      />
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <Button variant="secondary" size="sm" onClick={() => setIsRejecting(false)}>
                          Cancel
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRejectSubmission(reviewCommentInput)}
                        >
                          Confirm &amp; Request Resubmission
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <Button
                        variant="primary"
                        style={{ background: '#1e8e3e', borderColor: '#1e8e3e' }}
                        leftIcon={<Icon name="check_circle" size={18} />}
                        onClick={() => handleAcceptSubmission('Deliverables verified and accepted.')}
                      >
                        Accept Submission
                      </Button>
                      <Button
                        variant="danger"
                        leftIcon={<Icon name="cancel" size={18} />}
                        onClick={() => setIsRejecting(true)}
                      >
                        Reject &amp; Request Revision
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* WORKFLOW ACTION 3: Accepted Task -> Domain Senior / Lead / Developer marks as Finally DONE */}
              {selectedTask.status === 'ACCEPTED' && canManageTasks && (
                <div
                  style={{
                    background: 'var(--md-success-container)',
                    color: 'var(--md-on-success-container)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700 }}>
                      Submission Accepted &amp; Verified
                    </h4>
                    <span style={{ fontSize: '0.8125rem' }}>
                      As Domain Senior / Lead, you can now mark this deliverable as officially complete and done.
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    style={{ background: '#137333', borderColor: '#137333' }}
                    leftIcon={<Icon name="task_alt" size={18} />}
                    onClick={handleMarkAsDone}
                  >
                    Mark as Done (Final Completion)
                  </Button>
                </div>
              )}

              {/* Completed Status Summary */}
              {selectedTask.status === 'COMPLETED' && (
                <div
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    padding: '14px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    color: 'var(--gdg-green)',
                    fontWeight: 600,
                  }}
                >
                  <Icon name="verified" size={22} color="var(--gdg-green)" />
                  <span>This deliverable has been fully approved, accepted, and marked as DONE.</span>
                </div>
              )}
            </div>
          </Modal>
        )}
      </div>
    </DashboardShell>
  );
}
