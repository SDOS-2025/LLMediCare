import React, { useState } from "react";
import Calendar from "../components/Calendar";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import styled from "styled-components";

export default function DoctorAppointments() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // List of healthcare professionals with their Google Calendar IDs
  const professionals = [
    { name: "Dr. John Doe", calendarId: "dr.john@example.com", specialty: "Cardiology" },
    { name: "Dr. Jane Smith", calendarId: "dr.jane@example.com", specialty: "Neurology" },
    { name: "Dr. Emily Brown", calendarId: "dr.emily@example.com", specialty: "Pediatrics" },
  ];

  // State to track selected healthcare professional
  const [selectedProfessional, setSelectedProfessional] = useState(professionals[0].calendarId);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <AppContainer>
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <MainContent>
        <ContentWrapper>
          <HeaderSection>
            <PageTitle>Appointment Booking System</PageTitle>
            <PageSubtitle>Select a healthcare professional and manage your appointments</PageSubtitle>
          </HeaderSection>

          <CardContainer>
            <SelectionContainer>
              <SelectLabel htmlFor="doctorSelect">
                Select Healthcare Professional:
              </SelectLabel>
              <SelectWrapper>
                <Select
                  id="doctorSelect"
                  onChange={(e) => setSelectedProfessional(e.target.value)}
                  value={selectedProfessional}
                >
                  {professionals.map((prof) => (
                    <option key={prof.calendarId} value={prof.calendarId}>
                      {prof.name} - {prof.specialty}
                    </option>
                  ))}
                </Select>
                <SelectIcon>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </SelectIcon>
              </SelectWrapper>
            </SelectionContainer>

            {/* Embed the selected professional's Google Calendar */}
            <Calendar doctorCalendarId={selectedProfessional} />
          </CardContainer>
        </ContentWrapper>
      </MainContent>
    </AppContainer>
  );
}

// Styled Components
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  padding: 1.5rem;
  margin-top: 4rem;
`;

const ContentWrapper = styled.div`
  max-width: 56rem;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
`;

const PageSubtitle = styled.p`
  color: #6b7280;
  font-size: 1rem;
`;

const CardContainer = styled.div`
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const SelectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const SelectLabel = styled.label`
  color: #374151;
  font-weight: 500;
  margin-bottom: 0.5rem;
  
  @media (min-width: 768px) {
    margin-bottom: 0;
  }
`;

const SelectWrapper = styled.div`
  position: relative;
  
  @media (min-width: 768px) {
    width: 16rem;
  }
`;

const Select = styled.select`
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  color: #374151;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  appearance: none;
  
  &:focus {
    outline: none;
    ring: 2px;
    ring-color: #3b82f6;
    border-color: #3b82f6;
  }
`;

const SelectIcon = styled.div`
  pointer-events: none;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding-right: 0.5rem;
  color: #6b7280;
  
  svg {
    fill: currentColor;
    height: 1rem;
    width: 1rem;
  }
`;