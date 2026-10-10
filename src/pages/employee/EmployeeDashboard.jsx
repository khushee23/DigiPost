import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Package,
  MapPin,
  Calendar,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deliveryService } from '../../services/deliveryService';
import { analyticsService } from '../../services/analyticsService';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { ErrorState } from '../../components/common/ErrorState';
import { formatDate } from '../../utils/formatters';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    if (!user?._id) return;
    try {
      setIsLoading(true);
      setError(null);

      const [statsRes, delivRes] = await Promise.all([
        analyticsService.getEmployeeStats(user._id),
        deliveryService.getAssignedDeliveries(user._id),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (delivRes.success) {
        // Prioritize active (assigned, in transit, out for delivery)
        const active = delivRes.deliveries.filter((d) =>
          ['ASSIGNED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(d.status)
        );
        setActiveDeliveries(active);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load postal employee dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?._id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-neutral-200 rounded animate-pulse" />
        <SkeletonLoader type="stats" />
        <SkeletonLoader type="table" count={3} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Banner / Header */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            <Building2 className="w-3.5 h-3.5 text-[#D71920]" />
            <span>{user?.station || 'Central Sorting Hub 01'}</span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mt-0.5">
            Courier Duty Desk: {user?.name || 'Courier'}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage your daily delivery manifest and report status checkpoints.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/employee/status-update">
            <Button variant="primary" size="sm" icon={Clock}>
              Update Delivery Status
            </Button>
          </Link>
          <Link to="/employee/deliveries">
            <Button variant="outline" size="sm" icon={Truck}>
              View My Manifest
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned to Route"
          value={stats?.assignedDeliveries ?? 0}
          subtitle="Total allocated dispatches"
          icon={Package}
          colorScheme="default"
        />
        <StatCard
          title="Active Deliveries"
          value={stats?.activeDeliveries ?? 0}
          subtitle="In transit / out for delivery"
          icon={Truck}
          colorScheme="amber"
        />
        <StatCard
          title="Completed Deliveries"
          value={stats?.completedDeliveries ?? 0}
          subtitle="Verified doorstep handoffs"
          icon={CheckCircle2}
          colorScheme="green"
        />
        <StatCard
          title="Failed Attempts"
          value={stats?.failedDeliveries ?? 0}
          subtitle="Requires depot re-attempt"
          icon={AlertCircle}
          colorScheme="red"
        />
      </div>

      {/* Active Route Manifest */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Today's Active Delivery Queue</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Packages currently assigned to your route awaiting completion
            </p>
          </div>
          <Link
            to="/employee/deliveries"
            className="text-xs font-semibold text-[#D71920] hover:underline inline-flex items-center gap-1"
          >
            All Assigned ({activeDeliveries.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-neutral-100">
          {activeDeliveries.length === 0 ? (
            <div className="p-12 text-center text-neutral-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500 opacity-80" />
              <p className="text-xs font-medium text-neutral-700">All current dispatches completed!</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                No active pending packages on your delivery route at this moment.
              </p>
            </div>
          ) : (
            activeDeliveries.map((del) => (
              <div
                key={del._id}
                className="p-4 sm:p-5 hover:bg-neutral-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    <Package className="w-5 h-5 text-[#D71920]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-neutral-900">
                        {del.parcel?.trackingId}
                      </span>
                      <StatusBadge status={del.status} size="sm" />
                    </div>
                    <p className="text-xs font-semibold text-neutral-800 mt-1">
                      Recipient: {del.parcel?.receiver?.name} ({del.parcel?.receiver?.phone})
                    </p>
                    <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      {del.parcel?.receiver?.address}, {del.parcel?.receiver?.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Link to={`/employee/deliveries/${del._id}`}>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </Link>
                  <Link to={`/employee/status-update?deliveryId=${del._id}`}>
                    <Button variant="primary" size="sm">
                      Update Status
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
