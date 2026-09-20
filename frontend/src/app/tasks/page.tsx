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
import { useTasks } from '@/shared/hooks/useTasks';
import { Task } from '@/modules/tasks/tasks.service';

export default function TasksPage() {
  const {
    filteredTasks,
    filter,
    searchQuery,
    setFilter,
    setSearch,
    createTask,
    toggleTaskStatus,
    updateTaskStatus,
  } = useTasks();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [newAssigneeRole, setNewAssigneeRole] = useState('Member');
  const [newDomain, setNewDomain] = useState('AI/ML');
  const [newPriority, setNewPriority] = useState<Task['priority']>('MEDIUM');
  const [newDueDate, setNewDueDate] = useState('2026-09-25');

  const handleUpdateStatus = async (id: string, newStatus: Task['status']) => {
    try {
      const updated = await updateTaskStatus(id, newStatus);
      if (selectedTask && selectedTask.id === id) {
        setSelectedTask(updated);
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newAssignee) return;

    try {
      await createTask({
        title: newTitle,
        description: newDesc,
        assignee: `${newAssignee} (${newAssigneeRole})`,
        domain: newDomain,
        priority: newPriority,
        dueDate: newDueDate,
      });

      setNewTitle('');
      setNewDesc('');
      setNewAssignee('');
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleCompleteSubmission = async () => {
    if (!selectedTask) return;
    try {
      const descAppend = submissionNotes || submissionLink
        ? `${selectedTask.description || ''}\n\n[Submission Note: ${submissionNotes} ${submissionLink ? `| Link: ${submissionLink}` : ''}]`
        : selectedTask.description;

      await updateTaskStatus(selectedTask.id, 'COMPLETED');
      setSelectedTask(null);
      setSubmissionNotes('');
      setSubmissionLink('');
    } catch (err) {
      console.error('Failed to submit task:', err);
    }
  };

  const getPriorityBadge = (p: Task['priority']) => {
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

  const getStatusBadge = (s: Task['status']) => {
    switch (s) {
      case 'COMPLETED':
        return <Badge variant="green">Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="blue">In Progress</Badge>;
      case 'TODO':
      default:
        return <Badge variant="gray">To Do</Badge>;
    }
  };

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Filters, Search and Assign Task Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            padding: '12px 16px',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            {(['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'] as const).map((tab) => {
              const isActive = filter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  style={{
                    padding: '6px 16px',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    borderRadius: 'var(--radius-full)',
                    background: isActive ? 'var(--md-primary-container)' : 'var(--bg-elevated)',
                    color: isActive ? 'var(--md-on-primary-container)' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  className="m3-interactive"
                >
                  {tab.replace('_', ' ')}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ width: '260px' }}>
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Icon name="search" size={18} />}
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Icon name="add_task" size={16} />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Assign Task
            </Button>
          </div>
        </div>

        {/* Tasks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredTasks.length === 0 ? (
            <EmptyState
              title="No Tasks Found"
              description="There are no tasks matching your selected filter. Assign a new task above."
              actionLabel="Assign Task"
              onAction={() => setIsAddModalOpen(true)}
              icon="checklist"
            />
          ) : (
            filteredTasks.map((t) => {
              const isDone = t.status === 'COMPLETED';
              return (
                <Card
                  key={t.id}
                  style={{
                    padding: '18px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    borderRadius: 'var(--radius-lg)',
                    opacity: isDone ? 0.75 : 1,
                  }}
                  className="m3-interactive"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
                    <button
                      onClick={() => toggleTaskStatus(t.id, t.status)}
                      style={{
                        color: isDone ? 'var(--gdg-green)' : 'var(--text-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                      title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                    >
                      <Icon
                        name={isDone ? 'check_circle' : 'radio_button_unchecked'}
                        size={22}
                        fill={isDone}
                      />
                    </button>

                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '0.9375rem',
                          color: 'var(--text-main)',
                          textDecoration: isDone ? 'line-through' : 'none',
                        }}
                      >
                        {t.title}
                      </div>
                      {t.description && (
                        <div
                          style={{
                            fontSize: '0.8125rem',
                            color: 'var(--text-muted)',
                            marginTop: '2px',
                            maxWidth: '650px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {t.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <Badge variant="purple">{t.domain}</Badge>
                    {getPriorityBadge(t.priority)}
                    {getStatusBadge(t.status)}

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.8125rem',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <Icon name="person" size={16} color="var(--text-subtle)" />
                      <span>{t.assignee}</span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.8125rem',
                        color: 'var(--text-subtle)',
                      }}
                    >
                      <Icon name="schedule" size={16} />
                      <span>{t.dueDate}</span>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedTask(t)}
                      style={{ padding: '4px 12px', fontSize: '0.75rem', height: '30px' }}
                    >
                      View &amp; Submit
                    </Button>
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
          title="Assign New Task"
          icon="add_task"
        >
          <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Task Title"
              placeholder="e.g. Prepare Speaker Slide Deck for DevFest"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                Task Details &amp; Requirements
              </label>
              <textarea
                placeholder="Specify the steps, deliverables, or resources needed..."
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
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

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <Input
                label="Assignee Name"
                placeholder="e.g. Rahul Sharma"
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                required
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  Assignee Role
                </label>
                <select
                  value={newAssigneeRole}
                  onChange={(e) => setNewAssigneeRole(e.target.value)}
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
                  <option value="Domain Senior">Domain Senior</option>
                  <option value="Member">Member</option>
                  <option value="Co-Lead">Co-Lead</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  Domain
                </label>
                <select
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
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
                  <option value="AI/ML">AI / Machine Learning</option>
                  <option value="Cloud">Google Cloud</option>
                  <option value="Web">Web Technologies</option>
                  <option value="Android">Android / Flutter</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Design">UI/UX &amp; Design</option>
                  <option value="Management">Management &amp; Operations</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Task['priority'])}
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
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>
            </div>

            <Input
              label="Due Date"
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              required
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Assign Task
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: View & Submit Task Work */}
        {selectedTask && (
          <Modal
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            title={selectedTask.title}
            icon="assignment"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <Badge variant="purple">{selectedTask.domain}</Badge>
                {getPriorityBadge(selectedTask.priority)}
                {getStatusBadge(selectedTask.status)}
              </div>

              <div>
                <h4 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Task Description
                </h4>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-main)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {selectedTask.description || 'No description provided.'}
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  background: 'var(--bg-elevated)',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned To</span>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '2px' }}>
                    👤 {selectedTask.assignee}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Due Date</span>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)', marginTop: '2px' }}>
                    ⏰ {selectedTask.dueDate}
                  </div>
                </div>
              </div>

              {/* Status Update Quick Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  Update Status
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['TODO', 'IN_PROGRESS', 'COMPLETED'] as const).map((s) => (
                    <Button
                      key={s}
                      type="button"
                      variant={selectedTask.status === s ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedTask.id, s)}
                    >
                      {s.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Submit Work Section */}
              {selectedTask.status !== 'COMPLETED' && (
                <div
                  style={{
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Submit Completed Work
                  </h4>
                  <textarea
                    placeholder="Provide notes or details on how this task was completed..."
                    rows={2}
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '8px 12px',
                      color: 'var(--text-main)',
                      fontSize: '0.875rem',
                      fontFamily: 'var(--font-main)',
                      outline: 'none',
                    }}
                  />
                  <Input
                    placeholder="Deliverable URL (GitHub PR / Drive Link / Figma URL)..."
                    value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <Button variant="secondary" onClick={() => setSelectedTask(null)}>
                  Close
                </Button>
                {selectedTask.status !== 'COMPLETED' && (
                  <Button variant="primary" onClick={handleCompleteSubmission}>
                    Submit as Completed
                  </Button>
                )}
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardShell>
  );
}
