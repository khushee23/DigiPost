const LEGAL_TRANSITIONS = {
  PENDING: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_TRANSIT', 'FAILED'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY', 'FAILED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
  FAILED: ['ASSIGNED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'],
  DELIVERED: [],
  CANCELLED: [],
};

export const validateDeliveryStatusTransition = (currentStatus, requestedStatus, failureReason) => {
  const current = (currentStatus || 'ASSIGNED').toUpperCase();
  const next = (requestedStatus || '').toUpperCase();
  const allowed = LEGAL_TRANSITIONS[current] || [];

  if (!allowed.includes(next)) {
    throw new Error(
      `Invalid delivery status transition from ${current} to ${next}. Permitted next status: ${allowed.join(', ')}.`
    );
  }
  if (next === 'FAILED' && (!failureReason || !failureReason.trim())) {
    throw new Error('A failureReason is strictly mandatory when recording a delivery as FAILED.');
  }

  return next;
};
