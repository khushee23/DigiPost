import express from 'express';
import { protectRoute } from '../middlewares/auth.middleware.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../controllers/notifications.controller.js';

const router = express.Router();

// Contract standard routes (used by frontend notificationService)
router.get('/notifications', protectRoute, getNotifications);
router.patch('/notifications/read-all', protectRoute, markAllAsRead);
router.post('/notifications/mark-all-read', protectRoute, markAllAsRead);
router.patch('/notifications/:notificationId/read', protectRoute, markAsRead);

// Parameterized compatibility routes
router.get('/notifications/:id', protectRoute, getNotifications);
router.get('/notifications/:id/unread-count', protectRoute, getUnreadCount);
router.patch('/notifications/:id/:notificationId/read', protectRoute, markAsRead);
router.patch('/notifications/:id/read-all', protectRoute, markAllAsRead);

export default router;