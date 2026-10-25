import bcrypt from 'bcryptjs';
import store from '../services/store.js';
import supabase, { isSupabaseEnabled } from '../config/supabase.js';

const sanitize = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return {
    ...safeUser,
    _id: safeUser.id || safeUser._id,
  };
};

const persistUserUpdates = async (id, updates) => {
  if (!isSupabaseEnabled) return;
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('User was not found in the database.');
};

// ==============================================================================
// Admin Profile Endpoints
// ==============================================================================

export const getAdmin = async (req, res) => {
  try {
    const admin = store.getUserById(req.params.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }
    return res.status(200).json(sanitize(admin));
  } catch (error) {
    console.error('Error fetching admin:', error);
    return res.status(500).json({ message: 'Internal error while fetching admin' });
  }
};

export const updateAdmin = async (req, res) => {
  try {
    const { name, email, station } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (station !== undefined) updates.station = station;

    const current = store.getUserById(req.params.id);
    if (!current || current.role !== 'admin') {
      return res.status(404).json({ message: 'Admin not found' });
    }
    await persistUserUpdates(current.id || current._id, updates);
    const updated = store.updateUser(current.id || current._id, updates);

    return res.status(200).json({
      message: 'Admin details updated successfully',
      data: sanitize(updated),
    });
  } catch (error) {
    console.error('Error updating admin:', error);
    return res.status(500).json({ message: 'Internal error while updating admin' });
  }
};

// ==============================================================================
// Fleet Management: Customer Endpoints
// ==============================================================================

export const getCustomers = async (req, res) => {
  try {
    const users = store.getUsers({ role: 'customer', search: req.query.search });
    const parcels = store.getParcels();

    const customers = users.map((c) => {
      const customerParcels = parcels.filter((p) => p.customerId === c.id || p.customerId === c._id);
      return {
        ...sanitize(c),
        totalBookings: customerParcels.length,
        deliveredCount: customerParcels.filter((p) => p.status === 'DELIVERED').length,
      };
    });

    return res.status(200).json({
      success: true,
      customers,
      total: customers.length,
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching customers',
    });
  }
};

export const toggleCustomerStatus = async (req, res) => {
  try {
    const customerId = req.params.id;
    const user = store.getUserById(customerId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    if (user.role !== 'customer') {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    await persistUserUpdates(user.id || user._id, { status: newStatus });
    const updated = store.updateUser(user.id || user._id, { status: newStatus });

    return res.status(200).json({
      success: true,
      customer: sanitize(updated),
    });
  } catch (error) {
    console.error('Error toggling customer status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error toggling status',
    });
  }
};

// ==============================================================================
// Fleet Management: Employee Endpoints
// ==============================================================================

export const getEmployees = async (req, res) => {
  try {
    const users = store.getUsers({ role: 'employee', search: req.query.search });
    const deliveries = store.getDeliveries();

    const employees = users.map((emp) => {
      const empDeliveries = deliveries.filter(
        (d) => d.assignedEmployeeId === emp.id || d.assignedEmployeeId === emp._id
      );
      const activeDeliveries = empDeliveries.filter((d) =>
        ['ASSIGNED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(d.status)
      ).length;
      const completedDeliveries = empDeliveries.filter((d) => d.status === 'DELIVERED').length;

      return {
        ...sanitize(emp),
        activeDeliveries,
        completedDeliveries,
      };
    });

    return res.status(200).json({
      success: true,
      employees,
      total: employees.length,
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error fetching employees',
    });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { name, email, phone, station, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required to provision an employee',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = store.getUserById(normalizedEmail);

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An employee or user with this email already exists',
      });
    }

    const rawPass = password || 'employee123';
    const hashedPassword = await bcrypt.hash(rawPass, 10);

    const payload = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || null,
      station: station || 'Central Sorting Hub 01',
      role: 'employee',
      status: 'active',
      created_at: new Date().toISOString(),
    };

    let created;
    if (isSupabaseEnabled) {
      const { data, error } = await supabase.from('users').insert(payload).select('*').single();
      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ success: false, message: 'An employee or user with this email already exists' });
        }
        throw error;
      }
      created = store.addUser(data);
    } else {
      created = store.addUser(payload);
    }

    return res.status(201).json({
      success: true,
      employee: sanitize(created),
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create employee',
    });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const { name, email, phone, station } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (email !== undefined) updates.email = email.trim().toLowerCase();
    if (phone !== undefined) updates.phone = phone.trim();
    if (station !== undefined) updates.station = station.trim();

    const current = store.getUserById(employeeId);
    if (!current || current.role !== 'employee') {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    await persistUserUpdates(current.id || current._id, updates);
    const updated = store.updateUser(current.id || current._id, updates);

    return res.status(200).json({
      success: true,
      employee: sanitize(updated),
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error updating employee',
    });
  }
};

export const toggleEmployeeStatus = async (req, res) => {
  try {
    const employeeId = req.params.id;
    const user = store.getUserById(employeeId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    if (user.role !== 'employee') {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    await persistUserUpdates(user.id || user._id, { status: newStatus });
    const updated = store.updateUser(user.id || user._id, { status: newStatus });

    return res.status(200).json({
      success: true,
      employee: sanitize(updated),
    });
  } catch (error) {
    console.error('Error toggling employee status:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error toggling employee status',
    });
  }
};