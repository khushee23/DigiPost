import api, { USE_MOCK_API } from './api';
import { getMockData } from './mockData';

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const getIndiaDateParts = (date) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
};

const getIndiaDateKey = (date) => {
  const { year, month, day } = getIndiaDateParts(date);
  return `${year}-${month}-${day}`;
};

const getMockVolumeStats = (parcels, now = new Date()) => {
  const todayParts = getIndiaDateParts(now);
  const today = new Date(Date.UTC(Number(todayParts.year), Number(todayParts.month) - 1, Number(todayParts.day)));
  const mondayOffset = (today.getUTCDay() + 6) % 7;
  const weekStart = new Date(today);
  weekStart.setUTCDate(weekStart.getUTCDate() - mondayOffset);
  const weeklyVolume = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setUTCDate(day.getUTCDate() + index);
    const key = getIndiaDateKey(day);
    return {
      day: new Intl.DateTimeFormat('en-IN', { weekday: 'short', timeZone: 'UTC' }).format(day),
      bookings: parcels.filter((parcel) => {
        const date = new Date(parcel.bookingDate || parcel.booking_date);
        return !Number.isNaN(date.getTime()) && getIndiaDateKey(date) === key;
      }).length,
      delivered: parcels.filter((parcel) => {
        const event = (parcel.history || []).find((item) => item.status === 'DELIVERED');
        const date = parcel.deliveredDate || parcel.delivered_date || event?.timestamp;
        const parsedDate = date ? new Date(date) : null;
        return parsedDate && !Number.isNaN(parsedDate.getTime()) && getIndiaDateKey(parsedDate) === key;
      }).length,
    };
  });

  const firstMonth = new Date(Date.UTC(Number(todayParts.year), Number(todayParts.month) - 6, 1));
  const monthlyVolume = Array.from({ length: 6 }, (_, index) => {
    const start = new Date(Date.UTC(firstMonth.getUTCFullYear(), firstMonth.getUTCMonth() + index, 1));
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1));
    const monthlyParcels = parcels.filter((parcel) => {
      const date = new Date(parcel.bookingDate || parcel.booking_date);
      return !Number.isNaN(date.getTime()) &&
        getIndiaDateKey(date) >= getIndiaDateKey(start) &&
        getIndiaDateKey(date) < getIndiaDateKey(end);
    });
    return {
      month: new Intl.DateTimeFormat('en-IN', { month: 'short', timeZone: 'UTC' }).format(start),
      parcels: monthlyParcels.length,
      revenue: Number(monthlyParcels.reduce((sum, parcel) => sum + (Number(parcel.cost) || 0), 0).toFixed(2)),
    };
  });

  return { weeklyVolume, monthlyVolume };
};

export const analyticsService = {
  // Get overview metrics and dashboard charts
  getAdminStats: async () => {
    if (USE_MOCK_API) {
      await delay();
      const { users, parcels, complaints } = getMockData();

      const customers = users.filter((u) => u.role === 'customer');
      const employees = users.filter((u) => u.role === 'employee');

      const totalParcels = parcels.length;
      const pendingDeliveries = parcels.filter((p) => p.status === 'PENDING' || p.status === 'ASSIGNED').length;
      const inTransitDeliveries = parcels.filter((p) => p.status === 'IN_TRANSIT' || p.status === 'OUT_FOR_DELIVERY').length;
      const completedDeliveries = parcels.filter((p) => p.status === 'DELIVERED').length;
      const failedDeliveries = parcels.filter((p) => p.status === 'FAILED').length;
      const cancelledDeliveries = parcels.filter((p) => p.status === 'CANCELLED').length;

      const totalRevenue = parcels.reduce((sum, p) => sum + (p.cost || 0), 0);
      const openComplaints = complaints.filter((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;
      const attempts = completedDeliveries + failedDeliveries;

      const statusDistribution = [
        { name: 'Delivered', value: completedDeliveries, color: '#16803C' },
        { name: 'In Transit', value: inTransitDeliveries, color: '#6366F1' },
        { name: 'Pending / Assigned', value: pendingDeliveries, color: '#D97706' },
        { name: 'Failed', value: failedDeliveries, color: '#DC2626' },
        { name: 'Cancelled', value: cancelledDeliveries, color: '#737373' },
      ];

      const { weeklyVolume, monthlyVolume } = getMockVolumeStats(parcels);

      return {
        success: true,
        stats: {
          totalCustomers: customers.length,
          totalEmployees: employees.length,
          totalParcels,
          pendingDeliveries,
          inTransitDeliveries,
          completedDeliveries,
          failedDeliveries,
          cancelledDeliveries,
          totalRevenue,
          deliverySuccessRate: attempts ? Number(((completedDeliveries / attempts) * 100).toFixed(1)) : 0,
          openComplaints,
          statusDistribution,
          weeklyVolume,
          monthlyVolume,
        },
      };
    }

    const response = await api.get('/analytics/admin-summary');
    return response.data;
  },

  // Customer specific analytics
  getCustomerStats: async (customerId) => {
    if (USE_MOCK_API) {
      await delay();
      const { parcels, complaints } = getMockData();
      const customerParcels = parcels.filter((p) => p.customerId === customerId);

      const totalParcels = customerParcels.length;
      const pendingDeliveries = customerParcels.filter((p) => p.status === 'PENDING' || p.status === 'ASSIGNED').length;
      const inTransitDeliveries = customerParcels.filter((p) => p.status === 'IN_TRANSIT' || p.status === 'OUT_FOR_DELIVERY').length;
      const completedDeliveries = customerParcels.filter((p) => p.status === 'DELIVERED').length;
      const failedDeliveries = customerParcels.filter((p) => p.status === 'FAILED').length;
      const activeComplaints = complaints.filter((c) => c.customerId === customerId && c.status !== 'RESOLVED').length;

      const statusDistribution = [
        { name: 'Delivered', value: completedDeliveries, color: '#16803C' },
        { name: 'In Transit', value: inTransitDeliveries, color: '#6366F1' },
        { name: 'Pending', value: pendingDeliveries, color: '#D97706' },
        { name: 'Failed', value: failedDeliveries, color: '#DC2626' },
      ];

      return {
        success: true,
        stats: {
          totalParcels,
          pendingDeliveries,
          inTransitDeliveries,
          completedDeliveries,
          failedDeliveries,
          activeComplaints,
          statusDistribution,
        },
      };
    }

    const response = await api.get('/analytics/customer-summary', { params: { customerId } });
    return response.data;
  },

  // Employee specific analytics
  getEmployeeStats: async (employeeId) => {
    if (USE_MOCK_API) {
      await delay();
      const { deliveries } = getMockData();
      const empDeliveries = deliveries.filter((d) => d.assignedEmployeeId === employeeId);

      const assignedCount = empDeliveries.length;
      const activeCount = empDeliveries.filter((d) => ['ASSIGNED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(d.status)).length;
      const completedCount = empDeliveries.filter((d) => d.status === 'DELIVERED').length;
      const failedCount = empDeliveries.filter((d) => d.status === 'FAILED').length;

      return {
        success: true,
        stats: {
          assignedDeliveries: assignedCount,
          activeDeliveries: activeCount,
          completedDeliveries: completedCount,
          failedDeliveries: failedCount,
        },
      };
    }

    const response = await api.get('/analytics/employee-summary', { params: { employeeId } });
    return response.data;
  },
};
