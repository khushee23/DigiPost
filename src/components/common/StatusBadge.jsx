import React from 'react';
import { STATUS_LABELS, STATUS_BADGE_STYLES, COMPLAINT_STATUS_STYLES } from '../../constants/statusConstants';

export const StatusBadge = ({ status, size = 'md', className = '' }) => {
  if (!status) return null;

  const normalized = status.toUpperCase();

  // Parcel status lookup
  const parcelStyle = STATUS_BADGE_STYLES[normalized];
  if (parcelStyle) {
    const label = STATUS_LABELS[normalized] || status;
    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-xs font-semibold',
      lg: 'px-3 py-1.5 text-sm font-semibold',
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border ${parcelStyle.bg} ${parcelStyle.text} ${parcelStyle.border} ${sizes[size] || sizes.md} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${parcelStyle.dot}`} />
        <span>{label}</span>
      </span>
    );
  }

  // Complaint status lookup
  const complaintStyle = COMPLAINT_STATUS_STYLES[normalized];
  if (complaintStyle) {
    const labels = {
      OPEN: 'Open Case',
      IN_PROGRESS: 'Under Investigation',
      RESOLVED: 'Resolved',
      REJECTED: 'Rejected',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${complaintStyle.bg} ${complaintStyle.text} ${complaintStyle.border} ${className}`}
      >
        {labels[normalized] || status}
      </span>
    );
  }

  // Account status (active/inactive)
  if (status.toLowerCase() === 'active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Active
      </span>
    );
  }

  if (status.toLowerCase() === 'inactive') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-300">
        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
        Deactivated
      </span>
    );
  }

  // Fallback
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
      {status}
    </span>
  );
};
