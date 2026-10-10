import React from 'react';
import { CheckCircle2, Clock, Truck, MapPin, AlertCircle, PackageCheck } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

const ORDERED_STEPS = [
  { key: 'PENDING', label: 'Booking Created', icon: Clock },
  { key: 'ASSIGNED', label: 'Parcel Assigned', icon: MapPin },
  { key: 'IN_TRANSIT', label: 'In Transit', icon: Truck },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: PackageCheck },
];

export const TrackingTimeline = ({ status, history = [], failureReason = null }) => {
  // Determine current step index
  const statusOrder = ['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
  const currentIndex = status === 'FAILED' ? 3 : statusOrder.indexOf(status);

  return (
    <div className="py-2">
      {/* Step Tracker Header Bar */}
      <div className="relative mb-8">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-neutral-200 -translate-y-1/2 z-0 hidden sm:block" />
        
        {/* Active progress bar */}
        <div
          className="absolute top-1/2 left-0 h-1 bg-[#D71920] -translate-y-1/2 z-0 transition-all duration-500 hidden sm:block"
          style={{
            width: `${Math.max(0, Math.min(100, (currentIndex / (statusOrder.length - 1)) * 100))}%`,
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
          {ORDERED_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentIndex && status !== 'FAILED';
            const isCurrent = idx === currentIndex;
            const isFailed = status === 'FAILED' && idx === currentIndex;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shrink-0 border-2 ${
                    isFailed
                      ? 'bg-red-600 border-red-600 text-white shadow-sm'
                      : isCompleted
                      ? 'bg-[#D71920] border-[#D71920] text-white shadow-sm'
                      : isCurrent
                      ? 'bg-white border-[#D71920] text-[#D71920]'
                      : 'bg-white border-neutral-300 text-neutral-400'
                  }`}
                >
                  {isFailed ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-xs font-semibold ${
                      isCurrent || isCompleted ? 'text-neutral-900' : 'text-neutral-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  <span className="text-[11px] text-neutral-500">Step {idx + 1}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Failure Banner if Delivery Failed */}
      {status === 'FAILED' && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-red-800">Delivery Attempt Unsuccessful</h4>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">
              {failureReason || 'A delivery exception occurred during dispatch. The parcel has been routed back to the local sorting hub.'}
            </p>
          </div>
        </div>
      )}

      {/* Detailed Chronological History Log */}
      <div className="mt-8">
        <h4 className="text-sm font-semibold text-neutral-900 mb-4 pb-2 border-b border-neutral-200">
          Tracking Event Log
        </h4>
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-neutral-200">
          {history.length === 0 ? (
            <p className="text-xs text-neutral-500 italic pl-8">No historical checkpoints recorded yet.</p>
          ) : (
            [...history].reverse().map((event, idx) => (
              <div key={idx} className="relative flex items-start gap-4 pl-8">
                <div className="absolute left-2 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#D71920] -translate-x-1/2" />
                <div className="flex-1 bg-neutral-50 p-3.5 rounded-lg border border-neutral-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                    <span className="text-xs font-semibold text-neutral-900">
                      {event.location || 'Sorting Facility'}
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      {formatDateTime(event.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-700 leading-relaxed">{event.note}</p>
                  {event.updatedBy && (
                    <p className="text-[10px] text-neutral-400 mt-1">Logged by: {event.updatedBy}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
