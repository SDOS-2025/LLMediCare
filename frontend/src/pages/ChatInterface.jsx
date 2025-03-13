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
<<<<<<< HEAD
=======
  
  useEffect(() => {
    const fetchData = async () => {
      if (!authUser) return;
      
      dispatch(setLoading(true));
      try {
        // Check model status first
        try {
          const modelStatusResponse = await axios.get('/api/ai-assistant/model/status/');
          setModelStatus(modelStatusResponse.data);
          console.log('Model status:', modelStatusResponse.data);
          
          if (modelStatusResponse.data.status === 'error') {
            dispatch(setError(modelStatusResponse.data.message || 'AI model is not available'));
            return;
          }
        } catch (err) {
          console.error('Error checking model status:', err);
          dispatch(setError('Unable to connect to AI model. Please try again later.'));
          return;
        }
        
        // Fetch chat sessions from the API
        const sessionsResponse = await axios.get('/api/ai-assistant/chat-sessions/');
        const sessions = sessionsResponse.data;
        
        dispatch(setSessions(sessions));
        
        // Set the current session to the most recent one if not already set
        if (sessions.length > 0 && !currentSession) {
          const recentSession = sessions[0];
          dispatch(setCurrentSession(recentSession));
          
          // Fetch messages for this session
          const messagesResponse = await axios.get(`/api/ai-assistant/chat-sessions/${recentSession.id}/messages/`);
          dispatch(setMessages(messagesResponse.data));
        }
      } catch (err) {
        console.error('Error fetching chat data:', err);
        dispatch(setError('Failed to load chat data. Please try again.'));
      } finally {
        dispatch(setLoading(false));
      }
    };
    
    fetchData();
  }, [dispatch, authUser, currentSession]);
>>>>>>> 2f5a0d3d2c7973a9b46fed571ca9b54e83db5bce

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
<<<<<<< HEAD
    
    dispatch(sendUserInput(userMessage));
    setInputMessage('');
=======
    dispatch(addMessage(userMessage));
    
    // Show loading indicator for AI response
    const loadingMessage = {
      id: Date.now() + 1,
      session_id: currentSession.id,
      sender: 'assistant',
      content: 'Thinking...',
      created_at: new Date().toISOString(),
      isLoading: true
    };
    dispatch(addMessage(loadingMessage));
    
    try {
      // Check model status before sending message
      const modelStatusResponse = await axios.get('/api/ai-assistant/model/status/');
      if (modelStatusResponse.data.status === 'error') {
        throw new Error(modelStatusResponse.data.message || 'AI model is not available');
      }
      
      // Send message to backend with timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await axios.post(
        `/api/ai-assistant/chat-sessions/${currentSession.id}/messages/`,
        { content: inputMessage },
        { signal: controller.signal }
      );
      
      clearTimeout(timeout);
      
      // Remove loading message
      dispatch(setMessages(messages.filter(m => !m.isLoading)));
      
      // Add AI response to the chat
      if (response.data && response.data.content) {
        dispatch(addMessage({
          id: response.data.id || Date.now() + 2,
          session_id: currentSession.id,
          sender: 'assistant',
          content: response.data.content,
          created_at: response.data.created_at || new Date().toISOString()
        }));
      } else {
        throw new Error('Invalid response format from server');
      }
      
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove loading message
      dispatch(setMessages(messages.filter(m => !m.isLoading)));
      
      // Add error message to chat with more helpful information
      let errorMessage = 'Sorry, I encountered an error processing your message. Please try again.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'The request took too long to process. Please try again.';
      } else if (error.response) {
        if (error.response.status === 500) {
          errorMessage = 'The AI model is currently initializing. Please try again in a moment.';
        } else if (error.response.status === 404) {
          errorMessage = 'The chat service is unavailable. Please check your connection.';
        } else if (error.response.data && error.response.data.detail) {
          errorMessage = `Error: ${error.response.data.detail}`;
        }
      } else if (error.request) {
        errorMessage = 'No response received from the server. Please check your connection.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      dispatch(addMessage({
        id: Date.now() + 2,
        session_id: currentSession.id,
        sender: 'assistant',
        content: errorMessage,
        created_at: new Date().toISOString()
      }));
    }
>>>>>>> 2f5a0d3d2c7973a9b46fed571ca9b54e83db5bce
  };

  const handleCreateNewSession = () => {

  };

<<<<<<< HEAD
  const switchSession = (id) => {

=======
  const switchSession = async (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      dispatch(setCurrentSession(session));
      dispatch(setLoading(true));
      
      try {
        // Fetch messages for the selected session from the API
        const response = await axios.get(`/api/ai-assistant/chat-sessions/${sessionId}/messages/`);
        dispatch(setMessages(response.data));
      } catch (error) {
        console.error('Error fetching messages:', error);
        dispatch(setError('Failed to load messages. Please try again.'));
        dispatch(setMessages([])); // Clear messages on error
      } finally {
        dispatch(setLoading(false));
      }
    }
>>>>>>> 2f5a0d3d2c7973a9b46fed571ca9b54e83db5bce
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