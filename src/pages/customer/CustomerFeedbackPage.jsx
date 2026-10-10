import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Star, CheckCircle2, MessageSquare, Package, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { feedbackService } from '../../services/feedbackService';
import { parcelService } from '../../services/parcelService';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { formatDate } from '../../utils/formatters';

export const CustomerFeedbackPage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [searchParams] = useSearchParams();
  const prefillTrackingId = searchParams.get('trackingId') || '';

  const [deliveredParcels, setDeliveredParcels] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedTrackingId, setSelectedTrackingId] = useState(prefillTrackingId);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');

  const loadData = async () => {
    if (!user?._id) return;
    try {
      setIsLoading(true);
      const [parcelsRes, revsRes] = await Promise.all([
        parcelService.getCustomerParcels(user._id, { status: 'DELIVERED' }),
        feedbackService.getAllReviews(),
      ]);

      if (parcelsRes.success) {
        setDeliveredParcels(parcelsRes.parcels);
        if (!selectedTrackingId && parcelsRes.parcels.length > 0) {
          setSelectedTrackingId(parcelsRes.parcels[0].trackingId);
        }
      }

      if (revsRes.success) {
        setReviews(revsRes.reviews.filter((r) => r.customerId === user._id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTrackingId) {
      error('Please select a delivered parcel.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await feedbackService.submitReview({
        trackingId: selectedTrackingId,
        customerId: user._id,
        customerName: user.name,
        rating,
        feedback: feedbackText,
      });

      if (res.success) {
        success('Thank you! Your feedback has been recorded.');
        setFeedbackText('');
        loadData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit review.';
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if selected parcel already has a review
  const alreadyReviewed = reviews.some((r) => r.trackingId === selectedTrackingId);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Delivery Ratings & Feedback"
        subtitle="Help us improve postal courier service quality by reviewing your delivered packages."
        breadcrumbs={[
          { label: 'Dashboard', href: '/customer/dashboard' },
          { label: 'Feedback & Reviews' },
        ]}
      />

      {isLoading ? (
        <SkeletonLoader type="cards" count={2} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Form Column (7 cols) */}
          <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-5">
            <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              Submit Consignment Review
            </h3>

            {deliveredParcels.length === 0 ? (
              <div className="text-center py-8 text-neutral-400">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">
                  You do not have any delivered consignments eligible for review yet.
                </p>
              </div>
            ) : alreadyReviewed ? (
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-neutral-900">Review Already Recorded</h4>
                <p className="text-xs text-neutral-500 mt-1">
                  You have already submitted a review for consignment{' '}
                  <span className="font-mono font-bold text-neutral-800">{selectedTrackingId}</span>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                  label="Delivered Consignment"
                  value={selectedTrackingId}
                  onChange={(e) => setSelectedTrackingId(e.target.value)}
                  options={deliveredParcels.map((p) => ({
                    value: p.trackingId,
                    label: `${p.trackingId} — Delivered to ${p.destination}`,
                  }))}
                  required
                />

                {/* Star Rating Interactive Selector */}
                <div>
                  <label className="block text-sm font-medium text-neutral-800 mb-2">
                    Service Satisfaction Rating
                  </label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 rounded-md transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= (hoverRating || rating)
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-neutral-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-neutral-700 ml-2">
                      {hoverRating || rating} out of 5 Stars
                    </span>
                  </div>
                </div>

                <Textarea
                  label="Feedback Comments (Optional)"
                  rows={4}
                  placeholder="Share details regarding timeliness, courier professionalism, or parcel condition..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  isLoading={isSubmitting}
                  icon={Star}
                >
                  Submit Verified Review
                </Button>
              </form>
            )}
          </div>

          {/* Previous Reviews Column (5 cols) */}
          <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              Your Review History
            </h3>

            {reviews.length === 0 ? (
              <div className="text-center py-8 text-neutral-400">
                <p className="text-xs">No customer reviews submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-neutral-900">{rev.trackingId}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < rev.rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-neutral-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {rev.feedback && (
                      <p className="text-neutral-600 italic">"{rev.feedback}"</p>
                    )}
                    <span className="text-[10px] text-neutral-400 block pt-1">
                      {formatDate(rev.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
