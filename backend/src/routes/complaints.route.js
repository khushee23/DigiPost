import express from 'express';
import { protectRoute, adminOnly, customerOnly } from '../middlewares/auth.middleware.js';
import {
  createComplaint,
  getMyComplaints,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
} from '../controllers/complaints.controller.js';

const router = express.Router();

// Specific routes first to prevent :id param collisions
router.post('/complaints', protectRoute, customerOnly, createComplaint);
router.get('/complaints/my', protectRoute, customerOnly, getMyComplaints);
router.get('/complaints/my-complaints', protectRoute, customerOnly, getMyComplaints);
router.get('/complaints', protectRoute, adminOnly, getComplaints);

// ID-parameterized routes
router.get('/complaints/:id', protectRoute, getComplaintById);
router.patch('/complaints/:id/status', protectRoute, adminOnly, updateComplaintStatus);
router.patch('/complaints/:id', protectRoute, adminOnly, updateComplaintStatus);

export default router;