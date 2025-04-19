import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBell, FaTimes } from 'react-icons/fa';
import { FiCheck } from 'react-icons/fi';
import axios from 'axios';
import { useSelector } from 'react-redux';

export default function Notifications({inDropdown}) {
  const [notifications, setNotifications] = useState([]);
  const [showAllDialog, setShowAllDialog] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const currentUser = useSelector((state) => state.user.currentUser);

  // Fetch notifications
  useEffect(() => {
    async function fetchNotifications() {
      if (!currentUser) return;

      try {
        const response = await axios.get(
          `http://localhost:8000/api/user/notifications/unread/?user_email=${currentUser.email}`
        );
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }
    
    fetchNotifications();
    
    // Set up polling for notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const markNotificationAsRead = async (id) => {
    try {
      await axios.patch(`http://localhost:8000/api/user/notifications/${id}/mark-read/`);
      
      // Update notifications list
      const response = await axios.get(
        `http://localhost:8000/api/user/notifications/unread/?user_email=${currentUser.email}`
      );
      setNotifications(response.data);
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const response = await axios.patch(
        `http://localhost:8000/api/notifications/mark-all-read/`,
        null,
        {
          params: {
            user_email: currentUser.email
          },
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      if (response.data) {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // If this component is used in the dropdown mode, show as dropdown toggle
  if (inDropdown) {
    return (
      <NotificationContainer>
        <NotificationBell onClick={() => setShowNotifications(!showNotifications)}>
          🔔
          {notifications.length > 0 && (
            <NotificationBadge>{notifications.length}</NotificationBadge>
          )}
        </NotificationBell>
        
        {showNotifications && (
          <NotificationDropdown>
            <NotificationHeader>
              <h3>Notifications</h3>
              {notifications.length > 0 && (
                <MarkAllReadButton onClick={markAllNotificationsAsRead}>
                  Mark all as read
                </MarkAllReadButton>
              )}
            </NotificationHeader>
            
            {notifications.length > 0 ? (
              <NotificationList>
                {notifications.map(notification => (
                  <NotificationItem key={notification.id}>
                    <NotificationContent>
                      <NotificationTitle>{notification.title}</NotificationTitle>
                      <NotificationMessage>{notification.message}</NotificationMessage>
                      <NotificationTime>
                        {new Date(notification.created_at).toLocaleString()}
                      </NotificationTime>
                    </NotificationContent>
                    <MarkReadButton onClick={() => markNotificationAsRead(notification.id)}>
                      <FiCheck />
                    </MarkReadButton>
                  </NotificationItem>
                ))}
              </NotificationList>
            ) : (
              <NoNotifications>No new notifications</NoNotifications>
            )}
            <ViewAllButton onClick={() => setShowAllDialog(true)}>View all notifications</ViewAllButton>
          </NotificationDropdown>
        )}

        {showAllDialog && (
          <DialogOverlay>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  <FaBell size={20} color="#2563eb" />
                  <span>All Notifications</span>
                </DialogTitle>
                <CloseButton onClick={() => setShowAllDialog(false)}>
                  <FaTimes size={18} />
                </CloseButton>
              </DialogHeader>
              <DialogBody>
                {notifications.length > 0 ? (
                  <NotificationListFullView>
                    {notifications.map((notification) => (
                      <NotificationItem key={notification.id}>
                        <NotificationContent>
                          <NotificationTitle>{notification.title}</NotificationTitle>
                          <NotificationMessage>{notification.message}</NotificationMessage>
                          <NotificationTime>
                            {new Date(notification.created_at).toLocaleString()}
                          </NotificationTime>
                        </NotificationContent>
                        <MarkReadButton onClick={() => markNotificationAsRead(notification.id)}>
                          <FiCheck />
                        </MarkReadButton>
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
      </NotificationContainer>
    );
  }

  // Full page view
  return (
    <NotificationsContainer>
      <TitleContainer>
        <FaBell size={20} color="#2563eb" />
        <NotificationTitle>Notifications</NotificationTitle>
        {notifications.length > 0 && (
          <MarkAllReadButton onClick={markAllNotificationsAsRead}>
            Mark all as read
          </MarkAllReadButton>
        )}
      </TitleContainer>
      
      {notifications.length > 0 ? (
        <>
          <NotificationList>
            {notifications.map((notification) => (
              <NotificationItem key={notification.id}>
                <NotificationContent>
                  <NotificationTitle>{notification.title}</NotificationTitle>
                  <NotificationMessage>{notification.message}</NotificationMessage>
                  <NotificationTime>
                    {new Date(notification.created_at).toLocaleString()}
                  </NotificationTime>
                </NotificationContent>
                <MarkReadButton onClick={() => markNotificationAsRead(notification.id)}>
                  <FiCheck />
                </MarkReadButton>
              </NotificationItem>
            ))}
          </NotificationList>
        </>
      ) : (
        <EmptyState>No notifications found.</EmptyState>
      )}
    </NotificationsContainer>
  );
}

// Create notification function - can be exported and used in other components
export const createNotification = async (recipientEmail, title, message) => {
  try {
    const response = await axios.post('http://localhost:8000/api/user/notifications/', {
      user_email: recipientEmail,
      title: title,
      message: message,
      type: 'appointment'
    });
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Styling from original component
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f9fafb;
  }
`;

const NotificationContent = styled.div`
  flex: 1;
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

// Styles for dropdown mode
const NotificationContainer = styled.div`
  position: relative;
`;

const NotificationBell = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f3f4f6;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NotificationDropdown = styled.div`
  position: absolute;
  top: 45px;
  right: 0;
  background: white;
  border-radius: 8px;
  width: 350px;
  max-height: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08);
  z-index: 10;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  
  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
  }
`;

const NoNotifications = styled.div`
  padding: 1rem;
  text-align: center;
  color: #6b7280;
`;

const MarkAllReadButton = styled.button`
  background: none;
  border: none;
  color: #2563eb;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f3f4f6;
  }
`;

const MarkReadButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f3f4f6;
    color: #2563eb;
  }
`;