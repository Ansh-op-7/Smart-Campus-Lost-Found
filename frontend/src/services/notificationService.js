import api from './api';

/**
 * Service for in-app user notifications.
 */
export const notificationService = {
  /**
   * Fetch all notifications for the current authenticated user.
   */
  async getNotifications() {
    const response = await api.get('/api/notifications');
    return response.data;
  },

  /**
   * Fetch count of unread notifications.
   */
  async getUnreadCount() {
    const response = await api.get('/api/notifications/unread-count');
    return response.data;
  },

  /**
   * Mark a single notification as read.
   * @param {number|string} id
   */
  async markAsRead(id) {
    const response = await api.put(`/api/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all unread notifications as read.
   */
  async markAllAsRead() {
    const response = await api.put('/api/notifications/read-all');
    return response.data;
  },
};

export default notificationService;
