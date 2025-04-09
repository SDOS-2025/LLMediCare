import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base API URL
const API_BASE1 = "http://localhost:8000/api/ai";
const API_BASE2 = "http://localhost:8000/api/user";

export const sendUserInput = createAsyncThunk(
  "session/sendUserInput",
  async (inputText, { dispatch, rejectWithValue }) => {
    try {
      if (!inputText.session_id) {
        throw new Error("Session ID is required");
      }

      // First add the user's message to the session
      await dispatch(addChatToSession({ ...inputText }));

      // Then get the AI response
      const response = await axios.post(`${API_BASE1}/chat/`, {
        query: inputText.message,
      });

      // Create the AI's response message
      const llmMessage = {
        id: Date.now(),
        session_id: inputText.session_id,
        sender: "llm",
        message: response.data.response,
        created_at: new Date().toISOString(),
      };

      // Add the AI's response to the session
      await dispatch(addChatToSession({ ...llmMessage }));

      // Return the formatted message for the UI
      return {
        text: response.data.response,
        isUser: false,
      };
    } catch (error) {
      console.error("Error in sendUserInput:", error);
      return rejectWithValue(
        error.response?.data ||
          error.message ||
          "Failed to get response from the model"
      );
    }
  }
);

// Async thunk to create a new session for a user
export const createNewSession = createAsyncThunk(
  "session/createNewSession",
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      if (!userData || !userData.email) {
        throw new Error("User email is required to create a session");
      }

      const response = await axios.post(`${API_BASE2}/sessions/`, {
        user_email: userData.email,
      });

      // After creating the session, fetch all user sessions
      await dispatch(getUserSessions(userData.email));

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message || "Failed to create session"
      );
    }
  }
);

// Async thunk to get all sessions for a user by email
export const getUserSessions = createAsyncThunk(
  "session/getUserSessions",
  async (userEmail, { rejectWithValue }) => {
    try {
      if (!userEmail) {
        throw new Error("User email is required to fetch sessions");
      }

      const response = await axios.get(
        `${API_BASE2}/sessions/?email=${userEmail}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || error.message || "Failed to fetch user sessions"
      );
    }
  }
);

export const addChatToSession = createAsyncThunk(
  "session/addChatToSession",
  async (inputMessage, { rejectWithValue }) => {
    try {
      if (!inputMessage || !inputMessage.session_id) {
        throw new Error("Session ID is required to add chat");
      }

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
        error.response?.data || error.message || "Failed to add chat to session"
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

const initialState = {
  currentSession: null,
  sessions: [],
  messages: [],
  loading: false,
  error: null,
};

// Helper function to get user-specific storage key
const getUserStorageKey = (userId) => `chat_history_${userId}`;

// Helper function to load chat history from localStorage
const loadChatHistory = (userId) => {
  try {
    const stored = localStorage.getItem(getUserStorageKey(userId));
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading chat history:", error);
    return [];
  }
};

// Helper function to save chat history to localStorage
const saveChatHistory = (userId, messages) => {
  try {
    localStorage.setItem(getUserStorageKey(userId), JSON.stringify(messages));
  } catch (error) {
    console.error("Error saving chat history:", error);
  }
};

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setInput: (state, action) => {
      state.input = action.payload;
    },
    setCurrentSession: (state, action) => {
      state.currentSession = action.payload;
      if (action.payload?.user_id) {
        state.messages = loadChatHistory(action.payload.user_id);
      }
    },
    clearSession: (state) => {
      state.input = "";
      state.response = "";
      state.error = null;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
      if (state.currentSession?.user_id) {
        saveChatHistory(state.currentSession.user_id, state.messages);
      }
    },
    clearMessages: (state) => {
      state.messages = [];
      if (state.currentSession?.user_id) {
        localStorage.removeItem(
          getUserStorageKey(state.currentSession.user_id)
        );
      }
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
        if (action.payload) {
          state.messages.push(action.payload);
          if (state.currentSession?.user_id) {
            saveChatHistory(state.currentSession.user_id, state.messages);
          }
        }
      })
      .addCase(sendUserInput.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create new session
      .addCase(createNewSession.fulfilled, (state, action) => {
        state.currentSession = action.payload;
      })

      // Get all sessions for user
      .addCase(getUserSessions.fulfilled, (state, action) => {
        state.sessions = action.payload;
      })

      .addCase(addChatToSession.fulfilled, (state, action) => {
        state.currentSession.session_chats = action.payload.session_chats;
      })

      // Delete a session
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter(
          (session) => session.id !== action.payload
        );
      });
  },
});

export const { setInput, clearSession, setCurrentSession } =
  sessionSlice.actions;
export default sessionSlice.reducer;
