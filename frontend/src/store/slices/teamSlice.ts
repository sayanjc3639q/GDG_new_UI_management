import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TeamService } from '@/modules/team/team.service';
import { TeamMember, CreateMemberDto, UpdateMemberDto } from '@/modules/team/team.types';

interface TeamState {
  members: TeamMember[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  selectedDomain: string;
  searchQuery: string;
  lastFetched: number | null;
}

const initialState: TeamState = {
  members: [],
  status: 'idle',
  error: null,
  selectedDomain: 'ALL',
  searchQuery: '',
  lastFetched: null,
};

export const fetchTeam = createAsyncThunk<TeamMember[], { force?: boolean } | undefined>(
  'team/fetchTeam',
  async () => {
    return await TeamService.getMembers();
  },
  {
    condition: (args, { getState }) => {
      const state = (getState() as { team: TeamState }).team;
      if (args?.force) return true;
      if (state.lastFetched && Date.now() - state.lastFetched < 60000 && state.members.length > 0) {
        return false;
      }
      return state.status !== 'loading';
    },
  }
);

export const createMemberThunk = createAsyncThunk<TeamMember, CreateMemberDto>(
  'team/createMember',
  async (dto) => {
    return await TeamService.createMember(dto);
  }
);

export const updateMemberThunk = createAsyncThunk<TeamMember, { id: string; dto: UpdateMemberDto }>(
  'team/updateMember',
  async ({ id, dto }) => {
    return await TeamService.updateMember(id, dto);
  }
);

export const deleteMemberThunk = createAsyncThunk<string, string>(
  'team/deleteMember',
  async (id) => {
    await TeamService.deleteMember(id);
    return id;
  }
);

export const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {
    setSelectedDomain(state, action: PayloadAction<string>) {
      state.selectedDomain = action.payload;
    },
    setTeamSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeam.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTeam.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.members = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchTeam.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch team';
      })
      .addCase(createMemberThunk.fulfilled, (state, action) => {
        state.members.unshift(action.payload);
      })
      .addCase(updateMemberThunk.fulfilled, (state, action) => {
        const index = state.members.findIndex((m) => m.id === action.payload.id);
        if (index !== -1) {
          state.members[index] = action.payload;
        }
      })
      .addCase(deleteMemberThunk.fulfilled, (state, action) => {
        state.members = state.members.filter((m) => m.id !== action.payload);
      });
  },
});

export const { setSelectedDomain, setTeamSearchQuery } = teamSlice.actions;
export default teamSlice.reducer;
