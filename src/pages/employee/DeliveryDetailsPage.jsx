import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Truck,
  Package,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { TrackingTimeline } from '../../components/parcels/TrackingTimeline';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { formatDate, formatDateTime, formatWeight } from '../../utils/formatters';

export const DeliveryDetailsPage = () => {
  const { deliveryId } = useParams();
  const navigate = useNavigate();

  const [delivery, setDelivery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await deliveryService.getDeliveryDetails(deliveryId);
      if (res.success) {
        setDelivery(res.delivery);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to retrieve delivery details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (deliveryId) {
      loadData();
    }
  }, [deliveryId]);

  if (isLoading) {
    return <LoadingSpinner fullPage message="Loading delivery consignment data..." />;
  }

  if (error || !delivery) {
    return (
      <ErrorState
        title="Delivery Not Found"
        message={error || `Could not find delivery ID '${deliveryId}'.`}
        onRetry={() => navigate('/employee/deliveries')}
      />
    );
  }

  const { parcel } = delivery;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      <PageHeader
        title={`Delivery: ${delivery.deliveryId}`}
        subtitle={`Tracking Consignment: ${parcel?.trackingId} • Scheduled: ${formatDate(delivery.scheduledDate)}`}
        badge={<StatusBadge status={delivery.status} size="lg" />}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/employee/deliveries">
              <Button variant="outline" size="sm" icon={ArrowLeft}>
                Back to Manifest
              </Button>
            </Link>
            <Link to={`/employee/status-update?deliveryId=${delivery._id}`}>
              <Button variant="primary" size="sm" icon={Clock}>
                Update Delivery Status
              </Button>
            </Link>
          </div>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/employee/dashboard' },
          { label: 'My Deliveries', href: '/employee/deliveries' },
          { label: delivery.deliveryId },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Progress Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-2xs">
          <h3 className="text-sm font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#D71920]" />
            Consignment Transit Milestone History
          </h3>
          {parcel && (
            <TrackingTimeline
              status={parcel.status}
              history={parcel.history}
              failureReason={parcel.failureReason}
            />
          )}
        </div>

        {/* Right Column: Recipient & Delivery Instructions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Destination Details Card */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 pb-2 border-b border-neutral-100 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#D71920]" /> Doorstep Delivery Location
            </h4>
            <div className="bg-neutral-50 p-4 rounded-xl text-xs space-y-2">
              <div>
                <span className="text-neutral-400 text-[11px] block">Recipient Name</span>
                <span className="font-bold text-neutral-900 text-sm block">
                  {parcel?.receiver?.name}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 text-[11px] block">Contact Number</span>
                <span className="font-medium text-neutral-800">{parcel?.receiver?.phone}</span>
              </div>
              <div>
                <span className="text-neutral-400 text-[11px] block">Street Address</span>
                <span className="font-medium text-neutral-800 leading-relaxed block">
                  {parcel?.receiver?.address}, {parcel?.receiver?.city}, {parcel?.receiver?.state} {parcel?.receiver?.postalCode}
                </span>
              </div>
            </div>
          </div>

          {/* Consignment Notes & Instructions */}
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 pb-2 border-b border-neutral-100">
              Parcel Details & Instructions
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-neutral-50 rounded-lg">
                <span className="text-neutral-400 text-[11px] block">Category</span>
                <span className="font-semibold text-neutral-900 capitalize">{parcel?.parcelType}</span>
              </div>
              <div className="p-2.5 bg-neutral-50 rounded-lg">
                <span className="text-neutral-400 text-[11px] block">Weight</span>
                <span className="font-semibold text-neutral-900">{formatWeight(parcel?.weight)}</span>
              </div>
            </div>
            {delivery.notes && (
              <div className="p-3 bg-neutral-50 rounded-lg text-xs text-neutral-700">
                <span className="font-bold text-neutral-900 block mb-0.5">Admin Dispatch Notes:</span>
                {delivery.notes}
              </div>
            )}
            {parcel?.description && (
              <div className="p-3 bg-neutral-50 rounded-lg text-xs text-neutral-700">
                <span className="font-bold text-neutral-900 block mb-0.5">Package Contents:</span>
                {parcel.description}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
