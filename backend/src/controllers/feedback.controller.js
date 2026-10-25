import store from '../services/store.js';

// GET /feedback
export const getAllReviews = async (req, res) => {
  try {
    const reviews = store.getReviews().map((r) => ({
      ...r,
      _id: r.id || r._id,
      trackingId: r.trackingId || r.tracking_id,
    }));

    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ success: false, message: 'Failed to load reviews' });
  }
};

// GET /feedback/:trackingId
export const getReviewByTrackingId = async (req, res) => {
  try {
    const { trackingId } = req.params;
    const review = store.getReviewByTrackingId(trackingId);

    return res.status(200).json({
      success: true,
      review: review ? { ...review, _id: review.id || review._id, trackingId: review.trackingId } : null,
    });
  } catch (error) {
    console.error('Error fetching review:', error);
    return res.status(500).json({ success: false, message: 'Failed to load review' });
  }
};

// POST /feedback
export const submitReview = async (req, res) => {
  try {
    const { trackingId, rating, feedback } = req.body;
    if (!trackingId) {
      return res.status(400).json({ success: false, message: 'trackingId is required' });
    }

    const review = await store.addReview(
      {
        trackingId,
        rating,
        feedback,
      },
      req.user
    );

    return res.status(201).json({
      success: true,
      review: { ...review, _id: review.id || review._id },
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error submitting review',
    });
  }
};
