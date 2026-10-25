import store from '../services/store.js';

// GET /notifications (supports query ?userId=... and req.user.id)
export const getNotifications = async (req, res) => {
  try {
    let userId = req.query.userId || req.params.id || req.user?.id;
    // Security: Non-admin users can only view their own notifications
    if (req.user?.role !== 'admin') {
      userId = req.user?.id;
    }
    const notifications = store.getNotifications(userId).map((n) => ({
      ...n,
      _id: n.id || n._id,
      isRead: n.isRead !== undefined ? n.isRead : n.is_read,
    }));

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

// GET /notifications/:id/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    let userId = req.params.id || req.query.userId || req.user?.id;
    if (req.user?.role !== 'admin') {
      userId = req.user?.id;
    }
    const notifications = store.getNotifications(userId);
    const unreadCount = notifications.filter((n) => !(n.isRead !== undefined ? n.isRead : n.is_read)).length;

    return res.status(200).json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch unread notification count' });
  }
};

// PATCH /notifications/:notificationId/read or PATCH /notifications/:id/:notificationId/read
export const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.notificationId || req.params.id;
    await store.markNotificationRead(notificationId, req.user?.id);

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to mark notification as read' });
  }
};

// POST /notifications/mark-all-read or PATCH /notifications/read-all
export const markAllAsRead = async (req, res) => {
  try {
    let userId = req.body?.userId || req.params.id || req.user?.id;
    if (req.user?.role !== 'admin') {
      userId = req.user?.id;
    }
    if (userId) {
      await store.markAllNotificationsRead(userId);
    }

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return res.status(500).json({ success: false, message: 'Failed to mark notifications as read' });
  }
};
