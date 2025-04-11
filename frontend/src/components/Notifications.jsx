import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBell, FaTimes } from 'react-icons/fa';

export default function Notifications({ inDropdown = false }) {
  const [notifications, setNotifications] = useState([]);
  const [showAllDialog, setShowAllDialog] = useState(false);

  useEffect(() => {
    // For demo purposes, we use a static list.
    const demoNotifications = [
      { id: 1, message: "Your appointment is scheduled for 2025-04-20.", time: "1 hour ago" },
      { id: 2, message: "New lab results are available.", time: "3 hours ago" },
      { id: 3, message: "Your prescription has been updated.", time: "1 day ago" },
      { id: 4, message: "Reminder: Please complete your health questionnaire.", time: "2 days ago" },
      { id: 5, message: "Your doctor has updated your care plan.", time: "3 days ago" },
      { id: 6, message: "New message from Dr. Johnson regarding your last visit.", time: "4 days ago" },
      { id: 7, message: "Your insurance information has been updated.", time: "5 days ago" }
    ];
    setNotifications(demoNotifications);
  }, []);

  const handleViewAll = () => {
    setShowAllDialog(true);
  };

  const closeDialog = () => {
    setShowAllDialog(false);
  };

  // If this is rendered inside the dropdown, only show 3 notifications
  const displayedNotifications = inDropdown ? notifications.slice(0, 3) : notifications;

  return (
    <>
      <NotificationsContainer>
        <TitleContainer>
          <FaBell size={20} color="#2563eb" />
          <NotificationTitle>Notifications</NotificationTitle>
        </TitleContainer>
        {notifications.length > 0 ? (
          <>
            <NotificationList>
              {displayedNotifications.map((note) => (
                <NotificationItem key={note.id}>
                  <NotificationMessage>{note.message}</NotificationMessage>
                  <NotificationTime>{note.time}</NotificationTime>
                </NotificationItem>
              ))}
            </NotificationList>
            {inDropdown && notifications.length > 3 && (
              <ViewAllButton onClick={handleViewAll}>View all notifications</ViewAllButton>
            )}
            {!inDropdown && (
              <ViewAllButton onClick={handleViewAll}>View all notifications</ViewAllButton>
            )}
          </>
        ) : (
          <>
            <EmptyState>No notifications found.</EmptyState>
            <ViewAllButton disabled>No notifications available</ViewAllButton>
          </>
        )}
      </NotificationsContainer>

      {showAllDialog && (
        <DialogOverlay>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <FaBell size={20} color="#2563eb" />
                <span>All Notifications</span>
              </DialogTitle>
              <CloseButton onClick={closeDialog}>
                <FaTimes size={18} />
              </CloseButton>
            </DialogHeader>
            <DialogBody>
              {notifications.length > 0 ? (
                <NotificationListFullView>
                  {notifications.map((note) => (
                    <NotificationItem key={note.id}>
                      <NotificationMessage>{note.message}</NotificationMessage>
                      <NotificationTime>{note.time}</NotificationTime>
                    </NotificationItem>
                  ))}
                </NotificationListFullView>
              ) : (
                <EmptyState>No notifications found.</EmptyState>
              )}
            </DialogBody>
          </DialogContent>
        </DialogOverlay>
      )}
    </>
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

const NotificationListFullView = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 400px;
  overflow-y: auto;

  /* Modern scrollbar for WebKit browsers */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }

  /* Scrollbar for Firefox */
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
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

  &:disabled {
    cursor: not-allowed;
    color: #9ca3af;
    background-color: #f9fafb;
  }
`;

// Dialog overlay styles
const DialogOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const DialogContent = styled.div`
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
`;

const DialogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
`;

const DialogTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DialogBody = styled.div`
  padding: 0;
  overflow: hidden;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f3f4f6;
    color: #1f2937;
  }
`;