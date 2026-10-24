import express from 'express';
import { protectRoute, adminOnly } from '../middlewares/auth.middleware.js';
import {
  getAdmin,
  updateAdmin,
  getCustomers,
  toggleCustomerStatus,
  getEmployees,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
} from '../controllers/admin.controller.js';

const router = express.Router();

// Admin Profile
router.get('/admins/:id', protectRoute, adminOnly, getAdmin);
router.patch('/admins/:id', protectRoute, adminOnly, updateAdmin);

// Customer Management
router.get('/admin/customers', protectRoute, adminOnly, getCustomers);
router.patch('/admin/customers/:id/status', protectRoute, adminOnly, toggleCustomerStatus);

// Employee / Fleet Management
router.get('/admin/employees', protectRoute, adminOnly, getEmployees);
router.post('/admin/employees', protectRoute, adminOnly, createEmployee);
router.put('/admin/employees/:id', protectRoute, adminOnly, updateEmployee);
router.patch('/admin/employees/:id/status', protectRoute, adminOnly, toggleEmployeeStatus);

export default router;