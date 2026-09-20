'use client';

import React, { useState } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { CreateMemberDto, MemberRole, MemberDomain, LeadTitle } from '../team.types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateMemberDto) => Promise<void>;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateMemberDto>({
    name: '',
    email: '',
    gdgId: '',
    role: 'MEMBER',
    domain: 'Web Developer',
    leadTitle: 'Organizer',
    github: '',
    linkedin: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        ...formData,
        leadTitle: formData.role === 'LEAD' ? formData.leadTitle : undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Chapter Team Member" icon="person_add">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Input
            label="Full Name"
            placeholder="e.g. Alex Rivera"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Input
            label="GDG ID"
            placeholder="e.g. GDG-2026-001"
            value={formData.gdgId || ''}
            onChange={(e) => setFormData({ ...formData, gdgId: e.target.value })}
          />
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="alex@gdghit.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Role selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>Hierarchy Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as MemberRole })}
              style={{
                width: '100%',
                height: '42px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '0 14px',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-main)',
                outline: 'none',
              }}
            >
              <option value="MEMBER">Member</option>
              <option value="DOMAIN_SENIOR">Domain Senior</option>
              <option value="LEAD">Lead</option>
            </select>
          </div>

          {/* Domain selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--text-muted)' }}>Domain</label>
            <select
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value as MemberDomain })}
              style={{
                width: '100%',
                height: '42px',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '0 14px',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-main)',
                outline: 'none',
              }}
            >
              <option value="Graphic Designer">Graphic Designer</option>
              <option value="Video Editor">Video Editor</option>
              <option value="Photographer">Photographer</option>
              <option value="Web Developer">Web Developer</option>
              <option value="Content Writer">Content Writer</option>
              <option value="Public Relation Manager">Public Relation Manager</option>
              <option value="App Developer">App Developer</option>
              <option value="Technical Member">Technical Member</option>
            </select>
          </div>
        </div>

        {/* Dynamic Lead Title selector (only visible when role is LEAD) */}
        {formData.role === 'LEAD' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--gdg-yellow)' }}>
              Lead Specialization / Title
            </label>
            <select
              value={formData.leadTitle}
              onChange={(e) => setFormData({ ...formData, leadTitle: e.target.value as LeadTitle })}
              style={{
                width: '100%',
                height: '42px',
                background: 'var(--bg-input)',
                border: '1px solid var(--gdg-yellow)',
                borderRadius: 'var(--radius-sm)',
                padding: '0 14px',
                color: 'var(--text-main)',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-main)',
                outline: 'none',
              }}
            >
              <option value="Organizer">Organizer</option>
              <option value="Co-Organizer">Co-Organizer</option>
              <option value="Secretary">Secretary</option>
              <option value="Treasurer">Treasurer</option>
              <option value="Domain Lead">Domain Lead</option>
            </select>
          </div>
        )}

        <Input
          label="GitHub Profile URL"
          placeholder="https://github.com/username"
          value={formData.github}
          onChange={(e) => setFormData({ ...formData, github: e.target.value })}
        />

        <Input
          label="LinkedIn Profile URL"
          placeholder="https://linkedin.com/in/username"
          value={formData.linkedin}
          onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save Member
          </Button>
        </div>
      </form>
    </Modal>
  );
};
