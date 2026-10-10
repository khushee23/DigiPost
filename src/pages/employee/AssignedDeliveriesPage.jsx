import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Search, Filter, MapPin, Calendar, Clock, ArrowRight, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deliveryService } from '../../services/deliveryService';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataTable } from '../../components/common/DataTable';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { ErrorState } from '../../components/common/ErrorState';
import { formatDate } from '../../utils/formatters';

export const AssignedDeliveriesPage = () => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const loadDeliveries = async () => {
    if (!user?._id) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await deliveryService.getAssignedDeliveries(user._id, {
        status: statusFilter,
        search,
      });

      if (res.success) {
        setDeliveries(res.deliveries);
        setTotal(res.total);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load assigned delivery manifest.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, [user?._id, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadDeliveries();
  };

  const paginatedData = deliveries.slice((currentPage - 1) * pageSize, currentPage * pageSize);

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
      header: 'Recipient & Address',
      render: (d) => (
        <div className="text-xs">
          <span className="font-semibold text-neutral-900 block">{d.parcel?.receiver?.name}</span>
          <span className="text-neutral-500 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
            {d.parcel?.receiver?.address}, {d.parcel?.receiver?.city}
          </span>
        </div>
      ),
    },
    {
      header: 'Scheduled Date',
      render: (d) => (
        <span className="text-xs text-neutral-600">{formatDate(d.scheduledDate)}</span>
      ),
    },
    {
      header: 'Status',
      render: (d) => <StatusBadge status={d.status} size="sm" />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (d) => (
        <div className="flex items-center justify-end gap-2">
          <Link to={`/employee/deliveries/${d._id}`}>
            <Button variant="outline" size="sm" icon={Eye}>
              View
            </Button>
          </Link>
          <Link to={`/employee/status-update?deliveryId=${d._id}`}>
            <Button variant="primary" size="sm" icon={Clock}>
              Update
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="My Assigned Deliveries"
        subtitle="Active dispatches and route manifest assigned to your courier ID."
        actions={
          <Link to="/employee/status-update">
            <Button variant="primary" size="sm" icon={Clock}>
              Update Status Workflow
            </Button>
          </Link>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/employee/dashboard' },
          { label: 'My Deliveries' },
        ]}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Tracking ID, Delivery ID, Recipient or City..."
              className="w-full pl-10 pr-4 py-2.5 text-xs text-neutral-900 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#D71920] focus:border-[#D71920]"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Filter Manifest
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-neutral-100">
          <span className="text-xs text-neutral-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['ALL', 'ASSIGNED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-[#1C1C1C] text-white shadow-2xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {st === 'ALL' ? 'All Deliveries' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Delivery Table */}
      {isLoading ? (
        <SkeletonLoader type="table" count={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadDeliveries} />
      ) : (
        <DataTable
          columns={columns}
          data={paginatedData}
          keyField="_id"
          emptyMessage="No deliveries found matching your search and filter criteria."
          pagination={{
            currentPage,
            totalItems: total,
            pageSize,
            onPageChange: setCurrentPage,
          }}
        />
      )}
    </div>
  );
};
