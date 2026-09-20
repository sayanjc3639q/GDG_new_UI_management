'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchMeetings,
  createMeetingThunk,
  setMeetingFilter,
  setMeetingSearch,
} from '@/store/slices/meetingsSlice';
import { CreateMeetingDto } from '@/modules/meetings/meetings.service';

export function useMeetings(autoFetch = true) {
  const dispatch = useAppDispatch();
  const { items, status, error, filter, searchQuery } = useAppSelector((state) => state.meetings);

  useEffect(() => {
    if (autoFetch) {
      dispatch(fetchMeetings());
    }
  }, [dispatch, autoFetch]);

  const filteredMeetings = useMemo(() => {
    return items.filter((m) => {
      const matchesFilter = filter === 'ALL' || m.status === filter;
      const matchesSearch =
        searchQuery === '' ||
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.agenda.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [items, filter, searchQuery]);

  const handleCreateMeeting = useCallback(
    async (dto: CreateMeetingDto) => {
      return await dispatch(createMeetingThunk(dto)).unwrap();
    },
    [dispatch]
  );

  const handleSetFilter = useCallback(
    (newFilter: typeof filter) => {
      dispatch(setMeetingFilter(newFilter));
    },
    [dispatch]
  );

  const handleSetSearch = useCallback(
    (query: string) => {
      dispatch(setMeetingSearch(query));
    },
    [dispatch]
  );

  const refreshMeetings = useCallback(() => {
    dispatch(fetchMeetings({ force: true }));
  }, [dispatch]);

  return {
    meetings: items,
    filteredMeetings,
    status,
    isLoading: status === 'loading',
    error,
    filter,
    searchQuery,
    createMeeting: handleCreateMeeting,
    setFilter: handleSetFilter,
    setSearch: handleSetSearch,
    refreshMeetings,
  };
}
