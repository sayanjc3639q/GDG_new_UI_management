import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from './slices/tasksSlice';
import meetingsReducer from './slices/meetingsSlice';
import leavesReducer from './slices/leavesSlice';
import teamReducer from './slices/teamSlice';
import eventsReducer from './slices/eventsSlice';

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    meetings: meetingsReducer,
    leaves: leavesReducer,
    team: teamReducer,
    events: eventsReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
