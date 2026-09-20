import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MeetingsService, Meeting, CreateMeetingDto } from '@/modules/meetings/meetings.service';

interface MeetingsState {
  items: Meeting[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filter: 'ALL' | 'UPCOMING' | 'COMPLETED';
  searchQuery: string;
  lastFetched: number | null;
}

const initialState: MeetingsState = {
  items: [],
  status: 'idle',
  error: null,
  filter: 'ALL',
  searchQuery: '',
  lastFetched: null,
};

export const fetchMeetings = createAsyncThunk<Meeting[], { force?: boolean } | undefined>(
  'meetings/fetchMeetings',
  async () => {
    return await MeetingsService.getMeetings();
  },
  {
    condition: (args, { getState }) => {
      const state = (getState() as { meetings: MeetingsState }).meetings;
      if (args?.force) return true;
      if (state.lastFetched && Date.now() - state.lastFetched < 60000 && state.items.length > 0) {
        return false;
      }
      return state.status !== 'loading';
    },
  }
);

export const createMeetingThunk = createAsyncThunk<Meeting, CreateMeetingDto>(
  'meetings/createMeeting',
  async (dto) => {
    return await MeetingsService.createMeeting(dto);
  }
);

export const meetingsSlice = createSlice({
  name: 'meetings',
  initialState,
  reducers: {
    setMeetingFilter(state, action: PayloadAction<MeetingsState['filter']>) {
      state.filter = action.payload;
    },
    setMeetingSearch(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeetings.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMeetings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchMeetings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch meetings';
      })
      .addCase(createMeetingThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

export const { setMeetingFilter, setMeetingSearch } = meetingsSlice.actions;
export default meetingsSlice.reducer;
