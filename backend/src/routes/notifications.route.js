import express from 'express'
import { protectRoute, selfOrAdmin } from '../middlewares/auth.middleware.js'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../controllers/notifications.controller.js'
const router = express.Router()

// FIX: any logged-in user could read or modify anyone's notifications by changing the id.
// :id is the owner's user id, so only that user (or an admin) is allowed through.
router.get("/notifications/:id", protectRoute, selfOrAdmin("id"), getNotifications);
router.get("/notifications/:id/unread-count", protectRoute, selfOrAdmin("id"), getUnreadCount);
router.patch("/notifications/:id/:notificationId/read", protectRoute, selfOrAdmin("id"), markAsRead);
router.patch("/notifications/:id/read-all", protectRoute, selfOrAdmin("id"), markAllAsRead);
export default router;
