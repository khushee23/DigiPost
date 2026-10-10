import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MessageSquareWarning,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { complaintService } from '../../services/complaintService';
import { parcelService } from '../../services/parcelService';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { ErrorState } from '../../components/common/ErrorState';
import { formatDate, formatDateTime } from '../../utils/formatters';

export const CustomerComplaintsPage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [searchParams] = useSearchParams();
  const prefillTrackingId = searchParams.get('trackingId') || '';

  const [complaints, setComplaints] = useState([]);
  const [customerParcels, setCustomerParcels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    trackingId: prefillTrackingId,
    category: 'delayed_delivery',
    subject: '',
    description: '',
  });

  const categories = [
    { value: 'delayed_delivery', label: 'Delivery Delay / Overdue' },
    { value: 'damaged_parcel', label: 'Damaged Parcel or Packaging' },
    { value: 'lost_parcel', label: 'Missing / Lost Parcel' },
    { value: 'delivery_conduct', label: 'Courier Conduct / Missing Delivery Notice' },
    { value: 'billing', label: 'Postage Fee / Billing Discrepancy' },
    { value: 'other', label: 'Other Operational Issue' },
  ];

  const loadData = async () => {
    if (!user?._id) return;
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [compRes, parcelsRes] = await Promise.all([
        complaintService.getCustomerComplaints(user._id),
        parcelService.getCustomerParcels(user._id),
      ]);

      if (compRes.success) setComplaints(compRes.complaints);
      if (parcelsRes.success) setCustomerParcels(parcelsRes.parcels);
    } catch (err) {
      console.error(err);
      setErrorMessage('Unable to load complaints history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (prefillTrackingId) {
      setIsModalOpen(true);
    }
  }, [user?._id, prefillTrackingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) {
      error('Please complete both the subject and description.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await complaintService.submitComplaint({
        customerId: user._id,
        customerName: user.name,
        customerEmail: user.email,
        trackingId: formData.trackingId || null,
        category: formData.category,
        subject: formData.subject,
        description: formData.description,
      });

      if (res.success) {
        success(`Complaint ${res.complaint.complaintId} submitted successfully.`);
        setIsModalOpen(false);
        setFormData({
          trackingId: '',
          category: 'delayed_delivery',
          subject: '',
          description: '',
        });
        loadData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit complaint.';
      error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Support Complaints & Tickets"
        subtitle="Log operational concerns and track administrative resolution progress."
        actions={
          <Button variant="primary" size="sm" icon={PlusCircle} onClick={() => setIsModalOpen(true)}>
            Submit New Complaint
          </Button>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/customer/dashboard' },
          { label: 'Complaints' },
        ]}
      />

      {/* Complaints List */}
      {isLoading ? (
        <SkeletonLoader type="table" count={4} />
      ) : errorMessage ? (
        <ErrorState message={errorMessage} onRetry={loadData} />
      ) : complaints.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 mb-1">No Active Complaints</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-5">
            You do not have any open or historical support cases on record.
          </p>
          <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)} icon={PlusCircle}>
            File a Concern
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div
              key={c._id}
              className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs hover:border-neutral-300 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-neutral-900">{c.complaintId}</span>
                  <StatusBadge status={c.status} size="sm" />
                </div>
                <span className="text-xs text-neutral-400">Filed {formatDateTime(c.createdAt)}</span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-neutral-900">{c.subject}</h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 mt-1">
                  <span className="capitalize">
                    Category: <strong>{c.category.replace(/_/g, ' ')}</strong>
                  </span>
                  {c.trackingId && (
                    <span className="font-mono text-xs">
                      Linked Consignment: <strong className="text-[#D71920]">{c.trackingId}</strong>
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-700 mt-2 bg-neutral-50 p-3 rounded-lg leading-relaxed">
                  {c.description}
                </p>
              </div>

              {/* Resolution Notes Box if provided */}
              {c.resolutionNotes && (
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Administrative Resolution Note</span>
                  </div>
                  <p className="text-neutral-700 leading-relaxed">{c.resolutionNotes}</p>
                  {c.resolvedAt && (
                    <span className="text-[10px] text-neutral-400 block mt-1">
                      Resolved {formatDateTime(c.resolvedAt)}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Complaint Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit a Customer Complaint"
        subtitle="Our administrative desk will investigate your dispatch case promptly."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Linked Consignment (Optional)"
            name="trackingId"
            value={formData.trackingId}
            onChange={(e) => setFormData((p) => ({ ...p, trackingId: e.target.value }))}
            placeholder="Select a booked parcel or leave blank"
            options={customerParcels.map((p) => ({
              value: p.trackingId,
              label: `${p.trackingId} — To: ${p.destination} (${p.status})`,
            }))}
          />

          <Select
            label="Complaint Category"
            name="category"
            value={formData.category}
            onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
            options={categories}
            required
          />

          <Input
            label="Subject Summary"
            name="subject"
            placeholder="Brief overview of the issue..."
            value={formData.subject}
            onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
            required
          />

          <Textarea
            label="Detailed Description"
            name="description"
            rows={4}
            placeholder="Please detail what occurred, including dates, locations, or notes..."
            value={formData.description}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            required
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Submit Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
