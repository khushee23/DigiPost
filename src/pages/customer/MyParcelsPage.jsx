import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Filter, PlusCircle, ArrowRight, Calendar, MapPin, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { parcelService } from '../../services/parcelService';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataTable } from '../../components/common/DataTable';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { ErrorState } from '../../components/common/ErrorState';
import { formatDate, formatCurrency } from '../../utils/formatters';

export const MyParcelsPage = () => {
  const { user } = useAuth();
  const [parcels, setParcels] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const loadParcels = async () => {
    if (!user?._id) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await parcelService.getCustomerParcels(user._id, {
        status: statusFilter,
        search,
      });

      if (res.success) {
        setParcels(res.parcels);
        setTotal(res.total);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to retrieve your booked parcels.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadParcels();
  }, [user?._id, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadParcels();
  };

  const paginatedData = parcels.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    {
      header: 'Tracking ID',
      accessor: 'trackingId',
      render: (p) => (
        <div>
          <span className="font-mono font-bold text-neutral-900 block">{p.trackingId}</span>
          <span className="text-[11px] text-neutral-400 capitalize">{p.parcelType} • {p.weight} kg</span>
        </div>
      ),
    },
    {
      header: 'Booking Date',
      accessor: 'bookingDate',
      render: (p) => (
        <span className="text-neutral-600 text-xs">{formatDate(p.bookingDate)}</span>
      ),
    },
    {
      header: 'Route (Origin → Destination)',
      render: (p) => (
        <div className="text-xs">
          <span className="text-neutral-500 block">From: {p.origin}</span>
          <span className="font-medium text-neutral-900 block">To: {p.destination}</span>
        </div>
      ),
    },
    {
      header: 'Recipient',
      render: (p) => (
        <div className="text-xs">
          <span className="font-medium text-neutral-900 block">{p.receiver?.name}</span>
          <span className="text-neutral-400 text-[11px]">{p.receiver?.phone}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (p) => <StatusBadge status={p.status} size="sm" />,
    },
    {
      header: 'Action',
      className: 'text-right',
      render: (p) => (
        <Link to={`/customer/parcels/${p.trackingId}`}>
          <Button variant="outline" size="sm" icon={Eye}>
            Details
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="My Parcels & Consignment History"
        subtitle="Manage and track all shipments booked through your customer account."
        actions={
          <Link to="/customer/book">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              Book New Parcel
            </Button>
          </Link>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/customer/dashboard' },
          { label: 'My Parcels' },
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
              placeholder="Search by Tracking ID, Recipient, or City..."
              className="w-full pl-10 pr-4 py-2.5 text-xs text-neutral-900 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#D71920] focus:border-[#D71920]"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-neutral-100">
          <span className="text-xs text-neutral-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['ALL', 'PENDING', 'ASSIGNED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'].map((st) => (
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
              {st === 'ALL' ? 'All Parcels' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      {isLoading ? (
        <SkeletonLoader type="table" count={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={loadParcels} />
      ) : (
        <DataTable
          columns={columns}
          data={paginatedData}
          keyField="_id"
          emptyMessage="No shipments found matching your search and filter criteria."
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
