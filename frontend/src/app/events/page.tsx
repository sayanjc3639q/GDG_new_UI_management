'use client';

import React, { useState } from 'react';
import { DashboardShell } from '@/shared/layout/dashboard-shell';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Icon } from '@/shared/components/ui/icon';
import { useEvents } from '@/shared/hooks/useEvents';
import { EventCard, CreateEventModal, CreateEventDto } from '@/modules/events';

export default function EventsPage() {
  const {
    filteredEvents,
    filter: selectedType,
    searchQuery,
    setFilter: setSelectedType,
    setSearch,
    createEvent,
  } = useEvents();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = async (dto: CreateEventDto) => {
    await createEvent(dto);
  };

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
        {/* Filters and Search Bar with Create Action */}
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
          {/* Tabs / Filter Chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {filterTabs.map((tab) => {
              const isActive = selectedType === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setSelectedType(tab.value as any)}
                  style={{
                    padding: '6px 16px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: isActive ? 'var(--md-primary-container)' : 'var(--bg-elevated)',
                    color: isActive ? 'var(--md-on-primary-container)' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                  }}
                  className="m3-interactive"
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ width: '260px' }}>
              <Input
                placeholder="Filter by keyword..."
                value={searchQuery}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Icon name="search" size={18} />}
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Icon name="add" size={16} />}
              onClick={() => setIsModalOpen(true)}
            >
              Create Event
            </Button>
          </div>
        </div>


        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div
            style={{
              padding: '64px 24px',
              textAlign: 'center',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px dashed var(--border-color)',
            }}
          >
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>No events found matching your criteria.</p>
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
