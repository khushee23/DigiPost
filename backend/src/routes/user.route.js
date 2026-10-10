import express from 'express'
import { protectRoute, adminOnly } from '../middlewares/auth.middleware.js'
import { getUsers, getUserById, updateUserById, deleteUser } from '../controllers/user.controller.js'
const router = express.Router()

router.get("/users",protectRoute,adminOnly,getUsers)
router.get("/users/:id",adminOnly,getUserById)
router.patch("/users/:id",protectRoute,adminOnly,updateUserById)
router.delete("/users/:id",protectRoute,adminOnly,deleteUser)

export default router