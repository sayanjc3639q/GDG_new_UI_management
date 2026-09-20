import React from 'react';
import { TeamMember } from '../team.types';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Icon } from '@/shared/components/ui/icon';

interface MemberCardProps {
  member: TeamMember;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  const getRoleBadge = (role: TeamMember['role'], leadTitle?: TeamMember['leadTitle']) => {
    switch (role) {
      case 'LEAD':
        return (
          <Badge variant="yellow">
            Lead{leadTitle ? ` • ${leadTitle}` : ''}
          </Badge>
        );
      case 'DOMAIN_SENIOR':
        return <Badge variant="blue">Domain Senior</Badge>;
      case 'MEMBER':
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
        gap: '16px',
        padding: '24px',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      className="m3-interactive"
    >
      <div
        style={{
          width: '68px',
          height: '68px',
          borderRadius: 'var(--radius-full)',
          background:
            member.role === 'LEAD'
              ? 'linear-gradient(135deg, var(--gdg-yellow) 0%, #ea8600 100%)'
              : member.role === 'DOMAIN_SENIOR'
              ? 'linear-gradient(135deg, var(--gdg-blue) 0%, #174ea6 100%)'
              : 'linear-gradient(135deg, #5f6368 0%, #3c4043 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '1.25rem',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {member.avatarUrl ? (
          <img
            src={member.avatarUrl}
            alt={member.name}
            style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-full)', objectFit: 'cover' }}
          />
        ) : (
          getInitials(member.name)
        )}
      </div>

      <div>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
          {member.name}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {member.gdgId && (
            <Badge variant="blue" style={{ fontFamily: 'monospace', fontWeight: 700 }}>
              {member.gdgId}
            </Badge>
          )}
          {getRoleBadge(member.role, member.leadTitle)}
          <Badge variant="purple">{member.domain}</Badge>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginTop: '4px',
          color: 'var(--text-muted)',
        }}
      >
        <a
          href={`mailto:${member.email}`}
          title="Send Email"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-elevated)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-color)',
            textDecoration: 'none',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          <Icon name="mail" size={16} />
        </a>

        {member.github && (
          <a
            href={member.github}
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub Profile"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)',
              textDecoration: 'none',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            <Icon name="code" size={16} />
          </a>
        )}

        {member.linkedin && (
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn Profile"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)',
              textDecoration: 'none',
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            <Icon name="public" size={16} />
          </a>
        )}
      </div>
    </Card>
  );
};
