import express from 'express'
import { protectRoute, selfOrAdmin } from '../middlewares/auth.middleware.js'
import { getDeliveries, getDeliveriesToday, getDeliveryStatus, getDeliveryPriority, getEmployeeHistory, getEmployeePerformance } from '../controllers/delivery.controller.js'
const router = express.Router()

// :id is the EMPLOYEE id for these routes. An employee sees only their own, admins see anyone's.
router.get("/deliveries/:id/my",protectRoute,selfOrAdmin("id"),getDeliveries)
// FIX: this was adminOnly, so the employee it is meant for could never call it
router.get("/deliveries/:id/today",protectRoute,selfOrAdmin("id"),getDeliveriesToday)
// :id is the DELIVERY id here (ownership is checked in the controller)
router.get("/deliveries/:id/status",protectRoute,getDeliveryStatus)
// FIX: path was misspelled "/prioirty"
router.get("/deliveries/:id/priority",protectRoute,getDeliveryPriority)
router.get("/employees/:id/history",protectRoute,selfOrAdmin("id"),getEmployeeHistory)
router.get("/employees/:id/performance",protectRoute,selfOrAdmin("id"),getEmployeePerformance)

export default router
