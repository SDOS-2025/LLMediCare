import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

export default function Header ({ toggleSidebar, sidebarOpen }) {
  return (
    <HeaderContainer>
      <NavContainer>
        <FlexContainer>
          <div className="flex items-center">
            <HamburgerButton
              onClick={toggleSidebar}
              aria-label="Toggle Sidebar"
            >
              {sidebarOpen ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6L6 18"></path>
                  <path d="M6 6L18 18"></path>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h18"></path>
                  <path d="M3 6h18"></path>
                  <path d="M3 18h18"></path>
                </svg>
              )}
            </HamburgerButton>
            
            <LogoContainer to="/home">
              <LogoIcon viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </LogoIcon>
              <LogoText>LLMediCare</LogoText>
            </LogoContainer>
          </div>
        </FlexContainer>
      </NavContainer>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  height: 64px;
`;

const NavContainer = styled.nav`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
  height: 100%;
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
`;

const HamburgerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  margin-right: 16px;
  color: #64748b;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #334155;
    background-color: #f1f5f9;
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