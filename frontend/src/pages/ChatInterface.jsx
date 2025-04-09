import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import styled from "styled-components";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebase-config.js";
import {
  createNewSession,
  setCurrentSession,
  getUserSessions,
  sendUserInput,
  addChatToSession,
} from "../store/slices/sessionSlice";
import Chatbot from "../components/Chatbot";

export default function ChatInterface() {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);
  const sessions = useSelector((state) => state.session.user_sessions);
  const currentSession = useSelector((state) => state.session.cur_session);
  const loading = useSelector((state) => state.session.loading);

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [modelStatus, setModelStatus] = useState(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Check Firebase authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page when the component is mounted
  }, []);

  // Create a new session on component mount if logged in
  useEffect(() => {
    if (currentUser) {
      // Instead of loading existing sessions, create a new one
      handleCreateNewSession();
    }
  }, [currentUser]);

  // Scroll to bottom of messages when new ones arrive
  useEffect(() => {
    if (currentSession && currentSession.session_chats)
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !currentSession) return;
    console.log(currentSession);
    console.log(currentSession.id);
    console.log(currentSession._id);

    // Add user message immediately for better UX
    const userMessage = {
      id: Date.now(),
      session_id: currentSession.id,
      sender: "user",
      message: inputMessage,
      created_at: new Date().toISOString(),
    };

    dispatch(sendUserInput({ ...userMessage }));
    setInputMessage("");
  };

  const handleCreateNewSession = () => {
    if (currentUser) {
      const temp = currentUser;
      dispatch(createNewSession({ ...temp }));
    }
  };

  const switchSession = (session) => {
    dispatch(setCurrentSession(session));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (authLoading) {
    return (
      <AppContainer>
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <MainContent>
          <div className="flex items-center justify-center h-screen">
            <p>Loading...</p>
          </div>
        </MainContent>
      </AppContainer>
    );
  }

  if (!authUser) {
    return (
      <AppContainer>
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <MainContent>
          <div className="text-center my-24">
            <h2 className="text-2xl font-bold mb-4">AI Healthcare Assistant</h2>
            <p className="mb-6">Please sign in to use the AI chat assistant.</p>
            <Link to="/">
              <Button>Sign In</Button>
            </Link>
          </div>
        </MainContent>
      </AppContainer>
    );
  }

  return (
    <AppContainer>
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <MainContent>
        <Chatbot />
      </MainContent>
    </AppContainer>
  );
}

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin-top: 3rem;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 1rem;
`;

const SessionButton = styled.button`
  width: 100%;
  text-align: left;
  padding: 12px;
  border-radius: 4px;
  &:hover {
    background-color: #e2e8f0;
  }
  &.active {
    background-color: #dbeafe;
    color: #1e40af;
  }
`;

const NewChatButton = styled.button`
  width: 100%;
  padding: 12px;
  background-color: #1e40af;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #1a3765;
  }
`;

const ChatHeaderContainer = styled.div`
  margin-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 16px;
`;

const MessageContainer = styled.div`
  display: flex;
  margin-bottom: 16px;
  &.user {
    justify-content: flex-end;
  }
`;

const MessageBubble = styled.div`
  max-width: 75%;
  padding: 12px;
  border-radius: 4px;
  &.user {
    background-color: #dbeafe;
    color: #1e40af;
  }
  &.assistant {
    background-color: #f7fafc;
    color: #2d3748;
  }
`;

const MessageInputContainer = styled.form`
  margin-top: auto;
  padding: 16px;
  background-color: #ffffff;
  border-top: 1px solid #e2e8f0;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 8px;
  &:focus {
    border-color: #1e40af;
    outline: none;
  }
`;

const SendMessageButton = styled.button`
  padding: 12px;
  background-color: #1e40af;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #1a3765;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  background-color: #1e40af;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  &:hover {
    background-color: #1a3765;
  }
`;
// Updated styling components
const ChatAreaContainer = styled.div`
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 70vh;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SidebarContainer = styled.div`
  background-color: #f9fafb;
  padding: 16px;
  border-right: 1px solid #e2e8f0;
  height: 100%;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid #e2e8f0;
    margin-bottom: 16px;
  }
`;

const SessionsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 4px;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 8px;

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;

// Updated main layout container
const ChatContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f9fafb;
  height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;

  .chat-grid {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 16px;
    height: 100%;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  margin: 8px 0;

  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #1e40af;
    margin: 0 4px;
    opacity: 0.6;
    animation: wave 1.4s infinite ease-in-out;
  }

  .dot:nth-child(1) {
    animation-delay: -0.32s;
  }

  .dot:nth-child(2) {
    animation-delay: -0.16s;
  }

  @keyframes wave {
    0%,
    80%,
    100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-8px);
    }
  }
`;
