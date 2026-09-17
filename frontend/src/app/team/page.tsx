'use client';

import React, { useEffect, useState } from 'react';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { UserPlus, Search } from 'lucide-react';
import { TeamMember, TeamService, MemberCard, AddMemberModal, CreateMemberDto } from '@/modules/team';

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    TeamService.getMembers().then(setMembers);
  }, []);

  const handleAddMember = async (dto: CreateMemberDto) => {
    const created = await TeamService.createMember(dto);
    setMembers((prev) => [...prev, created]);
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.domain.toLowerCase().includes(search.toLowerCase());
    const matchesDomain = domainFilter === 'ALL' || m.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  const domains = ['ALL', 'AI/ML', 'Cloud', 'Web', 'Android', 'Cybersecurity', 'Design'];

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>Team &amp; Organizers</h1>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '4px' }}>
              GDG on Campus core leadership team, domain leads, and community organizers.
            </p>
          </div>

          <Button
            variant="primary"
            leftIcon={<UserPlus size={18} />}
            onClick={() => setIsModalOpen(true)}
          >
            Add Team Member
          </Button>
        </div>

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            background: 'rgba(19, 27, 44, 0.6)',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {domains.map((dom) => {
              const isActive = domainFilter === dom;
              return (
                <button
                  key={dom}
                  onClick={() => setDomainFilter(dom)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: isActive ? '#34A853' : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? '#ffffff' : '#9ca3af',
                    border: 'none',
                  }}
                >
                  {dom === 'ALL' ? 'All Domains' : dom}
                </button>
              );
            })}
          </div>

          <div style={{ width: '280px' }}>
            <Input
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
        </div>

        {/* Members Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {filteredMembers.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>

        {/* Modal */}
        <AddMemberModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddMember}
        />
      </div>
    </DashboardShell>
  );
}
