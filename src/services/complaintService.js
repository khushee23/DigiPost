import api, { USE_MOCK_API } from './api';
import { getMockData, saveMockCollection, STORAGE_KEYS } from './mockData';

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export const complaintService = {
  // Submit new complaint (Customer)
  submitComplaint: async (complaintData) => {
    if (USE_MOCK_API) {
      await delay(300);
      const { complaints } = getMockData();

      const newComplaint = {
        _id: `cmp_${Date.now()}`,
        complaintId: `CMP-${Math.floor(1000 + Math.random() * 9000)}`,
        customerId: complaintData.customerId,
        customerName: complaintData.customerName,
        customerEmail: complaintData.customerEmail,
        trackingId: complaintData.trackingId || null,
        category: complaintData.category,
        subject: complaintData.subject,
        description: complaintData.description,
        status: 'OPEN',
        resolutionNotes: null,
        resolvedAt: null,
        resolvedBy: null,
        createdAt: new Date().toISOString(),
      };

      const updated = [newComplaint, ...complaints];
      saveMockCollection(STORAGE_KEYS.COMPLAINTS, updated);

      return {
        success: true,
        complaint: newComplaint,
      };
    }

    const response = await api.post('/complaints', complaintData);
    return response.data;
  },

  // Get customer's complaints
  getCustomerComplaints: async (customerId) => {
    if (USE_MOCK_API) {
      await delay();
      const { complaints } = getMockData();
      const filtered = complaints.filter((c) => c.customerId === customerId);
      return {
        success: true,
        complaints: filtered,
        total: filtered.length,
      };
    }

    const response = await api.get('/complaints/my-complaints', { params: { customerId } });
    return response.data;
  },

  // Get all complaints (Admin)
  getAllComplaints: async (filters = {}) => {
    if (USE_MOCK_API) {
      await delay();
      const { complaints } = getMockData();
      let result = [...complaints];

      if (filters.status && filters.status !== 'ALL') {
        result = result.filter((c) => c.status === filters.status);
      }

      if (filters.search) {
        const q = filters.search.toLowerCase();
        result = result.filter(
          (c) =>
            c.complaintId.toLowerCase().includes(q) ||
            c.customerName?.toLowerCase().includes(q) ||
            c.subject?.toLowerCase().includes(q) ||
            (c.trackingId && c.trackingId.toLowerCase().includes(q))
        );
      }

      return {
        success: true,
        complaints: result,
        total: result.length,
      };
    }

    const response = await api.get('/complaints', { params: filters });
    return response.data;
  },

  // Resolve / Update status (Admin)
  updateComplaintStatus: async (complaintId, { status, resolutionNotes, adminUser }) => {
    if (USE_MOCK_API) {
      await delay(250);
      const { complaints } = getMockData();
      const index = complaints.findIndex((c) => c._id === complaintId || c.complaintId === complaintId);
      if (index === -1) throw new Error('Complaint record not found.');

      const complaint = complaints[index];
      complaint.status = status;
      complaint.resolutionNotes = resolutionNotes;

      if (status === 'RESOLVED' || status === 'REJECTED') {
        complaint.resolvedAt = new Date().toISOString();
        complaint.resolvedBy = {
          _id: adminUser._id,
          name: adminUser.name,
        };
      }

      complaints[index] = complaint;
      saveMockCollection(STORAGE_KEYS.COMPLAINTS, complaints);

      return { success: true, complaint };
    }

    const response = await api.patch(`/complaints/${complaintId}/status`, {
      status,
      resolutionNotes,
    });
    return response.data;
  },
};
