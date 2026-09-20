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
      case 'DEVELOPER':
        return (
          <Badge variant="purple" style={{ background: 'linear-gradient(135deg, #a142f4 0%, #681da8 100%)', color: '#fff', border: 'none' }}>
            Developer
          </Badge>
        );
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
            member.role === 'DEVELOPER'
              ? 'linear-gradient(135deg, #a142f4 0%, #681da8 100%)'
              : member.role === 'LEAD'
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
          gap: '8px',
          marginTop: '4px',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {/* Email */}
        <a
          href={`mailto:${member.email}`}
          title={member.email ? `Email: ${member.email}` : 'No Email provided'}
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
            transition: 'background 0.2s, color 0.2s, transform 0.1s',
          }}
          className="m3-interactive"
        >
          <Icon name="mail" size={18} />
        </a>

        {/* Phone */}
        {member.phone ? (
          <a
            href={`tel:${member.phone}`}
            title={`Call: ${member.phone}`}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-elevated)',
              color: 'var(--gdg-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)',
              textDecoration: 'none',
              transition: 'background 0.2s, color 0.2s, transform 0.1s',
            }}
            className="m3-interactive"
          >
            <Icon name="call" size={18} color="var(--gdg-green)" />
          </a>
        ) : (
          <div
            title="Phone number not provided"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-subtle)',
              opacity: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)',
              cursor: 'not-allowed',
            }}
          >
            <Icon name="call" size={18} />
          </div>
        )}

        {/* GitHub */}
        {member.github ? (
          <a
            href={member.github.startsWith('http') ? member.github : `https://${member.github}`}
            target="_blank"
            rel="noopener noreferrer"
            title={`GitHub: ${member.github}`}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)',
              textDecoration: 'none',
              transition: 'background 0.2s, color 0.2s, transform 0.1s',
            }}
            className="m3-interactive"
          >
            <Icon name="code" size={18} />
          </a>
        ) : (
          <div
            title="GitHub profile not provided"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-subtle)',
              opacity: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)',
              cursor: 'not-allowed',
            }}
          >
            <Icon name="code" size={18} />
          </div>
        )}

        {/* LinkedIn */}
        {member.linkedin ? (
          <a
            href={member.linkedin.startsWith('http') ? member.linkedin : `https://${member.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            title={`LinkedIn: ${member.linkedin}`}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-elevated)',
              color: 'var(--gdg-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)',
              textDecoration: 'none',
              transition: 'background 0.2s, color 0.2s, transform 0.1s',
            }}
            className="m3-interactive"
          >
            <Icon name="public" size={18} color="var(--gdg-blue)" />
          </a>
        ) : (
          <div
            title="LinkedIn profile not provided"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-subtle)',
              opacity: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)',
              cursor: 'not-allowed',
            }}
          >
            <Icon name="public" size={18} />
          </div>
        )}

        {/* Date of Birth (DOB) */}
        {member.dob ? (
          <div
            title={`Date of Birth: ${member.dob}`}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-elevated)',
              color: 'var(--gdg-yellow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)',
              cursor: 'default',
            }}
          >
            <Icon name="cake" size={18} color="var(--gdg-yellow)" />
          </div>
        ) : (
          <div
            title="Date of Birth not set"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--bg-elevated)',
              color: 'var(--text-subtle)',
              opacity: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)',
              cursor: 'not-allowed',
            }}
          >
            <Icon name="cake" size={18} />
          </div>
        )}
      </div>
    </Card>
  );
};
