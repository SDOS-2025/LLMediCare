import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sessions: [],
  currentSession: null,
  messages: [],
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setSessions: (state, action) => {
      state.sessions = action.payload;
    },
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const { 
  setSessions, 
  setCurrentSession, 
  setMessages, 
  addMessage, 
  setLoading, 
  setError 
} = chatSlice.actions;

export default chatSlice.reducer;
