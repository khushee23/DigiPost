import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, AlertCircle, Truck, MapPin, Send, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { deliveryService } from '../../services/deliveryService';
import { VALID_STATUS_TRANSITIONS, STATUS_LABELS } from '../../constants/statusConstants';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Input } from '../../components/common/Input';
import { Textarea } from '../../components/common/Textarea';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';

export const UpdateDeliveryStatusPage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefillDeliveryId = searchParams.get('deliveryId') || '';

  const [deliveries, setDeliveries] = useState([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(prefillDeliveryId);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [newStatus, setNewStatus] = useState('');
  const [checkpointLocation, setCheckpointLocation] = useState(user?.station || 'Central Sorting Hub 01');
  const [statusNote, setStatusNote] = useState('');
  const [failureReason, setFailureReason] = useState('Customer premises closed; recipient unavailable');

  // Confirmation modal
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadDeliveries = async () => {
    if (!user?._id) return;
    try {
      setIsLoading(true);
      const res = await deliveryService.getAssignedDeliveries(user._id);
      if (res.success) {
        setDeliveries(res.deliveries);

        // Auto select first or prefilled
        const target = res.deliveries.find((d) => d._id === selectedDeliveryId) || res.deliveries[0];
        if (target) {
          setSelectedDeliveryId(target._id);
          setSelectedDelivery(target);
          setDefaultNextStatus(target.status);
        }
      }
    } catch (err) {
      console.error(err);
      error('Failed to load assigned deliveries list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, [user?._id]);

  const setDefaultNextStatus = (currentStatus) => {
    const valid = VALID_STATUS_TRANSITIONS[currentStatus] || [];
    if (valid.length > 0) {
      setNewStatus(valid[0]);
    } else {
      setNewStatus('');
    }
  };

  const handleDeliveryChange = (e) => {
    const id = e.target.value;
    setSelectedDeliveryId(id);
    const target = deliveries.find((d) => d._id === id);
    if (target) {
      setSelectedDelivery(target);
      setDefaultNextStatus(target.status);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!newStatus) {
      error('Please select a target status transition.');
      return;
    }
    if (newStatus === 'FAILED' && !failureReason.trim()) {
      error('Please specify a valid reason for delivery failure.');
      return;
    }
    setIsConfirmOpen(true);
  };

  const executeStatusUpdate = async () => {
    try {
      setIsSubmitting(true);
      const res = await deliveryService.updateDeliveryStatus(selectedDelivery._id, {
        status: newStatus,
        location: checkpointLocation,
        note: statusNote || `Status updated to ${newStatus}`,
        failureReason: newStatus === 'FAILED' ? failureReason : null,
        employeeName: user.name,
      });

      if (res.success) {
        success(`Delivery status updated to ${newStatus}.`);
        setIsConfirmOpen(false);
        navigate(`/employee/deliveries/${selectedDelivery._id}`);
      }
    } catch (err) {
      error(err.message || 'Failed to update status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validOptions = selectedDelivery
    ? (VALID_STATUS_TRANSITIONS[selectedDelivery.status] || []).map((s) => ({
        value: s,
        label: STATUS_LABELS[s] || s,
      }))
    : [];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Update Consignment Delivery Status"
        subtitle="Record verified transit checkpoints and delivery handoff status."
        actions={
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/employee/deliveries')}>
            Back to Deliveries
          </Button>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/employee/dashboard' },
          { label: 'Update Status' },
        ]}
      />

      {isLoading ? (
        <SkeletonLoader type="table" count={3} />
      ) : deliveries.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-neutral-200">
          <Truck className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-900">No Assigned Deliveries</h3>
          <p className="text-xs text-neutral-500 mt-1">
            You do not currently have any active shipments assigned to your route.
          </p>
        </div>
      ) : (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-2xs space-y-6">
          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* 1. Select Consignment */}
            <Select
              label="Select Assigned Consignment"
              value={selectedDeliveryId}
              onChange={handleDeliveryChange}
              options={deliveries.map((d) => ({
                value: d._id,
                label: `${d.parcel?.trackingId} — To: ${d.parcel?.destination} (${d.status})`,
              }))}
              required
            />

            {/* Selected Parcel Summary Banner */}
            {selectedDelivery && (
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-neutral-900 text-sm">
                    {selectedDelivery.parcel?.trackingId}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500">Current Status:</span>
                    <StatusBadge status={selectedDelivery.status} size="sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-600 pt-1">
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Recipient</span>
                    <span className="font-medium text-neutral-800">
                      {selectedDelivery.parcel?.receiver?.name} ({selectedDelivery.parcel?.receiver?.phone})
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Destination</span>
                    <span className="font-medium text-neutral-800">
                      {selectedDelivery.parcel?.receiver?.address}, {selectedDelivery.parcel?.destination}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Choose Next Status Transition */}
            {validOptions.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                This consignment has reached terminal status (<strong>{selectedDelivery?.status}</strong>).
                No further forward courier status transitions permitted.
              </div>
            ) : (
              <>
                <Select
                  label="Target Status Transition"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  options={validOptions}
                  required
                />

                {/* If marking FAILED, prompt for reason */}
                {newStatus === 'FAILED' && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-3 animate-fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Delivery Exception Reason Required</span>
                    </div>
                    <Select
                      label="Select Failure Reason"
                      value={failureReason}
                      onChange={(e) => setFailureReason(e.target.value)}
                      options={[
                        { value: 'Customer premises closed; recipient unavailable', label: 'Customer premises closed; recipient unavailable' },
                        { value: 'Incorrect or incomplete destination address provided', label: 'Incorrect or incomplete address provided' },
                        { value: 'Recipient refused delivery acceptance', label: 'Recipient refused delivery acceptance' },
                        { value: 'Security checkpoint denied entry to premises', label: 'Security checkpoint denied entry' },
                        { value: 'Severe weather / route accessibility hazard', label: 'Severe weather or route obstruction' },
                      ]}
                      required
                    />
                  </div>
                )}

                <Input
                  label="Checkpoint Location Name"
                  placeholder="e.g. Scranton Local Depot, In Transit Van #4, or Destination Doorstep"
                  value={checkpointLocation}
                  onChange={(e) => setCheckpointLocation(e.target.value)}
                  icon={MapPin}
                  required
                />

                <Textarea
                  label="Log Checkpoint Notes (Optional)"
                  rows={3}
                  placeholder="e.g. Scanned at regional depot dock, handed directly to recipient, etc."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full mt-2"
                  icon={Send}
                >
                  Verify & Apply Status Transition
                </Button>
              </>
            )}
          </form>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={executeStatusUpdate}
        title="Confirm Status Transition"
        message={`Are you sure you want to transition parcel ${selectedDelivery?.parcel?.trackingId} to '${newStatus}'? This action will immediately update the public tracking manifest.`}
        confirmText="Confirm Transition"
        variant={newStatus === 'FAILED' ? 'danger' : 'warning'}
        isLoading={isSubmitting}
      />
    </div>
  );
};
