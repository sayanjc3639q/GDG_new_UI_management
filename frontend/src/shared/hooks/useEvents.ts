'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchEvents,
  createEventThunk,
  setEventFilter,
  setEventSearch,
} from '@/store/slices/eventsSlice';
import { GDGEvent, CreateEventDto } from '@/modules/events/events.types';

export function useEvents(autoFetch = true) {
  const dispatch = useAppDispatch();
  const { items, status, error, filter, searchQuery } = useAppSelector((state) => state.events);

  useEffect(() => {
    if (autoFetch) {
      dispatch(fetchEvents());
    }
  }, [dispatch, autoFetch]);

  const filteredEvents = useMemo(() => {
    return items.filter((evt) => {
      const matchesFilter = filter === 'ALL' || evt.type === filter;
      const matchesSearch =
        searchQuery === '' ||
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [items, filter, searchQuery]);

  const handleCreateEvent = useCallback(
    async (dto: CreateEventDto) => {
      return await dispatch(createEventThunk(dto)).unwrap();
    },
    [dispatch]
  );

  const handleSetFilter = useCallback(
    (newFilter: typeof filter) => {
      dispatch(setEventFilter(newFilter));
    },
    [dispatch]
  );

  const handleSetSearch = useCallback(
    (query: string) => {
      dispatch(setEventSearch(query));
    },
    [dispatch]
  );

  return {
    events: items,
    filteredEvents,
    status,
    isLoading: status === 'loading',
    error,
    filter,
    searchQuery,
    createEvent: handleCreateEvent,
    setFilter: handleSetFilter,
    setSearch: handleSetSearch,
    refreshEvents: () => dispatch(fetchEvents({ force: true })),
  };
}
