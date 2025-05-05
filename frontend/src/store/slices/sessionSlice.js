import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api-config"; // Import our improved API client
import { USER_API_URL, AI_API_URL } from "../../utils/environment";

// Base API URL
const API_BASE1 = AI_API_URL;
const API_BASE2 = USER_API_URL;

// Remove existing axios config since we're using the API client
// Configure axios defaults
// axios.defaults.withCredentials = true;  // Removing this line as it's causing CORS issues
// axios.defaults.timeout = 30000; // 30 seconds timeout

// Remove existing axios interceptors since they're in the API client
// We don't need these anymore since they're in the API client

export const sendUserInput = createAsyncThunk(
  "session/sendUserInput",
  async (inputText, { dispatch, rejectWithValue }) => {
    try {
      console.log("sendUserInput called with:", inputText);

      if (!inputText.session_id) {
        console.error("Session ID is missing in inputText:", inputText);
        throw new Error("Session ID is required");
      }

      // First add the user's message to the session
      try {
        console.log("Adding user message to session:", inputText);
        await dispatch(addChatToSession({ ...inputText })).unwrap();
      } catch (error) {
        console.error("Error adding user message to session:", error);
        // Continue even if this fails to try to get an AI response
      }

      // Prepare API request data - include context if provided
      const requestData = {
        query: inputText.message,
      };

      // Add context data if it exists (for medical report follow-up questions)
      if (inputText.context) {
        console.log("Including context in API request:", inputText.context);
        requestData.context = inputText.context;
      }

      // Then get the AI response
      console.log("Calling AI endpoint with data:", requestData);
      const response = await api.post(`${API_BASE1}/chat/`, requestData);

      console.log("Got AI response:", response.data);

      // Create the AI's response message
      const llmMessage = {
        id: Date.now(),
        session_id: inputText.session_id,
        sender: "llm",
        message: response.data.response,
        created_at: new Date().toISOString(),
      };

      // Add the AI's response to the session
      try {
        console.log("Adding AI response to session:", llmMessage);
        await dispatch(addChatToSession({ ...llmMessage })).unwrap();
      } catch (error) {
        console.error("Error adding AI response to session:", error);
        // Continue to return the response even if saving to session fails
      }

      // Return the formatted message for the UI
      return {
        text: response.data.response,
        isUser: false,
      };
    } catch (error) {
      console.error("Error in sendUserInput:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data ||
        error.message ||
        "Failed to get response from the model";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to create a new session for a user
export const createNewSession = createAsyncThunk(
  "session/createNewSession",
  async (userData, { dispatch, rejectWithValue }) => {
    try {
      console.log("Creating new session for user:", userData);

      // Extract email from user object
      let userEmail;
      if (typeof userData === "string") {
        userEmail = userData;
      } else if (userData && userData.email) {
        userEmail = userData.email;
      } else if (userData && userData.user && userData.user.email) {
        // Some user objects are nested
        userEmail = userData.user.email;
      } else {
        console.error("Invalid user data format:", userData);
        throw new Error("Valid user email is required to create a session");
      }

      console.log("Using email:", userEmail);

      const response = await api.post(`${API_BASE2}/sessions/`, {
        user_email: userEmail,
      });

      console.log("Session created successfully:", response.data);

      // After creating the session, fetch all user sessions
      await dispatch(getUserSessions(userEmail));

      return response.data;
    } catch (error) {
      console.error("Error creating session:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
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
      // Extract email if it's an object
      let email = userEmail;
      if (typeof userEmail === "object") {
        if (userEmail.email) {
          email = userEmail.email;
        } else if (userEmail.user && userEmail.user.email) {
          email = userEmail.user.email;
        } else {
          console.error("Invalid user email format:", userEmail);
          throw new Error("User email is required to fetch sessions");
        }
      }

      if (!email) {
        console.error("Missing email in:", userEmail);
        throw new Error("User email is required to fetch sessions");
      }

      console.log(`Fetching sessions for user email: ${email}`);
      const response = await api.get(`${API_BASE2}/sessions/?email=${email}`);
      console.log("Got user sessions:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
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
      console.log("addChatToSession called with:", inputMessage);

      if (!inputMessage || !inputMessage.session_id) {
        console.error("Missing session_id in message:", inputMessage);
        throw new Error("Session ID is required to add chat");
      }

      const message = {
        id: inputMessage.id,
        sender: inputMessage.sender,
        content: inputMessage.message,
        created_at: inputMessage.created_at,
      };

      console.log("Formatted message:", message);
      console.log(
        `Sending to ${API_BASE2}/sessions/${inputMessage.session_id}/add_chat/`
      );

      try {
        const response = await api.post(
          `${API_BASE2}/sessions/${inputMessage.session_id}/add_chat/`,
          { message: message },
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );
        console.log("Add chat response:", response.data);
        return response.data;
      } catch (error) {
        console.error("API error in addChatToSession:", error);
        if (error.response) {
          console.error("Response status:", error.response.status);
          console.error("Response data:", error.response.data);
        }
        throw error;
      }
    } catch (error) {
      console.error("Error in addChatToSession:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data ||
        error.message ||
        "Failed to add chat to session";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async thunk to delete a session by ID
export const deleteSession = createAsyncThunk(
  "session/deleteSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      await api.delete(`${API_BASE2}/sessions/${sessionId}/`);
      return sessionId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete session"
      );
    }
  }
);

// Make sure the state contains the right properties
const initialState = {
  currentSession: null,
  sessions: [], // All user sessions
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

// Helper function to save session in localStorage
const saveUserSessions = (userEmail, sessions) => {
  try {
    localStorage.setItem(
      `user_sessions_${userEmail}`,
      JSON.stringify(sessions)
    );
  } catch (error) {
    console.error("Error saving user sessions:", error);
  }
};

// Helper function to load sessions from localStorage
const loadUserSessions = (userEmail) => {
  try {
    const stored = localStorage.getItem(`user_sessions_${userEmail}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error loading user sessions:", error);
    return [];
  }
};

// Add this function to clear all session-related data from localStorage
export const clearAllStoredSessions = () => {
  try {
    // Get all keys from localStorage
    const keys = Object.keys(localStorage);

    // Find and remove all session-related keys
    keys.forEach((key) => {
      if (
        key.startsWith("chat_history_") ||
        key.startsWith("user_sessions_") ||
        key.startsWith("current_session")
      ) {
        localStorage.removeItem(key);
      }
    });

    console.log("All localStorage session data cleared");
    return true;
  } catch (error) {
    console.error("Error clearing localStorage:", error);
    return false;
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
    removeMessage: (state, action) => {
      // Remove a message by ID
      state.messages = state.messages.filter(
        (message) => message.id !== action.payload
      );
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
    clearAllLocalStorage: (state) => {
      clearAllStoredSessions();
      state.sessions = [];
      state.currentSession = null;
      state.messages = [];
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
      .addCase(createNewSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(createNewSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
        // Don't reset all messages here to preserve history

        // If this session doesn't already exist in our sessions array
        const sessionExists = state.sessions.some(
          (session) => session.id === action.payload.id
        );

        if (!sessionExists) {
          // Add the new session to the sessions array
          state.sessions = [action.payload, ...state.sessions];

          // Save updated sessions to localStorage if we have user email
          if (action.payload.user_email) {
            saveUserSessions(action.payload.user_email, state.sessions);
          }
        }
      })
      .addCase(createNewSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get all sessions for user
      .addCase(getUserSessions.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload || [];

        // Save the sessions to localStorage for offline access
        if (
          action.payload &&
          action.payload.length > 0 &&
          action.payload[0].user_email
        ) {
          saveUserSessions(action.payload[0].user_email, action.payload);
        }

        // If we have sessions but no current session, set the most recent as current
        if (state.sessions.length > 0 && !state.currentSession) {
          state.currentSession = state.sessions[0];
        }
      })
      .addCase(getUserSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addChatToSession.fulfilled, (state, action) => {
        if (!action.payload) return;

        state.currentSession.session_chats = action.payload.session_chats;

        // Also update this session in the sessions array
        const sessionIndex = state.sessions.findIndex(
          (session) => session.id === action.payload.id
        );

        if (sessionIndex !== -1) {
          state.sessions[sessionIndex] = action.payload;
        }
      })

      // Delete a session
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.sessions = state.sessions.filter(
          (session) => session.id !== action.payload
        );

        // If the deleted session was the current session, set a new current session
        if (
          state.currentSession &&
          state.currentSession.id === action.payload
        ) {
          state.currentSession =
            state.sessions.length > 0 ? state.sessions[0] : null;
        }
      });
  },
});

export const {
  setInput,
  clearSession,
  setCurrentSession,
  addMessage,
  removeMessage,
  clearMessages,
  clearAllLocalStorage,
} = sessionSlice.actions;

export default sessionSlice.reducer;
