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

// Styled components
const ChatContainer = styled(Paper)(({ theme }) => ({
  height: "calc(100vh - 200px)",
  display: "flex",
  flexDirection: "column",
  backgroundColor: "#f8f9fa",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: "auto",
  padding: theme.spacing(2),
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f1f1f1",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#888",
    borderRadius: "4px",
  },
}));

const MessageBubble = styled(Box)(({ theme, isUser }) => ({
  maxWidth: "80%",
  margin: "8px 0",
  padding: "16px 20px",
  borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
  backgroundColor: isUser ? theme.palette.primary.main : "#fff",
  color: isUser ? "#fff" : theme.palette.text.primary,
  alignSelf: isUser ? "flex-end" : "flex-start",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  width: "fit-content",
  "& ul": {
    margin: "8px 0",
    paddingLeft: "0",
    listStyleType: "none",
  },
  "& li": {
    marginBottom: "12px",
    fontSize: "0.95rem",
    lineHeight: "1.6",
    position: "relative",
    paddingLeft: "20px",
    "&::before": {
      content: '""',
      position: "absolute",
      left: "0",
      top: "8px",
      width: "6px",
      height: "6px",
      backgroundColor: isUser ? "#fff" : theme.palette.primary.main,
      borderRadius: "50%",
    },
  },
  "& h6": {
    fontWeight: 600,
    marginBottom: "16px",
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
  backgroundColor: "#fff",
  borderTop: "1px solid #e0e0e0",
  gap: theme.spacing(1),
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
            <Typography
              key={index}
              variant="h6"
              sx={{
                mt: index === 0 ? 0 : 2,
                mb: 1,
                color: "primary.main",
                fontWeight: 600,
                fontSize: "1.1rem",
                borderBottom: "1px solid rgba(25, 118, 210, 0.2)",
                paddingBottom: "8px",
              }}
            >
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
            <Box key={index} sx={{ mb: 2 }}>
              <List
                sx={{
                  listStyleType: "disc",
                  pl: 2,
                  "& .MuiListItem-root": {
                    display: "list-item",
                    pl: 0.5,
                    py: 0.5,
                  },
                }}
              >
                {lines.map((line, i) => {
                  // Remove any existing bullet points or dashes
                  const cleanLine = line.replace(/^[-•*]\s*/, "").trim();
                  return (
                    <ListItem
                      key={i}
                      sx={{
                        color: "text.primary",
                        fontSize: "0.95rem",
                        lineHeight: 1.6,
                      }}
                    >
                      <Typography variant="body1">{cleanLine}</Typography>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          );
        }
      })}
    </Box>
  );
};

const Chatbot = () => {
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

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/ai/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { text: data.response, isUser: false }]);
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
      const response = await fetch("http://localhost:8000/api/ai/clear/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Clear the messages state and input
      setMessages([]);
      setInput("");

      // Show success message
      setSnackbar({
        open: true,
        message: "New chat started",
        severity: "success",
      });

      // Force a re-render of the welcome message
      setTimeout(() => {
        scrollToBottom();
      }, 100);
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
      const response = await fetch("http://localhost:8000/api/ai/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { text: data.response, isUser: false }]);
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
            backgroundColor: "primary.main",
            color: "white",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SmartToyIcon />
            <Typography variant="h6">Medical Assistant</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="New Chat">
              <IconButton
                color="inherit"
                onClick={handleNewChat}
                disabled={isLoading}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear History">
              <IconButton
                color="inherit"
                onClick={handleClearChat}
                disabled={isLoading}
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
                sx={{ fontSize: 60, mb: 2, color: "primary.main" }}
              />
              <Typography variant="h6" gutterBottom>
                Welcome to LLMediCare Assistant
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Ask me any medical questions, and I'll do my best to help you.
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  maxWidth: "80%",
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
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
                  sx={{ justifyContent: "flex-start", textAlign: "left" }}
                >
                  What are common symptoms of flu and cold?
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() =>
                    handleExampleClick("How can I maintain a healthy heart?")
                  }
                  sx={{ justifyContent: "flex-start", textAlign: "left" }}
                >
                  How can I maintain a healthy heart?
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleExampleClick("What is a balanced diet?")}
                  sx={{ justifyContent: "flex-start", textAlign: "left" }}
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
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: message.isUser ? "flex-end" : "flex-start",
                    mb: 2,
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
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        <SmartToyIcon />
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
                      <Avatar sx={{ bgcolor: "secondary.main" }}>
                        <PersonIcon />
                      </Avatar>
                    )}
                  </Box>
                </Box>
              </Box>
            ))
          )}

          {isLoading && (
            <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
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
            disabled={isLoading}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "24px",
              },
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSend}
            disabled={isLoading}
            sx={{ borderRadius: "24px", px: 3 }}
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
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Chatbot;
