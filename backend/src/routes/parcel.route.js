import express from 'express';
import { protectRoute, adminOnly, customerOnly } from '../middlewares/auth.middleware.js';
import {
  createParcel,
  getMyParcels,
  getParcels,
  getParcelById,
  getTracking,
  assignParcel,
  cancelParcel,
  updateParcelById,
  deleteParcel,
  getBookings,
  getHistory,
} from '../controllers/parcel.controller.js';

const router = express.Router();

// Specific routes first to prevent :id param collisions
router.post('/parcels', protectRoute, customerOnly, createParcel);
router.get('/parcels/my', protectRoute, customerOnly, getMyParcels);
router.get('/parcels/my-parcels', protectRoute, customerOnly, getMyParcels);
router.get('/parcels', protectRoute, adminOnly, getParcels);
router.post('/parcels/:parcelId/assign', protectRoute, adminOnly, assignParcel);

// Public Tracking routes
router.get('/tracking/:trackingId', getTracking);
router.get('/parcels/track/:trackingId', getTracking);

// ID-parameterized routes
router.patch('/parcels/:id/cancel', protectRoute, cancelParcel);
router.get('/parcels/:id', protectRoute, getParcelById);
router.patch('/parcels/:id', protectRoute, adminOnly, updateParcelById);
router.delete('/parcels/:id', protectRoute, adminOnly, deleteParcel);

// User legacy aliases
router.get('/users/:id/bookings', protectRoute, getBookings);
router.get('/users/:id/history', protectRoute, getHistory);

export default router;