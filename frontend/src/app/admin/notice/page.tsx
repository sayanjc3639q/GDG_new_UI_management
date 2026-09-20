'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Icon } from '@/shared/components/ui/icon';

interface NoticeItem {
  id: string;
  title: string;
  body: string;
  category: 'ANNOUNCEMENT' | 'URGENT' | 'UPDATE';
  timestamp: string;
  author: string;
}

export default function AdminNoticePage() {
  const [notices, setNotices] = useState<NoticeItem[]>([
    {
      id: 'n-1',
      title: 'Monthly Chapter All-Hands Sync',
      body: 'All team leads please update your sprint boards before Friday 6 PM.',
      category: 'ANNOUNCEMENT',
      timestamp: 'Today at 2:30 PM',
      author: 'Lead Admin',
    },
    {
      id: 'n-2',
      title: 'Submission Deadline for DevFest CFP',
      body: 'Call for speakers is closing this weekend. Reach out to speakers in your network.',
      category: 'URGENT',
      timestamp: 'Yesterday at 11:00 AM',
      author: 'Organizer',
    },
  ]);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<'ANNOUNCEMENT' | 'URGENT' | 'UPDATE'>('ANNOUNCEMENT');
  const [isSent, setIsSent] = useState(false);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    const newNotice: NoticeItem = {
      id: `notice-${Date.now()}`,
      title,
      body,
      category,
      timestamp: 'Just now',
      author: 'Lead Admin',
    };

    setNotices([newNotice, ...notices]);
    setIsSent(true);
    setTitle('');
    setBody('');
    setTimeout(() => setIsSent(false), 3000);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'URGENT':
        return <Badge variant="red">Urgent</Badge>;
      case 'UPDATE':
        return <Badge variant="green">Update</Badge>;
      case 'ANNOUNCEMENT':
      default:
        return <Badge variant="blue">Announcement</Badge>;
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
              Broadcast Chapter Notices &amp; Announcements
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Broadcaster Form */}
          <Card style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Icon name="campaign" size={22} color="#f97316" fill />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Create New Broadcast
              </h3>
            </div>

            {isSent && (
              <div
                style={{
                  padding: '12px 16px',
                  background: 'var(--md-success-container)',
                  color: 'var(--gdg-green)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '16px',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Icon name="check_circle" size={18} />
                <span>Notice broadcast successfully to all members!</span>
              </div>
            )}

            <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label="Notice Title"
                placeholder="e.g. Schedule Change for DevFest Planning"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-main)' }}>Priority / Tag</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
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
                  <option value="ANNOUNCEMENT">Announcement</option>
                  <option value="URGENT">Urgent Broadcast</option>
                  <option value="UPDATE">General Update</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-main)' }}>Notice Content</label>
                <textarea
                  rows={4}
                  placeholder="Write message details for the chapter..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-elevated)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              <Button
                variant="primary"
                type="submit"
                leftIcon={<Icon name="send" size={16} />}
              >
                Broadcast Notice
              </Button>
            </form>
          </Card>

          {/* Broadcast History */}
          <Card style={{ padding: '24px', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '16px' }}>
              Broadcast History ({notices.length})
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {notices.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                      {n.title}
                    </span>
                    {getCategoryBadge(n.category)}
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '4px 0 10px 0' }}>
                    {n.body}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                    Posted by {n.author} • {n.timestamp}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
