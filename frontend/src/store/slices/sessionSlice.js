import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base API URL
const API_BASE1 = "http://localhost:8000/api/ai";
const API_BASE2 = "http://localhost:8000/api/user";

export const sendUserInput = createAsyncThunk(
  "session/sendUserInput",
  async (inputText, { dispatch, rejectWithValue }) => {
    try {
      await dispatch(addChatToSession({ ...inputText }));
      console.log(inputText);
      const response = await axios.post(`${API_BASE1}/chat/`, {
        query: inputText.message,
      });
      console.log(response.data);
      // Append chat message to session in backend

      const llmMessage = {
        id: Date.now(),
        session_id: inputText.session_id,
        sender: "llm",
        message: response.data.response,
        created_at: new Date().toISOString(),
      };
      await dispatch(addChatToSession({ ...llmMessage }));
      return response.data.response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to get response from the model"
      );
    }
  }
);

// Async thunk to create a new session for a user
export const createNewSession = createAsyncThunk(
  "session/createNewSession",
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      console.log(userData);
      const response = await axios.post(`${API_BASE2}/sessions/`, {
        user_email: userData.email,
      });
      console.log(response.data);
      dispatch(getUserSessions(userData.email));
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to create session"
      );
    }
  }
);

// Async thunk to get all sessions for a user by email
export const getUserSessions = createAsyncThunk(
  "session/getUserSessions",
  async (userData, { rejectWithValue }) => {
    try {
      console.log(userData.email);
      const response = await axios.get(
        `${API_BASE2}/sessions/?email=${userData.email}`
      );
      console.log(response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch user sessions"
      );
    }
  }
);

export const addChatToSession = createAsyncThunk(
  "session/addChatToSession",
  async (inputMessage, { rejectWithValue }) => {
    try {
      const message = {
        id: inputMessage.id,
        sender: inputMessage.sender,
        content: inputMessage.message,
        created_at: inputMessage.created_at,
      };
      const response = await axios.post(
        `${API_BASE2}/sessions/${inputMessage.session_id}/add_chat/`,
        { message: message }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to add chat to session"
      );
    }
  }
);

// Async thunk to delete a session by ID
export const deleteSession = createAsyncThunk(
  "session/deleteSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE2}/sessions/${sessionId}/`);
      return sessionId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete session"
      );
    }
  }
);

const sessionSlice = createSlice({
  name: "session",
  initialState: {
    input: "",
    response: "",
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
    setCurrentSession: (state, action) => {
      state.cur_session = action.payload;
    },
    clearSession: (state) => {
      state.input = "";
      state.response = "";
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
      })

      // Get all sessions for user
      .addCase(getUserSessions.fulfilled, (state, action) => {
        state.user_sessions = action.payload;
      })

      .addCase(addChatToSession.fulfilled, (state, action) => {
        state.cur_session.session_chats = action.payload.session_chats;
      })

      // Delete a session
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.user_sessions = state.user_sessions.filter(
          (session) => session.id !== action.payload
        );
      });
  },
});

export const { setInput, clearSession, setCurrentSession } =
  sessionSlice.actions;
export default sessionSlice.reducer;
