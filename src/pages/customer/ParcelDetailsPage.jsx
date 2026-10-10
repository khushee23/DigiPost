import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Calendar,
  MapPin,
  User,
  Phone,
  Mail,
  Truck,
  MessageSquareWarning,
  Star,
  ArrowLeft,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { parcelService } from '../../services/parcelService';
import { feedbackService } from '../../services/feedbackService';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TrackingTimeline } from '../../components/parcels/TrackingTimeline';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { formatDate, formatCurrency, formatWeight } from '../../utils/formatters';

export const ParcelDetailsPage = () => {
  const { trackingId } = useParams();
  const navigate = useNavigate();

  const [parcel, setParcel] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await parcelService.getParcelDetails(trackingId);
      if (res.success) {
        setParcel(res.parcel);
        // Check if review exists for this parcel
        try {
          const revRes = await feedbackService.getReviewByTrackingId(res.parcel.trackingId);
          if (revRes.success) setExistingReview(revRes.review);
        } catch {
          // No review found
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Parcel record not found.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (trackingId) {
      loadData();
    }
  }, [trackingId]);

  if (isLoading) {
    return <LoadingSpinner fullPage message="Loading parcel tracking details..." />;
  }

  if (error || !parcel) {
    return (
      <ErrorState
        title="Consignment Not Found"
        message={error || `Could not find parcel matching tracking ID '${trackingId}'.`}
        onRetry={() => navigate('/customer/parcels')}
      />
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <PageHeader
        title={`Parcel: ${parcel.trackingId}`}
        subtitle={`Registered on ${formatDate(parcel.bookingDate)} • Status: ${parcel.status.replace(/_/g, ' ')}`}
        badge={<StatusBadge status={parcel.status} size="lg" />}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/customer/parcels">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back to Parcels
              </Button>
            </Link>
            {parcel.status === 'DELIVERED' && !existingReview && (
              <Link to={`/customer/feedback?trackingId=${parcel.trackingId}`}>
                <Button variant="primary" size="sm" icon={Star}>
                  Leave a Review
                </Button>
              </Link>
            )}
            <Link to={`/customer/complaints?trackingId=${parcel.trackingId}`}>
              <Button variant="outline" size="sm" icon={MessageSquareWarning}>
                Report Issue
              </Button>
            </Link>
          </div>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/customer/dashboard' },
          { label: 'My Parcels', href: '/customer/parcels' },
          { label: parcel.trackingId },
        ]}
      />

      {/* Main Grid: Details + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tracking Progression Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-2xs">
          <h3 className="text-sm font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#D71920]" />
            Consignment Transit Progress
          </h3>
          <TrackingTimeline
            status={parcel.status}
            history={parcel.history}
            failureReason={parcel.failureReason}
          />
        </div>

        {/* Right Column: Sender, Receiver & Specifications Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Specifications Card */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 pb-2 border-b border-neutral-100">
              Shipment Specifications
            </h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-neutral-50 rounded-lg">
                <span className="text-neutral-400 text-[11px] block">Category</span>
                <span className="font-semibold text-neutral-900 capitalize">{parcel.parcelType}</span>
              </div>
              <div className="p-2.5 bg-neutral-50 rounded-lg">
                <span className="text-neutral-400 text-[11px] block">Weight</span>
                <span className="font-semibold text-neutral-900">{formatWeight(parcel.weight)}</span>
              </div>
              <div className="p-2.5 bg-neutral-50 rounded-lg">
                <span className="text-neutral-400 text-[11px] block">Postage Fee</span>
                <span className="font-semibold text-neutral-900">{formatCurrency(parcel.cost)}</span>
              </div>
              <div className="p-2.5 bg-neutral-50 rounded-lg">
                <span className="text-neutral-400 text-[11px] block">Est. Delivery</span>
                <span className="font-semibold text-neutral-900">{formatDate(parcel.expectedDeliveryDate)}</span>
              </div>
            </div>
            {parcel.description && (
              <div className="mt-3 p-3 bg-neutral-50 rounded-lg text-xs text-neutral-600">
                <span className="font-medium text-neutral-800 block mb-0.5">Description:</span>
                {parcel.description}
              </div>
            )}
          </div>

          {/* Sender & Receiver Card */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-neutral-500" /> Sender Information
              </h4>
              <div className="text-xs text-neutral-700 bg-neutral-50 p-3 rounded-lg space-y-1">
                <p className="font-semibold text-neutral-900">{parcel.sender?.name}</p>
                <p className="text-neutral-500">{parcel.sender?.phone}</p>
                <p className="text-neutral-600">
                  {parcel.sender?.address}, {parcel.sender?.city}, {parcel.sender?.state} {parcel.sender?.postalCode}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D71920]" /> Receiver Information
              </h4>
              <div className="text-xs text-neutral-700 bg-neutral-50 p-3 rounded-lg space-y-1">
                <p className="font-semibold text-neutral-900">{parcel.receiver?.name}</p>
                <p className="text-neutral-500">{parcel.receiver?.phone}</p>
                <p className="text-neutral-600">
                  {parcel.receiver?.address}, {parcel.receiver?.city}, {parcel.receiver?.state} {parcel.receiver?.postalCode}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned Delivery Courier (If assigned) */}
          {parcel.assignedTo && (
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-blue-600" /> Assigned Postal Courier
              </h4>
              <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {parcel.assignedTo.name.charAt(0)}
                </div>
                <div className="text-xs">
                  <p className="font-bold text-neutral-900">{parcel.assignedTo.name}</p>
                  <p className="text-neutral-500">{parcel.assignedTo.email}</p>
                  <p className="text-neutral-500">{parcel.assignedTo.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Review if already submitted */}
          {existingReview && (
            <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Your Rating & Review
              </h4>
              <div className="p-3 bg-emerald-50/50 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < existingReview.rating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-neutral-300'
                      }`}
                    />
                  ))}
                  <span className="font-bold text-neutral-800 ml-1.5">{existingReview.rating} / 5</span>
                </div>
                {existingReview.feedback && (
                  <p className="text-neutral-700 italic">"{existingReview.feedback}"</p>
                )}
                <span className="text-[10px] text-neutral-400 block pt-1">
                  Submitted {formatDate(existingReview.createdAt)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
