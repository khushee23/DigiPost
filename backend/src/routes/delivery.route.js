import express from 'express';
import { protectRoute, adminOnly, employeeOnly } from '../middlewares/auth.middleware.js';
import {
  getMyDeliveries,
  getDeliveriesToday,
  getDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  reassignDelivery,
  assignDelivery,
} from '../controllers/delivery.controller.js';

const router = express.Router();

// Specific routes first
router.get('/deliveries/my', protectRoute, employeeOnly, getMyDeliveries);
router.get('/deliveries/my-deliveries', protectRoute, employeeOnly, getMyDeliveries);
router.get('/deliveries/assigned', protectRoute, employeeOnly, getMyDeliveries);
router.get('/deliveries/today', protectRoute, employeeOnly, getDeliveriesToday);
router.get('/deliveries', protectRoute, adminOnly, getDeliveries);

// Parameterized routes
router.get('/deliveries/:id', protectRoute, employeeOnly, getDeliveryById);
router.patch('/deliveries/:id/status', protectRoute, employeeOnly, updateDeliveryStatus);
router.post('/deliveries/:id/assign', protectRoute, adminOnly, assignDelivery);
router.patch('/deliveries/:id/reassign', protectRoute, adminOnly, reassignDelivery);

export default router;