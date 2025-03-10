import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Send, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { addMessage } from '../../store/slices/chatSlice';
import type { RootState } from '../../store/store';
import { getMedicalResponse } from '../../lib/medicalAI';

export const ChatInterface: React.FC = () => {
  const dispatch = useDispatch();
  const messages = useSelector((state: RootState) => state.chat.messages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: input,
      sender: 'user' as const,
      timestamp: new Date().toISOString(),
    };

    dispatch(addMessage(userMessage));
    setInput('');
    setIsTyping(true);

    try {
      const response = await getMedicalResponse(input);
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'ai' as const,
        timestamp: new Date().toISOString(),
      };
      dispatch(addMessage(aiResponse));
    } catch (error) {
      const errorResponse = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble processing your request. Please try again or contact a healthcare provider for immediate assistance.",
        sender: 'ai' as const,
        timestamp: new Date().toISOString(),
      };
      dispatch(addMessage(errorResponse));
    } finally {
      setIsTyping(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-gray-50">
      <div className="bg-white border-b px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-lg font-semibold text-gray-900">Medical Assistant</h2>
          <p className="text-sm text-gray-600">Ask about symptoms, conditions, or general health advice</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Medical Assistant</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                I can help you understand symptoms, provide general health information, and suggest when you should see a doctor.
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-900 shadow'
                }`}
              >
                <div className="flex flex-col">
                  <div>{message.content}</div>
                  <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg px-4 py-2 shadow">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="border-t bg-white p-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe your symptoms or ask a health question..."
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
            />
            <Button onClick={handleSend} disabled={isTyping}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Disclaimer: This AI assistant provides general information only and should not replace professional medical advice.
            Always consult a healthcare provider for medical decisions.
          </p>
        </div>
      </div>
    </div>
  );
};