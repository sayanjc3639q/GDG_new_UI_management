'use client';

import React, { useState } from 'react';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Icon } from '@/shared/components/ui/icon';
import { useTeam } from '@/shared/hooks/useTeam';
import { MemberCard, AddMemberModal, CreateMemberDto } from '@/modules/team';

export default function TeamPage() {
  const {
    filteredMembers,
    selectedDomain,
    searchQuery,
    setDomain,
    setSearch,
    createMember,
  } = useTeam();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddMember = async (dto: CreateMemberDto) => {
    await createMember(dto);
  };

  const domains = ['ALL', 'AI/ML', 'Cloud', 'Web', 'Android', 'Cybersecurity', 'Design'];

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Search Toolbar with Add Member Action */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            background: 'var(--bg-card)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ width: '280px', maxWidth: '100%' }}>
            <Input
              placeholder="Search members by name, role, email..."
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Icon name="search" size={18} />}
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Icon name="person_add" size={16} />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Member
          </Button>
        </div>


        {/* Members Grid */}
        {filteredMembers.length === 0 ? (
          <EmptyState
            title="No Team Members Found"
            description="No chapter members match your current query. Add members using the button above."
            actionLabel="Add Member"
            onAction={() => setIsModalOpen(true)}
            icon="group"
          />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {filteredMembers.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}

        {/* Add Member Modal */}
        <AddMemberModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddMember}
        />
      </div>
    </DashboardShell>
  );
}
