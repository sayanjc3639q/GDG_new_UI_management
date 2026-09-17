'use client';

import React, { useEffect, useState } from 'react';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Plus, Search, Filter } from 'lucide-react';
import { GDGEvent, EventsService, EventCard, CreateEventModal, CreateEventDto, EventType } from '@/modules/events';

export default function EventsPage() {
  const [events, setEvents] = useState<GDGEvent[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    EventsService.getEvents().then(setEvents);
  }, []);

  const handleCreate = async (dto: CreateEventDto) => {
    const created = await EventsService.createEvent(dto);
    setEvents((prev) => [created, ...prev]);
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'ALL' || e.type === selectedType;
    return matchesSearch && matchesType;
  });

  const filterTabs = [
    { label: 'All Events', value: 'ALL' },
    { label: 'Workshops', value: 'WORKSHOP' },
    { label: 'Study Jams', value: 'STUDY_JAM' },
    { label: 'Hackathons', value: 'HACKATHON' },
    { label: 'Tech Talks', value: 'TECH_TALK' },
  ];

  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>Events &amp; Workshops</h1>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '4px' }}>
              Create, organize, and monitor attendee participation for all GDG campus events.
            </p>
          </div>

          <Button
            variant="primary"
            leftIcon={<Plus size={18} />}
            onClick={() => setIsModalOpen(true)}
          >
            Create New Event
          </Button>
        </div>

        {/* Filters and Search Bar */}
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
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {filterTabs.map((tab) => {
              const isActive = selectedType === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setSelectedType(tab.value)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: isActive ? '#4285F4' : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? '#ffffff' : '#9ca3af',
                    border: 'none',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div style={{ width: '280px' }}>
            <Input
              placeholder="Filter by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div
            style={{
              padding: '64px',
              textAlign: 'center',
              background: 'rgba(19, 27, 44, 0.4)',
              borderRadius: '16px',
              border: '1px dashed rgba(255, 255, 255, 0.15)',
            }}
          >
            <p style={{ color: '#9ca3af', fontSize: '1rem' }}>No events found matching your criteria.</p>
            <Button
              variant="outline"
              style={{ marginTop: '16px' }}
              onClick={() => {
                setSearch('');
                setSelectedType('ALL');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Modal */}
        <CreateEventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreate}
        />
      </div>
    </DashboardShell>
  );
}
