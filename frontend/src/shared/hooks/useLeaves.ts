'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchLeaves,
  createLeaveThunk,
  updateLeaveStatusThunk,
  setLeaveFilter,
} from '@/store/slices/leavesSlice';
import { CreateLeaveDto, LeaveApplication, LeaveStatus } from '@/modules/leaves/leaves.service';

export function useLeaves(autoFetch = true) {
  const dispatch = useAppDispatch();
  const { items, status, error, filter } = useAppSelector((state) => state.leaves);

  useEffect(() => {
    if (autoFetch) {
      dispatch(fetchLeaves());
    }
  }, [dispatch, autoFetch]);

  const filteredLeaves = useMemo(() => {
    return items.filter((l) => {
      if (filter === 'ALL') return true;
      return l.status === filter;
    });
  }, [items, filter]);

  const handleCreateLeave = useCallback(
    async (dto: CreateLeaveDto) => {
      return await dispatch(createLeaveThunk(dto)).unwrap();
    },
    [dispatch]
  );

  const handleUpdateStatus = useCallback(
    async (id: string, newStatus: LeaveStatus) => {
      return await dispatch(updateLeaveStatusThunk({ id, status: newStatus })).unwrap();
    },
    [dispatch]
  );

  const handleSetFilter = useCallback(
    (newFilter: typeof filter) => {
      dispatch(setLeaveFilter(newFilter));
    },
    [dispatch]
  );

  return {
    leaves: items,
    filteredLeaves,
    status,
    isLoading: status === 'loading',
    error,
    filter,
    createLeave: handleCreateLeave,
    updateLeaveStatus: handleUpdateStatus,
    setFilter: handleSetFilter,
    refreshLeaves: () => dispatch(fetchLeaves({ force: true })),
  };
}
