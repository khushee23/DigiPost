import express from 'express';
import { protectRoute, adminOnly } from '../middlewares/auth.middleware.js';
import {
  getMeUser,
  updateMeUser,
  getUsers,
  getUserById,
  updateUserById,
  toggleUserStatus,
  deleteUser,
} from '../controllers/user.controller.js';

const router = express.Router();

// Specific routes first to prevent :id param collisions
router.get('/users/me', protectRoute, getMeUser);
router.patch('/users/me', protectRoute, updateMeUser);

// User management routes
router.get('/users', protectRoute, adminOnly, getUsers);
router.patch('/users/:id/status', protectRoute, adminOnly, toggleUserStatus);
router.get('/users/:id', protectRoute, getUserById);
router.patch('/users/:id', protectRoute, adminOnly, updateUserById);
router.delete('/users/:id', protectRoute, adminOnly, deleteUser);

export default router;