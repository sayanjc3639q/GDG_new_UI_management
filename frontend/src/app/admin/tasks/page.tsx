'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
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
import { CHAPTER_DOMAINS } from '@/app/tasks/page';

export default function AdminTasksPage() {
  const { user } = useAuth();
  const { members } = useTeam();
  const { tasks, createTask, toggleTaskStatus, deleteTask } = useTasks();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState<string>(CHAPTER_DOMAINS[0]);
  const [assigneeMode, setAssigneeMode] = useState<'member' | 'custom'>('member');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [assignee, setAssignee] = useState('');
  const [assigneeRole, setAssigneeRole] = useState('MEMBER');
  const [dueDate, setDueDate] = useState('2026-09-30');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

  // Filter tasks by domain and search
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesDomain =
        selectedDomainFilter === 'ALL' || t.domain === selectedDomainFilter;
      const matchesSearch =
        searchQuery === '' ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.assignedBy && t.assignedBy.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesDomain && matchesSearch;
    });
  }, [tasks, selectedDomainFilter, searchQuery]);

  // Members filtered by selected domain
  const domainFilteredMembers = useMemo(() => {
    return members.filter((m) => !domain || m.domain === domain);
  }, [members, domain]);

  const handleSelectMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    if (!memberId) {
      setAssignee('');
      return;
    }
    const found = members.find((m) => m.id === memberId);
    if (found) {
      setAssignee(found.name);
      setAssigneeRole(found.leadTitle || found.role);
      if (found.domain && CHAPTER_DOMAINS.includes(found.domain as any)) {
        setDomain(found.domain);
      }
    }
  };

  const handleAssignToSelf = () => {
    if (!user) return;
    setAssigneeMode('custom');
    setAssignee(user.name);
    setAssigneeRole(user.leadTitle || user.role);
    if (user.domain && CHAPTER_DOMAINS.includes(user.domain as any)) {
      setDomain(user.domain);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !assignee) return;

    const assignerInfo = user
      ? `${user.name} (${user.leadTitle || user.role})`
      : 'Lead Admin (Organizer)';

    await createTask({
      title,
      description,
      domain,
      assignee: `${assignee} (${assigneeRole})`,
      assignedBy: assignerInfo,
      dueDate,
      priority,
    });

    setTitle('');
    setDescription('');
    setAssignee('');
    setSelectedMemberId('');
    setIsModalOpen(false);
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'HIGH':
        return <Badge variant="red">High</Badge>;
      case 'MEDIUM':
        return <Badge variant="yellow">Medium</Badge>;
      case 'LOW':
      default:
        return <Badge variant="blue">Low</Badge>;
    }
  };

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            background: 'var(--bg-card)',
            padding: '14px 20px',
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
              Task Deliverables &amp; Control
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Domain Filter */}
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
              }}
            >
              <option value="ALL">All Domains (8)</option>
              {CHAPTER_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <div style={{ width: '200px' }}>
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Icon name="search" size={16} />}
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Icon name="add_task" size={16} />}
              onClick={() => setIsModalOpen(true)}
            >
              Assign Deliverable
            </Button>
          </div>
        </div>

        {/* Tasks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTasks.length === 0 ? (
            <EmptyState
              title="No Tasks Assigned"
              description="There are currently no tasks matching your filters. Assign a new deliverable using the button above."
              actionLabel="Assign Task"
              onAction={() => setIsModalOpen(true)}
              icon="checklist"
            />
          ) : (
            filteredTasks.map((task) => (
              <Card
                key={task.id}
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  borderRadius: 'var(--radius-xl)',
                }}
                className="m3-interactive"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button
                    onClick={() => toggleTaskStatus(task.id, task.status)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: task.status === 'COMPLETED' ? 'var(--gdg-green)' : 'var(--text-subtle)',
                    }}
                    title="Toggle status"
                  >
                    <Icon
                      name={task.status === 'COMPLETED' ? 'check_circle' : 'radio_button_unchecked'}
                      size={24}
                      fill={task.status === 'COMPLETED'}
                    />
                  </button>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: '1rem',
                          color: task.status === 'COMPLETED' ? 'var(--text-muted)' : 'var(--text-main)',
                          textDecoration: task.status === 'COMPLETED' ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </span>
                      <Badge variant="blue">{task.domain}</Badge>
                      {getPriorityBadge(task.priority)}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '0.8125rem',
                        color: 'var(--text-muted)',
                        flexWrap: 'wrap',
                      }}
                    >
                      <span>
                        Assignee: <strong>{task.assignee}</strong>
                      </span>
                      {task.assignedBy && (
                        <span>
                          &bull; By: <strong style={{ color: 'var(--gdg-blue)' }}>{task.assignedBy}</strong>
                        </span>
                      )}
                      <span>&bull; Due: {task.dueDate}</span>
                    </div>
                    {task.description && (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {task.description}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleTaskStatus(task.id, task.status)}
                  >
                    {task.status === 'COMPLETED' ? 'Mark Incomplete' : 'Mark Completed'}
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<Icon name="delete" size={16} />}
                    onClick={async () => {
                      if (window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
                        await deleteTask(task.id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Modal: Assign Task */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Assign New Task Deliverable"
          icon="add_task"
        >
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Assigner Info */}
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            {/* Domain & Priority */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-main)' }}>
                  Domain (8 Domains)
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  style={{
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.875rem',
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
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-main)' }}>
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  style={{
                    height: '42px',
                    padding: '0 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.875rem',
                    outline: 'none',
                  }}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>

            {/* Member Assignee Selector */}
            <div
              style={{
                background: 'var(--bg-sidebar)',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Assignee (From Member List)
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
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
                    + Assign to Myself
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
                    {assigneeMode === 'member' ? 'Custom Assignee' : 'Select from Roster'}
                  </button>
                </div>
              </div>

              {assigneeMode === 'member' ? (
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
                    <option value="">-- Choose Member from {domain} or All --</option>
                    {domainFilteredMembers.length > 0 && (
                      <optgroup label={`${domain} Members (${domainFilteredMembers.length})`}>
                        {domainFilteredMembers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} &bull; {m.role} {m.leadTitle ? `(${m.leadTitle})` : ''} - {m.domain}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label="All Chapter Members">
                      {members.map((m) => (
                        <option key={`admin-all-${m.id}`} value={m.id}>
                          {m.name} &bull; {m.role} - {m.domain || 'General'}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                  <Input
                    label="Assignee Name"
                    placeholder="e.g. Rahul Sharma"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    required
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                      Assignee Role
                    </label>
                    <select
                      value={assigneeRole}
                      onChange={(e) => setAssigneeRole(e.target.value)}
                      style={{
                        width: '100%',
                        height: '42px',
                        background: 'var(--bg-input)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0 10px',
                        color: 'var(--text-main)',
                        fontSize: '0.875rem',
                        outline: 'none',
                      }}
                    >
                      <option value="MEMBER">Member</option>
                      <option value="DOMAIN_SENIOR">Domain Senior</option>
                      <option value="LEAD">Lead</option>
                      <option value="DEVELOPER">Developer (Superadmin)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
              <Input
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>

            <Input
              label="Description"
              placeholder="Deliverable details and scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
              <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Assign Deliverable
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
