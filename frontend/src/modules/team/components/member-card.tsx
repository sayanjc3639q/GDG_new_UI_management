import React from 'react';
import { TeamMember } from '../team.types';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Mail, Code2, Globe } from 'lucide-react';

interface MemberCardProps {
  member: TeamMember;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const getRoleBadge = (role: TeamMember['role']) => {
    switch (role) {
      case 'LEAD':
        return <Badge variant="blue">Chapter Lead</Badge>;
      case 'CO_LEAD':
        return <Badge variant="yellow">Co-Lead</Badge>;
      case 'ORGANIZER':
        return <Badge variant="green">Organizer</Badge>;
      default:
        return <Badge variant="gray">Member</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '14px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4285F4 0%, #34A853 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '1.25rem',
          boxShadow: '0 4px 16px rgba(66, 133, 244, 0.3)',
        }}
      >
        {getInitials(member.name)}
      </div>

      <div>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f9fafb', marginBottom: '4px' }}>
          {member.name}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          {getRoleBadge(member.role)}
          <Badge variant="purple">{member.domain}</Badge>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '4px',
          color: '#9ca3af',
        }}
      >
        <a
          href={`mailto:${member.email}`}
          title="Send Email"
          style={{
            padding: '8px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Mail size={16} />
        </a>
        <a
          href={member.github || 'https://github.com'}
          target="_blank"
          rel="noreferrer"
          title="GitHub Profile"
          style={{
            padding: '8px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Code2 size={16} />
        </a>
        <a
          href={member.linkedin || 'https://linkedin.com'}
          target="_blank"
          rel="noreferrer"
          title="Portfolio / LinkedIn"
          style={{
            padding: '8px',
            borderRadius: '6px',
            background: 'rgba(255, 255, 255, 0.04)',
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Globe size={16} />
        </a>
      </div>
    </Card>
  );
};
