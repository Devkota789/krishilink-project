import api from './api';

// Admin API endpoints for managing the entire system
export const adminAPI = {
  // User Management
  getAllUsers: async () => {
    try {
      const response = await api.get('/api/Admin/getAllUsers');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching all users:', error);
      return { success: false, error: error.message };
    }
  },

  getUserById: async (userId) => {
    try {
      const response = await api.get(`/api/Admin/getUser/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching user:', error);
      return { success: false, error: error.message };
    }
  },

  updateUserStatus: async (userId, status) => {
    try {
      const response = await api.put(`/api/Admin/updateUserStatus/${userId}`, { status });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating user status:', error);
      return { success: false, error: error.message };
    }
  },

  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/api/Admin/deleteUser/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { success: false, error: error.message };
    }
  },

  // Product Management
  getAllProductsAdmin: async () => {
    try {
      const response = await api.get('/api/Admin/getAllProducts');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching all products:', error);
      return { success: false, error: error.message };
    }
  },

  updateProductStatus: async (productId, isActive) => {
    try {
      const response = await api.put(`/api/Admin/updateProductStatus/${productId}`, { isActive });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating product status:', error);
      return { success: false, error: error.message };
    }
  },

  deleteProductAdmin: async (productId) => {
    try {
      // Prefer admin route; some environments restrict public delete
      let response;
      try {
        response = await api.delete(`/api/Admin/deleteProduct/${productId}`);
      } catch (err) {
        // Fallback to public route if admin route is unavailable
        response = await api.delete(`/api/Product/deleteProduct/${productId}`);
      }
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }
  },

  // Order Management
  getAllOrders: async () => {
    try {
      const response = await api.get('/api/Admin/getAllOrders');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching all orders:', error);
      return { success: false, error: error.message };
    }
  },

  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`/api/Admin/getOrder/${orderId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching order:', error);
      return { success: false, error: error.message };
    }
  },

  updateOrderStatus: async (orderId, statusData) => {
    try {
      const response = await api.put(`/api/Admin/updateOrderStatus/${orderId}`, statusData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message };
    }
  },

  // Analytics and Statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/api/Admin/getDashboardStats');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, error: error.message };
    }
  },

  getUserGrowthStats: async (period = 'monthly') => {
    try {
      const response = await api.get(`/api/Admin/getUserGrowthStats?period=${period}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching user growth stats:', error);
      return { success: false, error: error.message };
    }
  },

  getRevenueStats: async (period = 'monthly') => {
    try {
      const response = await api.get(`/api/Admin/getRevenueStats?period=${period}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching revenue stats:', error);
      return { success: false, error: error.message };
    }
  },

  getProductPerformanceStats: async () => {
    try {
      const response = await api.get('/api/Admin/getProductPerformanceStats');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching product performance stats:', error);
      return { success: false, error: error.message };
    }
  },

  getGeographicStats: async () => {
    try {
      const response = await api.get('/api/Admin/getGeographicStats');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching geographic stats:', error);
      return { success: false, error: error.message };
    }
  },

  // System Settings
  getSystemSettings: async () => {
    try {
      const response = await api.get('/api/Admin/getSystemSettings');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching system settings:', error);
      return { success: false, error: error.message };
    }
  },

  updateSystemSettings: async (settings) => {
    try {
      const response = await api.put('/api/Admin/updateSystemSettings', settings);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating system settings:', error);
      return { success: false, error: error.message };
    }
  },

  // Backup and Maintenance
  createBackup: async () => {
    try {
      const response = await api.post('/api/Admin/createBackup');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating backup:', error);
      return { success: false, error: error.message };
    }
  },

  cleanupLogs: async () => {
    try {
      const response = await api.post('/api/Admin/cleanupLogs');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error cleaning up logs:', error);
      return { success: false, error: error.message };
    }
  },

  optimizeDatabase: async () => {
    try {
      const response = await api.post('/api/Admin/optimizeDatabase');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error optimizing database:', error);
      return { success: false, error: error.message };
    }
  },

  // Content Moderation
  getReportedContent: async () => {
    try {
      const response = await api.get('/api/Admin/getReportedContent');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching reported content:', error);
      return { success: false, error: error.message };
    }
  },

  moderateContent: async (contentId, action, reason) => {
    try {
      const response = await api.put(`/api/Admin/moderateContent/${contentId}`, { action, reason });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error moderating content:', error);
      return { success: false, error: error.message };
    }
  },

  // Notification Management
  sendSystemNotification: async (notificationData) => {
    try {
      const response = await api.post('/api/Admin/sendSystemNotification', notificationData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error sending system notification:', error);
      return { success: false, error: error.message };
    }
  },

  getNotificationHistory: async () => {
    try {
      const response = await api.get('/api/Admin/getNotificationHistory');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching notification history:', error);
      return { success: false, error: error.message };
    }
  },

  // Audit Logs
  getAuditLogs: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/api/Admin/getAuditLogs?${queryParams}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      return { success: false, error: error.message };
    }
  },

  // User Activity Monitoring
  getUserActivity: async (userId, period = 'weekly') => {
    try {
      const response = await api.get(`/api/Admin/getUserActivity/${userId}?period=${period}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return { success: false, error: error.message };
    }
  },

  // Bulk Operations
  bulkUpdateUsers: async (userIds, updateData) => {
    try {
      const response = await api.put('/api/Admin/bulkUpdateUsers', { userIds, updateData });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error bulk updating users:', error);
      return { success: false, error: error.message };
    }
  },

  bulkUpdateProducts: async (productIds, updateData) => {
    try {
      const response = await api.put('/api/Admin/bulkUpdateProducts', { productIds, updateData });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error bulk updating products:', error);
      return { success: false, error: error.message };
    }
  },

  // Export Data
  exportUsers: async (format = 'csv', filters = {}) => {
    try {
      const queryParams = new URLSearchParams({ format, ...filters }).toString();
      const response = await api.get(`/api/Admin/exportUsers?${queryParams}`, {
        responseType: 'blob'
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error exporting users:', error);
      return { success: false, error: error.message };
    }
  },

  exportOrders: async (format = 'csv', filters = {}) => {
    try {
      const queryParams = new URLSearchParams({ format, ...filters }).toString();
      const response = await api.get(`/api/Admin/exportOrders?${queryParams}`, {
        responseType: 'blob'
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error exporting orders:', error);
      return { success: false, error: error.message };
    }
  },

  exportProducts: async (format = 'csv', filters = {}) => {
    try {
      const queryParams = new URLSearchParams({ format, ...filters }).toString();
      const response = await api.get(`/api/Admin/exportProducts?${queryParams}`, {
        responseType: 'blob'
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error exporting products:', error);
      return { success: false, error: error.message };
    }
  }
};

export default adminAPI;
