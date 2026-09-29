import express from 'express'
import { protectRoute, adminOnly } from '../middlewares/auth.middleware.js'
import { createParcel, getParcels, getParcelById, updateParcelById, deleteParcel, getBookings, getHistory } from '../controllers/parcel.controller.js'
const router = express.Router()

router.post("/parcels",protectRoute,createParcel)
router.get("/parcels",protectRoute,adminOnly,getParcels)
router.get("/parcels/:id",protectRoute,getParcelById)
router.patch("/parcels/:id",protectRoute,updateParcelById)
router.delete("/parcels/:id",protectRoute,deleteParcel)
router.get("/users/:id/bookings",protectRoute,getBookings)
router.get("/users/:id/history",protectRoute,getHistory)

export default router