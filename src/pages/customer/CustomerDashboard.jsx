import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  PlusCircle,
  Search,
  ArrowRight,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { analyticsService } from '../../services/analyticsService';
import { parcelService } from '../../services/parcelService';
import { StatCard } from '../../components/common/StatCard';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { ErrorState } from '../../components/common/ErrorState';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentParcels, setRecentParcels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    if (!user?._id) return;
    try {
      setIsLoading(true);
      setError(null);

      const [statsRes, parcelsRes] = await Promise.all([
        analyticsService.getCustomerStats(user._id),
        parcelService.getCustomerParcels(user._id, { limit: 5 }),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (parcelsRes.success) setRecentParcels(parcelsRes.parcels.slice(0, 5));
    } catch (err) {
      console.error(err);
      setError('Unable to load customer dashboard data.');
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
        <SkeletonLoader type="table" count={4} />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting and Quick Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Customer Dashboard
          </span>
          <h1 className="text-2xl font-bold text-neutral-900 mt-0.5">
            Welcome back, {user?.name || 'Customer'}
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Track your dispatches and book new consignments with ease.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/customer/book">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              Book a Parcel
            </Button>
          </Link>
          <Link to="/customer/track">
            <Button variant="outline" size="sm" icon={Search}>
              Track Shipment
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Consignments"
          value={stats?.totalParcels ?? 0}
          subtitle="All-time bookings"
          icon={Package}
          colorScheme="default"
        />
        <StatCard
          title="Pending Processing"
          value={stats?.pendingDeliveries ?? 0}
          subtitle="Awaiting depot dispatch"
          icon={Clock}
          colorScheme="amber"
        />
        <StatCard
          title="In Transit"
          value={stats?.inTransitDeliveries ?? 0}
          subtitle="En route to destination"
          icon={Truck}
          colorScheme="blue"
        />
        <StatCard
          title="Delivered"
          value={stats?.completedDeliveries ?? 0}
          subtitle="Completed doorsteps"
          icon={CheckCircle2}
          colorScheme="green"
        />
      </div>

      {/* Main Content: Recent Parcels + Status Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Parcels Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Recent Parcel Bookings</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Your latest registered packages</p>
            </div>
            <Link
              to="/customer/parcels"
              className="text-xs font-semibold text-[#D71920] hover:underline inline-flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-[11px] font-semibold text-neutral-600 uppercase border-b border-neutral-100">
                <tr>
                  <th className="px-4 py-3">Tracking ID</th>
                  <th className="px-4 py-3">Booking Date</th>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentParcels.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-neutral-400">
                      You have not booked any parcels yet. Click "Book a Parcel" to begin!
                    </td>
                  </tr>
                ) : (
                  recentParcels.map((p) => (
                    <tr key={p._id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-neutral-900">
                        {p.trackingId}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-500">
                        {formatDate(p.bookingDate)}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-800 truncate max-w-[150px]">
                        {p.destination}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={p.status} size="sm" />
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          to={`/customer/parcels/${p.trackingId}`}
                          className="font-semibold text-[#D71920] hover:underline"
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Distribution Visual Chart */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-neutral-200 shadow-2xs p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Shipment Status Breakdown</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Real-time parcel distribution</p>
          </div>

          <div className="h-56 w-full my-3">
            {stats?.statusDistribution && stats.statusDistribution.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusDistribution.filter((d) => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stats.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1C1C1C',
                      borderColor: '#333',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-400 text-xs">
                No parcel records to display
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Active Complaints: <strong className="text-neutral-800">{stats?.activeComplaints ?? 0}</strong></span>
            <Link to="/customer/complaints" className="text-[#D71920] hover:underline font-medium">
              View Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
