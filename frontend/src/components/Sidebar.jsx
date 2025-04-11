import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../utils/firebase-config";
import styled from 'styled-components';
import { useSelector } from 'react-redux';

export default function Sidebar({ isOpen, setIsOpen }) {
  const [tempUser, setTempUser] = useState();
  const curUser = useSelector((state) => state.user.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setTempUser(curUser);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  useEffect(() => {
    console.log(tempUser);
  }, [tempUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/'); // Redirect to login page after logout
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleMouseEnter = () => setIsOpen(true);
  const handleMouseLeave = () => setIsOpen(false);

  return (
    <SidebarContainer 
      isOpen={isOpen}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <NavigationContainer>
        <NavGroup>
          <NavItem>
            <StyledNavLink to="/home" end>
              <NavIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </NavIcon>
              <NavText isOpen={isOpen}>Home</NavText>
            </StyledNavLink>
          </NavItem>
          <NavItem>
            <StyledNavLink to="/chat">
              <NavIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </NavIcon>
              <NavText isOpen={isOpen}>AI Chat</NavText>
            </StyledNavLink>
          </NavItem>
          <NavItem>
            <StyledNavLink to="/matrix-chat">
              <NavIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </NavIcon>
              <NavText isOpen={isOpen}>Community Chat</NavText>
            </StyledNavLink>
          </NavItem>
          <NavItem>
            <StyledNavLink to="/appointments">
              <NavIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </NavIcon>
              <NavText isOpen={isOpen}>Appointments</NavText>
            </StyledNavLink>
          </NavItem>
          <NavItem>
            <StyledNavLink to="/records">
              <NavIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </NavIcon>
              <NavText isOpen={isOpen}>Medical Records</NavText>
            </StyledNavLink>
          </NavItem>
        </NavGroup>
      </NavigationContainer>

      <ProfileSection>
        {tempUser ? (
          <>
            <UserAvatarContainer isOpen={isOpen} onClick={() => {navigate('/profile')}}>
              {tempUser.profile_pic ? <ProfileImage src={tempUser.profile_pic} alt="Profile" /> : <UserAvatar>{tempUser.email[0].toUpperCase()}</UserAvatar>}
              <UserInfo isOpen={isOpen}>
                <UserName>{tempUser && tempUser.name ? tempUser.name : "User"}</UserName>
                <UserEmail>{tempUser && tempUser.email ? tempUser.email : "email@example.com"}</UserEmail>
              </UserInfo>
            </UserAvatarContainer>
            <ActionButton onClick={handleLogout}>
              <ActionIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </ActionIcon>
              <ActionText isOpen={isOpen}>Logout</ActionText>
            </ActionButton>
          </>
        ) : (
          <LoginButton to="/" isOpen={isOpen}>
            <LoginIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
              <polyline points="10 17 15 12 10 7"></polyline>
              <line x1="15" y1="12" x2="3" y2="12"></line>
            </LoginIcon>
            <span>Sign In</span>
          </LoginButton>
        )}
      </ProfileSection>
    </SidebarContainer>
  );
};

const SidebarContainer = styled.div`
  position: fixed;
  top: 64px;
  left: 0;
  bottom: 0;
  width: ${props => props.isOpen ? '240px' : '72px'};
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 16px 0;
  overflow-x: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 10;
`;

const NavigationContainer = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NavGroup = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NavItem = styled.li`
  width: 100%;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  text-decoration: none;
  color: #64748b;
  transition: all 0.2s ease;
  border-radius: 6px;
  margin: 0 8px;

  &:hover {
    background-color: #f1f5f9;
    color: #0f172a;
  }

  &.active {
    background-color: #e2e8f0;
    color: #0f172a;
    font-weight: 500;
  }
`;

const NavIcon = styled.svg`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`;

const NavText = styled.span`
  margin-left: 12px;
  font-size: 14px;
  white-space: nowrap;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  transition: opacity 0.2s ease;
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
`;

const ProfileSection = styled.div`
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const UserAvatarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  overflow: hidden;
  cursor: pointer;
  &:hover {
    background-color:rgb(201, 204, 206);
    border-radius: 6px;
  }
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #6366f1;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  transition: opacity 0.2s ease;
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  white-space: nowrap;
  overflow: hidden;
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: #64748b;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 6px;
  color: #64748b;
  transition: all 0.2s ease;

  &:hover {
    background-color: #fee2e2;
    color: #ef4444;
  }
`;

const ActionIcon = styled.svg`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`;

const ActionText = styled.span`
  margin-left: 12px;
  font-size: 14px;
  white-space: nowrap;
  opacity: ${props => (props.isOpen ? 1 : 0)};
  transition: opacity 0.2s ease;
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
`;

const LoginButton = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  text-decoration: none;
  color: #64748b;
  transition: all 0.2s ease;
  border-radius: 6px;
  background-color: #f1f5f9;
  
  &:hover {
    background-color: #e2e8f0;
    color: #0f172a;
  }
  
  span {
    margin-left: 12px;
    font-size: 14px;
    white-space: nowrap;
    opacity: ${props => (props.isOpen ? 1 : 0)};
    transition: opacity 0.2s ease;
    visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  }
`;

const LoginIcon = styled.svg`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
`;

const ProfileImage = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;