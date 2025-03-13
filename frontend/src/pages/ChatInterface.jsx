import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { sendUserInput } from '../store/slices/sessionSlice';
import styled from 'styled-components';
import { Header } from '../components/Header';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

export default function ChatInterface() {
  const dispatch = useDispatch();
  const { sessions, currentSession, messages, loading } = useSelector((state) => state.chat);
  const user = useSelector((state) => state.auth.user);
  
  const [inputMessage, setInputMessage] = useState('');
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
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page when the component is mounted
  }, []);
  
  // Scroll to bottom of messages when new ones arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !currentSession) return;
    
    // Add user message immediately for better UX
    const userMessage = {
      id: Date.now(),
      session_id: currentSession.id,
      sender: 'user',
      message: inputMessage,
      created_at: new Date().toISOString()
    };
  };

  const handleCreateNewSession = () => {

  };
  
  const switchSession = (id) => {


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
            <Link to="/login">
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
        <ChatContainer>
          <div className="grid grid-cols-1 md:grid-cols-4">
            {/* Sidebar with chat sessions */}
            <SidebarContainer className="md:col-span-1">
              <div className="mb-4">
                <NewChatButton
                  onClick={handleCreateNewSession}
                  className="w-full"
                >
                  New Chat
                </NewChatButton>
              </div>
              
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Recent Conversations
              </h3>
              
              <SessionsContainer className="space-y-2 max-h-96 overflow-y-auto">
                {sessions.map((session) => (
                  <SessionButton
                    key={session.id}
                    onClick={() => switchSession(session.id)}
                    className={`w-full text-left px-3 py-2 rounded-md ${
                      currentSession?.id === session.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <p className="font-medium truncate">{session.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </SessionButton>
                ))}
              </SessionsContainer>
            </SidebarContainer>
            
            {/* Chat area */}
            <ChatAreaContainer className="p-4 md:col-span-3 flex flex-col h-[calc(100vh-200px)]">
              {currentSession ? (
                <>
                  <ChatHeaderContainer className="mb-4 border-b pb-2">
                    <h2 className="text-lg font-semibold">
                      {currentSession.title}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {formatDate(currentSession.created_at)}
                    </p>
                  </ChatHeaderContainer>
                  
                  {/* Messages */}
                  <MessagesContainer className="flex-1 overflow-y-auto mb-4 space-y-4">
                    {messages.map((message) => (
                      <MessageContainer
                        key={message.id}
                        className={`flex ${
                          message.sender === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <MessageBubble
                          className={`max-w-3/4 rounded-lg p-3 ${
                            message.sender === 'user'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p>{message.content}</p>
                          <p className="text-xs mt-1 text-gray-500">
                            {formatDate(message.created_at)}
                          </p>
                        </MessageBubble>
                      </MessageContainer>
                    ))}
                    <div ref={messagesEndRef} />
                  </MessagesContainer>
                  
                  {/* Input area */}
                  <MessageInputContainer onSubmit={handleSendMessage} className="mt-auto">
                    <Input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Type your message..."
                      disabled={loading}
                    />
                    <SendMessageButton type="submit" disabled={loading || !inputMessage.trim()}>
                      Send
                    </SendMessageButton>
                  </MessageInputContainer>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-gray-500 mb-4">Select a conversation or start a new one</p>
                  <NewChatButton
                    onClick={handleCreateNewSession}
                  >
                    New Chat
                  </NewChatButton>
                </div>
              )}
            </ChatAreaContainer>
          </div>
        </ChatContainer>
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

const ChatContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f9fafb; 
`;

const SidebarContainer = styled.div`
  background-color: #f9fafb; 
  padding: 16px;
  border-right: 1px solid #e2e8f0; 
`;

const SessionsContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
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

const ChatAreaContainer = styled.div`
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px);
`;

const ChatHeaderContainer = styled.div`
  margin-bottom: 16px;
  border-bottom: 1px solid #e2e8f0; 
  padding-bottom: 16px;
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
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