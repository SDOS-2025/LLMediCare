import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaBars } from 'react-icons/fa';
import Search from './Search';

export default function Header({ toggleSidebar, sidebarOpen }) {
  return (
    <HeaderContainer>
      <LeftSection>
        <MenuButton onClick={toggleSidebar}>
          <FaBars />
        </MenuButton>
        <Search />
      </LeftSection>
      <RightSection>
        {/* Add any right-side header content here */}
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

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
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