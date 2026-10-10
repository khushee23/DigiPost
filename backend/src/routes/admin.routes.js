
import express from 'express';
import { protectRoute, adminOnly } from '../middlewares/auth.middleware.js';
import { getAdmin, updateAdmin } from '../controllers/admin.controller.js';
const router = express.Router();

router.get('/admins/:id', protectRoute, adminOnly, getAdmin);
router.patch('/admins/:id', protectRoute, adminOnly, updateAdmin);

export default router;