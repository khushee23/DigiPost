import express from 'express';
import { protectRoute, adminOnly, customerOnly, employeeOnly } from '../middlewares/auth.middleware.js';
import {
  getCustomerSummary,
  getEmployeeSummary,
  getAdminSummary,
  getDeliveriesAnalytics,
  getRevenueAnalytics,
} from '../controllers/analytics.controller.js';

const router = express.Router();

router.get('/analytics/customer-summary', protectRoute, customerOnly, getCustomerSummary);
router.get('/analytics/employee-summary', protectRoute, employeeOnly, getEmployeeSummary);
router.get('/analytics/admin-summary', protectRoute, adminOnly, getAdminSummary);
router.get('/analytics/dashboard', protectRoute, adminOnly, getAdminSummary);
router.get('/analytics/deliveries', protectRoute, adminOnly, getDeliveriesAnalytics);
router.get('/analytics/revenue', protectRoute, adminOnly, getRevenueAnalytics);

export default router;
