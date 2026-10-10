import api, { USE_MOCK_API } from './api';
import { getMockData, saveMockCollection, STORAGE_KEYS } from './mockData';

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const feedbackService = {
  // Get review for a tracking ID
  getReviewByTrackingId: async (trackingId) => {
    if (USE_MOCK_API) {
      await delay();
      const { reviews } = getMockData();
      const review = reviews.find((r) => r.trackingId === trackingId);
      return { success: true, review: review || null };
    }

    const response = await api.get(`/feedback/${trackingId}`);
    return response.data;
  },

  // Submit new review
  submitReview: async ({ trackingId, customerId, customerName, rating, feedback }) => {
    if (USE_MOCK_API) {
      await delay(250);
      const { reviews } = getMockData();
      const existing = reviews.find((r) => r.trackingId === trackingId);
      if (existing) {
        throw new Error('A review has already been submitted for this parcel.');
      }

      const newReview = {
        _id: `rev_${Date.now()}`,
        trackingId,
        customerId,
        customerName,
        rating,
        feedback,
        createdAt: new Date().toISOString(),
      };

      const updated = [newReview, ...reviews];
      saveMockCollection(STORAGE_KEYS.REVIEWS, updated);

      return { success: true, review: newReview };
    }

    const response = await api.post('/feedback', { trackingId, rating, feedback });
    return response.data;
  },

  // Get all customer reviews (for public or admin)
  getAllReviews: async () => {
    if (USE_MOCK_API) {
      await delay();
      const { reviews } = getMockData();
      return { success: true, reviews };
    }

    const response = await api.get('/feedback');
    return response.data;
  },
};
