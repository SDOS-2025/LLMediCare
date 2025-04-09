import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Container,
  IconButton,
  CircularProgress,
  Divider,
  Avatar,
  Tooltip,
  Snackbar,
  Alert,
  List,
  ListItem,
  Drawer,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";
import ChatIcon from "@mui/icons-material/Chat";
import MenuIcon from "@mui/icons-material/Menu";
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import {
  sendUserInput,
  createNewSession,
  getUserSessions,
  setCurrentSession,
  clearMessages,
} from "../store/slices/sessionSlice";

// Styled components
const ChatContainer = styled(Paper)(({ theme }) => ({
  height: "calc(100vh - 200px)",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#ffffff",
  borderRadius: "24px",
  overflow: "hidden",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
  border: "1px solid rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
  },
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: theme.spacing(3),
  background: "linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)",
  "&::-webkit-scrollbar": {
    width: "6px",
  },
  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#cbd5e1",
    borderRadius: "12px",
    "&:hover": {
      background: "#94a3b8",
    },
  },
}));

const MessageBubble = styled(Box)(({ theme, isUser }) => ({
  maxWidth: "80%",
  margin: "12px 0",
  padding: "16px 24px",
  borderRadius: isUser ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
  backgroundColor: isUser ? theme.palette.primary.main : "#f8fafc",
  color: isUser ? "#fff" : theme.palette.text.primary,
  alignSelf: isUser ? "flex-end" : "flex-start",
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  width: "fit-content",
  transition: "transform 0.2s ease",
  "&:hover": {
    transform: "translateY(-1px)",
  },
  "& .MuiList-root": {
    padding: 0,
    marginTop: "8px",
    marginBottom: "8px",
  },
  "& .MuiListItem-root": {
    display: "flex",
    alignItems: "flex-start",
    padding: "4px 0",
    "&::before": {
      content: '"•"',
      color: isUser ? "#fff" : theme.palette.primary.main,
      marginRight: "12px",
      fontSize: "1.2rem",
      lineHeight: 1.5,
    },
  },
  "& .MuiTypography-h6": {
    fontWeight: 600,
    marginBottom: "12px",
    color: isUser ? "#fff" : theme.palette.primary.main,
    fontSize: "1.1rem",
    borderBottom: `1px solid ${
      isUser ? "rgba(255,255,255,0.2)" : "rgba(25,118,210,0.2)"
    }`,
    paddingBottom: "8px",
  },
}));

const InputContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  padding: theme.spacing(2),
  backgroundColor: "#ffffff",
  borderTop: "1px solid rgba(0,0,0,0.06)",
  gap: theme.spacing(1),
  position: "relative",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "1px",
    background:
      "linear-gradient(90deg, transparent, rgba(0,0,0,0.05), transparent)",
  },
}));

const formatResponse = (text) => {
  // First, clean up any extra dashes and asterisks
  let cleanText = text.replace(/--/g, "").replace(/\*\*\*\*/g, "**");

  // Split the response into sections
  const sections = cleanText.split("**").filter((section) => section.trim());

  return (
    <Box sx={{ width: "100%" }}>
      {sections.map((section, index) => {
        if (index % 2 === 0) {
          // This is a section header
          return (
            <Typography key={index} variant="h6" gutterBottom>
              {section.trim()}
            </Typography>
          );
        } else {
          // This is content section
          const lines = section
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line);

          return (
            <List key={index} dense>
              {lines.map((line, i) => {
                // Remove any existing bullet points or dashes
                const cleanLine = line.replace(/^[-•*]\s*/, "").trim();
                return (
                  <ListItem key={i}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: "0.95rem",
                        lineHeight: 1.6,
                        display: "block",
                        width: "100%",
                      }}
                    >
                      {cleanLine}
                    </Typography>
                  </ListItem>
                );
              })}
            </List>
          );
        }
      })}
    </Box>
  );
};

const Chatbot = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);
  const currentSession = useSelector((state) => state.session.currentSession);
  const allSessions = useSelector((state) => state.session.sessions);
  const loading = useSelector((state) => state.session.loading);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const messagesEndRef = useRef(null);

  // Load user's chat sessions when component mounts or when user changes
  useEffect(() => {
    const loadUserSessions = async () => {
      if (currentUser?.email) {
        console.log("Loading sessions for user:", currentUser.email);
        try {
          await dispatch(getUserSessions(currentUser.email));
          console.log("User sessions loaded successfully");
        } catch (error) {
          console.error("Failed to load user sessions:", error);
          setSnackbar({
            open: true,
            message:
              "Failed to load your chat history. Please refresh the page.",
            severity: "error",
          });
        }
      } else {
        console.log("No user logged in, skipping session loading");
      }
    };

    loadUserSessions();
  }, [dispatch, currentUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize messages from current session if available
  useEffect(() => {
    if (
      currentSession &&
      currentSession.session_chats &&
      currentSession.session_chats.length > 0
    ) {
      const formattedMessages = currentSession.session_chats.map((chat) => ({
        text: chat.message || chat.content,
        isUser: chat.sender === "user",
      }));
      setMessages(formattedMessages);
    } else {
      setMessages([]);
    }
  }, [currentSession]);

  // Update loading state based on Redux loading state
  useEffect(() => {
    setIsLoading(loading);
  }, [loading]);

  // Add a debug log to see what's happening with the response
  useEffect(() => {
    console.log("Current session:", currentSession);
    console.log("Current messages:", messages);
    console.log("All sessions:", allSessions);
  }, [currentSession, messages, allSessions]);

  const formatSessionTitle = (session) => {
    if (!session) return "New Chat";

    // Get the first message or use default text
    if (session.session_chats && session.session_chats.length > 0) {
      const firstUserMessage = session.session_chats.find(
        (chat) => chat.sender === "user"
      );
      if (firstUserMessage) {
        const content =
          firstUserMessage.content || firstUserMessage.message || "";
        // Truncate to 20 characters
        return content.length > 20 ? content.substring(0, 20) + "..." : content;
      }
    }

    // Fall back to date if no message content
    return new Date(session.created_at).toLocaleString();
  };

  const handleSwitchSession = (session) => {
    dispatch(setCurrentSession(session));
    setDrawerOpen(false);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      // Check if we have a user first
      if (!currentUser) {
        console.error("No currentUser available");
        setSnackbar({
          open: true,
          message: "Please log in to send messages",
          severity: "warning",
        });
        setIsLoading(false);
        return;
      }

      console.log("Current user:", currentUser);
      let sessionId = currentSession?.id;
      console.log("Current session:", currentSession);

      // If no current session exists, create a new one
      if (!sessionId) {
        console.log(
          "No session ID available, creating new session for user:",
          currentUser
        );
        try {
          // Create a new session
          const newSession = await dispatch(
            createNewSession(currentUser)
          ).unwrap();
          console.log("Created new session:", newSession);

          if (!newSession || !newSession.id) {
            throw new Error("Failed to create a valid session");
          }

          sessionId = newSession.id;
          console.log("Created new session with ID:", sessionId);
        } catch (error) {
          console.error("Error creating session:", error);
          setSnackbar({
            open: true,
            message: `Failed to create a new chat session: ${
              error.message || "Unknown error"
            }`,
            severity: "error",
          });
          setIsLoading(false);
          return;
        }
      }

      // Double-check that we have a valid session ID
      if (!sessionId) {
        console.error("Still no session ID available after creation attempt");
        setSnackbar({
          open: true,
          message: "Unable to send message: No valid session",
          severity: "error",
        });
        setIsLoading(false);
        return;
      }

      // Proceed with sending the message
      const messageData = {
        id: Date.now(),
        session_id: sessionId,
        sender: "user",
        message: userMessage,
        created_at: new Date().toISOString(),
      };

      console.log("Sending message with data:", messageData);

      try {
        // Send user message and get the response
        const result = await dispatch(sendUserInput(messageData)).unwrap();
        console.log("Message sent successfully, got result:", result);

        // Directly update the messages state with the response
        if (result && result.text) {
          setMessages((prev) => [
            ...prev,
            { text: result.text, isUser: false },
          ]);
        } else {
          console.error("Invalid response format:", result);
          throw new Error("Invalid response from server");
        }
      } catch (error) {
        console.error("Error sending message:", error);
        // Add a more descriptive error message to help debug
        let errorMessage = "An error occurred while sending the message";

        if (error.message) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        } else if (error.response) {
          errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
        }

        setMessages((prev) => [
          ...prev,
          {
            text: `**Error**\n- I apologize, but I encountered an error sending your message.\n- ${errorMessage}\n- Please try again later.`,
            isUser: false,
          },
        ]);
        setSnackbar({
          open: true,
          message: `Failed to get a response: ${errorMessage}`,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("General error in handleSend:", error);
      let errorMessage = "Unknown error";
      if (error?.message) errorMessage = error.message;

      setMessages((prev) => [
        ...prev,
        {
          text: `**Error**\n- I apologize, but I encountered an error.\n- ${errorMessage}\n- Please try again later.`,
          isUser: false,
        },
      ]);
      setSnackbar({
        open: true,
        message: `Error: ${errorMessage}`,
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      // First clear the AI agent chat history
      const aiClearResponse = await fetch(
        "http://localhost:8000/api/ai/clear/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
        }
      );

      if (!aiClearResponse.ok) {
        const errorData = await aiClearResponse.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${aiClearResponse.status}`
        );
      }

      // If we have a current session, also clear the session chat history
      if (currentSession?.id) {
        const sessionClearResponse = await fetch(
          `http://localhost:8000/api/user/sessions/${currentSession.id}/clear_chats/`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            credentials: "include",
          }
        );

        if (!sessionClearResponse.ok) {
          console.warn(
            "Could not clear session chats:",
            sessionClearResponse.status
          );
        }
      }

      // Dispatch the clearMessages action to Redux
      dispatch(clearMessages());

      // Also update local component state
      setMessages([]);
      setInput("");
      setSnackbar({
        open: true,
        message: "Chat history cleared successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error clearing chat:", error);
      setSnackbar({
        open: true,
        message: "Failed to clear chat history. Please try again.",
        severity: "error",
      });
    }
  };

  const handleNewChat = async () => {
    try {
      if (currentUser) {
        // Create a new session but preserve previous sessions
        const newSession = await dispatch(
          createNewSession(currentUser)
        ).unwrap();

        // Set the new session as current
        dispatch(setCurrentSession(newSession));

        // Clear messages for this new session
        setMessages([]);
        setInput("");

        // Get all sessions to update the sidebar
        dispatch(getUserSessions(currentUser.email));

        setSnackbar({
          open: true,
          message: "New chat started",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error starting new chat:", error);
      setSnackbar({
        open: true,
        message: "Failed to start new chat. Please try again.",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleExampleClick = async (question) => {
    setInput(question);
    // We need to manually trigger handleSend with the question
    const userMessage = question.trim();
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      let sessionId = currentSession?.id;

      // If no current session exists, create a new one
      if (!sessionId && currentUser) {
        try {
          const newSession = await dispatch(
            createNewSession(currentUser)
          ).unwrap();
          sessionId = newSession.id;
          console.log("Created new session with ID:", sessionId);
        } catch (error) {
          console.error("Error creating session:", error);
          setSnackbar({
            open: true,
            message: "Failed to create a new chat session. Please try again.",
            severity: "error",
          });
          setIsLoading(false);
          return;
        }
      }

      if (!sessionId) {
        console.error("No session ID available");
        setSnackbar({
          open: true,
          message: "Unable to send message. Please try again.",
          severity: "error",
        });
        setIsLoading(false);
        return;
      }

      const messageData = {
        id: Date.now(),
        session_id: sessionId,
        sender: "user",
        message: userMessage,
        created_at: new Date().toISOString(),
      };

      console.log("Sending example message with data:", messageData);

      // Send user message and get the response
      const result = await dispatch(sendUserInput(messageData)).unwrap();
      console.log("Example message sent successfully:", result);

      // Directly update the messages state with the response
      if (result && result.text) {
        setMessages((prev) => [...prev, { text: result.text, isUser: false }]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "**Error**\n- I apologize, but I encountered an error.\n- Please try again later.",
          isUser: false,
        },
      ]);
      setSnackbar({
        open: true,
        message: "Failed to get a response from the server. Please try again.",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <ChatContainer elevation={3}>
        <Box
          sx={{
            p: 2,
            background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              color="inherit"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 1 }}
              aria-label="Menu"
            >
              <MenuIcon />
            </IconButton>
            <SmartToyIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {currentSession
                ? formatSessionTitle(currentSession)
                : "Medical Assistant"}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="New Chat">
              <IconButton
                color="inherit"
                onClick={handleNewChat}
                disabled={loading}
                aria-label="New Chat"
                sx={{
                  transition: "transform 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear Chat">
              <IconButton
                color="inherit"
                onClick={handleClearChat}
                disabled={loading || messages.length === 0}
                aria-label="Clear Chat"
                sx={{
                  transition: "transform 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.1)",
                  },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Chat History Drawer */}
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Box sx={{ width: 300, pt: 2 }}>
            <Typography variant="h6" sx={{ px: 2, pb: 2, fontWeight: 600 }}>
              Chat History
            </Typography>
            <Divider />
            <List>
              <ListItemButton
                onClick={handleNewChat}
                sx={{
                  backgroundColor: !currentSession
                    ? "rgba(25, 118, 210, 0.1)"
                    : "transparent",
                  "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.2)" },
                }}
              >
                <ListItemIcon>
                  <AddIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary="New Chat" />
              </ListItemButton>

              {allSessions && allSessions.length > 0 ? (
                allSessions.map((session) => (
                  <ListItemButton
                    key={session.id}
                    onClick={() => handleSwitchSession(session)}
                    sx={{
                      backgroundColor:
                        currentSession?.id === session.id
                          ? "rgba(25, 118, 210, 0.1)"
                          : "transparent",
                      "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.2)" },
                    }}
                  >
                    <ListItemIcon>
                      <ChatIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={formatSessionTitle(session)}
                      secondary={new Date(session.created_at).toLocaleString()}
                    />
                  </ListItemButton>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No previous chats" />
                </ListItem>
              )}
            </List>
          </Box>
        </Drawer>

        <MessagesContainer>
          {messages.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "text.secondary",
                textAlign: "center",
                p: 3,
              }}
            >
              <SmartToyIcon
                sx={{
                  fontSize: 80,
                  mb: 2,
                  color: "primary.main",
                  animation: "float 3s ease-in-out infinite",
                  "@keyframes float": {
                    "0%, 100%": {
                      transform: "translateY(0)",
                    },
                    "50%": {
                      transform: "translateY(-10px)",
                    },
                  },
                }}
              />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Welcome to LLMediCare Assistant
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, maxWidth: "600px" }}>
                Ask me any medical questions, and I'll do my best to help you
                with accurate and reliable information.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  maxWidth: "80%",
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="primary"
                >
                  Example questions you can ask:
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() =>
                    handleExampleClick(
                      "What are common symptoms of flu and cold?"
                    )
                  }
                  disabled={loading}
                  sx={{
                    justifyContent: "flex-start",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateX(5px)",
                      backgroundColor: "rgba(25, 118, 210, 0.04)",
                    },
                  }}
                >
                  What are common symptoms of flu and cold?
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() =>
                    handleExampleClick("How can I maintain a healthy heart?")
                  }
                  disabled={loading}
                  sx={{
                    justifyContent: "flex-start",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateX(5px)",
                      backgroundColor: "rgba(25, 118, 210, 0.04)",
                    },
                  }}
                >
                  How can I maintain a healthy heart?
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleExampleClick("What is a balanced diet?")}
                  disabled={loading}
                  sx={{
                    justifyContent: "flex-start",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateX(5px)",
                      backgroundColor: "rgba(25, 118, 210, 0.04)",
                    },
                  }}
                >
                  What is a balanced diet?
                </Button>
              </Box>
            </Box>
          ) : (
            messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  animation: "fadeIn 0.3s ease",
                  "@keyframes fadeIn": {
                    from: {
                      opacity: 0,
                      transform: "translateY(10px)",
                    },
                    to: {
                      opacity: 1,
                      transform: "translateY(0)",
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: message.isUser ? "flex-end" : "flex-start",
                    mb: 2,
                    width: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1,
                      maxWidth: "85%",
                    }}
                  >
                    {!message.isUser && (
                      <Avatar
                        sx={{
                          bgcolor: "primary.main",
                          width: 32,
                          height: 32,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        <SmartToyIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                    )}
                    <MessageBubble isUser={message.isUser}>
                      {message.isUser ? (
                        <Typography>{message.text}</Typography>
                      ) : (
                        formatResponse(message.text)
                      )}
                    </MessageBubble>
                    {message.isUser && (
                      <Avatar
                        sx={{
                          bgcolor: "secondary.main",
                          width: 32,
                          height: 32,
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                    )}
                  </Box>
                </Box>
              </Box>
            ))
          )}

          {loading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                my: 2,
                animation: "pulse 1.5s ease-in-out infinite",
                "@keyframes pulse": {
                  "0%, 100%": {
                    opacity: 1,
                  },
                  "50%": {
                    opacity: 0.5,
                  },
                },
              }}
            >
              <CircularProgress size={24} />
            </Box>
          )}

          <div ref={messagesEndRef} />
        </MessagesContainer>

        <Divider />

        <InputContainer>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your medical question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "primary.main",
                  borderWidth: "2px",
                },
              },
              "& .MuiInputBase-input": {
                fontSize: "0.95rem",
              },
            }}
          />
          <Tooltip title="Send Message">
            <span>
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                aria-label="Send Message"
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  borderRadius: "12px",
                  height: "48px",
                  width: "48px",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                  "&.Mui-disabled": {
                    backgroundColor: "rgba(25, 118, 210, 0.3)",
                    color: "white",
                  },
                  transition: "transform 0.2s",
                  "&:hover:not(.Mui-disabled)": {
                    transform: "scale(1.05)",
                  },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <SendIcon />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </InputContainer>
      </ChatContainer>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Chatbot;
