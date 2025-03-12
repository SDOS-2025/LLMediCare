import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAuth } from '../auth/AuthProvider';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  height: 100vh;
  background-color: #1e40af; // blue-800
  color: white;
  width: 256px; // 64 * 4
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
`;

const LogoContainer = styled.div`
  padding: 20px;
  border-bottom: 1px solid #1a3765; // blue-700
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: bold;
`;

const Tagline = styled.p`
  font-size: 14px;
  color: #66b5ff; // blue-200
`;

const NavigationContainer = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const NavigationLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out;
  &:hover {
    background-color: #1a3765; // blue-700
  }
  &.active {
    background-color: #1a3765; // blue-700
    color: white;
  }
`;

const NavigationIcon = styled.svg`
  height: 20px;
  width: 20px;
  margin-right: 12px;
`;

const UserProfileContainer = styled.div`
  padding: 16px;
  border-top: 1px solid #1a3765; // blue-700
  background-color: #1a3765; // blue-900
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const UserProfileInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserProfileName = styled.p`
  font-size: 16px;
  font-weight: bold;
`;

const UserProfileEmail = styled.p`
  font-size: 14px;
  color: #66b5ff; // blue-200
`;

const LogoutButton = styled.button`
  padding: 8px;
  border-radius: 50%;
  background-color: transparent;
  border: none;
  cursor: pointer;
  &:hover {
    background-color: #1a3765; // blue-700
  }
`;

export const Sidebar = () => {
  const user = useSelector(state => state.auth.user);
  const { logout } = useAuth();

  return (
    <SidebarContainer>
      <LogoContainer>
        <Logo>LLMediCare</Logo>
        <Tagline>AI-Powered Healthcare</Tagline>
      </LogoContainer>
      <NavigationContainer>
        <ul>
          <li>
            <NavigationLink to="/" end>
              <NavigationIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </NavigationIcon>
              <span>Home</span>
            </NavigationLink>
          </li>
          <li>
            <NavigationLink to="/chat">
              <NavigationIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
              </NavigationIcon>
              <span>AI Chat</span>
            </NavigationLink>
          </li>
          <li>
            <NavigationLink to="/appointments">
              <NavigationIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </NavigationIcon>
              <span>Appointments</span>
            </NavigationLink>
          </li>
          <li>
            <NavigationLink to="/records">
              <NavigationIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </NavigationIcon>
              <span>Medical Records</span>
            </NavigationLink>
          </li>
        </ul>
      </NavigationContainer>
      <UserProfileContainer>
        {user ? (
          <UserProfile>
            <UserProfileInfo>
              <UserProfileName>{user.displayName || user.email}</UserProfileName>
              <UserProfileEmail>{user.email}</UserProfileEmail>
            </UserProfileInfo>
            <LogoutButton onClick={logout}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm7 8a1 1 0 10-2 0v3a1 1 0 102 0v-3zm2-5.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" />
              </svg>
            </LogoutButton>
          </UserProfile>
        ) : (
          <div className="flex items-center space-x-2">
            <NavLink 
              to="/login" 
              className="py-2 px-4 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-500 transition-colors w-full text-center"
            >
              Sign In
            </NavLink>
          </div>
        )}
      </UserProfileContainer>
    </SidebarContainer>
  );
};
