import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBell } from 'react-icons/fa';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // For demo purposes, we use a static list.
    const demoNotifications = [
      { id: 1, message: "Your appointment is scheduled for 2025-04-20.", time: "1 hour ago" },
      { id: 2, message: "New lab results are available.", time: "3 hours ago" },
      { id: 3, message: "Your prescription has been updated.", time: "1 day ago" }
    ];
    setNotifications(demoNotifications);
  }, []);

  return (
    <NotificationsContainer>
      <TitleContainer>
        <FaBell size={20} color="#2563eb" />
        <NotificationTitle>Notifications</NotificationTitle>
      </TitleContainer>
      {notifications.length > 0 ? (
        <NotificationList>
          {notifications.map((note) => (
            <NotificationItem key={note.id}>
              <NotificationMessage>{note.message}</NotificationMessage>
              <NotificationTime>{note.time}</NotificationTime>
            </NotificationItem>
          ))}
        </NotificationList>
      ) : (
        <EmptyState>No notifications found.</EmptyState>
      )}
      <ViewAllButton>View all notifications</ViewAllButton>
    </NotificationsContainer>
  );
}

const NotificationsContainer = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

const NotificationTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
`;

const NotificationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 300px;
  overflow-y: auto;
`;

const NotificationItem = styled.li`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f9fafb;
  }
`;

const NotificationMessage = styled.p`
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  color: #1f2937;
`;

const NotificationTime = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
`;

const EmptyState = styled.p`
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
`;

const ViewAllButton = styled.button`
  width: 100%;
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  border: none;
  border-top: 1px solid #e5e7eb;
  color: #2563eb;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f3f4f6;
  }
`;