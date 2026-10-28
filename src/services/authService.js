import api, { USE_MOCK_API } from './api';
import { getMockData, saveMockCollection, STORAGE_KEYS } from './mockData';

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const loginWithMock = async ({ email, password }) => {
  await delay();
  const { users } = getMockData();
  const normalized = (email || '').trim().toLowerCase();

  // Find user by direct email or altEmail
  let user = users.find(
    (u) =>
      (u.email || '').toLowerCase() === normalized ||
      (u.altEmail && u.altEmail.toLowerCase() === normalized)
  );

  // Flexible alias matching for demo convenience
  if (!user) {
    if (
      normalized === 'employee' ||
      normalized === 'employee@postoffice.gov' ||
      normalized === 'courier' ||
      normalized === 'courier@postoffice.gov' ||
      normalized === 'john' ||
      normalized === 'john.carrier' ||
      normalized === 'john.carrier@postoffice.gov'
    ) {
      user = users.find((u) => u.role === 'employee');
    } else if (normalized === 'admin' || normalized === 'admin@postoffice.gov') {
      user = users.find((u) => u.role === 'admin');
    } else if (
      normalized === 'customer' ||
      normalized === 'customer@postoffice.gov' ||
      normalized === 'customer@gmail.com' ||
      normalized === 'sarah.customer@gmail.com'
    ) {
      user = users.find((u) => u.role === 'customer');
    }
  }

  if (!user) {
    throw new Error(
      `No account found for "${email}". Available demo accounts: customer (sarah.customer@gmail.com), employee (employee@postoffice.gov), or admin (admin@postoffice.gov).`
    );
  }

  if (user.status === 'inactive') {
    throw new Error('This account has been deactivated. Please contact support.');
  }

  const mockToken = `mock_jwt_token_${user._id || user.id}_${Date.now()}`;
  return {
    success: true,
    token: mockToken,
    user: { ...user, id: user._id || user.id, _id: user._id || user.id },
  };
};

const registerWithMock = async ({ name, email, phone, password, address }) => {
  await delay();
  const { users } = getMockData();
  const normalized = (email || '').trim().toLowerCase();
  const exists = users.some((u) => (u.email || '').toLowerCase() === normalized);
  if (exists) {
    throw new Error('An account with this email already exists.');
  }

  const id = `usr_${Date.now()}`;
  const newUser = {
    _id: id,
    id,
    name: name.trim(),
    email: normalized,
    phone: phone || '',
    address: address || '',
    role: 'customer',
    station: null,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  saveMockCollection(STORAGE_KEYS.USERS, updatedUsers);

  const mockToken = `mock_jwt_token_${id}_${Date.now()}`;
  return {
    success: true,
    token: mockToken,
    user: newUser,
  };
};

const getCurrentUserMock = async () => {
  await delay(50);
  const cached = localStorage.getItem('poas_auth_user');
  if (!cached) return null;
  let parsed;
  try {
    parsed = JSON.parse(cached);
  } catch {
    return null;
  }
  const { users } = getMockData();
  const fresh = users.find((u) => (u._id || u.id) === (parsed._id || parsed.id));
  return fresh || parsed;
};

export const authService = {
  // Login user with seamless offline fallback if backend server is not running
  login: async ({ email, password }) => {
    if (USE_MOCK_API) {
      return loginWithMock({ email, password });
    }

    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (err) {
      const isNetworkOrOffline =
        !err.response || err.response.status >= 502 || err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED';
      if (isNetworkOrOffline) {
        console.warn('[DigiPost] Backend server offline or unreachable. Falling back to local offline mode.');
        return loginWithMock({ email, password });
      }
      throw err;
    }
  },

  // Public registration creates customer accounts only; staff accounts are provisioned by administrators.
  register: async ({ name, email, phone, password, address }) => {
    if (USE_MOCK_API) {
      return registerWithMock({ name, email, phone, password, address });
    }

    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        phone,
        password,
        address,
      });
      return response.data;
    } catch (err) {
      const isNetworkOrOffline =
        !err.response || err.response.status >= 502 || err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED';
      if (isNetworkOrOffline) {
        console.warn('[DigiPost] Backend server offline or unreachable. Falling back to local offline mode.');
        return registerWithMock({ name, email, phone, password, address });
      }
      throw err;
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    if (USE_MOCK_API) {
      return getCurrentUserMock();
    }

    try {
      const response = await api.get('/auth/me');
      return response.data.user;
    } catch (err) {
      const isNetworkOrOffline =
        !err.response || err.response.status >= 502 || err.code === 'ERR_NETWORK';
      if (isNetworkOrOffline) {
        return getCurrentUserMock();
      }
      throw err;
    }
  },

  // Update profile
  updateProfile: async (userData) => {
    if (USE_MOCK_API) {
      await delay();
      const { users } = getMockData();
      const index = users.findIndex((u) => u._id === userData._id);
      if (index === -1) throw new Error('User not found.');

      const updated = { ...users[index], ...userData };
      users[index] = updated;
      saveMockCollection(STORAGE_KEYS.USERS, users);
      localStorage.setItem('poas_auth_user', JSON.stringify(updated));
      return { success: true, user: updated };
    }

    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  // Change password
  changePassword: async ({ currentPassword, newPassword }) => {
    if (USE_MOCK_API) {
      await delay();
      return { success: true, message: 'Password updated successfully.' };
    }

    const response = await api.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('poas_auth_token');
    localStorage.removeItem('poas_auth_user');
  },
};