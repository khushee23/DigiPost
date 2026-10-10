import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Search, Filter, Calendar, MapPin, Eye, CheckCircle2 } from 'lucide-react';
import { deliveryService } from '../../services/deliveryService';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataTable } from '../../components/common/DataTable';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { formatDate, formatDateTime } from '../../utils/formatters';

export const DeliveryMonitoringPage = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const loadDeliveries = async () => {
    try {
      setIsLoading(true);
      const res = await deliveryService.getAllDeliveries({
        status: statusFilter,
        search,
      });

      if (res.success) {
        setDeliveries(res.deliveries);
        setTotal(res.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, [statusFilter]);

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
      header: 'Assigned Courier',
      render: (d) => (
        <div className="text-xs">
          <span className="font-semibold text-neutral-900 block">{d.assignedEmployee?.name || 'Unassigned'}</span>
          <span className="text-[11px] text-neutral-400">{d.assignedEmployee?.station || 'Regional Depot'}</span>
        </div>
      ),
    },
    {
      header: 'Destination & Recipient',
      render: (d) => (
        <div className="text-xs">
          <span className="font-medium text-neutral-800 block">{d.parcel?.receiver?.name}</span>
          <span className="text-neutral-500">{d.parcel?.destination}</span>
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
      header: 'Completion Date / Note',
      render: (d) => (
        <span className="text-xs text-neutral-600 block max-w-xs truncate">
          {d.completionDate ? formatDateTime(d.completionDate) : d.notes || 'In progress'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Delivery Operations Monitoring"
        subtitle="Live tracking of courier dispatches, transit progression, and delivery handoffs."
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Delivery Monitoring' },
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
              placeholder="Search by Tracking ID, Delivery ID, Courier Name, or Destination..."
              className="w-full pl-10 pr-4 py-2.5 text-xs text-neutral-900 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#D71920]"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Filter Deliveries
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-neutral-100">
          <span className="text-xs text-neutral-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
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

      {isLoading ? (
        <SkeletonLoader type="table" count={5} />
      ) : (
        <DataTable
          columns={columns}
          data={paginatedData}
          keyField="_id"
          emptyMessage="No active deliveries found matching filters."
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
