import React, { createContext, useState, useContext, useCallback } from 'react';
import Notification from '../components/Notification';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
  }, []);

  const closeNotification = () => {
    setNotification({ message: '', type: '' });
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  return useContext(NotificationContext);
};