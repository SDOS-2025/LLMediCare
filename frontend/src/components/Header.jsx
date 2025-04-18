import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaBars, FaBell } from 'react-icons/fa';
import Search from './Search';
import Notifications from './Notifications';

export default function Header({ toggleSidebar, sidebarOpen }) {
  const [showNotifications, setShowNotifications] = useState(false);

  // Mock data for demonstration purposes
  // In a real app, you would get this from your state/context
  const notificationCount = 7; // Update this based on actual notifications count

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleClickOutside = (e) => {
    if (e.target.closest('.notifications-dropdown') === null && 
        e.target.closest('.notification-icon') === null) {
      setShowNotifications(false);
    }
  };

  // Add event listener when notifications are shown
  React.useEffect(() => {
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <HeaderContainer>
      <LeftSection>
        <MenuButton onClick={toggleSidebar}>
          <FaBars />
        </MenuButton>
        <SearchBar><Search /></SearchBar>
      </LeftSection>
      <RightSection>
      <Notifications inDropdown={true} />
      </RightSection>
    </HeaderContainer>
  );
}

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background-color: white;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  z-index: 40;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
`;

const SearchBar = styled.div`
  display: absolute;
  width: 100%;
  margin-left: 20rem;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f1f5f9;
    color: #0f172a;
  }
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;  
  gap: 8px;
  text-decoration: none;
  margin-left: 35rem;
`;

const LogoIcon = styled.svg`
  height: 28px;
  width: 28px;
  color: #3b82f6;
`;

const LogoText = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.5px;
`;

const NotificationIconContainer = styled.div`
  position: relative;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f1f5f9;
    color: #0f172a;
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ef4444;
  color: white;
  font-size: 0.6rem;
  font-weight: 600;
  min-height: 18px;
  min-width: 18px;
  padding: 0 4px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotificationsDropdown = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  width: 320px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 50;
`;