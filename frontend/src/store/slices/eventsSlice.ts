import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { EventsService } from '@/modules/events/events.service';
import { GDGEvent, CreateEventDto } from '@/modules/events/events.types';

interface EventsState {
  items: GDGEvent[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  filter: 'ALL' | 'WORKSHOP' | 'STUDY_JAM' | 'HACKATHON' | 'TECH_TALK';
  searchQuery: string;
  lastFetched: number | null;
}

const initialState: EventsState = {
  items: [],
  status: 'idle',
  error: null,
  filter: 'ALL',
  searchQuery: '',
  lastFetched: null,
};

export const fetchEvents = createAsyncThunk<GDGEvent[], { force?: boolean } | undefined>(
  'events/fetchEvents',
  async () => {
    return await EventsService.getEvents();
  },
  {
    condition: (args, { getState }) => {
      const state = (getState() as { events: EventsState }).events;
      if (args?.force) return true;
      if (state.lastFetched && Date.now() - state.lastFetched < 60000 && state.items.length > 0) {
        return false;
      }
      return state.status !== 'loading';
    },
  }
);

export const createEventThunk = createAsyncThunk<GDGEvent, CreateEventDto>(
  'events/createEvent',
  async (dto) => {
    return await EventsService.createEvent(dto);
  }
);

export const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEventFilter(state, action: PayloadAction<EventsState['filter']>) {
      state.filter = action.payload;
    },
    setEventSearch(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch events';
      })
      .addCase(createEventThunk.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

export const { setEventFilter, setEventSearch } = eventsSlice.actions;
export default eventsSlice.reducer;
