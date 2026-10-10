import React, { useState, useEffect } from 'react';
import { Users, Search, UserCheck, UserX, Eye, Mail, Phone, MapPin, Calendar, Package } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { formatDate } from '../../utils/formatters';

export const CustomerManagementPage = () => {
  const { success, error } = useToast();
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Selected customer for modal
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Status toggle confirmation
  const [customerToToggle, setCustomerToToggle] = useState(null);
  const [isToggleConfirmOpen, setIsToggleConfirmOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getCustomers({ search });
      if (res.success) {
        setCustomers(res.customers);
        setTotal(res.total);
      }
    } catch (err) {
      console.error(err);
      error('Failed to load customers registry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadCustomers();
  };

  const handleToggleClick = (cust) => {
    setCustomerToToggle(cust);
    setIsToggleConfirmOpen(true);
  };

  const executeToggleStatus = async () => {
    try {
      setIsToggling(true);
      const res = await adminService.toggleCustomerStatus(customerToToggle._id);
      if (res.success) {
        success(`Customer account status updated to ${res.customer.status}.`);
        setIsToggleConfirmOpen(false);
        setCustomerToToggle(null);
        loadCustomers();
      }
    } catch (err) {
      error(err.message || 'Failed to update customer status.');
    } finally {
      setIsToggling(false);
    }
  };

  const openDetails = (cust) => {
    setSelectedCustomer(cust);
    setIsDetailModalOpen(true);
  };

  const paginatedData = customers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    {
      header: 'Customer Name',
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-xs text-neutral-800">
            {c.name.charAt(0)}
          </div>
          <div>
            <span className="font-semibold text-neutral-900 block">{c.name}</span>
            <span className="text-[11px] text-neutral-400 font-mono">{c._id}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Email & Phone',
      render: (c) => (
        <div className="text-xs">
          <span className="text-neutral-800 block">{c.email}</span>
          <span className="text-neutral-400 text-[11px]">{c.phone}</span>
        </div>
      ),
    },
    {
      header: 'Total Bookings',
      render: (c) => (
        <span className="text-xs font-semibold text-neutral-800">
          {c.totalBookings} parcels ({c.deliveredCount} delivered)
        </span>
      ),
    },
    {
      header: 'Account Status',
      render: (c) => <StatusBadge status={c.status} size="sm" />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (c) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" icon={Eye} onClick={() => openDetails(c)}>
            Details
          </Button>
          <Button
            variant={c.status === 'active' ? 'ghost' : 'outline'}
            size="sm"
            onClick={() => handleToggleClick(c)}
            className={c.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-emerald-700 hover:bg-emerald-50'}
          >
            {c.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Customer Account Management"
        subtitle="Inspect customer registries, booking statistics, and account access authorizations."
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Customers' },
        ]}
      />

      {/* Search Input Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers by name, email, or telephone number..."
              className="w-full pl-10 pr-4 py-2 text-xs text-neutral-900 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#D71920]"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search Registry
          </Button>
        </form>
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonLoader type="table" count={5} />
      ) : (
        <DataTable
          columns={columns}
          data={paginatedData}
          keyField="_id"
          emptyMessage="No customers found matching search parameters."
          pagination={{
            currentPage,
            totalItems: total,
            pageSize,
            onPageChange: setCurrentPage,
          }}
        />
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Customer Profile Details"
          subtitle={`Account ID: ${selectedCustomer._id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="w-12 h-12 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center font-bold text-base">
                {selectedCustomer.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">{selectedCustomer.name}</h4>
                <p className="text-neutral-500">{selectedCustomer.email}</p>
                <div className="mt-1">
                  <StatusBadge status={selectedCustomer.status} size="sm" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-neutral-50 rounded-lg">
                <span className="text-neutral-400 text-[11px] block">Telephone</span>
                <span className="font-semibold text-neutral-900">{selectedCustomer.phone}</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg">
                <span className="text-neutral-400 text-[11px] block">Registration Date</span>
                <span className="font-semibold text-neutral-900">{formatDate(selectedCustomer.createdAt)}</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg col-span-2">
                <span className="text-neutral-400 text-[11px] block">Registered Address</span>
                <span className="font-medium text-neutral-800 leading-relaxed block">
                  {selectedCustomer.address || 'Standard postal address on file'}
                </span>
              </div>
            </div>

            <div className="p-4 bg-red-50/50 rounded-xl border border-red-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#D71920] block">
                  Consignment Activity
                </span>
                <span className="text-xs text-neutral-700">
                  Total Bookings: <strong>{selectedCustomer.totalBookings}</strong> • Completed: <strong>{selectedCustomer.deliveredCount}</strong>
                </span>
              </div>
              <Package className="w-6 h-6 text-[#D71920]" />
            </div>

            <div className="flex justify-end pt-3 border-t border-neutral-100">
              <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
                Close Window
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toggle Account Status Confirmation */}
      <ConfirmationDialog
        isOpen={isToggleConfirmOpen}
        onClose={() => setIsToggleConfirmOpen(false)}
        onConfirm={executeToggleStatus}
        title={customerToToggle?.status === 'active' ? 'Deactivate Customer Account' : 'Activate Customer Account'}
        message={`Are you sure you want to change the status of ${customerToToggle?.name} to ${customerToToggle?.status === 'active' ? 'INACTIVE' : 'ACTIVE'}?`}
        confirmText={customerToToggle?.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
        variant={customerToToggle?.status === 'active' ? 'danger' : 'info'}
        isLoading={isToggling}
      />
    </div>
  );
};
