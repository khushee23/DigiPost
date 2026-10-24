import express from 'express'
import { protectRoute, adminOnly, selfOrAdmin } from '../middlewares/auth.middleware.js'
import { createParcel, getParcels, getParcelById, updateParcelById, deleteParcel, getBookings, getHistory } from '../controllers/parcel.controller.js'
const router = express.Router()

router.post("/parcels",protectRoute,createParcel)
router.get("/parcels",protectRoute,adminOnly,getParcels)
// Ownership checks for these three are done inside the controller (admin or the parcel's sender)
router.get("/parcels/:id",protectRoute,getParcelById)
router.patch("/parcels/:id",protectRoute,updateParcelById)
router.delete("/parcels/:id",protectRoute,deleteParcel)
// A user can only see their own bookings/history (admins can see anyone's)
router.get("/users/:id/bookings",protectRoute,selfOrAdmin("id"),getBookings)
router.get("/users/:id/history",protectRoute,selfOrAdmin("id"),getHistory)

export default router
