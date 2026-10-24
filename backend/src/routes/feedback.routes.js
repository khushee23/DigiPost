import express from 'express';
import { protectRoute, customerOnly } from '../middlewares/auth.middleware.js';
import {
  getAllReviews,
  getReviewByTrackingId,
  submitReview,
} from '../controllers/feedback.controller.js';

const router = express.Router();

router.get('/feedback', getAllReviews);
router.get('/reviews', getAllReviews);
router.get('/feedback/:trackingId', getReviewByTrackingId);
router.get('/reviews/:trackingId', getReviewByTrackingId);
router.post('/feedback', protectRoute, customerOnly, submitReview);
router.post('/reviews', protectRoute, customerOnly, submitReview);

export default router;
