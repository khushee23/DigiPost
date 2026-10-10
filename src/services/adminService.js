import api, { USE_MOCK_API } from './api';
import { getMockData, saveMockCollection, STORAGE_KEYS } from './mockData';

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export const adminService = {
  // Get all registered customers
  getCustomers: async (filters = {}) => {
    if (USE_MOCK_API) {
      await delay();
      const { users, parcels } = getMockData();
      let customers = users
        .filter((u) => u.role === 'customer')
        .map((c) => {
          const customerParcels = parcels.filter((p) => p.customerId === c._id);
          return {
            ...c,
            totalBookings: customerParcels.length,
            deliveredCount: customerParcels.filter((p) => p.status === 'DELIVERED').length,
          };
        });

      if (filters.search) {
        const q = filters.search.toLowerCase();
        customers = customers.filter(
          (c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q)
        );
      }

      return {
        success: true,
        customers,
        total: customers.length,
      };
    }

    const response = await api.get('/admin/customers', { params: filters });
    return response.data;
  },

  // Toggle customer account status (active/inactive)
  toggleCustomerStatus: async (customerId) => {
    if (USE_MOCK_API) {
      await delay(200);
      const { users } = getMockData();
      const index = users.findIndex((u) => u._id === customerId);
      if (index === -1) throw new Error('Customer not found.');

      users[index].status = users[index].status === 'active' ? 'inactive' : 'active';
      saveMockCollection(STORAGE_KEYS.USERS, users);
      return { success: true, customer: users[index] };
    }

    const response = await api.patch(`/admin/customers/${customerId}/status`);
    return response.data;
  },

  // Get all postal employees
  getEmployees: async (filters = {}) => {
    if (USE_MOCK_API) {
      await delay();
      const { users, deliveries } = getMockData();
      let employees = users
        .filter((u) => u.role === 'employee')
        .map((emp) => {
          const empDeliveries = deliveries.filter((d) => d.assignedEmployeeId === emp._id);
          const activeDeliveries = empDeliveries.filter((d) => ['ASSIGNED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(d.status)).length;
          const completedDeliveries = empDeliveries.filter((d) => d.status === 'DELIVERED').length;
          return {
            ...emp,
            activeDeliveries,
            completedDeliveries,
          };
        });

      if (filters.search) {
        const q = filters.search.toLowerCase();
        employees = employees.filter(
          (e) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || (e.station && e.station.toLowerCase().includes(q))
        );
      }

      return {
        success: true,
        employees,
        total: employees.length,
      };
    }

    const response = await api.get('/admin/employees', { params: filters });
    return response.data;
  },

  // Add / Provision new employee
  createEmployee: async (employeeData) => {
    if (USE_MOCK_API) {
      await delay(300);
      const { users } = getMockData();

      const exists = users.some((u) => u.email.toLowerCase() === employeeData.email.toLowerCase());
      if (exists) throw new Error('An employee with this email already exists.');

      const newEmployee = {
        _id: `usr_emp_${Date.now()}`,
        name: employeeData.name,
        email: employeeData.email,
        phone: employeeData.phone,
        role: 'employee',
        station: employeeData.station || 'Central Sorting Hub 01',
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      const updated = [...users, newEmployee];
      saveMockCollection(STORAGE_KEYS.USERS, updated);
      return { success: true, employee: newEmployee };
    }

    const response = await api.post('/admin/employees', employeeData);
    return response.data;
  },

  // Update employee
  updateEmployee: async (employeeId, employeeData) => {
    if (USE_MOCK_API) {
      await delay(200);
      const { users } = getMockData();
      const index = users.findIndex((u) => u._id === employeeId);
      if (index === -1) throw new Error('Employee not found.');

      users[index] = { ...users[index], ...employeeData };
      saveMockCollection(STORAGE_KEYS.USERS, users);
      return { success: true, employee: users[index] };
    }

    const response = await api.put(`/admin/employees/${employeeId}`, employeeData);
    return response.data;
  },

  // Toggle employee active status
  toggleEmployeeStatus: async (employeeId) => {
    if (USE_MOCK_API) {
      await delay(200);
      const { users } = getMockData();
      const index = users.findIndex((u) => u._id === employeeId);
      if (index === -1) throw new Error('Employee not found.');

      users[index].status = users[index].status === 'active' ? 'inactive' : 'active';
      saveMockCollection(STORAGE_KEYS.USERS, users);
      return { success: true, employee: users[index] };
    }

    const response = await api.patch(`/admin/employees/${employeeId}/status`);
    return response.data;
  },
};
