import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  setSessions, 
  setCurrentSession, 
  setMessages, 
  addMessage, 
  setLoading, 
  setError 
} from '../../store/slices/chatSlice';
import styled from 'styled-components';

const ChatContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
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

export const ChatInterface = () => {
  const dispatch = useDispatch();
  const { sessions, currentSession, messages, loading, error } = useSelector((state) => state.chat);
  const user = useSelector((state) => state.auth.user);
  
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of messages when new ones arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      dispatch(setLoading(true));
      try {
        // In a real app, you would fetch from the API
        // For now, we'll use mock data
        const mockSessions = [
          {
            id: 1,
            created_at: '2025-03-12T10:30:00Z',
            title: 'Consultation about headache'
          },
          {
            id: 2,
            created_at: '2025-03-10T14:45:00Z',
            title: 'Questions about medication'
          }
        ];
        
        dispatch(setSessions(mockSessions));
        
        // Set the current session to the most recent one
        if (mockSessions.length > 0 && !currentSession) {
          const recentSession = mockSessions[0];
          dispatch(setCurrentSession(recentSession));
          
          // Fetch messages for this session
          const mockMessages = [
            {
              id: 1,
              session_id: 1,
              sender: 'user',
              content: 'I have been experiencing frequent headaches recently.',
              created_at: '2025-03-12T10:30:15Z'
            },
            {
              id: 2,
              session_id: 1,
              sender: 'assistant',
              content: "I'm sorry to hear that you're experiencing frequent headaches. Can you tell me more about the nature of these headaches? For example, where is the pain located, how long do they last, and are there any triggers you've noticed?",
              created_at: '2025-03-12T10:30:30Z'
            },
            {
              id: 3,
              session_id: 1,
              sender: 'user',
              content: 'They usually start at the front of my head and last for several hours. I notice they get worse when I stare at a screen for too long.',
              created_at: '2025-03-12T10:31:00Z'
            },
            {
              id: 4,
              session_id: 1,
              sender: 'assistant',
              content: "Based on what you've described, it sounds like you might be experiencing tension headaches, which can be triggered by prolonged screen time. This is quite common, especially if you work at a computer. I would recommend taking regular breaks from screen time (try the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds), ensuring proper ergonomics at your workstation, and staying hydrated. Over-the-counter pain relievers like ibuprofen can help with symptoms. If the headaches persist or worsen, I would recommend seeing a healthcare provider for a more thorough evaluation.",
              created_at: '2025-03-12T10:31:30Z'
            }
          ];
          
          dispatch(setMessages(mockMessages));
        }
      } catch (err) {
        console.error('Error fetching chat data:', err);
        dispatch(setError('Failed to load chat data. Please try again.'));
      } finally {
        dispatch(setLoading(false));
      }
    };
    
    fetchData();
  }, [dispatch, user, currentSession]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || !currentSession) return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      session_id: currentSession.id,
      sender: 'user',
      content: inputMessage,
      created_at: new Date().toISOString()
    };
    
    dispatch(addMessage(userMessage));
    setInputMessage('');
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        session_id: currentSession.id,
        sender: 'assistant',
        content: "I'm analyzing your message. In a production environment, this would be processed by our AI model to generate a helpful medical response tailored to your query.",
        created_at: new Date().toISOString()
      };
      
      dispatch(addMessage(aiMessage));
    }, 1000);
  };

  const createNewSession = () => {
    const newSession = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      title: 'New consultation'
    };
    
    dispatch(setSessions([newSession, ...sessions]));
    dispatch(setCurrentSession(newSession));
    dispatch(setMessages([]));
  };

  const switchSession = (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      dispatch(setCurrentSession(session));
      
      // In a real app, you would fetch messages for this session from the API
      // For now, let's simulate different messages for different sessions
      const mockMessages = sessionId === 1 
        ? [
            {
              id: 1,
              session_id: 1,
              sender: 'user',
              content: 'I have been experiencing frequent headaches recently.',
              created_at: '2025-03-12T10:30:15Z'
            },
            {
              id: 2,
              session_id: 1,
              sender: 'assistant',
              content: "I'm sorry to hear that you're experiencing frequent headaches. Can you tell me more about the nature of these headaches? For example, where is the pain located, how long do they last, and are there any triggers you've noticed?",
              created_at: '2025-03-12T10:30:30Z'
            },
            {
              id: 3,
              session_id: 1,
              sender: 'user',
              content: 'They usually start at the front of my head and last for several hours. I notice they get worse when I stare at a screen for too long.',
              created_at: '2025-03-12T10:31:00Z'
            },
            {
              id: 4,
              session_id: 1,
              sender: 'assistant',
              content: "Based on what you've described, it sounds like you might be experiencing tension headaches, which can be triggered by prolonged screen time. This is quite common, especially if you work at a computer. I would recommend taking regular breaks from screen time (try the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds), ensuring proper ergonomics at your workstation, and staying hydrated. Over-the-counter pain relievers like ibuprofen can help with symptoms. If the headaches persist or worsen, I would recommend seeing a healthcare provider for a more thorough evaluation.",
              created_at: '2025-03-12T10:31:30Z'
            }
          ]
        : [
            {
              id: 5,
              session_id: 2,
              sender: 'user',
              content: 'I was prescribed Lisinopril for my blood pressure. Are there any side effects I should be aware of?',
              created_at: '2025-03-10T14:45:15Z'
            },
            {
              id: 6,
              session_id: 2,
              sender: 'assistant',
              content: "Lisinopril is an ACE inhibitor commonly used to treat high blood pressure. Common side effects may include dizziness, lightheadedness, dry cough, and increased potassium levels. Less common but more serious side effects include swelling of the face/lips/tongue/throat, difficulty breathing, or signs of infection like fever or sore throat. It's important to take this medication regularly as prescribed, and if you experience any concerning side effects, especially severe dizziness or difficulty breathing, contact your healthcare provider immediately. Also, be sure to inform your doctor of all other medications you're taking, as some drugs can interact with Lisinopril.",
              created_at: '2025-03-10T14:45:45Z'
            },
            {
              id: 7,
              session_id: 2,
              sender: 'user',
              content: 'I have been experiencing a dry cough since starting the medication. Is this normal?',
              created_at: '2025-03-10T14:46:30Z'
            },
            {
              id: 8,
              session_id: 2,
              sender: 'assistant',
              content: "Yes, a persistent dry cough is one of the most common side effects of ACE inhibitors like Lisinopril, affecting about 5-35% of patients. This cough typically doesn't go away with cough medicines and may persist as long as you're taking the medication. If the cough is severely bothering you, speak with your doctor - they might consider switching you to a different type of blood pressure medication, such as an ARB (Angiotensin Receptor Blocker), which has similar benefits but is less likely to cause a cough. Don't stop taking your medication without consulting your healthcare provider first.",
              created_at: '2025-03-10T14:47:00Z'
            }
          ];
      
      dispatch(setMessages(mockMessages));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">AI Healthcare Assistant</h2>
          <p className="mb-6">Please sign in to use the AI chat assistant.</p>
        </div>
      </div>
    );
  }

  return (
    <ChatContainer>
      <div className="grid grid-cols-1 md:grid-cols-4">
        {/* Sidebar with chat sessions */}
        <SidebarContainer className="md:col-span-1">
          <div className="mb-4">
            <NewChatButton
              onClick={createNewSession}
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
                onClick={createNewSession}
              >
                New Chat
              </NewChatButton>
            </div>
          )}
        </ChatAreaContainer>
      </div>
    </ChatContainer>
  );
};
