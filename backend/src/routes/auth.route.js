import express from 'express'
import { protectRoute } from '../middlewares/auth.middleware.js'
import { register, login, logout, getMe, updateProfile, changePassword } from '../controllers/auth.controller.js'
const router = express.Router()

router.post("/auth/register", register)
router.post("/auth/login", login)
router.post("/auth/logout", logout)
router.get("/auth/me", protectRoute, getMe)
router.put("/auth/profile", protectRoute, updateProfile)
router.put("/auth/change-password", protectRoute, changePassword)

export default router
