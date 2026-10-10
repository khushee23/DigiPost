import React, { useState, useEffect } from 'react';
import {
  MessageSquareWarning,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  User,
  Clock,
  Eye,
  Send,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { complaintService } from '../../services/complaintService';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { Textarea } from '../../components/common/Textarea';
import { StatusBadge } from '../../components/common/StatusBadge';
import { DataTable } from '../../components/common/DataTable';
import { Modal } from '../../components/common/Modal';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { formatDateTime } from '../../utils/formatters';

export const ComplaintManagementPage = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Resolve Ticket Modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadComplaints = async () => {
    try {
      setIsLoading(true);
      const res = await complaintService.getAllComplaints({
        status: statusFilter,
        search,
      });

      if (res.success) {
        setComplaints(res.complaints);
        setTotal(res.total);
      }
    } catch (err) {
      console.error(err);
      error('Failed to load customer complaints registry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadComplaints();
  };

  const openResolveModal = (c) => {
    setSelectedComplaint(c);
    setNewStatus(c.status === 'OPEN' ? 'IN_PROGRESS' : 'RESOLVED');
    setResolutionNotes(c.resolutionNotes || '');
    setIsResolveModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!resolutionNotes.trim()) {
      error('Please provide an administrative note or resolution summary.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await complaintService.updateComplaintStatus(selectedComplaint._id, {
        status: newStatus,
        resolutionNotes,
        adminUser: user,
      });

      if (res.success) {
        success(`Ticket ${selectedComplaint.complaintId} status updated to ${newStatus}.`);
        setIsResolveModalOpen(false);
        loadComplaints();
      }
    } catch (err) {
      error(err.message || 'Failed to update ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const paginatedData = complaints.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const columns = [
    {
      header: 'Ticket ID',
      render: (c) => (
        <div>
          <span className="font-mono font-bold text-neutral-900 block">{c.complaintId}</span>
          <span className="text-[11px] text-neutral-400">
            {c.trackingId ? `Parcel: ${c.trackingId}` : 'General Inquiry'}
          </span>
        </div>
      ),
    },
    {
      header: 'Customer',
      render: (c) => (
        <div className="text-xs">
          <span className="font-semibold text-neutral-900 block">{c.customerName}</span>
          <span className="text-neutral-500">{c.customerEmail}</span>
        </div>
      ),
    },
    {
      header: 'Category & Subject',
      render: (c) => (
        <div className="text-xs max-w-xs">
          <span className="text-neutral-400 capitalize block text-[11px]">
            {c.category?.replace(/_/g, ' ')}
          </span>
          <span className="font-bold text-neutral-900 truncate block">{c.subject}</span>
        </div>
      ),
    },
    {
      header: 'Filing Date',
      render: (c) => (
        <span className="text-xs text-neutral-600">{formatDateTime(c.createdAt)}</span>
      ),
    },
    {
      header: 'Status',
      render: (c) => <StatusBadge status={c.status} size="sm" />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (c) => (
        <Button variant="outline" size="sm" icon={Eye} onClick={() => openResolveModal(c)}>
          Investigate
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Customer Support & Complaint Resolution"
        subtitle="Manage escalation tickets, investigate transit exceptions, and post administrative determinations."
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Complaints' },
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
              placeholder="Search by Ticket ID, Customer Name, Subject, or Tracking ID..."
              className="w-full pl-10 pr-4 py-2.5 text-xs text-neutral-900 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#D71920]"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search Tickets
          </Button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-neutral-100">
          <span className="text-xs text-neutral-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].map((st) => (
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
              {st === 'ALL' ? 'All Tickets' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <SkeletonLoader type="table" count={4} />
      ) : (
        <DataTable
          columns={columns}
          data={paginatedData}
          keyField="_id"
          emptyMessage="No customer complaints found matching criteria."
          pagination={{
            currentPage,
            totalItems: total,
            pageSize,
            onPageChange: setCurrentPage,
          }}
        />
      )}

      {/* Review & Resolve Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          title={`Ticket: ${selectedComplaint.complaintId}`}
          subtitle={`Filed by ${selectedComplaint.customerName} on ${formatDateTime(selectedComplaint.createdAt)}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4 text-xs">
            {/* Customer Statement Box */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-sm">{selectedComplaint.subject}</span>
                <StatusBadge status={selectedComplaint.status} size="sm" />
              </div>
              <p className="text-neutral-700 leading-relaxed bg-white p-3 rounded-lg border border-neutral-200">
                {selectedComplaint.description}
              </p>
              {selectedComplaint.trackingId && (
                <p className="text-neutral-500 text-[11px]">
                  Consignment Reference: <strong className="text-[#D71920] font-mono">{selectedComplaint.trackingId}</strong>
                </p>
              )}
            </div>

            {/* Resolution Form */}
            <form onSubmit={handleUpdateStatus} className="space-y-4 pt-2">
              <Select
                label="Update Ticket Status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                options={[
                  { value: 'IN_PROGRESS', label: 'Under Active Investigation (IN_PROGRESS)' },
                  { value: 'RESOLVED', label: 'Mark as Resolved / Action Completed (RESOLVED)' },
                  { value: 'REJECTED', label: 'Reject / Invalid Complaint (REJECTED)' },
                ]}
                required
              />

              <Textarea
                label="Administrative Investigation & Resolution Notes"
                rows={4}
                placeholder="Explain the outcome, courier investigation findings, refund status, or customer communication..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                required
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <Button variant="outline" size="sm" onClick={() => setIsResolveModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                  Post Determination
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};
