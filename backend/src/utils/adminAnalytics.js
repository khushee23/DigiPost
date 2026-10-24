const readDate = (...values) => {
  const value = values.find(Boolean);
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
};

const indiaDateParts = (date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
};

const dateKey = (date) => {
  const { year, month, day } = indiaDateParts(date);
  return `${year}-${month}-${day}`;
};

const deliveredDateFor = (parcel) => {
  const directDate = readDate(parcel.deliveredDate, parcel.delivered_date);
  if (directDate) return directDate;

  const deliveredEvent = (Array.isArray(parcel.history) ? parcel.history : [])
    .find((event) => event.status?.toUpperCase() === 'DELIVERED');
  return readDate(deliveredEvent?.timestamp);
};

export const buildAdminAnalytics = (state, now = new Date()) => {
  const users = state.users || [];
  const parcels = state.parcels || [];
  const complaints = state.complaints || [];
  const customers = users.filter((user) => user.role === 'customer');
  const employees = users.filter((user) => user.role === 'employee');

  const totalParcels = parcels.length;
  const pendingDeliveries = parcels.filter((parcel) => ['PENDING', 'ASSIGNED'].includes(parcel.status)).length;
  const inTransitDeliveries = parcels.filter((parcel) => ['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(parcel.status)).length;
  const completedDeliveries = parcels.filter((parcel) => parcel.status === 'DELIVERED').length;
  const failedDeliveries = parcels.filter((parcel) => parcel.status === 'FAILED').length;
  const cancelledDeliveries = parcels.filter((parcel) => parcel.status === 'CANCELLED').length;
  const totalRevenue = parcels.reduce((sum, parcel) => sum + (Number(parcel.cost) || 0), 0);
  const openComplaints = complaints.filter((complaint) => ['OPEN', 'IN_PROGRESS'].includes(complaint.status)).length;

  const todayParts = indiaDateParts(now);
  const today = new Date(Date.UTC(Number(todayParts.year), Number(todayParts.month) - 1, Number(todayParts.day)));
  const mondayOffset = (today.getUTCDay() + 6) % 7;
  const weekStart = addDays(today, -mondayOffset);
  const weeklyVolume = Array.from({ length: 7 }, (_, index) => {
    const day = addDays(weekStart, index);
    const key = dateKey(day);
    return {
      day: new Intl.DateTimeFormat('en-IN', { weekday: 'short', timeZone: 'UTC' }).format(day),
      bookings: parcels.filter((parcel) => {
        const bookingDate = readDate(parcel.bookingDate, parcel.booking_date);
        return bookingDate && dateKey(bookingDate) === key;
      }).length,
      delivered: parcels.filter((parcel) => {
        const deliveredDate = deliveredDateFor(parcel);
        return deliveredDate && dateKey(deliveredDate) === key;
      }).length,
    };
  });

  const firstMonth = new Date(Date.UTC(Number(todayParts.year), Number(todayParts.month) - 6, 1));
  const monthlyVolume = Array.from({ length: 6 }, (_, index) => {
    const monthStart = new Date(Date.UTC(firstMonth.getUTCFullYear(), firstMonth.getUTCMonth() + index, 1));
    const nextMonth = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1));
    const monthParcels = parcels.filter((parcel) => {
      const bookingDate = readDate(parcel.bookingDate, parcel.booking_date);
      return bookingDate && dateKey(bookingDate) >= dateKey(monthStart) && dateKey(bookingDate) < dateKey(nextMonth);
    });
    return {
      month: new Intl.DateTimeFormat('en-IN', { month: 'short', timeZone: 'UTC' }).format(monthStart),
      parcels: monthParcels.length,
      revenue: Number(monthParcels.reduce((sum, parcel) => sum + (Number(parcel.cost) || 0), 0).toFixed(2)),
    };
  });

  const attempts = completedDeliveries + failedDeliveries;
  const deliverySuccessRate = attempts ? Number(((completedDeliveries / attempts) * 100).toFixed(1)) : 0;

  return {
    totalCustomers: customers.length,
    totalEmployees: employees.length,
    totalParcels,
    pendingDeliveries,
    inTransitDeliveries,
    completedDeliveries,
    failedDeliveries,
    cancelledDeliveries,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    deliverySuccessRate,
    openComplaints,
    statusDistribution: [
      { name: 'Delivered', value: completedDeliveries, color: '#16803C' },
      { name: 'In Transit', value: inTransitDeliveries, color: '#6366F1' },
      { name: 'Pending / Assigned', value: pendingDeliveries, color: '#D97706' },
      { name: 'Failed', value: failedDeliveries, color: '#DC2626' },
      { name: 'Cancelled', value: cancelledDeliveries, color: '#737373' },
    ],
    weeklyVolume,
    monthlyVolume,
  };
};
