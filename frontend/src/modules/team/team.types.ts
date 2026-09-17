export type MemberRole = 'LEAD' | 'CO_LEAD' | 'ORGANIZER' | 'MEMBER';
export type MemberDomain = 'AI/ML' | 'Web' | 'Android' | 'Cloud' | 'Cybersecurity' | 'Design';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  domain: MemberDomain;
  avatarUrl?: string;
  github?: string;
  linkedin?: string;
  joinedAt: string;
}

export interface CreateMemberDto {
  name: string;
  email: string;
  role: MemberRole;
  domain: MemberDomain;
  github?: string;
  linkedin?: string;
}
