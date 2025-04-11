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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";
import ChatIcon from "@mui/icons-material/Chat";
import MenuIcon from "@mui/icons-material/Menu";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ImageIcon from "@mui/icons-material/Image";
import DescriptionIcon from "@mui/icons-material/Description";
import { styled } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import {
  sendUserInput,
  createNewSession,
  getUserSessions,
  setCurrentSession,
  clearMessages,
  addMessage,
  removeMessage,
} from "../store/slices/sessionSlice";
import axios from "axios";

const formatResponse = (text) => {
  if (!text) return "";

  // Process markdown headings (e.g., ## Heading)
  let formatted = text.replace(
    /^##\s+(.+)$/gm,
    '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>'
  );

  // First detect if this is a numbered list
  const hasNumberedList = /^\d+\.\s+.+$/gm.test(formatted);

  // Format bullet points
  formatted = formatted.replace(
    /^-\s+(.+)$/gm,
    '<li class="ml-5 mb-1">$1</li>'
  );

  // Wrap bullet lists in ul tags
  formatted = formatted.replace(/<\/li>\n<li/g, "</li><li");
  formatted = formatted.replace(
    /(<li[^>]*>.*?<\/li>)/gs,
    '<ul class="list-disc my-2">$1</ul>'
  );

  // Format numbered lists with proper sequential numbering
  if (hasNumberedList) {
    // Find all numbered list items
    const listItems = [];
    const numberPattern = /^(\d+)\.\s+(.+)$/gm;
    let match;

    // Extract all list items
    while ((match = numberPattern.exec(formatted)) !== null) {
      listItems.push({
        number: parseInt(match[1]),
        content: match[2],
        originalText: match[0],
      });
    }

    // Process all numbered list items
    if (listItems.length > 0) {
      // Create the HTML for ordered list
      let olHtml = '<ol class="list-decimal my-2">';

      listItems.forEach((item) => {
        olHtml += `<li value="${item.number}" class="ml-5 mb-1">${item.content}</li>`;
        // Replace the original text with a placeholder
        formatted = formatted.replace(
          item.originalText,
          `__NUMBERED_LIST_ITEM_${item.number}__`
        );
      });

      olHtml += "</ol>";

      // Replace the first placeholder with the full ordered list
      formatted = formatted.replace(
        `__NUMBERED_LIST_ITEM_${listItems[0].number}__`,
        olHtml
      );

      // Remove other placeholders
      for (let i = 1; i < listItems.length; i++) {
        formatted = formatted.replace(
          `__NUMBERED_LIST_ITEM_${listItems[i].number}__`,
          ""
        );
      }
    }
  }

  // Make disclaimer text italicized
  formatted = formatted.replace(
    /\*([^*]+)\*/g,
    '<em class="text-gray-600">$1</em>'
  );

  // Convert double newlines into paragraph breaks for better spacing
  formatted = formatted.replace(/\n\n/g, '</p><p class="my-2">');

  // Wrap in container and clean up empty paragraphs
  formatted =
    '<div class="markdown-content"><p class="my-2">' + formatted + "</p></div>";
  formatted = formatted.replace(/<p class="my-2"><\/p>/g, "");

  return formatted;
};

export default function Chatbot () {
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
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Add state to store medical report data
  const [reportContext, setReportContext] = useState({
    hasReport: false,
    extractedText: "",
    analysis: "",
  });

  // Add context reset tracking after initial state setup
  const [contextRelevanceCounter, setContextRelevanceCounter] = useState(0);
  const MAX_REPORT_RELEVANCE = 3; // After 3 questions, we'll stop including the report context automatically

  // Function to determine if a new message is related to a previous medical report
  const isRelatedToMedicalReport = (message) => {
    const medicalReportKeywords = [
      "report",
      "scan",
      "test",
      "results",
      "diagnosis",
      "doctor",
      "medical",
      "hospital",
      "treatment",
      "cancer",
      "tumor",
      "medication",
      "prescription",
      "therapy",
      "finding",
      "condition",
    ];

    const messageLower = message.toLowerCase();

    // Check if the message contains any medical report related keywords
    return medicalReportKeywords.some((keyword) =>
      messageLower.includes(keyword)
    );
  };

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

      // Determine if we should include report context
      const shouldIncludeReportContext =
        reportContext.hasReport &&
        (isRelatedToMedicalReport(userMessage) ||
          contextRelevanceCounter < MAX_REPORT_RELEVANCE);

      // Include report context if appropriate
      if (shouldIncludeReportContext) {
        messageData.context = {
          report_text: reportContext.extractedText,
          report_analysis: reportContext.analysis,
          is_followup_question: true,
        };
        console.log(
          "Including report context in message:",
          messageData.context
        );

        // Increment the counter for context relevance tracking
        setContextRelevanceCounter((prev) => prev + 1);
      } else if (reportContext.hasReport) {
        // If we have a report but didn't include it, reset the counter
        console.log(
          "Skipping report context for this message - topic appears unrelated"
        );
        setContextRelevanceCounter(0);
      }

      console.log("Sending message with data:", messageData);

      try {
        // Send user message and get the response
        await dispatch(sendUserInput(messageData)).unwrap();
        console.log("Message sent successfully");

        // Don't manually add the AI response here - the response will be handled by the Redux store
        // This fixes the duplicate message issue
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

  // Add a function to reset the medical report context
  const handleResetContext = () => {
    setReportContext({
      hasReport: false,
      extractedText: "",
      analysis: "",
    });
    setContextRelevanceCounter(0);

    setSnackbar({
      open: true,
      message: "Medical report context has been cleared",
      severity: "success",
    });
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

        // Clear any existing report context
        handleResetContext();

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
      await dispatch(sendUserInput(messageData)).unwrap();
      console.log("Example message sent successfully");

      // Don't manually add the AI response here - the response will be handled by the Redux store
      // This fixes the duplicate message issue
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

  const handleUploadButtonClick = () => {
    setUploadDialogOpen(true);
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    setSelectedFile(null);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
    } else {
      setSnackbar({
        open: true,
        message: "Please select a valid image file",
        severity: "error",
      });
    }
  };

  const handleUploadReport = async () => {
    if (!selectedFile) {
      setSnackbar({
        open: true,
        message: "Please select a file first",
        severity: "warning",
      });
      return;
    }

    if (!currentUser) {
      setSnackbar({
        open: true,
        message: "Please log in to upload reports",
        severity: "warning",
      });
      return;
    }

    setIsUploading(true);

    try {
      let sessionId = currentSession?.id;

      if (!sessionId) {
        try {
          const newSession = await dispatch(
            createNewSession(currentUser.email)
          ).unwrap();
          sessionId = newSession.id;
          dispatch(setCurrentSession(newSession));
        } catch (error) {
          console.error("Error creating session:", error);
          setSnackbar({
            open: true,
            message: "Failed to create a new chat session. Please try again.",
            severity: "error",
          });
          setIsUploading(false);
          return;
        }
      }

      // Create form data
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("user_id", currentUser.email);
      formData.append("session_id", sessionId);

      // Add user message about uploading report
      const userMessage = {
        id: Date.now(),
        session_id: sessionId,
        sender: "user",
        message: `I've uploaded a medical report image named "${selectedFile.name}" for analysis.`,
        created_at: new Date().toISOString(),
      };

      dispatch(addMessage(userMessage));

      // Display a loading message while processing
      const tempLoadingMessage = {
        id: Date.now() + 1,
        session_id: sessionId,
        sender: "assistant",
        message:
          "I'm analyzing your medical report image. This may take a moment...",
        created_at: new Date().toISOString(),
        isLoading: true,
      };

      dispatch(addMessage(tempLoadingMessage));

      console.log("Uploading medical report to backend...");

      // Upload the file to the backend
      try {
        const response = await axios.post(
          "http://localhost:8000/api/ai/process-medical-report/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            timeout: 120000, // Increase timeout to 120 seconds (2 minutes)
          }
        );

        console.log("Upload response:", response.data);

        // Remove the loading message - use the proper action
        dispatch(removeMessage(tempLoadingMessage.id));

        if (response.data && response.data.success) {
          console.log("OCR analysis:", response.data.analysis);
          console.log("Current sessionId:", sessionId);

          // Store the report data in context for future reference
          setReportContext({
            hasReport: true,
            extractedText: response.data.extracted_text,
            analysis: response.data.analysis,
          });

          // Format the analysis in a readable way - create message object first
          const analysisMessage = {
            id: Date.now() + 2,
            session_id: sessionId,
            sender: "assistant",
            message: `# Medical Report Analysis\n\n${response.data.analysis}\n\n## Recommendations\nBased on this medical report, I recommend:\n- Follow any prescribed medications exactly as directed\n- Schedule follow-up appointments as mentioned in the report\n- Monitor your symptoms and report any changes to your doctor\n- Maintain a healthy lifestyle with proper diet and exercise as appropriate for your condition\n\n*Disclaimer: This analysis is based on OCR text extraction and may not be fully accurate. Always consult with a healthcare professional for proper medical advice.*`,
            created_at: new Date().toISOString(),
          };

          console.log("Dispatching analysis message:", analysisMessage);

          // Add the message both to Redux store and local state
          dispatch(addMessage(analysisMessage));
          setMessages((prev) => [
            ...prev,
            { text: analysisMessage.message, isUser: false },
          ]);

          // Add a follow-up question to encourage conversation
          setTimeout(() => {
            const followUpMessage = {
              id: Date.now() + 3,
              session_id: sessionId,
              sender: "assistant",
              message:
                "Do you have any questions about the report or need clarification on any part of the analysis?",
              created_at: new Date().toISOString(),
            };

            dispatch(addMessage(followUpMessage));
            setMessages((prev) => [
              ...prev,
              { text: followUpMessage.message, isUser: false },
            ]);
          }, 2000);

          setSnackbar({
            open: true,
            message: "Medical report processed successfully",
            severity: "success",
          });
        } else {
          console.log("OCR processing failed:", response.data);

          const errorMessage = {
            id: Date.now() + 2,
            session_id: sessionId,
            sender: "assistant",
            message: `I couldn't properly analyze the report image. ${
              response.data?.error ||
              "Please make sure the image is clear and contains readable text."
            }`,
            created_at: new Date().toISOString(),
          };

          dispatch(addMessage(errorMessage));
          setMessages((prev) => [
            ...prev,
            { text: errorMessage.message, isUser: false },
          ]);

          setSnackbar({
            open: true,
            message:
              response.data?.error || "Failed to process the medical report",
            severity: "error",
          });
        }
      } catch (uploadError) {
        console.error("Error during upload:", uploadError);

        // Remove the loading message - use the proper action
        dispatch(removeMessage(tempLoadingMessage.id));

        // Add more detailed error message
        let errorDetail = "An unknown error occurred";

        if (uploadError.response) {
          // Server responded with an error
          errorDetail =
            uploadError.response.data?.error ||
            `Server error: ${uploadError.response.status}`;
        } else if (uploadError.code === "ECONNABORTED") {
          // Timeout error
          errorDetail =
            "The request timed out. The image may be too large or complex for processing. Try using a clearer or smaller image.";
        } else if (uploadError.message === "Network Error") {
          errorDetail =
            "Backend server may not be running. Please check your server connection.";
        } else {
          errorDetail = uploadError.message;
        }

        const errorMessage = {
          id: Date.now() + 2,
          session_id: sessionId,
          sender: "assistant",
          message: `I encountered an error while processing your medical report: ${errorDetail}`,
          created_at: new Date().toISOString(),
        };

        dispatch(addMessage(errorMessage));
        // Also update local state directly for immediate display
        setMessages((prev) => [
          ...prev,
          { text: errorMessage.message, isUser: false },
        ]);

        setSnackbar({
          open: true,
          message: errorDetail,
          severity: "error",
        });
      }
    } catch (error) {
      console.error("General error in handleUploadReport:", error);

      const generalErrorMsg = {
        id: Date.now() + 2,
        session_id: currentSession?.id,
        sender: "assistant",
        message:
          "I'm sorry, but I encountered an error while processing your medical report. Please try again later.",
        created_at: new Date().toISOString(),
      };

      dispatch(addMessage(generalErrorMsg));
      // Also update local state directly
      setMessages((prev) => [
        ...prev,
        { text: generalErrorMsg.message, isUser: false },
      ]);

      setSnackbar({
        open: true,
        message:
          error.response?.data?.error || "Error processing medical report",
        severity: "error",
      });
    } finally {
      setIsUploading(false);
      setUploadDialogOpen(false);
      setSelectedFile(null);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {reportContext.hasReport && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(25, 118, 210, 0.1)",
            padding: "8px 16px",
            borderRadius: "8px",
            marginBottom: "12px",
            gap: 1,
          }}
        >
          <DescriptionIcon color="primary" fontSize="small" />
          <Typography variant="body2" color="primary.main">
            Medical report context is active - your questions will be answered
            in relation to your uploaded report
          </Typography>
          <Button
            size="small"
            variant="outlined"
            onClick={handleResetContext}
            sx={{ ml: 2, minWidth: "auto", padding: "2px 8px" }}
          >
            Clear
          </Button>
        </Box>
      )}

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
            {reportContext.hasReport && (
              <Tooltip title="Clear Medical Report Context">
                <IconButton
                  color="inherit"
                  onClick={handleResetContext}
                  disabled={loading}
                  aria-label="Clear Context"
                  sx={{
                    transition: "transform 0.2s ease",
                    "&:hover": {
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <DescriptionIcon />
                </IconButton>
              </Tooltip>
            )}
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
                        <Box
                          dangerouslySetInnerHTML={{
                            __html: formatResponse(message.text),
                          }}
                          sx={{ width: "100%" }}
                        />
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
          <Tooltip title="Upload Medical Report">
            <IconButton
              color="primary"
              onClick={handleUploadButtonClick}
              disabled={isLoading}
            >
              <UploadFileIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Send Message">
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
          </Tooltip>
        </InputContainer>
      </ChatContainer>

      {/* Upload Medical Report Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleCloseUploadDialog}>
        <DialogTitle>Upload Medical Report</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Upload a clear image of your medical report. The AI will use OCR
            technology to extract and analyze the text.
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              mt: 2,
              mb: 2,
            }}
          >
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="report-file-input"
              type="file"
              onChange={handleFileSelect}
              ref={fileInputRef}
            />
            <label htmlFor="report-file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<ImageIcon />}
                sx={{ mb: 2 }}
              >
                Select Image
              </Button>
            </label>
            {selectedFile && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mt: 1,
                  p: 1,
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  width: "100%",
                }}
              >
                <DescriptionIcon sx={{ mr: 1, color: "primary.main" }} />
                <Typography noWrap variant="body2">
                  {selectedFile.name}
                </Typography>
              </Box>
            )}
          </Box>
          <Typography variant="caption" color="text.secondary">
            For best results, ensure the image is well-lit and the text is
            clearly visible. Supported formats: JPG, PNG, GIF, BMP
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>Cancel</Button>
          <Button
            onClick={handleUploadReport}
            variant="contained"
            color="primary"
            disabled={!selectedFile || isUploading}
            startIcon={isUploading ? <CircularProgress size={20} /> : null}
          >
            {isUploading ? "Processing..." : "Upload and Analyze"}
          </Button>
        </DialogActions>
      </Dialog>

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

// Styled components
const ChatContainer = styled(Paper)(({ theme }) => ({
  height: "calc(100% - 50px)",
  width: "calc(100vw - 110px)",
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
  "& .markdown-content": {
    fontFamily: "'Roboto', sans-serif",
    width: "100%",
  },
  "& h3": {
    color: isUser ? "#fff" : theme.palette.primary.main,
    fontSize: "1.1rem",
    fontWeight: "600",
    margin: "16px 0 8px 0",
    borderBottom: `1px solid ${
      isUser ? "rgba(255,255,255,0.2)" : "rgba(25,118,210,0.2)"
    }`,
    paddingBottom: "4px",
  },
  "& ul, & ol": {
    margin: "8px 0",
    paddingLeft: "20px",
  },
  "& ul": {
    listStyleType: "disc",
  },
  "& ol": {
    listStyleType: "decimal",
  },
  "& li": {
    margin: "4px 0",
    display: "list-item",
    paddingLeft: "4px",
  },
  "& li::marker": {
    color: isUser ? "#fff" : theme.palette.primary.main,
  },
  "& ol > li": {
    paddingLeft: "8px",
  },
  "& p": {
    margin: "8px 0",
  },
  "& em": {
    color: isUser ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.6)",
    fontStyle: "italic",
    display: "block",
    marginTop: "10px",
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