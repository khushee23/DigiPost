import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Filter, Send, Eye, MapPin, Calendar, Clock } from 'lucide-react';
import { parcelService } from '../../services/parcelService';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { TrackingTimeline } from '../../components/parcels/TrackingTimeline';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { formatDate, formatCurrency, formatWeight } from '../../utils/formatters';

export const ParcelManagementPage = () => {
  const [parcels, setParcels] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [unassignedOnly, setUnassignedOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [selectedParcel, setSelectedParcel] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const loadParcels = async () => {
    try {
      setIsLoading(true);
      const res = await parcelService.getAllParcels({
        status: statusFilter,
        unassignedOnly,
        search,
      });

      if (res.success) {
        setParcels(res.parcels);
        setTotal(res.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadParcels();
  }, [statusFilter, unassignedOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadParcels();
  };

  const paginatedData = parcels.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    {
      header: 'Tracking ID',
      render: (p) => (
        <div>
          <span className="font-mono font-bold text-neutral-900 block">{p.trackingId}</span>
          <span className="text-[11px] text-neutral-400 capitalize">{p.parcelType} • {p.weight} kg</span>
        </div>
      ),
    },
    {
      header: 'Sender / Origin',
      render: (p) => (
        <div className="text-xs">
          <span className="font-semibold text-neutral-900 block">{p.sender?.name}</span>
          <span className="text-neutral-500">{p.origin}</span>
        </div>
      ),
    },
    {
      header: 'Recipient / Destination',
      render: (p) => (
        <div className="text-xs">
          <span className="font-semibold text-neutral-900 block">{p.receiver?.name}</span>
          <span className="text-neutral-500">{p.destination}</span>
        </div>
      ),
    },
    {
      header: 'Assigned Courier',
      render: (p) => (
        <div className="text-xs">
          {p.assignedTo ? (
            <span className="font-medium text-blue-700 block">{p.assignedTo.name}</span>
          ) : (
            <span className="text-amber-600 font-semibold italic block">Awaiting Courier</span>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      render: (p) => <StatusBadge status={p.status} size="sm" />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => {
              setSelectedParcel(p);
              setIsDetailModalOpen(true);
            }}
          >
            Inspect
          </Button>
          {!p.assignedTo && (
            <Link to={`/admin/assignment?parcelId=${p._id}`}>
              <Button variant="primary" size="sm" icon={Send}>
                Assign
              </Button>
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Parcel Consignment Management"
        subtitle="Global postal directory across all hubs, transit pipelines, and delivery destinations."
        actions={
          <Link to="/admin/assignment">
            <Button variant="primary" size="sm" icon={Send}>
              Assignment Center
            </Button>
          </Link>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Parcels' },
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
              placeholder="Search by Tracking ID, Sender, Recipient, or City..."
              className="w-full pl-10 pr-4 py-2.5 text-xs text-neutral-900 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#D71920]"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search Parcels
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-100">
          <div className="flex flex-wrap items-center gap-1.5">
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
                {st === 'ALL' ? 'All' : st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <label className="flex items-center text-xs text-neutral-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={unassignedOnly}
              onChange={(e) => setUnassignedOnly(e.target.checked)}
              className="w-4 h-4 rounded text-[#D71920] border-neutral-300 focus:ring-[#D71920]"
            />
            <span className="ml-2 font-semibold text-amber-700">Show Unassigned Only</span>
          </label>
        </div>
      </div>

      {isLoading ? (
        <SkeletonLoader type="table" count={5} />
      ) : (
        <DataTable
          columns={columns}
          data={paginatedData}
          keyField="_id"
          emptyMessage="No consignments found matching filter criteria."
          pagination={{
            currentPage,
            totalItems: total,
            pageSize,
            onPageChange: setCurrentPage,
          }}
        />
      )}

      {/* Inspect Parcel Modal */}
      {selectedParcel && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Consignment: ${selectedParcel.trackingId}`}
          subtitle={`Booked on ${formatDate(selectedParcel.bookingDate)}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
              <div>
                <span className="text-neutral-400 text-[11px] block">Current Status</span>
                <StatusBadge status={selectedParcel.status} size="md" />
              </div>
              <div className="text-right">
                <span className="text-neutral-400 text-[11px] block">Calculated Postage</span>
                <span className="font-bold text-neutral-900 text-sm">
                  {formatCurrency(selectedParcel.cost)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-xs font-bold text-neutral-900 block mb-1">Sender</span>
                <p className="font-medium text-neutral-800">{selectedParcel.sender?.name}</p>
                <p className="text-neutral-500">{selectedParcel.sender?.phone}</p>
                <p className="text-neutral-600 mt-1">
                  {selectedParcel.sender?.address}, {selectedParcel.origin}
                </p>
              </div>

              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-xs font-bold text-neutral-900 block mb-1">Recipient</span>
                <p className="font-medium text-neutral-800">{selectedParcel.receiver?.name}</p>
                <p className="text-neutral-500">{selectedParcel.receiver?.phone}</p>
                <p className="text-neutral-600 mt-1">
                  {selectedParcel.receiver?.address}, {selectedParcel.destination}
                </p>
              </div>
            </div>

            {/* Tracking Progression */}
            <div className="pt-2">
              <TrackingTimeline
                status={selectedParcel.status}
                history={selectedParcel.history}
                failureReason={selectedParcel.failureReason}
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-neutral-100">
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
