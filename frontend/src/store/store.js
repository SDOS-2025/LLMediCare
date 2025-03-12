import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import appointmentReducer from './slices/appointmentSlice';
import recordsReducer from './slices/recordsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    appointments: appointmentReducer,
    records: recordsReducer,
  },
});
