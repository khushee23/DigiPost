import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Send, CheckCircle2, UserCheck, Package, MapPin, Calendar, Truck, ArrowLeft } from 'lucide-react';
import { parcelService } from '../../services/parcelService';
import { adminService } from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { formatDate } from '../../utils/formatters';

export const DeliveryAssignmentPage = () => {
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillParcelId = searchParams.get('parcelId') || '';

  const [unassignedParcels, setUnassignedParcels] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected for assignment
  const [selectedParcelId, setSelectedParcelId] = useState(prefillParcelId);
  const [selectedCourierId, setSelectedCourierId] = useState('');

  // Confirmation
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [parcelsRes, employeesRes] = await Promise.all([
        parcelService.getAllParcels({ unassignedOnly: true }),
        adminService.getEmployees(),
      ]);

      if (parcelsRes.success) {
        setUnassignedParcels(parcelsRes.parcels);
        if (!selectedParcelId && parcelsRes.parcels.length > 0) {
          setSelectedParcelId(parcelsRes.parcels[0]._id);
        }
      }

      if (employeesRes.success) {
        const activeCouriers = employeesRes.employees.filter((e) => e.status === 'active');
        setCouriers(activeCouriers);
        if (activeCouriers.length > 0) {
          setSelectedCourierId(activeCouriers[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
      error('Failed to load assignment data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectedParcel = unassignedParcels.find((p) => p._id === selectedParcelId);
  const selectedCourier = couriers.find((c) => c._id === selectedCourierId);

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!selectedParcel || !selectedCourier) {
      error('Please select both an unassigned consignment and an active courier.');
      return;
    }
    setIsConfirmOpen(true);
  };

  const executeAssignment = async () => {
    try {
      setIsAssigning(true);
      const res = await parcelService.assignParcel(selectedParcel._id, selectedCourier);
      if (res.success) {
        success(`Parcel ${selectedParcel.trackingId} assigned to courier ${selectedCourier.name}!`);
        setIsConfirmOpen(false);
        loadData();
      }
    } catch (err) {
      error(err.message || 'Failed to complete assignment.');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Delivery Courier Assignment Center"
        subtitle="Allocate unassigned customer packages to verified couriers based on depot proximity and route capacity."
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Parcels', href: '/admin/parcels' },
          { label: 'Assignment Center' },
        ]}
      />

      {isLoading ? (
        <SkeletonLoader type="table" count={3} />
      ) : unassignedParcels.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-neutral-200 shadow-2xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-900">All Consignments Assigned</h3>
          <p className="text-xs text-neutral-500 mt-1 mb-4">
            There are currently zero pending unassigned packages awaiting courier allocation.
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/parcels')}>
            View All Parcels
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Assignment Form (7 cols) */}
          <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-5">
            <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3 flex items-center gap-2">
              <Send className="w-4 h-4 text-[#D71920]" />
              Dispatch Allocation
            </h3>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <Select
                label="Select Awaiting Consignment"
                value={selectedParcelId}
                onChange={(e) => setSelectedParcelId(e.target.value)}
                options={unassignedParcels.map((p) => ({
                  value: p._id,
                  label: `${p.trackingId} — To: ${p.destination} (${p.parcelType}, ${p.weight}kg)`,
                }))}
                required
              />

              <Select
                label="Select Active Postal Courier"
                value={selectedCourierId}
                onChange={(e) => setSelectedCourierId(e.target.value)}
                options={couriers.map((c) => ({
                  value: c._id,
                  label: `${c.name} — ${c.station} (${c.activeDeliveries || 0} active packages)`,
                }))}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-2"
                icon={Send}
              >
                Assign Package to Courier
              </Button>
            </form>
          </div>

          {/* Preview Card (5 cols) */}
          <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              Assignment Preview
            </h3>

            {selectedParcel && (
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-2">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Package Details
                </span>
                <span className="font-mono font-bold text-neutral-900 text-sm block">
                  {selectedParcel.trackingId}
                </span>
                <p className="text-neutral-600">
                  Destination: <strong>{selectedParcel.destination}</strong>
                </p>
                <p className="text-neutral-600">
                  Recipient: <strong>{selectedParcel.receiver?.name}</strong>
                </p>
              </div>
            )}

            {selectedCourier && (
              <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 text-xs space-y-2">
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                  Courier Capacity
                </span>
                <span className="font-bold text-neutral-900 text-sm block">
                  {selectedCourier.name}
                </span>
                <p className="text-neutral-600">
                  Depot: <strong>{selectedCourier.station}</strong>
                </p>
                <p className="text-neutral-600">
                  Current Load: <strong>{selectedCourier.activeDeliveries || 0} packages in progress</strong>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeAssignment}
        title="Confirm Dispatch Assignment"
        message={`Are you sure you want to assign consignment ${selectedParcel?.trackingId} to courier ${selectedCourier?.name}? The status will transition from PENDING to ASSIGNED.`}
        confirmText="Confirm & Assign"
        variant="warning"
        isLoading={isAssigning}
      />
    </div>
  );
};
