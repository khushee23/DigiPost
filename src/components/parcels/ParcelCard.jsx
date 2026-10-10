import React from 'react';
import { Package, ArrowRight, Calendar, MapPin } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { Link } from 'react-router-dom';

export const ParcelCard = ({ parcel, role = 'customer' }) => {
  const detailLink =
    role === 'employee'
      ? `/employee/deliveries`
      : role === 'admin'
      ? `/admin/parcels`
      : `/customer/parcels/${parcel.trackingId}`;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5 hover:border-neutral-300 hover:shadow-xs transition-all duration-200">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-xs font-bold text-neutral-900">{parcel.trackingId}</span>
            <p className="text-[11px] text-neutral-400 capitalize">{parcel.parcelType} • {parcel.weight} kg</p>
          </div>
        </div>
        <StatusBadge status={parcel.status} size="sm" />
      </div>

      <div className="my-3 py-2.5 px-3 bg-neutral-50 rounded-lg text-xs space-y-1.5 border border-neutral-100">
        <div className="flex items-center justify-between text-neutral-600">
          <span className="flex items-center gap-1.5 text-neutral-500">
            <MapPin className="w-3.5 h-3.5 text-neutral-400" /> From
          </span>
          <span className="font-medium text-neutral-800 truncate max-w-[150px]">{parcel.origin}</span>
        </div>
        <div className="flex items-center justify-between text-neutral-600">
          <span className="flex items-center gap-1.5 text-neutral-500">
            <MapPin className="w-3.5 h-3.5 text-[#D71920]" /> To
          </span>
          <span className="font-medium text-neutral-800 truncate max-w-[150px]">{parcel.destination}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
        <div className="flex items-center gap-1 text-neutral-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDate(parcel.bookingDate)}</span>
        </div>
        <Link
          to={detailLink}
          className="font-medium text-[#D71920] hover:text-[#A80F17] inline-flex items-center gap-1 hover:underline"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
