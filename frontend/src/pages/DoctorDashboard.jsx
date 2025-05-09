import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function DoctorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentUser = useSelector((state) => state.user.currentUser);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    // Check if user is a doctor
    if (!currentUser || currentUser.role !== 'doctor') {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const handleCardClick = (action) => {
    switch (action) {
      case 'appointments':
        navigate('/doctor/appointments');
        break;
      case 'patients':
        navigate('/doctor/patients');
        break;
      case 'records':
        navigate('/doctor/records');
        break;
      case 'chat':
        navigate('/doctor/chat');
        break;
      default:
        break;
    }
  };

  if (!currentUser || currentUser.role !== 'doctor') {
    return null;
  }

  return (
    <AppContainer>
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <MainContent>
        <DashboardHeader>
          <h1>Doctor Dashboard</h1>
          <p>Welcome, Dr. {currentUser?.name || 'User'}</p>
        </DashboardHeader>

        <DashboardGrid>
          <DashboardCard onClick={() => handleCardClick('appointments')}>
            <CardIcon>📅</CardIcon>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>View and manage your appointments</CardDescription>
            <CardButton>View Appointments</CardButton>
          </DashboardCard>

          <DashboardCard onClick={() => handleCardClick('patients')}>
            <CardIcon>👥</CardIcon>
            <CardTitle>Patients</CardTitle>
            <CardDescription>Access your patient records</CardDescription>
            <CardButton>View Patients</CardButton>
          </DashboardCard>

          <DashboardCard onClick={() => handleCardClick('records')}>
            <CardIcon>📝</CardIcon>
            <CardTitle>Medical Records</CardTitle>
            <CardDescription>Review and update medical records</CardDescription>
            <CardButton>View Records</CardButton>
          </DashboardCard>

          <DashboardCard onClick={() => handleCardClick('chat')}>
            <CardIcon>💬</CardIcon>
            <CardTitle>Chat</CardTitle>
            <CardDescription>Communicate with patients</CardDescription>
            <CardButton>Open Chat</CardButton>
          </DashboardCard>
        </DashboardGrid>
      </MainContent>
    </AppContainer>
  );
}

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f9fafb;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 2rem;
  margin-left: 72px;
  transition: margin-left 0.3s ease;

  @media (min-width: 768px) {
    margin-left: ${props => props.sidebarOpen ? '240px' : '72px'};
  }
`;

const DashboardHeader = styled.div`
  margin-bottom: 2rem;

  h1 {
    font-size: 2rem;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 0.5rem;
  }

  p {
    font-size: 1.1rem;
    color: #666;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const DashboardCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const CardIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const CardTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
`;

const CardDescription = styled.p`
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

const CardButton = styled.button`
  background-color: #3a86ff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #2667cc;
  }
`; 