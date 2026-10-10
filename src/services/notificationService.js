import api, { USE_MOCK_API } from './api';
import { getMockData, saveMockCollection, STORAGE_KEYS } from './mockData';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const notificationService = {
  // Get notifications for current user
  getNotifications: async (userId) => {
    if (USE_MOCK_API) {
      await delay();
      const { notifications } = getMockData();
      const userNotifs = notifications.filter((n) => n.userId === userId);
      const unreadCount = userNotifs.filter((n) => !n.isRead).length;

      return {
        success: true,
        notifications: userNotifs,
        unreadCount,
      };
    }

    const response = await api.get('/notifications', { params: { userId } });
    return response.data;
  },

  // Mark single as read
  markAsRead: async (notificationId) => {
    if (USE_MOCK_API) {
      await delay(100);
      const { notifications } = getMockData();
      const index = notifications.findIndex((n) => n._id === notificationId);
      if (index >= 0) {
        notifications[index].isRead = true;
        saveMockCollection(STORAGE_KEYS.NOTIFICATIONS, notifications);
      }
      return { success: true };
    }

    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async (userId) => {
    if (USE_MOCK_API) {
      await delay(150);
      const { notifications } = getMockData();
      const updated = notifications.map((n) => (n.userId === userId ? { ...n, isRead: true } : n));
      saveMockCollection(STORAGE_KEYS.NOTIFICATIONS, updated);
      return { success: true };
    }

    const response = await api.post('/notifications/mark-all-read', { userId });
    return response.data;
  },
};
