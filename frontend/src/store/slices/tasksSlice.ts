import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TasksService, Task, CreateTaskDto } from '@/modules/tasks/tasks.service';

interface TasksState {
  items: Task[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filter: 'ALL' | 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  searchQuery: string;
  lastFetched: number | null;
}

const initialState: TasksState = {
  items: [],
  status: 'idle',
  error: null,
  filter: 'ALL',
  searchQuery: '',
  lastFetched: null,
};

// Async Thunks
export const fetchTasks = createAsyncThunk<Task[], { force?: boolean } | undefined>(
  'tasks/fetchTasks',
  async (_, { getState }) => {
    return await TasksService.getTasks();
  },
  {
    condition: (args, { getState }) => {
      const state = (getState() as { tasks: TasksState }).tasks;
      if (args?.force) return true;
      // Cache data for 60 seconds to minimize server load
      if (state.lastFetched && Date.now() - state.lastFetched < 60000 && state.items.length > 0) {
        return false;
      }
      return state.status !== 'loading';
    },
  }
);

export const createTaskThunk = createAsyncThunk<Task, CreateTaskDto>(
  'tasks/createTask',
  async (dto) => {
    return await TasksService.createTask(dto);
  }
);

export const updateTaskThunk = createAsyncThunk<Task, { id: string; updates: Partial<Task> }>(
  'tasks/updateTask',
  async ({ id, updates }) => {
    return await TasksService.updateTask(id, updates);
  }
);

export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilter(state, action: PayloadAction<TasksState['filter']>) {
      state.filter = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    optimisticToggleTaskStatus(state, action: PayloadAction<string>) {
      const task = state.items.find((t) => t.id === action.payload);
      if (task) {
        task.status = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      // createTaskThunk
      .addCase(createTaskThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // updateTaskThunk
      .addCase(updateTaskThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { setFilter, setSearchQuery, optimisticToggleTaskStatus } = tasksSlice.actions;
export default tasksSlice.reducer;
