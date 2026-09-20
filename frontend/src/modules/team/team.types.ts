export type MemberRole = 'DEVELOPER' | 'LEAD' | 'DOMAIN_SENIOR' | 'MEMBER';

export type MemberDomain =
  | 'Graphic Designer'
  | 'Video Editor'
  | 'Photographer'
  | 'Web Developer'
  | 'Content Writer'
  | 'Public Relation Manager'
  | 'App Developer'
  | 'Technical Member';

export type LeadTitle =
  | 'Organizer'
  | 'Co-Organizer'
  | 'Lead Developer'
  | 'Secretary'
  | 'Treasurer'
  | 'Domain Lead';

export interface TeamMember {
  id: string;
  gdgId?: string;
  name: string;
  email: string;
  role: MemberRole;
  domain: MemberDomain;
  leadTitle?: LeadTitle;
  avatarUrl?: string;
  github?: string;
  linkedin?: string;
  phone?: string;
  dob?: string;
  joinedAt: string;
}

export interface CreateMemberDto {
  name: string;
  email: string;
  role: MemberRole;
  domain: MemberDomain;
  gdgId?: string;
  leadTitle?: LeadTitle;
  github?: string;
  linkedin?: string;
  phone?: string;
  dob?: string;
}

export interface UpdateMemberDto {
  name?: string;
  email?: string;
  role?: MemberRole;
  domain?: MemberDomain;
  gdgId?: string;
  leadTitle?: LeadTitle;
  github?: string;
  linkedin?: string;
  phone?: string;
  dob?: string;
}
