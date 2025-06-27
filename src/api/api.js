import axios from 'axios';

const BASE_URL = 'https://krishilink.shamir.com.np';

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
    
    // // Check if token has changed (new login session)
    // if (token !== currentSessionToken) {
    //   currentSessionToken = token;
    //   console.log('Token changed in interceptor:', token ? token.substring(0, 20) + '...' : 'null');
    // }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
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
  registerUser: (userData) => api.post('/api/KrishilinkAuth/registerUser', userData),
  sendConfirmationEmail: (emailData) => api.post('/api/KrishilinkAuth/sendConfirmationEmail', emailData),
  confirmEmail: (token) => api.get(`/api/KrishilinkAuth/ConfirmEmail?token=${token}`),
  passwordLogin: (credentials) => api.post('/api/KrishilinkAuth/passwordLogin', credentials),
  sendOTP: (otpData) => api.post('/api/KrishilinkAuth/sendOTP', otpData),
  verifyOTP: (otpData) => api.post('/api/KrishilinkAuth/verifyOTP', otpData),
  refreshToken: (refreshToken) => api.post('/api/KrishilinkAuth/refreshToken', { refreshToken }),
  logout: (logoutData) => api.post('/api/KrishilinkAuth/logout', logoutData),
  // Add token invalidation endpoint if your API supports it
  invalidateToken: (token) => api.post('/api/KrishilinkAuth/invalidateToken', { token }),
};

// Product API endpoints
export const productAPI = {
  getAllProducts: () => api.get('/api/Product/getProducts'),
  getProductById: (productId) => api.get(`/api/Product/getProduct/${productId}`),
  getRelatedProducts: (productId) => api.get(`/api/Product/getRelatedProducts/${productId}`),
  getProductImage: (productImageCode) => api.get(`/api/Product/getProductImage/${productImageCode}`),
  addProduct: (productData, config = {}) => api.post('/api/Product/addProduct', productData, config),

  getMyProducts: () => api.get('/api/Product/getMyProducts'),
  getMyProduct: (productId) => api.get(`/api/Product/getMyProduct/${productId}`),
  updateProduct: (productId, productData) => api.put(`/api/Product/updateProduct/${productId}`, productData),
  deleteProduct: (productId) => api.delete(`/api/Product/deleteProduct/${productId}`),
};

// Order API endpoints
export const orderAPI = {
  addOrder: (orderData) => api.post('/api/Order/addOrder', orderData),
  addOrders: (ordersData) => api.post('/api/Order/addOrders', ordersData),
  cancelOrder: (orderId) => api.put(`/api/Order/cancelOrder/${orderId}`),
  confirmOrder: (orderId) => api.put(`/api/Order/confirmOrder/${orderId}`),
  shipOrder: (orderId) => api.put(`/api/Order/shipOrder/${orderId}`),
  deliverOrder: (orderId) => api.put(`/api/Order/deliverOrder/${orderId}`),
  getMyOrders: () => api.get('/api/Order/getMyOrders'),
};

// Review API endpoints
export const reviewAPI = {
  addReview: (reviewData) => api.post('/api/Review/AddReview', reviewData),
  getProductReviews: (productId) => api.get(`/api/Review/getProductReviews/${productId}`),
  deleteReview: (reviewId) => api.delete(`/api/Review/DeleteReview/${reviewId}`),
};

// User API endpoints
export const userAPI = {
  getMyDetails: () => api.get('/api/User/GetMyDetails'),
  getUserImage: () => api.get('/api/User/getUserImage'),
  updateProfile: (profileData) => api.put('/api/User/UpdateProfile', profileData),
  updateStatus: (statusData) => api.put('/api/User/updateStatus', statusData),
  deleteUser: (userId) => api.delete(`/api/User/Delete/${userId}`),
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

export default api; 