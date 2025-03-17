// src/components/Notifications.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBell } from 'react-icons/fa';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // For demo purposes, we use a static list.
    const demoNotifications = [
      { id: 1, message: "Your appointment is scheduled for 2025-03-20." },
      { id: 2, message: "New lab results are available." },
      { id: 3, message: "Your prescription has been updated." }
    ];
    setNotifications(demoNotifications);
  }, []);

  return (
    <NotificationsContainer>
      <TitleContainer>
        <FaBell size={24} color="#4299e1" />
        <h3>Notifications</h3>
      </TitleContainer>
      {notifications.length > 0 ? (
        <NotificationList>
          {notifications.map((note) => (
            <NotificationItem key={note.id}>
              {note.message}
            </NotificationItem>
          ))}
        </NotificationList>
      ) : (
        <p>No notifications found.</p>
      )}
    </NotificationsContainer>
  );
}

const NotificationsContainer = styled.div`
  background: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  margin-top: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #2d3748;
  }
`;

const NotificationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NotificationItem = styled.li`
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  &:last-child {
    border-bottom: none;
  }
`;
