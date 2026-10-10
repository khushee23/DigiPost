import express from 'express'
import { protectRoute, adminOnly } from '../middlewares/auth.middleware.js'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../controllers/notifications.controller.js'
const router = express.Router()

router.get("/notifications/:id", protectRoute, getNotifications);
router.get("/notifications/:id/unread-count", protectRoute, getUnreadCount);
router.patch("/notifications/:id/:notificationId/read", protectRoute, markAsRead);
router.patch("/notifications/:id/read-all", protectRoute, markAllAsRead);
export default router;