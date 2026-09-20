'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchTeam,
  createMemberThunk,
  updateMemberThunk,
  deleteMemberThunk,
  setSelectedDomain,
  setTeamSearchQuery,
} from '@/store/slices/teamSlice';
import { TeamMember, CreateMemberDto, UpdateMemberDto } from '@/modules/team/team.types';

export function useTeam(autoFetch = true) {
  const dispatch = useAppDispatch();
  const { members, status, error, selectedDomain, searchQuery } = useAppSelector(
    (state) => state.team
  );

  useEffect(() => {
    if (autoFetch) {
      dispatch(fetchTeam());
    }
  }, [dispatch, autoFetch]);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesDomain = selectedDomain === 'ALL' || m.domain === selectedDomain;
      const matchesSearch =
        searchQuery === '' ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.gdgId && m.gdgId.toLowerCase().includes(searchQuery.toLowerCase())) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDomain && matchesSearch;
    });
  }, [members, selectedDomain, searchQuery]);

  const handleCreateMember = useCallback(
    async (dto: CreateMemberDto) => {
      return await dispatch(createMemberThunk(dto)).unwrap();
    },
    [dispatch]
  );

  const handleUpdateMember = useCallback(
    async (id: string, dto: UpdateMemberDto) => {
      return await dispatch(updateMemberThunk({ id, dto })).unwrap();
    },
    [dispatch]
  );

  const handleDeleteMember = useCallback(
    async (id: string) => {
      return await dispatch(deleteMemberThunk(id)).unwrap();
    },
    [dispatch]
  );

  const handleSetDomain = useCallback(
    (domain: string) => {
      dispatch(setSelectedDomain(domain));
    },
    [dispatch]
  );

  const handleSetSearch = useCallback(
    (query: string) => {
      dispatch(setTeamSearchQuery(query));
    },
    [dispatch]
  );

  return {
    members,
    filteredMembers,
    status,
    isLoading: status === 'loading',
    error,
    selectedDomain,
    searchQuery,
    createMember: handleCreateMember,
    updateMember: handleUpdateMember,
    deleteMember: handleDeleteMember,
    setDomain: handleSetDomain,
    setSearch: handleSetSearch,
    refreshTeam: () => dispatch(fetchTeam({ force: true })),
  };
}
