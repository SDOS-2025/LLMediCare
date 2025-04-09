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
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { sendUserInput, createNewSession } from "../store/slices/sessionSlice";

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
  const currentSession = useSelector((state) => state.session.cur_session);
  const loading = useSelector((state) => state.session.loading);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const messagesEndRef = useRef(null);

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
  }, [currentSession, messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
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

      console.log("Sending message with data:", messageData);

      // Send user message and get the response
      const result = await dispatch(sendUserInput(messageData)).unwrap();
      console.log("Message sent successfully:", result);

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
    }
  };

  const handleClearChat = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/ai/clear/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

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
        await dispatch(createNewSession(currentUser));
        setMessages([]);
        setInput("");
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
            <SmartToyIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Medical Assistant
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="New Chat">
              <IconButton
                color="inherit"
                onClick={handleNewChat}
                disabled={loading}
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
            <Tooltip title="Clear History">
              <IconButton
                color="inherit"
                onClick={handleClearChat}
                disabled={loading}
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
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "24px",
                backgroundColor: "#f8fafc",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#f1f5f9",
                },
                "&.Mui-focused": {
                  backgroundColor: "#ffffff",
                  boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
                },
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSend}
            disabled={loading}
            sx={{
              borderRadius: "24px",
              px: 3,
              py: 1,
              transition: "all 0.2s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
              },
            }}
            endIcon={<SendIcon />}
          >
            Send
          </Button>
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
