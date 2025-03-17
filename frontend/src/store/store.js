import { configureStore } from '@reduxjs/toolkit';
import sessionReducer from './slices/sessionSlice';
import userReducer from './slices/userSlice';
import recordsReducer from './slices/recordsSlice';  // Import records slice

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    user: userReducer,
    records: recordsReducer,  // Add records reducer
  },
});
