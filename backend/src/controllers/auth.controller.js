import bcrypt from 'bcryptjs';
import supabase, { isSupabaseEnabled } from '../config/supabase.js';
import store from '../services/store.js';
import { generateToken } from '../utils/token.js';

// Helper to remove password and format user response for frontend
const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  const canonicalRole = (safeUser.role || 'customer').toString().trim().toLowerCase();
  return {
    ...safeUser,
    id: safeUser.id || safeUser._id,
    _id: safeUser.id || safeUser._id,
    role: canonicalRole,
  };
};

/**
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, phone, password, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing
    const existingInStore = store.getUserById(normalizedEmail);
    if (existingInStore) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const assignedRole = 'customer';
    const newUserPayload = {
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || null,
      address: address || null,
      station: null,
      role: assignedRole,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let createdUser;
    if (isSupabaseEnabled) {
      const { data: supaUser, error: insertError } = await supabase
        .from('users')
        .insert(newUserPayload)
        .select()
        .single();
      if (insertError) {
        if (insertError.code === '23505') {
          return res.status(409).json({ success: false, message: 'An account with this email already exists' });
        }
        throw insertError;
      }
      createdUser = store.addUser(supaUser);
    } else {
      createdUser = store.addUser(newUserPayload);
    }

    const token = generateToken(createdUser.id || createdUser._id, createdUser.role, res, createdUser.email);

    return res.status(201).json({
      success: true,
      token,
      user: sanitizeUser(createdUser),
    });
  } catch (error) {
    console.error('Error in register controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
    });
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    let normalizedEmail = email.trim().toLowerCase();

    // Friendly alias support for convenient logins
    if (normalizedEmail === 'admin') normalizedEmail = 'admin@postoffice.gov';
    if (normalizedEmail === 'employee' || normalizedEmail === 'courier') normalizedEmail = 'employee@postoffice.gov';
    if (normalizedEmail === 'customer') normalizedEmail = 'sarah.customer@gmail.com';

    let user = null;

    if (isSupabaseEnabled) {
      const { data: supaUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (supaUser) {
        user = supaUser;
        store.addUser(supaUser);
      }
    } else {
      user = store.getUserById(normalizedEmail);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check account status
    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact support.',
      });
    }

    // Verify password hash
    let isPasswordValid = false;
    if (user.password) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user.id || user._id, user.role, res, user.email);

    return res.status(200).json({
      success: true,
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Error in login controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login',
    });
  }
};

/**
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    let user = null;

    if (isSupabaseEnabled) {
      const { data: supaUser, error } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
      if (error) throw error;
      if (supaUser) user = supaUser;
    } else {
      user = store.getUserById(userId);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error fetching profile' });
  }
};

/**
 * PUT /api/auth/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, station } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (address !== undefined) updates.address = address.trim();
    if (station !== undefined && req.user.role === 'admin') updates.station = station.trim();

    if (isSupabaseEnabled) {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select('*')
        .maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ success: false, message: 'User not found' });
    }
    const updatedUser = store.updateUser(userId, updates);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: sanitizeUser(updatedUser || { ...req.user, ...updates }),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error updating profile' });
  }
};

/**
 * PUT /api/auth/change-password
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = store.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let isCurrentValid = false;
    if (user.password) {
      isCurrentValid = await bcrypt.compare(currentPassword, user.password);
    }
    if (!isCurrentValid) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    if (isSupabaseEnabled) {
      const { data, error } = await supabase
        .from('users')
        .update({ password: hashedNewPassword })
        .eq('id', userId)
        .select('id')
        .maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ success: false, message: 'User not found' });
    }
    store.updateUser(userId, { password: hashedNewPassword });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error changing password' });
  }
};
