import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../auth/AuthProvider';
import styled from 'styled-components';
import { AuthModal } from "../auth/AuthModal.jsx";

const HeaderContainer = styled.header`
  background-color: #ffffff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const NavContainer = styled.nav`
  padding: 16px;
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HamburgerMenuButton = styled.button`
  margin-right: 16px;
  color: #6b7280;
  &:hover {
    color: #374151;
  }
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  space-x: 2;
`;

const LogoIcon = styled.svg`
  height: 32px;
  width: 32px;
  color: #3498db;
`;

const LogoText = styled.span`
  font-size: 24px;
  font-weight: bold;
  color: #333333;
`;

const NavLinksContainer = styled.div`
  display: none;
  @media (min-width: 768px) {
    display: flex;
    align-items: center;
    space-x: 6;
  }
`;

const NavLink = styled(Link)`
  font-size: 16px;
  font-weight: medium;
  color: #6b7280;
  &:hover {
    color: #374151;
  }
`;

const AuthButton = styled.button`
  padding: 8px 16px;
  background-color: #ffffff;
  color: #1e40af;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #f1f5f9;
  }
`;

const UserProfileContainer = styled.div`
  display: flex;
  align-items: center;
  space-x: 4;
`;

const UserProfileText = styled.span`
  font-size: 14px;
  color: #6b7280;
`;

const SignOutButton = styled.button`
  padding: 8px 16px;
  background-color: #ffffff;
  color: #1e40af;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background-color: #f1f5f9;
  }
`;

const AuthModalContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Header = ({ toggleSidebar, sidebarOpen }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const { logout } = useAuth();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <HeaderContainer>
      <NavContainer>
        <FlexContainer>
          <div className="flex items-center">
            {/* Hamburger Menu Button for Mobile */}
            <HamburgerMenuButton
              onClick={toggleSidebar}
              aria-label="Toggle Sidebar"
            >
              {sidebarOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </HamburgerMenuButton>
            
            <LogoContainer to="/">
              <LogoIcon viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </LogoIcon>
              <LogoText>LLMediCare</LogoText>
            </LogoContainer>
          </div>
          
          <NavLinksContainer>
            <NavLink to="/chat">AI Chat</NavLink>
            <NavLink to="/appointments">Appointments</NavLink>
            <NavLink to="/records">Medical Records</NavLink>
            {user ? (
              <UserProfileContainer>
                <UserProfileText>{user.email}</UserProfileText>
                <SignOutButton onClick={handleSignOut}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Sign Out</span>
                </SignOutButton>
              </UserProfileContainer>
            ) : (
              <AuthButton onClick={() => setIsAuthModalOpen(true)}>Sign In</AuthButton>
            )}
          </NavLinksContainer>

          {/* User profile and actions */}
          <div className="flex items-center">
            {user ? (
              <UserProfileContainer>
                <UserProfileText className="hidden md:inline">{user.email}</UserProfileText>
                <SignOutButton onClick={handleSignOut}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Sign Out</span>
                </SignOutButton>
              </UserProfileContainer>
            ) : (
              <AuthButton onClick={() => setIsAuthModalOpen(true)}>Sign In</AuthButton>
            )}
          </div>
        </FlexContainer>
      </NavContainer>

      <AuthModalContainer>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      </AuthModalContainer>
    </HeaderContainer>
  );
};
