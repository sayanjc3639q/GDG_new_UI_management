import React from 'react';
import { GDGEvent } from '../events.types';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Calendar, MapPin, Users, Globe, Video } from 'lucide-react';

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
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <Badge variant={getTypeColor(event.type)}>{event.type.replace('_', ' ')}</Badge>
          <span style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={14} />
            {formattedDate}
          </span>
        </div>

        <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f9fafb', marginBottom: '8px' }}>
          {event.title}
        </h4>

        <p style={{ fontSize: '0.8125rem', color: '#9ca3af', lineHeight: 1.5, marginBottom: '16px' }}>
          {event.description}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {(event.tags || []).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '0.6875rem',
                padding: '2px 8px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#cbd5e1',
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
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.75rem',
          color: '#9ca3af',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {event.isVirtual ? <Video size={14} color="#8ab4f8" /> : <MapPin size={14} color="#EA4335" />}
          <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.location}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Users size={14} color="#34A853" />
          <span>{event.capacity} Capacity</span>
        </div>
      </div>
    </Card>
  );
};
