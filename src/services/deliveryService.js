import api, { USE_MOCK_API } from './api';
import { getMockData, saveMockCollection, STORAGE_KEYS } from './mockData';

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export const deliveryService = {
  // Get deliveries assigned to employee
  getAssignedDeliveries: async (employeeId, filters = {}) => {
    if (USE_MOCK_API) {
      await delay();
      const { deliveries, parcels } = getMockData();

      // Join deliveries with parcel data
      let joined = deliveries
        .filter((d) => d.assignedEmployeeId === employeeId)
        .map((d) => {
          const parcel = parcels.find((p) => p._id === d.parcelId) || null;
          return { ...d, parcel };
        });

      if (filters.status && filters.status !== 'ALL') {
        joined = joined.filter((d) => d.status === filters.status);
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        joined = joined.filter(
          (d) =>
            d.deliveryId.toLowerCase().includes(q) ||
            d.parcel?.trackingId.toLowerCase().includes(q) ||
            d.parcel?.receiver?.name.toLowerCase().includes(q) ||
            d.parcel?.destination.toLowerCase().includes(q)
        );
      }

      return {
        success: true,
        deliveries: joined,
        total: joined.length,
      };
    }

    const response = await api.get('/deliveries/my-deliveries', { params: { employeeId, ...filters } });
    return response.data;
  },

  // Get delivery details by ID
  getDeliveryDetails: async (deliveryId) => {
    if (USE_MOCK_API) {
      await delay();
      const { deliveries, parcels, users } = getMockData();
      const delivery = deliveries.find((d) => d._id === deliveryId || d.deliveryId === deliveryId);

      if (!delivery) throw new Error('Delivery record not found.');

      const parcel = parcels.find((p) => p._id === delivery.parcelId);
      const employee = users.find((u) => u._id === delivery.assignedEmployeeId);

      return {
        success: true,
        delivery: {
          ...delivery,
          parcel,
          assignedEmployee: employee,
        },
      };
    }

    const response = await api.get(`/deliveries/${deliveryId}`);
    return response.data;
  },

  // Update status (Employee)
  updateDeliveryStatus: async (deliveryId, { status, note, location, failureReason, employeeName }) => {
    if (USE_MOCK_API) {
      await delay(300);
      const { deliveries, parcels } = getMockData();
      const delIndex = deliveries.findIndex((d) => d._id === deliveryId || d.deliveryId === deliveryId);
      if (delIndex === -1) throw new Error('Delivery not found.');

      const delivery = deliveries[delIndex];
      delivery.status = status;

      if (status === 'DELIVERED') {
        delivery.completionDate = new Date().toISOString();
      } else if (status === 'FAILED') {
        delivery.failureReason = failureReason;
        delivery.completionDate = new Date().toISOString();
      }

      deliveries[delIndex] = delivery;
      saveMockCollection(STORAGE_KEYS.DELIVERIES, deliveries);

      // Update corresponding parcel
      const parcelIndex = parcels.findIndex((p) => p._id === delivery.parcelId);
      if (parcelIndex >= 0) {
        const parcel = parcels[parcelIndex];
        parcel.status = status;
        if (status === 'DELIVERED') {
          parcel.deliveredDate = new Date().toISOString();
        } else if (status === 'FAILED') {
          parcel.failureReason = failureReason;
        }

        parcel.history.push({
          status,
          timestamp: new Date().toISOString(),
          location: location || 'Transit Delivery Route',
          note: note || (status === 'FAILED' ? `Failed: ${failureReason}` : `Status updated to ${status}`),
          updatedBy: employeeName || 'Delivery Courier',
        });

        parcels[parcelIndex] = parcel;
        saveMockCollection(STORAGE_KEYS.PARCELS, parcels);
      }

      return { success: true, delivery };
    }

    const response = await api.patch(`/deliveries/${deliveryId}/status`, {
      status,
      note,
      location,
      failureReason,
    });
    return response.data;
  },

  // Get all deliveries (Admin)
  getAllDeliveries: async (filters = {}) => {
    if (USE_MOCK_API) {
      await delay();
      const { deliveries, parcels, users } = getMockData();

      let result = deliveries.map((d) => {
        const parcel = parcels.find((p) => p._id === d.parcelId) || null;
        const employee = users.find((u) => u._id === d.assignedEmployeeId) || null;
        return { ...d, parcel, assignedEmployee: employee };
      });

      if (filters.status && filters.status !== 'ALL') {
        result = result.filter((d) => d.status === filters.status);
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (d) =>
            d.deliveryId.toLowerCase().includes(q) ||
            d.parcel?.trackingId.toLowerCase().includes(q) ||
            d.assignedEmployee?.name.toLowerCase().includes(q) ||
            d.parcel?.destination.toLowerCase().includes(q)
        );
      }

      return {
        success: true,
        deliveries: result,
        total: result.length,
      };
    }

    const response = await api.get('/deliveries', { params: filters });
    return response.data;
  },
};
