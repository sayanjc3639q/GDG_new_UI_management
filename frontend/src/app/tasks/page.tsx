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
  CheckSquare,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock,
  User,
} from 'lucide-react';
import { TasksService, Task } from '@/modules/tasks/tasks.service';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState('Chapter Lead');
  const [newDomain, setNewDomain] = useState('AI/ML');
  const [newPriority, setNewPriority] = useState<Task['priority']>('MEDIUM');
  const [newDueDate, setNewDueDate] = useState('2026-09-22');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const data = await TasksService.getTasks();
      setTasks(data);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskStatus = async (id: string, currentStatus: Task['status']) => {
    const nextStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    try {
      const updated = await TasksService.updateTask(id, { status: nextStatus });
      setTasks(tasks.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      console.error('Failed to toggle task status:', err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    try {
      const created = await TasksService.createTask({
        title: newTitle,
        description: newDesc,
        assignee: newAssignee,
        domain: newDomain,
        priority: newPriority,
        dueDate: newDueDate,
      });

      setTasks([created, ...tasks]);
      setNewTitle('');
      setNewDesc('');
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesFilter = filter === 'ALL' || t.status === filter;
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.assignee.toLowerCase().includes(search.toLowerCase()) ||
      t.domain.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

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

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>Task Management</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '4px' }}>
              Assign, organize, and monitor GDG organizing committee action items.
            </p>
          </div>

          <Button
            variant="primary"
            leftIcon={<Plus size={16} />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Create Task
          </Button>
        </div>

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            padding: '12px 16px',
          }}
        >
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {(['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'] as const).map((tab) => {
              const isActive = filter === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    background: isActive ? 'var(--gdg-blue)' : 'var(--bg-elevated)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {tab.replace('_', ' ')}
                </button>
              );
            })}
          </div>

          <div style={{ width: '260px' }}>
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={15} />}
            />
          </div>
        </div>

        {/* Tasks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredTasks.length === 0 ? (
            <EmptyState
              title="No Tasks Available"
              description="Nothing to see here yet. Create your first task to assign action items to organizers."
              actionLabel="Create Task"
              onAction={() => setIsAddModalOpen(true)}
              icon={<CheckSquare size={20} />}
            />
          ) : (
            filteredTasks.map((t) => {
              const isDone = t.status === 'COMPLETED';
              return (
                <Card
                  key={t.id}
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    opacity: isDone ? 0.7 : 1,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                    <button
                      onClick={() => toggleTaskStatus(t.id, t.status)}
                      style={{ color: isDone ? 'var(--gdg-green)' : 'var(--text-subtle)' }}
                    >
                      {isDone ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>

                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          color: 'var(--text-main)',
                          textDecoration: isDone ? 'line-through' : 'none',
                        }}
                      >
                        {t.title}
                      </div>
                      {t.description && (
                        <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {t.description}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <Badge variant="purple">{t.domain}</Badge>
                    {getPriorityBadge(t.priority)}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <User size={13} />
                      <span>{t.assignee}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                      <Clock size={13} />
                      <span>{t.dueDate}</span>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Modal */}
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Create Team Task">
          <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input
              label="Task Title"
              placeholder="e.g. Prepare Speaker Deck"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                Description
              </label>
              <textarea
                placeholder="Action steps and notes..."
                rows={3}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Input
                label="Assignee"
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                required
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Domain
                </label>
                <select
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
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
                  <option value="AI/ML">AI/ML</option>
                  <option value="Cloud">Google Cloud</option>
                  <option value="Web">Web</option>
                  <option value="Android">Android</option>
                  <option value="Design">Design</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as Task['priority'])}
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
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>
              </div>

              <Input
                label="Due Date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Task
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardShell>
  );
}
