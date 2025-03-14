import React from "react";
import styled from "styled-components";

export default function Calendar({ doctorCalendarId }) {
  // Set your Google Calendar Timezone
  const timeZone = "Asia/Kolkata"; // Change this according to your region

  // Construct the embed URL
  const googleCalendarEmbedUrl = `https://calendar.google.com/calendar/embed?src=${doctorCalendarId}&ctz=${timeZone}&showTitle=0&showNav=1&showDate=1&showPrint=0&showTabs=1&showCalendars=0&showTz=1`;

  // Construct the event edit URL (for editing booked appointments)
  const googleCalendarEditUrl = "https://calendar.google.com/calendar/u/0/r/eventedit";

  return (
    <CalendarContainer>
      <CalendarHeader>
        <CalendarTitle>Available Appointment Slots</CalendarTitle>
        <ManageButton
          href={googleCalendarEditUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ButtonIcon>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
              />
            </svg>
          </ButtonIcon>
          Manage Your Appointment
        </ManageButton>
      </CalendarHeader>

      <CalendarFrame>
        <CalendarIframe
          src={googleCalendarEmbedUrl}
          frameBorder="0"
          scrolling="no"
          title="Doctor's Appointment Calendar"
        />
      </CalendarFrame>

      <InfoBox>
        <InfoIconContainer>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </InfoIconContainer>
        <InfoText>
          Click on an available time slot to schedule your appointment. You can manage or cancel your appointments using the button above.
        </InfoText>
      </InfoBox>
    </CalendarContainer>
  );
}

// Styled Components
const CalendarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const CalendarHeader = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const CalendarTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
`;

const ManageButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  background-color: #2563eb;
  text-decoration: none;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #1d4ed8;
  }
  
  &:focus {
    outline: none;
    ring: 2px;
    ring-offset: 2px;
    ring-color: #2563eb;
  }
  
  @media (min-width: 768px) {
    margin-top: 0;
  }
`;

const ButtonIcon = styled.span`
  display: inline-block;
  margin-right: 0.5rem;
  
  svg {
    height: 1rem;
    width: 1rem;
  }
`;

const CalendarFrame = styled.div`
  background-color: #f9fafb;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
`;

const CalendarIframe = styled.iframe`
  width: 100%;
  height: 24rem;
  
  @media (min-width: 768px) {
    height: 32rem;
  }
`;

const InfoBox = styled.div`
  display: flex;
  background-color: #eff6ff;
  border-left: 4px solid #60a5fa;
  padding: 1rem;
  border-radius: 0.375rem;
`;

const InfoIconContainer = styled.div`
  flex-shrink: 0;
  
  svg {
    height: 1.25rem;
    width: 1.25rem;
    color: #60a5fa;
  }
`;

const InfoText = styled.p`
  margin-left: 0.75rem;
  font-size: 0.875rem;
  color: #1e40af;
`;