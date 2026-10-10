import api, { USE_MOCK_API } from './api';
import { getMockData, saveMockCollection, STORAGE_KEYS } from './mockData';

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export const parcelService = {
  // Book a new parcel
  bookParcel: async (parcelData) => {
    if (USE_MOCK_API) {
      await delay(300);
      const { parcels, users } = getMockData();

      // Generate a realistic tracking ID
      const randomDigits = Math.floor(10000000 + Math.random() * 90000000);
      const trackingId = `PO-${randomDigits}`;

      // Calculate cost based on weight and parcel type
      const baseRates = {
        standard: 10,
        express: 22,
        document: 12,
        fragile: 25,
        heavy: 35,
      };
      const rate = baseRates[parcelData.parcelType] || 15;
      const weightMultiplier = Math.max(1, Number(parcelData.weight || 1));
      const calculatedCost = Number((rate + weightMultiplier * 4.5).toFixed(2));

      // Calculate expected delivery date (2 to 4 days)
      const expectedDays = parcelData.parcelType === 'express' ? 2 : 4;
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + expectedDays);

      const newParcel = {
        _id: `pcl_${Date.now()}`,
        trackingId,
        customerId: parcelData.customerId,
        sender: parcelData.sender,
        receiver: parcelData.receiver,
        origin: `${parcelData.sender.city}, ${parcelData.sender.state}`,
        destination: `${parcelData.receiver.city}, ${parcelData.receiver.state}`,
        parcelType: parcelData.parcelType,
        weight: Number(parcelData.weight),
        description: parcelData.description || '',
        cost: calculatedCost,
        status: 'PENDING',
        assignedTo: null,
        bookingDate: new Date().toISOString(),
        expectedDeliveryDate: expectedDate.toISOString(),
        history: [
          {
            status: 'PENDING',
            timestamp: new Date().toISOString(),
            location: `${parcelData.sender.city} Origin Branch`,
            note: 'Parcel booked online and manifest created in system.',
            updatedBy: parcelData.sender.name,
          },
        ],
      };

      const updatedParcels = [newParcel, ...parcels];
      saveMockCollection(STORAGE_KEYS.PARCELS, updatedParcels);

      return {
        success: true,
        parcel: newParcel,
        trackingId,
      };
    }

    const response = await api.post('/parcels', parcelData);
    return response.data;
  },

  // Get customer's parcels
  getCustomerParcels: async (customerId, filters = {}) => {
    if (USE_MOCK_API) {
      await delay();
      const { parcels } = getMockData();
      let filtered = parcels.filter((p) => p.customerId === customerId);

      if (filters.status && filters.status !== 'ALL') {
        filtered = filtered.filter((p) => p.status === filters.status);
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.trackingId.toLowerCase().includes(query) ||
            p.destination.toLowerCase().includes(query) ||
            p.receiver?.name.toLowerCase().includes(query)
        );
      }

      return {
        success: true,
        parcels: filtered,
        total: filtered.length,
      };
    }

    const response = await api.get('/parcels/my-parcels', { params: { customerId, ...filters } });
    return response.data;
  },

  // Get all parcels (Admin)
  getAllParcels: async (filters = {}) => {
    if (USE_MOCK_API) {
      await delay();
      const { parcels } = getMockData();
      let result = [...parcels];

      if (filters.status && filters.status !== 'ALL') {
        result = result.filter((p) => p.status === filters.status);
      }
      if (filters.unassignedOnly) {
        result = result.filter((p) => !p.assignedTo || p.status === 'PENDING');
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        result = result.filter(
          (p) =>
            p.trackingId.toLowerCase().includes(query) ||
            p.sender?.name.toLowerCase().includes(query) ||
            p.receiver?.name.toLowerCase().includes(query) ||
            p.origin.toLowerCase().includes(query) ||
            p.destination.toLowerCase().includes(query)
        );
      }

      return {
        success: true,
        parcels: result,
        total: result.length,
      };
    }

    const response = await api.get('/parcels', { params: filters });
    return response.data;
  },

  // Get parcel by tracking ID or ID
  getParcelDetails: async (identifier) => {
    if (USE_MOCK_API) {
      await delay();
      const { parcels } = getMockData();
      const parcel = parcels.find(
        (p) => p._id === identifier || p.trackingId.toLowerCase() === identifier.toLowerCase()
      );

      if (!parcel) {
        throw new Error(`Parcel with ID or Tracking number '${identifier}' was not found.`);
      }

      return { success: true, parcel };
    }

    const response = await api.get(`/parcels/${identifier}`);
    return response.data;
  },

  // Public parcel tracking (sanitized, safe)
  getPublicTracking: async (trackingId) => {
    if (USE_MOCK_API) {
      await delay(200);
      const { parcels } = getMockData();
      const parcel = parcels.find((p) => p.trackingId.toLowerCase() === trackingId.trim().toLowerCase());

      if (!parcel) {
        throw new Error(`No parcel record found matching tracking number '${trackingId}'. Please check and try again.`);
      }

      // Public sanitized version without sensitive addresses, phone numbers, or passwords
      const publicData = {
        trackingId: parcel.trackingId,
        originCity: parcel.origin,
        destinationCity: parcel.destination,
        parcelType: parcel.parcelType,
        weight: parcel.weight,
        status: parcel.status,
        bookingDate: parcel.bookingDate,
        expectedDeliveryDate: parcel.expectedDeliveryDate,
        deliveredDate: parcel.deliveredDate,
        failureReason: parcel.failureReason,
        history: parcel.history.map((h) => ({
          status: h.status,
          timestamp: h.timestamp,
          location: h.location,
          note: h.note,
        })),
      };

      return { success: true, tracking: publicData };
    }

    const response = await api.get(`/tracking/${trackingId}`);
    return response.data;
  },

  // Assign parcel to an employee
  assignParcel: async (parcelId, employee) => {
    if (USE_MOCK_API) {
      await delay(250);
      const { parcels, deliveries } = getMockData();
      const parcelIndex = parcels.findIndex((p) => p._id === parcelId || p.trackingId === parcelId);

      if (parcelIndex === -1) throw new Error('Parcel not found.');

      const parcel = parcels[parcelIndex];
      parcel.status = 'ASSIGNED';
      parcel.assignedTo = {
        _id: employee._id,
        name: employee.name,
        phone: employee.phone,
        email: employee.email,
      };

      parcel.history.push({
        status: 'ASSIGNED',
        timestamp: new Date().toISOString(),
        location: employee.station || 'Regional Dispatch Hub',
        note: `Assigned to delivery courier ${employee.name}.`,
        updatedBy: 'System Administrator',
      });

      parcels[parcelIndex] = parcel;
      saveMockCollection(STORAGE_KEYS.PARCELS, parcels);

      // Create or update delivery record
      const existingDelIndex = deliveries.findIndex((d) => d.parcelId === parcel._id);
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 1);

      if (existingDelIndex >= 0) {
        deliveries[existingDelIndex].assignedEmployeeId = employee._id;
        deliveries[existingDelIndex].status = 'ASSIGNED';
      } else {
        deliveries.push({
          _id: `del_${Date.now()}`,
          deliveryId: `DEL-${Math.floor(10000 + Math.random() * 90000)}`,
          parcelId: parcel._id,
          assignedEmployeeId: employee._id,
          status: 'ASSIGNED',
          assignedDate: new Date().toISOString(),
          scheduledDate: scheduledDate.toISOString(),
          notes: 'Standard assignment from central administration.',
        });
      }
      saveMockCollection(STORAGE_KEYS.DELIVERIES, deliveries);

      return { success: true, parcel };
    }

    const response = await api.post(`/parcels/${parcelId}/assign`, { employeeId: employee._id });
    return response.data;
  },
};
