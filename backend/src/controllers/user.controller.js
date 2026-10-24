import store from '../services/store.js';
import supabase, { isSupabaseEnabled } from '../config/supabase.js';

const sanitizeUser = (u) => {
  if (!u) return null;
  const { password, ...safe } = u;
  return { ...safe, _id: safe.id || safe._id };
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

// GET /api/users/me
export const getMeUser = async (req, res) => {
  try {
    const user = store.getUserById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal error fetching user' });
  }
};

// PATCH /api/users/me
export const updateMeUser = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;

    const current = store.getUserById(req.user.id);
    if (!current) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await persistUserUpdates(current.id || current._id, updates);
    const updated = store.updateUser(current.id || current._id, updates);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: sanitizeUser(updated),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal error updating profile' });
  }
};

// GET /api/users (Admin only)
export const getUsers = async (req, res) => {
  try {
    const users = store.getUsers().map(sanitizeUser);
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error in fetching user:', error);
    return res.status(500).json({ message: 'Internal error in fetching user' });
  }
};

// GET /api/users/:id (Admin or self)
export const getUserById = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Access denied: You can only view your own profile' });
    }

    const user = store.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json(sanitizeUser(user));
  } catch (error) {
    return res.status(500).json({ message: 'Internal error in fetching user by id' });
  }
};

// PATCH /api/users/:id/status (Admin only)
export const toggleUserStatus = async (req, res) => {
  try {
    const user = store.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    await persistUserUpdates(user.id || user._id, { status: newStatus });
    const updated = store.updateUser(user.id || user._id, { status: newStatus });

    return res.status(200).json({
      success: true,
      message: `User status changed to ${newStatus}`,
      user: sanitizeUser(updated),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal error toggling user status' });
  }
};

// PATCH /api/users/:id (Admin only)
export const updateUserById = async (req, res) => {
  try {
    const current = store.getUserById(req.params.id);
    if (!current) {
      return res.status(404).json({ message: 'User not found' });
    }
    const { name, phone, address, station, status } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (address !== undefined) updates.address = address;
    if (station !== undefined) updates.station = station;
    if (status !== undefined) updates.status = status;
    await persistUserUpdates(current.id || current._id, updates);
    const updated = store.updateUser(current.id || current._id, updates);

    return res.status(200).json(sanitizeUser(updated));
  } catch (error) {
    return res.status(500).json({ message: 'Internal error in updating user' });
  }
};

// DELETE /api/users/:id (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = store.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (isSupabaseEnabled) {
      const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id || user._id)
        .select('id')
        .maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ success: false, message: 'User not found in database' });
    }
    store.state.users = store.state.users.filter((entry) => entry.id !== user.id && entry._id !== user._id);
    store.saveState();

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal error in deleting user' });
  }
};