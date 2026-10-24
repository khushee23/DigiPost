import express from 'express'
import { protectRoute, adminOnly, selfOrAdmin } from '../middlewares/auth.middleware.js'
import { getUsers, getUserById, updateUserById, deleteUser } from '../controllers/user.controller.js'
const router = express.Router()

router.get("/users", protectRoute, adminOnly, getUsers)
// FIX: protectRoute was missing here, so adminOnly crashed (req.user was undefined).
// A user may read their own record; admins may read any.
router.get("/users/:id", protectRoute, selfOrAdmin("id"), getUserById)
router.patch("/users/:id", protectRoute, adminOnly, updateUserById)
router.delete("/users/:id", protectRoute, adminOnly, deleteUser)

export default router
