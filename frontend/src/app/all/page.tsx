'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Modal } from '@/shared/components/ui/modal';
import { Input } from '@/shared/components/ui/input';
import { Icon } from '@/shared/components/ui/icon';

import { GoogleSpotlightCard } from '@/shared/components/ui/google-spotlight-card';

interface FeatureBlock {
  id: string;
  title: string;
  description: string;
  iconName: string;
  iconColor: string;
  bgTint: string;
  href?: string;
  actionType?: 'MODAL_REPOSITORY' | 'MODAL_FORMS' | 'MODAL_SOCIAL' | 'MODAL_WORK_REPORT' | 'MODAL_NOTICE';
}

export default function AllFeaturesPage() {
  const [activeModal, setActiveModal] = useState<'REPOSITORY' | 'FORMS' | 'SOCIAL' | 'WORK_REPORT' | 'NOTICE' | null>(null);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeBody, setNoticeBody] = useState('');
  const [noticeSent, setNoticeSent] = useState(false);

  const featureBlocks: FeatureBlock[] = [
    {
      id: 'repository',
      title: 'Repository',
      description: 'GitHub codebase, open-source project tracks, and code reviews.',
      iconName: 'code',
      iconColor: '#3b82f6',
      bgTint: 'rgba(59, 130, 246, 0.12)',
      actionType: 'MODAL_REPOSITORY',
    },
    {
      id: 'forms',
      title: 'Forms',
      description: 'Member intake, workshop registrations, feedback and surveys.',
      iconName: 'dynamic_form',
      iconColor: '#10b981',
      bgTint: 'rgba(16, 185, 129, 0.12)',
      actionType: 'MODAL_FORMS',
    },
    {
      id: 'social',
      title: 'Social Media Contents',
      description: 'Promotional posters, event captions, brand kit, and media assets.',
      iconName: 'share',
      iconColor: '#ec4899',
      bgTint: 'rgba(236, 72, 153, 0.12)',
      actionType: 'MODAL_SOCIAL',
    },
    {
      id: 'members',
      title: 'Members',
      description: 'Manage chapter member roster, domain seniors, and roles.',
      iconName: 'group',
      iconColor: 'var(--gdg-blue)',
      bgTint: 'var(--md-primary-container)',
      href: '/team',
    },
    {
      id: 'applications',
      title: 'Applications',
      description: 'Review, approve, and track absence and leave applications.',
      iconName: 'assignment',
      iconColor: 'var(--gdg-red)',
      bgTint: 'var(--md-error-container)',
      href: '/leave',
    },
    {
      id: 'meetings',
      title: 'Meetings',
      description: 'Schedule and manage Google Meet syncs and tracks.',
      iconName: 'videocam',
      iconColor: 'var(--gdg-yellow)',
      bgTint: 'var(--md-warning-container)',
      href: '/meetings',
    },
    {
      id: 'tasks',
      title: 'Tasks',
      description: 'Assign deliverables, monitor progress, and review submissions.',
      iconName: 'check_circle',
      iconColor: 'var(--gdg-green)',
      bgTint: 'var(--md-success-container)',
      href: '/tasks',
    },
    {
      id: 'work-report',
      title: 'Work Report',
      description: 'Chapter deliverables overview and completion metrics.',
      iconName: 'assessment',
      iconColor: '#a855f7',
      bgTint: 'rgba(168, 85, 247, 0.12)',
      actionType: 'MODAL_WORK_REPORT',
    },
    {
      id: 'notice',
      title: 'Notice',
      description: 'Broadcast chapter notices and announcements to all members.',
      iconName: 'campaign',
      iconColor: '#f97316',
      bgTint: 'rgba(249, 115, 22, 0.12)',
      actionType: 'MODAL_NOTICE',
    },
    {
      id: 'events',
      title: 'Events',
      description: 'Plan, publish, and monitor workshops, hackathons, and study jams.',
      iconName: 'event',
      iconColor: 'var(--gdg-blue)',
      bgTint: 'var(--md-primary-container)',
      href: '/events',
    },
    {
      id: 'calendar',
      title: 'Calendar',
      description: 'Chapter activity timelines, deadlines, and milestone schedules.',
      iconName: 'calendar_month',
      iconColor: 'var(--gdg-blue)',
      bgTint: 'var(--md-primary-container)',
      href: '/calendar',
    },
  ];

  const handleBroadcastNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle) return;
    setNoticeSent(true);
    setTimeout(() => {
      setNoticeSent(false);
      setNoticeTitle('');
      setNoticeBody('');
      setActiveModal(null);
    }, 1500);
  };

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* All Features Grid with identical UI to /admin */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {featureBlocks.map((block) => {
            const content = (
              <GoogleSpotlightCard
                key={block.id}
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  borderRadius: 'var(--radius-xl)',
                  height: '100%',
                }}
                onClick={() => {
                  if (block.actionType === 'MODAL_REPOSITORY') setActiveModal('REPOSITORY');
                  else if (block.actionType === 'MODAL_FORMS') setActiveModal('FORMS');
                  else if (block.actionType === 'MODAL_SOCIAL') setActiveModal('SOCIAL');
                  else if (block.actionType === 'MODAL_WORK_REPORT') setActiveModal('WORK_REPORT');
                  else if (block.actionType === 'MODAL_NOTICE') setActiveModal('NOTICE');
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-lg)',
                      background: block.bgTint,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: block.iconColor,
                    }}
                  >
                    <Icon name={block.iconName} size={26} fill />
                  </div>
                  <Icon name="arrow_forward" size={18} color="var(--text-subtle)" />
                </div>

                <div>
                  <h3
                    style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      marginBottom: '6px',
                    }}
                  >
                    {block.title}
                  </h3>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.5,
                      margin: 0,
                    }}
                  >
                    {block.description}
                  </p>
                </div>
              </GoogleSpotlightCard>
            );

            if (block.href) {
              return (
                <Link key={block.id} href={block.href} style={{ textDecoration: 'none' }}>
                  {content}
                </Link>
              );
            }

            return <div key={block.id}>{content}</div>;
          })}
        </div>

        {/* Modal: Repository */}
        {activeModal === 'REPOSITORY' && (
          <Modal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            title="Chapter Repositories"
            icon="code"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Official GitHub repositories, open-source projects, and chapter codebase tracks.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a
                  href="https://github.com/sayanjc3639q/GDG_new_UI_management"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    padding: '14px 16px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: 'var(--text-main)',
                  }}
                  className="m3-interactive"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon name="terminal" size={20} color="var(--gdg-blue)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>GDG_new_UI_management</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Main Next.js + NestJS chapter operational hub</div>
                    </div>
                  </div>
                  <Icon name="open_in_new" size={16} color="var(--text-subtle)" />
                </a>

                <div
                  style={{
                    padding: '14px 16px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Icon name="folder" size={20} color="var(--gdg-green)" />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>gdg-campus-hit-projects</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Workshops starter kits &amp; hackathon templates</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--gdg-green)', fontWeight: 600 }}>Active</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <Button variant="primary" onClick={() => setActiveModal(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Modal: Forms */}
        {activeModal === 'FORMS' && (
          <Modal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            title="Chapter Forms & Surveys"
            icon="dynamic_form"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Active Google Forms, attendee registration sheets, and chapter intake surveys.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { name: 'Fall 2026 Core Team Recruitment Form', responses: '142 responses', status: 'Active' },
                  { name: 'Cloud & AI Study Jam RSVP Form', responses: '210 responses', status: 'Active' },
                  { name: 'Speaker Callout & Workshop Proposal', responses: '18 submissions', status: 'Reviewing' },
                ].map((form, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '14px 16px',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>{form.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{form.responses}</div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--gdg-blue)', fontWeight: 600 }}>{form.status}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <Button variant="primary" onClick={() => setActiveModal(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Modal: Social Media Contents */}
        {activeModal === 'SOCIAL' && (
          <Modal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            title="Social Media & Brand Kit"
            icon="share"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Promotional creative assets, Instagram story templates, LinkedIn posts, and chapter brand kit.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    padding: '16px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <Icon name="palette" size={22} color="#ec4899" />
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>Brand Assets</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official GDG Logos, Google Sans Fonts &amp; Color Palettes</span>
                </div>

                <div
                  style={{
                    padding: '16px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <Icon name="photo_camera" size={22} color="#f97316" />
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-main)' }}>Event Posters</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Figma templates &amp; Canva social post designs</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <Button variant="primary" onClick={() => setActiveModal(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Modal: Work Report */}
        {activeModal === 'WORK_REPORT' && (
          <Modal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            title="Chapter Work Report"
            icon="assessment"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Current sprint deliverables and completion rates across all GDG chapter tracks.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  background: 'var(--bg-elevated)',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tasks Completion</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gdg-green)', marginTop: '2px' }}>
                    85.7% (12/14)
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Syncs</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gdg-blue)', marginTop: '2px' }}>
                    8 Scheduled
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Domain Output Summary:
                </span>
                <ul style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', paddingLeft: '20px', lineHeight: 1.6 }}>
                  <li>AI/ML: 4 tasks finished • 1 standup concluded</li>
                  <li>Web &amp; Cloud: Next.js 15 sprint on schedule</li>
                  <li>Design: UI component audit completed</li>
                  <li>Android: Workshop materials ready</li>
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <Button variant="primary" onClick={() => setActiveModal(null)}>
                  Done
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Modal: Broadcast Notice */}
        {activeModal === 'NOTICE' && (
          <Modal
            isOpen={true}
            onClose={() => setActiveModal(null)}
            title="Broadcast Chapter Notice"
            icon="campaign"
          >
            <form onSubmit={handleBroadcastNotice} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label="Notice Headline"
                placeholder="e.g. All-Hands Chapter Sync this Friday at 6 PM"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                required
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>
                  Notice Content
                </label>
                <textarea
                  placeholder="Type the announcement details for chapter leads and members..."
                  rows={4}
                  value={noticeBody}
                  onChange={(e) => setNoticeBody(e.target.value)}
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

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                {noticeSent && (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--md-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Icon name="check_circle" size={16} fill /> Notice Broadcasted!
                  </span>
                )}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                  <Button type="button" variant="secondary" onClick={() => setActiveModal(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Send Notice
                  </Button>
                </div>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardShell>
  );
}
