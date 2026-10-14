import express from 'express'
import { protectRoute, adminOnly } from '../middlewares/auth.middleware.js'
import { getDeliveries, getDeliveriesToday, getDeliveryStatus, getDeliveryPriority, getEmployeeHistory, getEmployeePerformance } from '../controllers/delivery.controller.js'
const router = express.Router()

router.get("/deliveries/:id/my",protectRoute,getDeliveries)
router.get("/deliveries/:id/today",protectRoute,adminOnly,getDeliveriesToday)
router.get("/deliveries/:id/status",protectRoute,getDeliveryStatus)
router.get("/deliveries/:id/prioirty",protectRoute,getDeliveryPriority)
router.get("/employees/:id/history",protectRoute,getEmployeeHistory)
router.get("/employees/:id/performance",protectRoute,getEmployeePerformance)

export default router