import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  MessageSquareWarning,
  Send,
  BarChart3,
  ArrowRight,
  TrendingUp,
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
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentParcels, setRecentParcels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [statsRes, parcelsRes] = await Promise.all([
        analyticsService.getAdminStats(),
        parcelService.getAllParcels({ limit: 5 }),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (parcelsRes.success) setRecentParcels(parcelsRes.parcels.slice(0, 5));
    } catch (err) {
      console.error(err);
      setError('Unable to load administration dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Admin Command Header */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            System Administration
          </span>
          <h1 className="text-2xl font-bold text-neutral-900 mt-0.5">
            Postal Operations Command Center
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Real-time oversight of consignments, courier fleets, and customer support.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link to="/admin/assignment">
            <Button variant="primary" size="sm" icon={Send}>
              Assign Pending Parcels
            </Button>
          </Link>
          <Link to="/admin/employees">
            <Button variant="outline" size="sm" icon={UserCheck}>
              Manage Couriers
            </Button>
          </Link>
          <Link to="/admin/reports">
            <Button variant="secondary" size="sm" icon={BarChart3}>
              Analytics Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Parcels"
          value={stats?.totalParcels ?? 0}
          subtitle="System manifest volume"
          icon={Package}
          colorScheme="default"
        />
        <StatCard
          title="Pending Dispatch"
          value={stats?.pendingDeliveries ?? 0}
          subtitle="Awaiting courier allocation"
          icon={Clock}
          colorScheme="amber"
        />
        <StatCard
          title="Delivered Doorsteps"
          value={stats?.completedDeliveries ?? 0}
          subtitle="Verified successful dropoffs"
          icon={CheckCircle2}
          colorScheme="green"
        />
        <StatCard
          title="Total Postage Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          subtitle="Collected freight value"
          icon={DollarSign}
          colorScheme="red"
        />
      </div>

      {/* Secondary Quick Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-neutral-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block font-medium">Customers</span>
            <span className="text-lg font-bold text-neutral-900">{stats?.totalCustomers ?? 0}</span>
          </div>
          <Users className="w-5 h-5 text-neutral-400" />
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block font-medium">Couriers on Staff</span>
            <span className="text-lg font-bold text-neutral-900">{stats?.totalEmployees ?? 0}</span>
          </div>
          <UserCheck className="w-5 h-5 text-blue-600" />
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block font-medium">Failed Attempts</span>
            <span className="text-lg font-bold text-red-600">{stats?.failedDeliveries ?? 0}</span>
          </div>
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
        <div className="bg-white p-4 rounded-xl border border-neutral-200 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-neutral-400 block font-medium">Open Support Tickets</span>
            <span className="text-lg font-bold text-amber-600">{stats?.openComplaints ?? 0}</span>
          </div>
          <MessageSquareWarning className="w-5 h-5 text-amber-500" />
        </div>
      </div>

      {/* Analytics Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Volume Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Weekly Consignment Volume Trends</h3>
              <p className="text-xs text-neutral-400">Bookings vs successful deliveries by day</p>
            </div>
            <span className="text-xs font-semibold text-[#D71920]">Current Week</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.weeklyVolume || []}>
                <XAxis dataKey="day" stroke="#888" fontSize={11} />
                <YAxis stroke="#888" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1C1C1C',
                    borderColor: '#333',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="bookings" name="Booked" fill="#1C1C1C" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delivered" name="Delivered" fill="#D71920" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consignment Status Distribution Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-neutral-900">Delivery Status Breakdown</h3>
              <p className="text-xs text-neutral-400">Live parcel state distribution</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.statusDistribution?.filter((d) => d.value > 0) || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {(stats?.statusDistribution || []).map((entry, index) => (
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
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Parcels Activity Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Recent System Consignments</h3>
            <p className="text-xs text-neutral-400">Most recently created postal bookings</p>
          </div>
          <Link
            to="/admin/parcels"
            className="text-xs font-semibold text-[#D71920] hover:underline inline-flex items-center gap-1"
          >
            All Parcels <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 text-[11px] font-semibold text-neutral-600 uppercase border-b border-neutral-100">
              <tr>
                <th className="px-4 py-3">Tracking ID</th>
                <th className="px-4 py-3">Sender</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Assigned Courier</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recentParcels.map((p) => (
                <tr key={p._id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="px-4 py-3.5 font-mono font-bold text-neutral-900">{p.trackingId}</td>
                  <td className="px-4 py-3.5 text-neutral-700">{p.sender?.name}</td>
                  <td className="px-4 py-3.5 text-neutral-700">{p.destination}</td>
                  <td className="px-4 py-3.5 text-neutral-600">
                    {p.assignedTo ? (
                      <span className="font-medium text-blue-700">{p.assignedTo.name}</span>
                    ) : (
                      <span className="text-neutral-400 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">
                    <StatusBadge status={p.status} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {!p.assignedTo ? (
                      <Link
                        to={`/admin/assignment?parcelId=${p._id}`}
                        className="text-xs font-semibold text-[#D71920] hover:underline"
                      >
                        Assign Now
                      </Link>
                    ) : (
                      <Link
                        to="/admin/parcels"
                        className="text-xs font-semibold text-neutral-600 hover:underline"
                      >
                        View
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
