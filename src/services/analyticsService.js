import api, { USE_MOCK_API } from './api';
import { getMockData } from './mockData';

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const analyticsService = {
  // Get overview metrics and dashboard charts
  getAdminStats: async () => {
    if (USE_MOCK_API) {
      await delay();
      const { users, parcels, deliveries, complaints } = getMockData();

      const customers = users.filter((u) => u.role === 'customer');
      const employees = users.filter((u) => u.role === 'employee');

      const totalParcels = parcels.length;
      const pendingDeliveries = parcels.filter((p) => p.status === 'PENDING' || p.status === 'ASSIGNED').length;
      const inTransitDeliveries = parcels.filter((p) => p.status === 'IN_TRANSIT' || p.status === 'OUT_FOR_DELIVERY').length;
      const completedDeliveries = parcels.filter((p) => p.status === 'DELIVERED').length;
      const failedDeliveries = parcels.filter((p) => p.status === 'FAILED').length;

      const totalRevenue = parcels.reduce((sum, p) => sum + (p.cost || 0), 0);
      const openComplaints = complaints.filter((c) => c.status === 'OPEN' || c.status === 'IN_PROGRESS').length;

      // Status breakdown for Pie Chart
      const statusDistribution = [
        { name: 'Delivered', value: completedDeliveries, color: '#16803C' },
        { name: 'In Transit', value: inTransitDeliveries, color: '#6366F1' },
        { name: 'Pending / Assigned', value: pendingDeliveries, color: '#D97706' },
        { name: 'Failed', value: failedDeliveries, color: '#DC2626' },
      ];

      // Weekly volume trends
      const weeklyVolume = [
        { day: 'Mon', bookings: 12, delivered: 9 },
        { day: 'Tue', bookings: 18, delivered: 14 },
        { day: 'Wed', bookings: 15, delivered: 12 },
        { day: 'Thu', bookings: 22, delivered: 19 },
        { day: 'Fri', bookings: 28, delivered: 24 },
        { day: 'Sat', bookings: 16, delivered: 15 },
        { day: 'Sun', bookings: 8, delivered: 7 },
      ];

      // Monthly parcel volume
      const monthlyVolume = [
        { month: 'May', parcels: 340, revenue: 8400 },
        { month: 'Jun', parcels: 410, revenue: 10200 },
        { month: 'Jul', parcels: 390, revenue: 9800 },
        { month: 'Aug', parcels: 480, revenue: 12100 },
        { month: 'Sep', parcels: 520, revenue: 13400 },
        { month: 'Oct', parcels: totalParcels * 15 + 120, revenue: totalRevenue * 12 + 2500 },
      ];

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
          totalRevenue,
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
