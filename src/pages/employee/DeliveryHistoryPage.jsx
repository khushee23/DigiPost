import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, AlertCircle, Search, Calendar, MapPin, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deliveryService } from '../../services/deliveryService';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataTable } from '../../components/common/DataTable';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { formatDate, formatDateTime } from '../../utils/formatters';

export const DeliveryHistoryPage = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const loadHistory = async () => {
    if (!user?._id) return;
    try {
      setIsLoading(true);
      const res = await deliveryService.getAssignedDeliveries(user._id);
      if (res.success) {
        // Filter completed or failed deliveries
        const terminal = res.deliveries.filter((d) =>
          ['DELIVERED', 'FAILED'].includes(d.status)
        );
        setHistory(terminal);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user?._id]);

  const filtered = history.filter((d) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.deliveryId.toLowerCase().includes(q) ||
      d.parcel?.trackingId.toLowerCase().includes(q) ||
      d.parcel?.receiver?.name.toLowerCase().includes(q)
    );
  });

  const paginatedData = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const completedCount = history.filter((d) => d.status === 'DELIVERED').length;
  const failedCount = history.filter((d) => d.status === 'FAILED').length;
  const successRate = history.length > 0 ? ((completedCount / history.length) * 100).toFixed(1) : '100.0';

  const columns = [
    {
      header: 'Delivery / Tracking ID',
      render: (d) => (
        <div>
          <span className="font-mono font-bold text-neutral-900 block">{d.parcel?.trackingId}</span>
          <span className="text-[11px] text-neutral-400 font-mono">{d.deliveryId}</span>
        </div>
      ),
    },
    {
      header: 'Recipient & Destination',
      render: (d) => (
        <div className="text-xs">
          <span className="font-semibold text-neutral-900 block">{d.parcel?.receiver?.name}</span>
          <span className="text-neutral-500">{d.parcel?.destination}</span>
        </div>
      ),
    },
    {
      header: 'Resolution Date',
      render: (d) => (
        <span className="text-xs text-neutral-600">
          {formatDateTime(d.completionDate || d.scheduledDate)}
        </span>
      ),
    },
    {
      header: 'Final Status',
      render: (d) => <StatusBadge status={d.status} size="sm" />,
    },
    {
      header: 'Notes / Failure Reason',
      render: (d) => (
        <span className="text-xs text-neutral-600 max-w-xs truncate block">
          {d.failureReason || d.notes || 'Completed cleanly'}
        </span>
      ),
    },
    {
      header: 'Action',
      className: 'text-right',
      render: (d) => (
        <Link to={`/employee/deliveries/${d._id}`}>
          <Button variant="outline" size="sm" icon={Eye}>
            Log
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Delivery Duty History & Performance"
        subtitle="Archived record of all completed and attempted consignments on your route."
        breadcrumbs={[
          { label: 'Dashboard', href: '/employee/dashboard' },
          { label: 'Delivery History' },
        ]}
      />

      {/* Performance Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
            Completed Consignments
          </span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">{completedCount}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
            Unsuccessful Attempts
          </span>
          <span className="text-2xl font-bold text-red-600 mt-1 block">{failedCount}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
            Successful Delivery Rate
          </span>
          <span className="text-2xl font-bold text-[#111111] mt-1 block">{successRate}%</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search archived deliveries by tracking number or recipient..."
            className="w-full pl-10 pr-4 py-2 text-xs text-neutral-900 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#D71920]"
          />
        </div>
      </div>

      {isLoading ? (
        <SkeletonLoader type="table" count={4} />
      ) : (
        <DataTable
          columns={columns}
          data={paginatedData}
          keyField="_id"
          emptyMessage="No historical deliveries recorded yet."
          pagination={{
            currentPage,
            totalItems: filtered.length,
            pageSize,
            onPageChange: setCurrentPage,
          }}
        />
      )}
    </div>
  );
};
