'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchTasks,
  createTaskThunk,
  updateTaskThunk,
  setFilter,
  setSearchQuery,
  optimisticToggleTaskStatus,
} from '@/store/slices/tasksSlice';
import { CreateTaskDto, Task } from '@/modules/tasks/tasks.service';

export function useTasks(autoFetch = true) {
  const dispatch = useAppDispatch();
  const { items, status, error, filter, searchQuery } = useAppSelector((state) => state.tasks);

  useEffect(() => {
    if (autoFetch) {
      dispatch(fetchTasks());
    }
  }, [dispatch, autoFetch]);

  const filteredTasks = useMemo(() => {
    return items.filter((task) => {
      const matchesFilter = filter === 'ALL' || task.status === filter;
      const matchesSearch =
        searchQuery === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.domain.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [items, filter, searchQuery]);

  const upcomingTasks = useMemo(() => {
    return [...items].sort((a, b) => {
      if (a.status === 'COMPLETED' && b.status !== 'COMPLETED') return 1;
      if (a.status !== 'COMPLETED' && b.status === 'COMPLETED') return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }, [items]);

  const handleCreateTask = useCallback(
    async (dto: CreateTaskDto) => {
      return await dispatch(createTaskThunk(dto)).unwrap();
    },
    [dispatch]
  );

  const handleToggleStatus = useCallback(
    async (id: string, currentStatus: Task['status']) => {
      const nextStatus = currentStatus === 'COMPLETED' ? 'TODO' : 'COMPLETED';
      dispatch(optimisticToggleTaskStatus(id));
      try {
        await dispatch(updateTaskThunk({ id, updates: { status: nextStatus } })).unwrap();
      } catch (err) {
        // Revert on error
        dispatch(optimisticToggleTaskStatus(id));
      }
    },
    [dispatch]
  );

  const handleUpdateStatus = useCallback(
    async (id: string, newStatus: Task['status']) => {
      return await dispatch(updateTaskThunk({ id, updates: { status: newStatus } })).unwrap();
    },
    [dispatch]
  );

  const handleSetFilter = useCallback(
    (newFilter: typeof filter) => {
      dispatch(setFilter(newFilter));
    },
    [dispatch]
  );

  const handleSetSearch = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
    },
    [dispatch]
  );

  const refreshTasks = useCallback(() => {
    dispatch(fetchTasks({ force: true }));
  }, [dispatch]);

  return {
    tasks: items,
    filteredTasks,
    upcomingTasks,
    status,
    isLoading: status === 'loading',
    error,
    filter,
    searchQuery,
    createTask: handleCreateTask,
    toggleTaskStatus: handleToggleStatus,
    updateTaskStatus: handleUpdateStatus,
    setFilter: handleSetFilter,
    setSearch: handleSetSearch,
    refreshTasks,
  };
}
