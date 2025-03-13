import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Base API URL
const API_BASE = 'http://localhost:8000/api/ai';

// Async thunk to send user input to an existing session
export const sendUserInput = createAsyncThunk('session/sendUserInput', async ({ email, inputText }, { rejectWithValue }) => {
    try {
      console.log(email, inputText);
      const response = await axios.post(`${API_BASE}/sessions/chat/`, { email, message: inputText });
      console.log(response.data);
      return response.data.response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to get response from the model');
    }
});

// Async thunk to create a new session for a user
export const createNewSession = createAsyncThunk('session/createNewSession', async (email, { rejectWithValue }) => {
    try {
      console.log(email);
      const response = await axios.post(`${API_BASE}/sessions/`, { user_email: email });
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create session');
    }
});

// Async thunk to get all sessions for a user by email
export const getUserSessions = createAsyncThunk('session/getUserSessions', async (email, { rejectWithValue }) => {
    try {
      console.log(email);
      const response = await axios.get(`${API_BASE}/sessions/user_sessions/?email=${email}`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch user sessions');
    }
});

// Async thunk to delete a session by ID
export const deleteSession = createAsyncThunk('session/deleteSession', async (sessionId, { rejectWithValue }) => {
    try {
        await axios.delete(`${API_BASE}/sessions/${sessionId}/`);
        return sessionId;
    } catch (error) {
        return rejectWithValue(error.response?.data || 'Failed to delete session');
    }
});

const sessionSlice = createSlice({
    name: 'session',
    initialState: {
        input: '',
        response: '',
        loading: false,
        error: null,
        cur_session: null,
        user_sessions: [],
        user: null,
        isAuthenticated: false,
    },
    reducers: {
        setInput: (state, action) => {
            state.input = action.payload;
        },
        clearSession: (state) => {
            state.input = '';
            state.response = '';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Send user input
            .addCase(sendUserInput.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendUserInput.fulfilled, (state, action) => {
                state.loading = false;
                state.response = action.payload;
            })
            .addCase(sendUserInput.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Create new session
            .addCase(createNewSession.fulfilled, (state, action) => {
                state.cur_session = action.payload;
                state.user_sessions.push(action.payload);
            })

            // Get all sessions for user
            .addCase(getUserSessions.fulfilled, (state, action) => {
                state.user_sessions = action.payload;
            })

            // Delete a session
            .addCase(deleteSession.fulfilled, (state, action) => {
                state.user_sessions = state.user_sessions.filter(session => session.id !== action.payload);
            });
    },
});

export const { setInput, clearSession } = sessionSlice.actions;
export default sessionSlice.reducer;
