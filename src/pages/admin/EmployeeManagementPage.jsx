import React, { useState, useEffect } from 'react';
import { UserCheck, PlusCircle, Search, UserX, Truck, Building2, Phone, Mail, CheckCircle2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { formatDate } from '../../utils/formatters';

export const EmployeeManagementPage = () => {
  const { success, error } = useToast();
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Add Employee Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    station: 'Central Sorting Hub 01',
  });

  // Toggle Status Confirmation
  const [employeeToToggle, setEmployeeToToggle] = useState(null);
  const [isToggleConfirmOpen, setIsToggleConfirmOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getEmployees({ search });
      if (res.success) {
        setEmployees(res.employees);
        setTotal(res.total);
      }
    } catch (err) {
      console.error(err);
      error('Failed to load employee roster.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadEmployees();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      error('Please complete all required courier fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await adminService.createEmployee(formData);
      if (res.success) {
        success(`Postal courier ${res.employee.name} provisioned successfully.`);
        setIsAddModalOpen(false);
        setFormData({ name: '', email: '', phone: '', station: 'Central Sorting Hub 01' });
        loadEmployees();
      }
    } catch (err) {
      error(err.message || 'Failed to create employee account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeToggleStatus = async () => {
    try {
      setIsToggling(true);
      const res = await adminService.toggleEmployeeStatus(employeeToToggle._id);
      if (res.success) {
        success(`Courier status updated to ${res.employee.status}.`);
        setIsToggleConfirmOpen(false);
        setEmployeeToToggle(null);
        loadEmployees();
      }
    } catch (err) {
      error(err.message || 'Failed to update courier status.');
    } finally {
      setIsToggling(false);
    }
  };

  const paginatedData = employees.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    {
      header: 'Courier Name',
      render: (e) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            {e.name.charAt(0)}
          </div>
          <div>
            <span className="font-semibold text-neutral-900 block">{e.name}</span>
            <span className="text-[11px] text-neutral-400 font-mono">{e._id}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Depot / Station',
      render: (e) => (
        <div className="text-xs">
          <span className="font-medium text-neutral-800 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            {e.station || 'Central Depot'}
          </span>
          <span className="text-[11px] text-neutral-400">{e.email}</span>
        </div>
      ),
    },
    {
      header: 'Current Route Load',
      render: (e) => (
        <div className="text-xs">
          <span className="font-bold text-blue-700 block">{e.activeDeliveries} active parcels</span>
          <span className="text-[11px] text-neutral-500">{e.completedDeliveries} completed total</span>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (e) => <StatusBadge status={e.status} size="sm" />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (e) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant={e.status === 'active' ? 'ghost' : 'outline'}
            size="sm"
            onClick={() => {
              setEmployeeToToggle(e);
              setIsToggleConfirmOpen(true);
            }}
            className={e.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-emerald-700 hover:bg-emerald-50'}
          >
            {e.status === 'active' ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Postal Employee & Courier Fleet Management"
        subtitle="Manage dispatch personnel, regional station assignments, and courier route authorizations."
        actions={
          <Button variant="primary" size="sm" icon={PlusCircle} onClick={() => setIsAddModalOpen(true)}>
            Provision New Courier
          </Button>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Employees' },
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
              placeholder="Search couriers by name, email, or depot location..."
              className="w-full pl-10 pr-4 py-2 text-xs text-neutral-900 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#D71920]"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search Staff
          </Button>
        </form>
      </div>

      {isLoading ? (
        <SkeletonLoader type="table" count={5} />
      ) : (
        <DataTable
          columns={columns}
          data={paginatedData}
          keyField="_id"
          emptyMessage="No employees found matching criteria."
          pagination={{
            currentPage,
            totalItems: total,
            pageSize,
            onPageChange: setCurrentPage,
          }}
        />
      )}

      {/* Provision New Courier Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision Authorized Postal Courier"
        subtitle="Create an internal staff account for parcel dispatch and delivery operations."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Full Courier Name"
            placeholder="e.g. Marcus Vance"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            required
          />

          <Input
            label="Official Postal Email"
            type="email"
            placeholder="marcus.vance@postoffice.gov"
            value={formData.email}
            onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
            required
          />

          <Input
            label="Contact Telephone"
            placeholder="+1 (555) 789-0123"
            value={formData.phone}
            onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
            required
          />

          <Select
            label="Assigned Depot Hub"
            value={formData.station}
            onChange={(e) => setFormData((p) => ({ ...p, station: e.target.value }))}
            options={[
              { value: 'Central Sorting Hub 01', label: 'Central Sorting Hub 01 (Headquarters)' },
              { value: 'West Metro Delivery Hub', label: 'West Metro Delivery Hub' },
              { value: 'North District Postal Terminal', label: 'North District Postal Terminal' },
              { value: 'East Coastal Dispatch Depot', label: 'East Coastal Dispatch Depot' },
            ]}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <Button variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Provision Staff Account
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isToggleConfirmOpen}
        onClose={() => setIsToggleConfirmOpen(false)}
        onConfirm={executeToggleStatus}
        title={employeeToToggle?.status === 'active' ? 'Deactivate Courier' : 'Activate Courier'}
        message={`Are you sure you want to change the status of courier ${employeeToToggle?.name} to ${employeeToToggle?.status === 'active' ? 'INACTIVE' : 'ACTIVE'}?`}
        confirmText={employeeToToggle?.status === 'active' ? 'Deactivate' : 'Activate'}
        variant={employeeToToggle?.status === 'active' ? 'danger' : 'info'}
        isLoading={isToggling}
      />
    </div>
  );
};
