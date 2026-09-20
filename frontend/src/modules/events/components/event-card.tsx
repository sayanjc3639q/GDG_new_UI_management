import React from 'react';
import { GDGEvent } from '../events.types';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Icon } from '@/shared/components/ui/icon';

interface EventCardProps {
  event: GDGEvent;
  onSelect?: (event: GDGEvent) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onSelect }) => {
  const getTypeColor = (type: GDGEvent['type']) => {
    switch (type) {
      case 'HACKATHON':
        return 'red';
      case 'STUDY_JAM':
        return 'blue';
      case 'DEV_FEST':
        return 'yellow';
      case 'TECH_TALK':
        return 'green';
      default:
        return 'purple';
    }
  };

  const formattedDate = new Date(event.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Card
      onClick={() => onSelect?.(event)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        gap: '16px',
        borderRadius: 'var(--radius-xl)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      className="m3-interactive"
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <Badge variant={getTypeColor(event.type)}>{event.type.replace('_', ' ')}</Badge>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Icon name="calendar_month" size={16} color="var(--text-subtle)" />
            {formattedDate}
          </span>
        </div>

        <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>
          {event.title}
        </h4>

        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
          {event.description}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {(event.tags || []).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '0.6875rem',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--bg-elevated)',
                color: 'var(--text-muted)',
                fontWeight: 500,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {event.isVirtual ? (
            <Icon name="videocam" size={16} color="var(--gdg-blue)" />
          ) : (
            <Icon name="location_on" size={16} color="var(--gdg-red)" />
          )}
          <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.location}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Icon name="group" size={16} color="var(--gdg-green)" />
          <span>{event.capacity} Capacity</span>
        </div>
      </div>
    </Card>
  );
};
