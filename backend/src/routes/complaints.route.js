import express from 'express';
import {protectRoute, adminOnly} from '../middlewares/auth.middleware.js';
import { createComplaint, getComplaints, getComplaintById, getCustomerComplaints, updateComplaintStatus } from '../controllers/complaints.controller.js';
const router = express.Router();

// Create a complaint
router.post('/complaints', protectRoute, createComplaint);
router.get('/complaints', protectRoute, adminOnly, getComplaints);
router.get('/customers/:customerId/complaints', protectRoute, getCustomerComplaints);
router.get('/complaints/:id', protectRoute, getComplaintById);
router.patch('/complaints/:id', protectRoute, adminOnly, updateComplaintStatus);

export default router;