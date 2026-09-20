'use client';

import React, { useState } from 'react';
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

export default function AdminTasksPage() {
  const { tasks, createTask, toggleTaskStatus } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [domain, setDomain] = useState('Web');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('2026-09-30');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    await createTask({
      title,
      description,
      domain,
      assignee: assignee || 'Unassigned',
      dueDate,
      priority,
    });
    setTitle('');
    setDescription('');
    setAssignee('');
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
              Task Deliverables &amp; Submissions
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Icon name="add_task" size={18} />}
            onClick={() => setIsModalOpen(true)}
          >
            Assign Task
          </Button>
        </div>

        {/* Tasks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.length === 0 ? (
            <EmptyState
              title="No Tasks Assigned"
              description="There are currently no tasks in the database. Assign a new deliverable using the button above."
              actionLabel="Assign Task"
              onAction={() => setIsModalOpen(true)}
              icon="checklist"
            />
          ) : (
            tasks.map((task) => (
            <Card
              key={task.id}
              style={{
                padding: '20px 24px',
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    <span>Assignee: <strong>{task.assignee}</strong></span>
                    <span>•</span>
                    <span>Due: {task.dueDate}</span>
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
              </div>
            </Card>
          ))
        )}
      </div>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Assign New Task Deliverable"
          icon="add_task"
        >
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Task Title"
              placeholder="e.g. Build RSVP Scanner UI component"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Assignee"
                placeholder="e.g. Jane Smith"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                required
              />
              <Input
                label="Domain"
                placeholder="e.g. Web / Cloud / AI"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-main)' }}>Priority</label>
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
                  }}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
            </div>
            <Input
              label="Description"
              placeholder="Deliverable details and scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
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
