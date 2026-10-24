import express from 'express';
import { protectRoute, adminOnly, selfOrAdmin } from '../middlewares/auth.middleware.js';
import { createComplaint, getComplaints, getComplaintById, getCustomerComplaints, getMyComplaints, updateComplaintStatus } from '../controllers/complaints.controller.js';
const router = express.Router();

// Create a complaint
router.post('/complaints', protectRoute, createComplaint);
router.get('/complaints', protectRoute, adminOnly, getComplaints);
// NOTE: "my-complaints" must be declared BEFORE "/complaints/:id", otherwise Express
// would treat "my-complaints" as an id.
router.get('/complaints/my-complaints', protectRoute, getMyComplaints);
router.get('/customers/:customerId/complaints', protectRoute, selfOrAdmin('customerId'), getCustomerComplaints);
router.get('/complaints/:id', protectRoute, getComplaintById);
router.patch('/complaints/:id', protectRoute, adminOnly, updateComplaintStatus);
// Same handler under the path the frontend contract uses
router.patch('/complaints/:id/status', protectRoute, adminOnly, updateComplaintStatus);

export default router;
