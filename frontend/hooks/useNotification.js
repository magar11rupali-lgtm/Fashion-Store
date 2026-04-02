'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(undefined);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const MAX_NOTIFICATIONS = 3; // Limit visible notifications

  const showNotification = useCallback((type, message, duration = 3000) => {
    // Prevent duplicate messages
    const isDuplicate = notifications.some(n => n.message === message && n.type === type);
    if (isDuplicate) {
      return null;
    }

    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const notification = {
      id,
      type, // 'success', 'error', 'info', 'warning'
      message,
      duration
    };

    setNotifications(prev => {
      const updated = [...prev, notification];
      // Keep only the most recent notifications
      return updated.slice(-MAX_NOTIFICATIONS);
    });

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }

    return id;
  }, [notifications]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const value = {
    notifications,
    showNotification,
    removeNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
