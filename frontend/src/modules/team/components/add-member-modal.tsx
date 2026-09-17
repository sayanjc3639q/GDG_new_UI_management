'use client';

import React, { useState } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { CreateMemberDto, MemberRole, MemberDomain } from '../team.types';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateMemberDto) => Promise<void>;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateMemberDto>({
    name: '',
    email: '',
    role: 'ORGANIZER',
    domain: 'Web',
    github: '',
    linkedin: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add GDG Team Member">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input
          label="Full Name"
          placeholder="e.g. Alex Rivera"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="alex@gdghit.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#9ca3af' }}>Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as MemberRole })}
              style={{
                width: '100%',
                background: 'rgba(17, 24, 39, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#f3f4f6',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            >
              <option value="LEAD">Chapter Lead</option>
              <option value="CO_LEAD">Co-Lead</option>
              <option value="ORGANIZER">Organizer</option>
              <option value="MEMBER">Member</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#9ca3af' }}>Domain</label>
            <select
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value as MemberDomain })}
              style={{
                width: '100%',
                background: 'rgba(17, 24, 39, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#f3f4f6',
                fontSize: '0.875rem',
                outline: 'none',
              }}
            >
              <option value="AI/ML">AI / Machine Learning</option>
              <option value="Web">Web Technologies</option>
              <option value="Cloud">Google Cloud</option>
              <option value="Android">Android / Flutter</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Design">UI/UX & Design</option>
            </select>
          </div>
        </div>

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

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
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
