'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Icon } from '@/shared/components/ui/icon';
import { useTeam } from '@/shared/hooks/useTeam';
import { AddMemberModal, EditMemberModal, CreateMemberDto, UpdateMemberDto, TeamMember } from '@/modules/team';

export default function AdminMembersPage() {
  const {
    filteredMembers,
    searchQuery,
    setSearch,
    createMember,
    updateMember,
    deleteMember,
  } = useTeam();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'DEVELOPER' | 'LEAD' | 'DOMAIN_SENIOR' | 'MEMBER'>('ALL');

  const handleAddMember = async (dto: CreateMemberDto) => {
    await createMember(dto);
  };

  const handleUpdateMember = async (id: string, dto: UpdateMemberDto) => {
    await updateMember(id, dto);
  };

  const handleDeleteMember = async (member: TeamMember) => {
    const confirmed = window.confirm(`Are you sure you want to delete member "${member.name}"?`);
    if (confirmed) {
      await deleteMember(member.id);
    }
  };

  const displayedMembers = filteredMembers.filter((m) => {
    if (roleFilter === 'ALL') return true;
    return m.role === roleFilter;
  });

  const devCount = filteredMembers.filter((m) => m.role === 'DEVELOPER').length;
  const leadCount = filteredMembers.filter((m) => m.role === 'LEAD').length;
  const seniorCount = filteredMembers.filter((m) => m.role === 'DOMAIN_SENIOR').length;
  const memberCount = filteredMembers.filter((m) => m.role === 'MEMBER').length;

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header & Search Toolbar */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
            <div style={{ width: '280px', maxWidth: '100%' }}>
              <Input
                placeholder="Search by name, GDG ID, role, domain..."
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Icon name="search" size={18} />}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Icon name="person_add" size={16} />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add Member
            </Button>
          </div>
        </div>

        {/* Hierarchy Tier Filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Roster', count: filteredMembers.length },
            { id: 'DEVELOPER', label: 'Developers', count: devCount },
            { id: 'LEAD', label: 'Leads', count: leadCount },
            { id: 'DOMAIN_SENIOR', label: 'Domain Seniors', count: seniorCount },
            { id: 'MEMBER', label: 'Members', count: memberCount },
          ].map((tab) => {
            const isActive = roleFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id as any)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: isActive ? 'var(--md-primary-container)' : 'var(--bg-card)',
                  color: isActive ? 'var(--md-on-primary-container)' : 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
                className="m3-interactive"
              >
                <span>{tab.label}</span>
                <Badge variant={isActive ? 'blue' : 'gray'} style={{ fontSize: '0.6875rem', padding: '0 6px' }}>
                  {tab.count}
                </Badge>
              </button>
            );
          })}
        </div>

        {/* Member Table / List for Admin Control */}
        <Card style={{ padding: '0px', overflow: 'hidden', borderRadius: 'var(--radius-xl)' }}>
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="group" size={20} color="var(--gdg-blue)" fill />
              <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main)' }}>
                Chapter Roster ({displayedMembers.length})
              </span>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Member</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>GDG ID</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Hierarchy Role</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Domain</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Email</th>
                  <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedMembers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px 20px', textAlign: 'center' }}>
                      <EmptyState
                        title="No Members Found"
                        description="No members found matching your search criteria in the database."
                        actionLabel="Add Member"
                        onAction={() => setIsAddModalOpen(true)}
                        icon="group"
                      />
                    </td>
                  </tr>
                ) : (
                  displayedMembers.map((member) => (
                    <tr
                      key={member.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: 'var(--radius-full)',
                              background:
                                member.role === 'DEVELOPER'
                                  ? 'linear-gradient(135deg, #a142f4 0%, #681da8 100%)'
                                  : member.role === 'LEAD'
                                  ? 'var(--md-warning-container)'
                                  : member.role === 'DOMAIN_SENIOR'
                                  ? 'var(--md-primary-container)'
                                  : 'var(--bg-elevated)',
                              color:
                                member.role === 'DEVELOPER'
                                  ? '#ffffff'
                                  : member.role === 'LEAD'
                                  ? 'var(--gdg-yellow)'
                                  : member.role === 'DOMAIN_SENIOR'
                                  ? 'var(--gdg-blue)'
                                  : 'var(--text-muted)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '0.875rem',
                            }}
                          >
                            {member.avatarUrl ? (
                              <img
                                src={member.avatarUrl}
                                alt={member.name}
                                style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
                              />
                            ) : (
                              member.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .substring(0, 2)
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{member.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {member.gdgId ? (
                          <Badge variant="blue" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            {member.gdgId}
                          </Badge>
                        ) : (
                          <span style={{ color: 'var(--text-subtle)', fontSize: '0.8125rem' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        {member.role === 'DEVELOPER' ? (
                          <Badge variant="purple" style={{ background: 'linear-gradient(135deg, #a142f4 0%, #681da8 100%)', color: '#fff', border: 'none' }}>
                            Developer
                          </Badge>
                        ) : member.role === 'LEAD' ? (
                          <Badge variant="yellow">
                            Lead{member.leadTitle ? ` (${member.leadTitle})` : ''}
                          </Badge>
                        ) : member.role === 'DOMAIN_SENIOR' ? (
                          <Badge variant="blue">Domain Senior</Badge>
                        ) : (
                          <Badge variant="gray">Member</Badge>
                        )}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <Badge variant="purple">{member.domain}</Badge>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                        {member.email || 'chapter@gdg.community'}
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Edit Member Details"
                            onClick={() => setEditingMember(member)}
                          >
                            <Icon name="edit" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Delete Member"
                            style={{ color: 'var(--gdg-red)' }}
                            onClick={() => handleDeleteMember(member)}
                          >
                            <Icon name="delete" size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Add Member Modal */}
        <AddMemberModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddMember}
        />

        {/* Edit Member Modal */}
        <EditMemberModal
          isOpen={!!editingMember}
          member={editingMember}
          onClose={() => setEditingMember(null)}
          onSubmit={handleUpdateMember}
        />
      </div>
    </DashboardShell>
  );
}
