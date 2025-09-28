import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Simulate WebSocket connection
  useEffect(() => {
    // In a real app, this would be a WebSocket connection
    const connectWebSocket = () => {
      setIsConnected(true);
      // WebSocket connected
    };

    connectWebSocket();

    // Simulate receiving notifications
    const interval = setInterval(() => {
      // Simulate random notifications for demo
      if (Math.random() > 0.8) {
        const sampleNotifications = [
          {
            id: Date.now(),
            type: 'assignment',
            title: 'Yeni Ödev',
            message: 'Matematik dersinde yeni bir ödev atandı',
            timestamp: new Date(),
            read: false
          },
          {
            id: Date.now() + 1,
            type: 'exam',
            title: 'Sınav Hatırlatması',
            message: 'Yarın matematik sınavınız var',
            timestamp: new Date(),
            read: false
          },
          {
            id: Date.now() + 2,
            type: 'goal',
            title: 'Hedef Güncellemesi',
            message: 'Hedefinizde %75 ilerleme kaydettiniz',
            timestamp: new Date(),
            read: false
          }
        ];

        const randomNotification = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
        addNotification(randomNotification);
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(interval);
      setIsConnected(false);
    };
  }, []);

  const addNotification = (notification) => {
    const newNotification = {
      ...notification,
      id: notification.id || Date.now(),
      timestamp: notification.timestamp || new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    toast.success(newNotification.message, {
      duration: 4000,
      position: 'top-right',
    });
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const removeNotification = (notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationsByType = (type) => {
    return notifications.filter(notification => notification.type === type);
  };

  const getUnreadNotifications = () => {
    return notifications.filter(notification => !notification.read);
  };

  const value = {
    notifications,
    unreadCount,
    isConnected,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    getNotificationsByType,
    getUnreadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

