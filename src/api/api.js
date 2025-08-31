import axios from 'axios';
import { handleApiResponse } from './handleApiResponse';

const BASE_URL = 'https://w1vqqn7ucvzpndp9xsvdkd15gzcedswvilahs3agd6b3dljo7tg24pbklk4u.shamir.com.np';

// Create axios instance with base URL
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
  maxRedirects: 0, // Do not follow redirects
});

// Track the current session token to detect changes
let currentSessionToken = null;

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    
    // Debug logging to help identify auth issues
    console.log('Request interceptor - URL:', config.url);
    console.log('Request interceptor - Token exists:', !!token);
    if (token) {
      console.log('Request interceptor - Token preview:', token.substring(0, 20) + '...');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request interceptor - Authorization header set');
    } else {
      console.log('Request interceptor - No token found, request will be sent without auth');
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle CORS errors and auth redirects
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Handle redirects (301, 302) as auth errors, as the server is likely redirecting to a login page
    if (status === 301 || status === 302 || status === 401) {
      // Clear user data from local storage
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      currentSessionToken = null;
      
      // Clear session storage
      sessionStorage.removeItem('krishilink_session_id');
      
      // Redirect to login page. Using window.location.href to force a full page reload.
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      
      return Promise.reject(new Error('Session expired or invalid. Redirecting to login.'));
    }
    
    if (status === 502) {
      console.error('Server error (502): The server is temporarily unavailable');
      return Promise.reject(new Error('Server is temporarily unavailable. Please try again later.'));
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  registerUser: async (userData) => {
    try {
      const response = await api.post('/api/KrishilinkAuth/registerUser', userData);
      return handleApiResponse(response);
    } catch (err) {
      if (err.response && err.response.data) {
        return handleApiResponse(err.response);
      }
      return { success: false, error: 'Network error', errorDetails: [] };
    }
  },
  sendConfirmationEmail: (emailData) => api.post('/api/KrishilinkAuth/sendConfirmationEmail', emailData),
  confirmEmail: (token) => api.get(`/api/KrishilinkAuth/ConfirmEmail?token=${token}`),
  passwordLogin: async (credentials) => {
    try {
      const response = await api.post('/api/KrishilinkAuth/passwordLogin', credentials);
      return handleApiResponse(response);
    } catch (err) {
      if (err.response && err.response.data) {
        return handleApiResponse(err.response);
      }
      return { success: false, error: 'Network error', errorDetails: [] };
    }
  },
  sendOTP: (otpData) => api.post('/api/KrishilinkAuth/sendOTP', otpData),
  verifyOTP: async (otpData) => {
    try {
      const response = await api.post('/api/KrishilinkAuth/verifyOTP', otpData);
      return handleApiResponse(response);
    } catch (err) {
      if (err.response && err.response.data) {
        return handleApiResponse(err.response);
      }
      return { success: false, error: 'Network error', errorDetails: [] };
    }
  },
  refreshToken: (refreshToken) => api.post('/api/KrishilinkAuth/refreshToken', { refreshToken }),
  logout: (logoutData) => api.post('/api/KrishilinkAuth/logout', logoutData),
  // Add token invalidation endpoint if your API supports it
  invalidateToken: (token) => api.post('/api/KrishilinkAuth/invalidateToken', { token }),
};

// Wrapper for login to handle ApiResponse<T> and ApiError<T>
export async function login({ emailOrPhone, password }) {
  try {
    const response = await authAPI.passwordLogin({ emailOrPhone, password });
    const data = response.data;

    if (data.success) {
      // Success: ApiResponse<T>
      return { success: true, data: data.data, message: data.message };
    } else {
      // ApiResponse<T> with success: false
      let errorMsg = data.message || 'Login failed';
      let errorDetails = [];
      if (Array.isArray(data.errors)) {
        errorDetails = data.errors;
      } else if (data.errors && typeof data.errors === 'object') {
        errorDetails = Object.values(data.errors).flat();
      }
      return { success: false, error: errorMsg, errorDetails };
    }
  } catch (err) {
    // Axios error: check for ApiError<T> shape
    if (err.response && err.response.data) {
      const data = err.response.data;
      let errorMsg = data.message || data.title || 'Login failed';
      let errorDetails = [];
      if (Array.isArray(data.errors)) {
        errorDetails = data.errors;
      } else if (data.errors && typeof data.errors === 'object') {
        errorDetails = Object.values(data.errors).flat();
      }
      return { success: false, error: errorMsg, errorDetails };
    }
    // Network or unknown error
    return { success: false, error: 'Network error', errorDetails: [] };
  }
}

// Product API endpoints
export const productAPI = {
  getAllProducts: async () => {
    try {
      const response = await api.get('/api/Product/getProducts');
      return handleApiResponse(response);
    } catch (err) {
      if (err.response && err.response.data) {
        return handleApiResponse(err.response);
      }
      return { success: false, error: 'Network error', errorDetails: [] };
    }
  },
  getProductById: (productId) => api.get(`/api/Product/getProduct/${productId}`),
  getRelatedProducts: (productId) => api.get(`/api/Product/getRelatedProducts/${productId}`),
  getProductImage: (productImageCode) => api.get(`/api/Product/getProductImage/${productImageCode}`, { responseType: 'blob' }),
  addProduct: async (productData, config = {}) => {
    try {
      const response = await api.post('/api/Product/addProduct', productData, config);
      return handleApiResponse(response);
    } catch (err) {
      if (err.response && err.response.data) {
        return handleApiResponse(err.response);
      }
      return { success: false, error: 'Network error', errorDetails: [] };
    }
  },
  getMyProducts: async () => {
    try {
      const response = await api.get('/api/Product/getMyProducts');
      return handleApiResponse(response);
    } catch (err) {
      if (err.response && err.response.data) {
        return handleApiResponse(err.response);
      }
      return { success: false, error: 'Network error', errorDetails: [] };
    }
  },
  getMyProduct: (productId) => api.get(`/api/Product/getMyProduct/${productId}`),
  updateProduct: (productId, productData) => api.put(`/api/Product/updateProduct/${productId}`, productData),
  deleteProduct: (productId) => api.delete(`/api/Product/deleteProduct/${productId}`),
  updateProductStatus: (productId, isActive) => api.put(`/api/Product/updateProductStatus/${productId}`, { isActive }),
  getNearProducts: async (latitude, longitude) => {
    try {
      const response = await api.get(`/api/Product/getNearProducts/${latitude},${longitude}`);
      return handleApiResponse(response);
    } catch (err) {
      if (err.response && err.response.data) {
        return handleApiResponse(err.response);
      }
      return { success: false, error: 'Network error', errorDetails: [] };
    }
  },
};

// Order API endpoints
export const orderAPI = {
  addOrder: (orderData) => {
    // For multipart/form-data, let the browser set the Content-Type header with boundary
    const config = {
      headers: {
        // Remove the default Accept header for this request
        'Accept': undefined,
      },
    };
    return api.post('/api/Order/addOrder', orderData, config);
  },
  addOrders: (ordersData) => {
    // For bulk orders using application/json
    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };
    return api.post('/api/Order/addOrders', ordersData, config);
  },
  getMyOrders: () => api.get('/api/Order/getMyOrders'),
  getOrderById: (orderId) => api.get(`/api/Order/getOrder/${orderId}`),
  updateOrderStatus: (orderId, statusData) => api.put(`/api/Order/updateOrderStatus/${orderId}`, statusData),
  deleteOrder: (orderId) => api.delete(`/api/Order/deleteOrder/${orderId}`),
};



// User API endpoints
export const userAPI = {
  getAllUsers: async () => {
  try {
    const response = await api.get('/api/User/GetAllUsers');
    return handleApiResponse(response);
  } catch (err) {
    if (err.response && err.response.data) {
      return handleApiResponse(err.response);
    }
    return { success: false, error: 'Network error', errorDetails: [] };
  }
  },
  getAllFarmers: async () => {
    try {
      const response = await api.get('/api/User/GetAllFarmers');
      return handleApiResponse(response);
    } catch (err) {
      if (err.response && err.response.data) {
        return handleApiResponse(err.response);
      }
      return { success: false, error: 'Network error', errorDetails: [] };
    }
  },
  getAllBuyers: async () => {
    try {
      const response = await api.get('/api/User/GetAllBuyers');
      return handleApiResponse(response);
    } catch (err) {
      if (err.response && err.response.data) {
        return handleApiResponse(err.response);
      }
      return { success: false, error: 'Network error', errorDetails: [] };
    }
  },
  getAllActiveUsers: async () => {
    try {
      const response = await api.get('/api/User/GetAllActiveUsers');
      return handleApiResponse(response);
    } catch (err) {
      if (err.response && err.response.data) {
        return handleApiResponse(err.response);
      }
      return { success: false, error: 'Network error', errorDetails: [] };
    }
  },
  getUserDetailsById: async (userId) => {
    try {
      const response = await api.get('/api/User/GetUserDetailsById', { params: { userId } });
      return handleApiResponse(response);
    } catch (err) {
      if (err.response && err.response.data) {
        return handleApiResponse(err.response);
      }
      return { success: false, error: 'Network error', errorDetails: [] };
    }
  },
  getUserDetailsByPhoneNumber: async (phoneNumber) => {
    try {
      const response = await api.get('/api/User/GetUserDetailsByPhoneNumber', { params: { phoneNumber } });
      return handleApiResponse(response);
    } catch (err) {
      if (err.response && err.response.data) {
        return handleApiResponse(err.response);
      }
      return { success: false, error: 'Network error', errorDetails: [] };
    }
  },
  getUserDetailsByEmail: async (email) => {
    try {
      const response = await api.get('/api/User/GetUserDetailsByEmail', { params: { email } });
      return handleApiResponse(response);
    } catch (err) {
      if (err.response && err.response.data) {
        return handleApiResponse(err.response);
      }
      return { success: false, error: 'Network error', errorDetails: [] };
    }
  },
  getMyDetails: () => api.get('/api/User/GetMyDetails'),
  getUserImage: () => api.get('/api/User/getUserImage'),
  updateProfile: (profileData) => api.put('/api/User/UpdateProfile', profileData),
  updateStatus: async (statusData) => {
    try {
      const response = await api.put('/api/User/updateStatus', statusData);
      return handleApiResponse(response);
    } catch (err) {
      if (err.response && err.response.data) {
        return handleApiResponse(err.response);
      }
      return { success: false, error: 'Network error', errorDetails: [] };
    }
  },
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/api/User/Delete/${userId}`);
      return handleApiResponse(response);
    } catch (err) {
      if (err.response && err.response.data) {
        return handleApiResponse(err.response);
      }
      return { success: false, error: 'Network error', errorDetails: [] };
    }
  },
};

// Utility function to clear all authentication data
export const clearAuthData = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('authToken');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('krishilink_session_id');
  currentSessionToken = null;
  console.log('All authentication data cleared via utility function');
};

// Utility function to check authentication status
export const checkAuthStatus = () => {
  const user = localStorage.getItem('user');
  const token = localStorage.getItem('authToken');
  const refreshToken = localStorage.getItem('refreshToken');
  const sessionId = sessionStorage.getItem('krishilink_session_id');
  
  console.log('=== Authentication Status Check ===');
  console.log('User exists:', !!user);
  console.log('Token exists:', !!token);
  console.log('Refresh token exists:', !!refreshToken);
  console.log('Session ID exists:', !!sessionId);
  
  if (user) {
    try {
      const userData = JSON.parse(user);
      console.log('User role:', userData.role);
      console.log('User email/phone:', userData.emailOrPhone || userData.email);
    } catch (e) {
      console.log('Failed to parse user data');
    }
  }
  
  if (token) {
    console.log('Token preview:', token.substring(0, 20) + '...');
  }
  
  return { user: !!user, token: !!token, refreshToken: !!refreshToken, sessionId: !!sessionId };
};

export default api; 