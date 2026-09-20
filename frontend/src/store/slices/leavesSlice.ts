import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { LeavesService, LeaveApplication, CreateLeaveDto, LeaveStatus } from '@/modules/leaves/leaves.service';

interface LeavesState {
  items: LeaveApplication[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filter: 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';
  lastFetched: number | null;
}

const initialState: LeavesState = {
  items: [],
  status: 'idle',
  error: null,
  filter: 'ALL',
  lastFetched: null,
};

export const fetchLeaves = createAsyncThunk<LeaveApplication[], { force?: boolean } | undefined>(
  'leaves/fetchLeaves',
  async () => {
    return await LeavesService.getLeaves();
  },
  {
    condition: (args, { getState }) => {
      const state = (getState() as { leaves: LeavesState }).leaves;
      if (args?.force) return true;
      if (state.lastFetched && Date.now() - state.lastFetched < 60000 && state.items.length > 0) {
        return false;
      }
      return state.status !== 'loading';
    },
  }
);

export const createLeaveThunk = createAsyncThunk<LeaveApplication, CreateLeaveDto>(
  'leaves/createLeave',
  async (dto) => {
    return await LeavesService.createLeave(dto);
  }
);

export const updateLeaveStatusThunk = createAsyncThunk<
  LeaveApplication,
  { id: string; status: LeaveStatus }
>('leaves/updateLeaveStatus', async ({ id, status }) => {
  return await LeavesService.updateStatus(id, status);
});

export const leavesSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    setLeaveFilter(state, action: PayloadAction<LeavesState['filter']>) {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaves.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchLeaves.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch leaves';
      })
      .addCase(createLeaveThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateLeaveStatusThunk.fulfilled, (state, action) => {
        const index = state.items.findIndex((l) => l.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export const { setLeaveFilter } = leavesSlice.actions;
export default leavesSlice.reducer;
