import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth-slice';
import chatReducer from './slices/chat-slice';
import appointmentReducer from './slices/appointment-slice';
import recordsReducer from './slices/records-slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    appointments: appointmentReducer,
    records: recordsReducer,
  },
});
