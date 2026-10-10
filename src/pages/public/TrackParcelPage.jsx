import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Package, MapPin, Calendar, Weight, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { parcelService } from '../../services/parcelService';
import { TrackingTimeline } from '../../components/parcels/TrackingTimeline';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

export const TrackParcelPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const [trackingIdInput, setTrackingIdInput] = useState(initialId);
  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTracking = async (id) => {
    if (!id.trim()) return;
    try {
      setIsLoading(true);
      setError('');
      setTrackingData(null);
      const res = await parcelService.getPublicTracking(id.trim());
      if (res.success) {
        setTrackingData(res.tracking);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Parcel record not found.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchTracking(initialId);
    }
  }, [initialId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (trackingIdInput.trim()) {
      setSearchParams({ id: trackingIdInput.trim() });
      fetchTracking(trackingIdInput.trim());
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Title & Search Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#D71920] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Search className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
            Public Parcel Tracking
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-md mx-auto">
            Check the real-time processing and delivery transit status of any postal shipment.
          </p>
        </div>

        {/* Tracking Search Input Box */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-md border border-neutral-200 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Package className="w-5 h-5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={trackingIdInput}
                onChange={(e) => setTrackingIdInput(e.target.value)}
                placeholder="Enter Tracking ID (e.g. PO-84920184)"
                className="w-full pl-11 pr-4 py-3 text-sm text-neutral-900 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#D71920] focus:border-[#D71920]"
                required
              />
            </div>
            <Button type="submit" variant="primary" size="md" isLoading={isLoading} icon={Search}>
              Track Shipment
            </Button>
          </form>

          {/* Quick links to sample IDs */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <span>Quick tests:</span>
            <button
              type="button"
              onClick={() => {
                setTrackingIdInput('PO-84920184');
                setSearchParams({ id: 'PO-84920184' });
                fetchTracking('PO-84920184');
              }}
              className="px-2 py-0.5 rounded bg-neutral-100 hover:bg-red-50 hover:text-[#D71920] text-neutral-700 font-mono text-[11px]"
            >
              PO-84920184 (Out for Delivery)
            </button>
            <button
              type="button"
              onClick={() => {
                setTrackingIdInput('PO-98231019');
                setSearchParams({ id: 'PO-98231019' });
                fetchTracking('PO-98231019');
              }}
              className="px-2 py-0.5 rounded bg-neutral-100 hover:bg-emerald-50 hover:text-emerald-700 text-neutral-700 font-mono text-[11px]"
            >
              PO-98231019 (Delivered)
            </button>
            <button
              type="button"
              onClick={() => {
                setTrackingIdInput('PO-41029481');
                setSearchParams({ id: 'PO-41029481' });
                fetchTracking('PO-41029481');
              }}
              className="px-2 py-0.5 rounded bg-neutral-100 hover:bg-amber-50 hover:text-amber-700 text-neutral-700 font-mono text-[11px]"
            >
              PO-41029481 (Failed Attempt)
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading && <LoadingSpinner message="Querying postal tracking registry..." />}

        {/* Error State */}
        {error && (
          <div className="bg-white p-8 rounded-2xl border border-red-200 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 mb-1">Tracking Record Not Found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed mb-4">{error}</p>
            <p className="text-xs text-neutral-400">
              Please ensure the tracking ID is typed correctly, or contact customer support.
            </p>
          </div>
        )}

        {/* Tracking Details Card */}
        {trackingData && !isLoading && (
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-md overflow-hidden animate-fade-in">
            {/* Top Bar with Tracking ID and Status Badge */}
            <div className="p-6 bg-[#1C1C1C] text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                  Official Postal Consignment
                </span>
                <h2 className="text-xl sm:text-2xl font-mono font-bold text-white mt-0.5">
                  {trackingData.trackingId}
                </h2>
              </div>
              <div>
                <StatusBadge status={trackingData.status} size="lg" />
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-neutral-200 bg-neutral-50/50">
              <div className="p-3 bg-white rounded-xl border border-neutral-200">
                <span className="text-[11px] text-neutral-400 block mb-1">Origin City</span>
                <p className="text-xs font-semibold text-neutral-900 truncate">{trackingData.originCity}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-neutral-200">
                <span className="text-[11px] text-neutral-400 block mb-1">Destination City</span>
                <p className="text-xs font-semibold text-neutral-900 truncate">{trackingData.destinationCity}</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-neutral-200">
                <span className="text-[11px] text-neutral-400 block mb-1">Parcel Category</span>
                <p className="text-xs font-semibold text-neutral-900 capitalize">{trackingData.parcelType} ({trackingData.weight} kg)</p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-neutral-200">
                <span className="text-[11px] text-neutral-400 block mb-1">Est. Delivery</span>
                <p className="text-xs font-semibold text-neutral-900">
                  {formatDate(trackingData.expectedDeliveryDate)}
                </p>
              </div>
            </div>

            {/* Tracking Progression Timeline */}
            <div className="p-6 sm:p-8">
              <TrackingTimeline
                status={trackingData.status}
                history={trackingData.history}
                failureReason={trackingData.failureReason}
              />
            </div>

            {/* Privacy Safe Notice Footer */}
            <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Public Tracking View (Sensitive customer data protected)</span>
              </div>
              <Link to="/login" className="text-[#D71920] font-semibold hover:underline">
                Customer Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
