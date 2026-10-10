// import api, { USE_MOCK_API } from './api';
// import { getMockData, saveMockCollection, STORAGE_KEYS } from './mockData';

// const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

// export const authService = {
//   // Login user
//   login: async ({ email, password }) => {
//     if (USE_MOCK_API) {
//       await delay();
//       const { users } = getMockData();
//       const normalized = (email || '').trim().toLowerCase();

//       // Find user by direct email or altEmail
//       let user = users.find(
//         (u) =>
//           u.email.toLowerCase() === normalized ||
//           (u.altEmail && u.altEmail.toLowerCase() === normalized)
//       );

//       // Flexible alias matching for demo convenience
//       if (!user) {
//         if (
//           normalized === 'employee' ||
//           normalized === 'employee@postoffice.gov' ||
//           normalized === 'courier' ||
//           normalized === 'courier@postoffice.gov' ||
//           normalized === 'john' ||
//           normalized === 'john.carrier' ||
//           normalized === 'john.carrier@postoffice.gov'
//         ) {
//           user = users.find((u) => u.role === 'employee');
//         } else if (normalized === 'admin' || normalized === 'admin@postoffice.gov') {
//           user = users.find((u) => u.role === 'admin');
//         } else if (
//           normalized === 'customer' ||
//           normalized === 'customer@postoffice.gov' ||
//           normalized === 'customer@gmail.com' ||
//           normalized === 'sarah.customer@gmail.com'
//         ) {
//           user = users.find((u) => u.role === 'customer');
//         }
//       }

//       if (!user) {
//         throw new Error(
//           `No account found for "${email}". Available accounts: employee@postoffice.gov (Employee), admin@postoffice.gov (Admin), or sarah.customer@gmail.com (Customer).`
//         );
//       }

//       if (user.status === 'inactive') {
//         throw new Error('This account has been deactivated. Please contact support.');
//       }

//       // Generate a mock JWT token
//       const mockToken = `mock_jwt_token_${user._id}_${Date.now()}`;
//       return {
//         success: true,
//         token: mockToken,
//         user: { ...user },
//       };
//     }

//     const response = await api.post('/auth/login', { email, password });
//     return response.data;
//   },

//   // Register a new customer
//   register: async ({ name, email, phone, password, address }) => {
//     if (USE_MOCK_API) {
//       await delay();
//       const { users } = getMockData();
//       const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
//       if (exists) {
//         throw new Error('An account with this email already exists.');
//       }

//       const newUser = {
//         _id: `usr_cust_${Date.now()}`,
//         name,
//         email,
//         phone,
//         address: address || '',
//         role: 'customer',
//         status: 'active',
//         createdAt: new Date().toISOString(),
//       };

//       const updatedUsers = [...users, newUser];
//       saveMockCollection(STORAGE_KEYS.USERS, updatedUsers);

//       const mockToken = `mock_jwt_token_${newUser._id}_${Date.now()}`;
//       return {
//         success: true,
//         token: mockToken,
//         user: newUser,
//       };
//     }

//     const response = await api.post('/auth/register', { name, email, phone, password, address });
//     return response.data;
//   },

//   // Get current user profile
//   getCurrentUser: async () => {
//     if (USE_MOCK_API) {
//       await delay(100);
//       const cached = localStorage.getItem('poas_auth_user');
//       if (!cached) return null;
//       const parsed = JSON.parse(cached);
//       const { users } = getMockData();
//       const fresh = users.find((u) => u._id === parsed._id);
//       return fresh || parsed;
//     }

//     const response = await api.get('/auth/me');
//     return response.data.user;
//   },

//   // Update profile
//   updateProfile: async (userData) => {
//     if (USE_MOCK_API) {
//       await delay();
//       const { users } = getMockData();
//       const index = users.findIndex((u) => u._id === userData._id);
//       if (index === -1) throw new Error('User not found.');

//       const updated = { ...users[index], ...userData };
//       users[index] = updated;
//       saveMockCollection(STORAGE_KEYS.USERS, users);
//       localStorage.setItem('poas_auth_user', JSON.stringify(updated));
//       return { success: true, user: updated };
//     }

//     const response = await api.put('/auth/profile', userData);
//     return response.data;
//   },

//   // Change password
//   changePassword: async ({ currentPassword, newPassword }) => {
//     if (USE_MOCK_API) {
//       await delay();
//       return { success: true, message: 'Password updated successfully.' };
//     }

//     const response = await api.put('/auth/change-password', { currentPassword, newPassword });
//     return response.data;
//   },

//   // Logout
//   logout: () => {
//     localStorage.removeItem('poas_auth_token');
//     localStorage.removeItem('poas_auth_user');
//   },
// };
import api, { USE_MOCK_API } from './api';
import { getMockData, saveMockCollection, STORAGE_KEYS } from './mockData';

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  // Login user
  login: async ({ email, password }) => {
    if (USE_MOCK_API) {
      await delay();
      const { users } = getMockData();
      const normalized = (email || '').trim().toLowerCase();

      // Find user by direct email or altEmail
      let user = users.find(
        (u) =>
          u.email.toLowerCase() === normalized ||
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
          `No account found for "${email}". Available accounts: employee@postoffice.gov (Employee), admin@postoffice.gov (Admin), or sarah.customer@gmail.com (Customer).`
        );
      }

      if (user.status === 'inactive') {
        throw new Error('This account has been deactivated. Please contact support.');
      }

      // Generate a mock JWT token
      const mockToken = `mock_jwt_token_${user._id}_${Date.now()}`;
      return {
        success: true,
        token: mockToken,
        user: { ...user },
      };
    }

    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Register a new customer
  register: async ({ name, email, phone, password, address }) => {
    if (USE_MOCK_API) {
      await delay();
      const { users } = getMockData();
      const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        throw new Error('An account with this email already exists.');
      }

      const newUser = {
        _id: `usr_cust_${Date.now()}`,
        name,
        email,
        phone,
        address: address || '',
        role: 'customer',
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...users, newUser];
      saveMockCollection(STORAGE_KEYS.USERS, updatedUsers);

      const mockToken = `mock_jwt_token_${newUser._id}_${Date.now()}`;
      return {
        success: true,
        token: mockToken,
        user: newUser,
      };
    }

    const response = await api.post('/auth/register', { name, email, phone, password, address });
    return response.data;
  },

  // Get current user profile
  getCurrentUser: async () => {
    if (USE_MOCK_API) {
      await delay(100);
      const cached = localStorage.getItem('poas_auth_user');
      if (!cached) return null;
      let parsed;
      try {
        parsed = JSON.parse(cached);
      } catch {
        return null;
      }
      const { users } = getMockData();
      const fresh = users.find((u) => u._id === parsed._id);
      return fresh || parsed;
    }

    const response = await api.get('/auth/me');
    return response.data.user;
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