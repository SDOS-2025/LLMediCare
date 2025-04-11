import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

export default function ChatArea () {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const matrixRoomLink = "https://matrix.to/#/!yUmBJwCJzFjGYECrxx:matrix.org?via=matrix.org"; // replace this!

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AppContainer>
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <MainContent>
        <ChatContainer>
          <ChatSection>
            <div className="mx-auto max-w-2xl py-24 sm:py-32 lg:py-40">
              <div className="text-center">
                <ChatTitle>Community Chat</ChatTitle>
                <ChatText>
                  Click the button below to join our secure Matrix-based chat room.
                  Connect with healthcare professionals and other patients.
                </ChatText>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <a href={matrixRoomLink} target="_blank" rel="noopener noreferrer">
                    <Button size="lg">Join Chat Room</Button>
                  </a>
                  <Link to="/home">
                    <Button variant="outline" size="lg">Back to Home</Button>
                  </Link>
                </div>
              </div>
            </div>
          </ChatSection>
        </ChatContainer>
      </MainContent>
    </AppContainer>
  );
};

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  margin-left: 72px; /* Width of collapsed sidebar */
  margin-top: 64px; /* Height of header */
  flex: 1;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const ChatContainer = styled.div`
  background-color: white;
`;

const ChatSection = styled.div`
  position: relative;
  padding: 14px 6px;
`;

const ChatTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: bold;
  color: #1f2937; // gray-900
`;

const ChatText = styled.p`
  margin-top: 1.5rem;
  font-size: 1.125rem;
  line-height: 1.75rem;
  color: #4b5563; // gray-600
`;

const Button = styled.button`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 0.375rem;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  
  ${props => props.variant === 'outline' ? `
    background-color: transparent;
    border: 1px solid #2563eb;
    color: #2563eb;
    &:hover {
      background-color: rgba(37, 99, 235, 0.1);
    }
  ` : `
    background-color: #2563eb;
    border: 1px solid #2563eb;
    color: white;
    &:hover {
      background-color: #1d4ed8;
    }
  `}
  
  ${props => props.size === 'lg' ? `
    padding: 0.75rem 1.5rem;
    font-size: 1.125rem;
  ` : ''}
`;