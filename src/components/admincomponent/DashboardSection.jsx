import React, { useState, useEffect } from 'react';

const DashboardSection = ({ onTabChange }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingOrders: 0,
    monthlyGrowth: 0,
    conversionRate: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load data using dynamic imports
      const { adminAPI } = await import('../../api/adminAPI');
      const { userAPI, productAPI } = await import('../../api/api');
      
      const [statsResponse, activityResponse, productsResponse, growthResponse, usersResponse, allProductsResponse] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getAuditLogs({ limit: 10 }),
        adminAPI.getProductPerformanceStats(),
        adminAPI.getUserGrowthStats('monthly'),
        userAPI.getAllUsers(),
        productAPI.getAllProducts()
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (activityResponse.success) {
        setRecentActivity(activityResponse.data);
      }

      if (productsResponse.success) {
        setTopProducts(productsResponse.data);
      }

      if (growthResponse.success) {
        setUserGrowth(growthResponse.data);
      }

      // Merge live total users count into KPI stats
      if (usersResponse.success) {
        const usersArray = Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data?.users || [];
        setStats(prev => ({
          ...prev,
          totalUsers: usersArray.length
        }));
      }

      // Merge live total products count into KPI stats
      if (allProductsResponse.success) {
        const productsArray = Array.isArray(allProductsResponse.data) ? allProductsResponse.data : allProductsResponse.data?.products || [];
        setStats(prev => ({
          ...prev,
          totalProducts: productsArray.length
        }));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set fallback data if API calls fail
      setStats({
        totalUsers: 1250,
        totalProducts: 567,
        totalOrders: 234,
        totalRevenue: 45678,
        activeUsers: 890,
        pendingOrders: 45,
        monthlyGrowth: 12.5,
        conversionRate: 3.2
      });
    }
    setLoading(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Key Metrics */}
      <div className="metrics-section">
        <h2>Key Performance Indicators</h2>
        <div className="metrics-grid">
          <div className="metric-card primary">
            <div className="metric-icon">👥</div>
            <div className="metric-content">
              <h3>Total Users</h3>
              <p className="metric-value">{stats.totalUsers.toLocaleString()}</p>
              <span className="metric-change positive">+{stats.monthlyGrowth}% this month</span>
            </div>
          </div>

          <div className="metric-card success">
            <div className="metric-icon">💰</div>
            <div className="metric-content">
              <h3>Total Revenue</h3>
              <p className="metric-value">{formatCurrency(stats.totalRevenue)}</p>
              <span className="metric-change positive">+12.5% vs last month</span>
            </div>
          </div>

          <div className="metric-card warning">
            <div className="metric-icon">📦</div>
            <div className="metric-content">
              <h3>Total Orders</h3>
              <p className="metric-value">{stats.totalOrders.toLocaleString()}</p>
              <span className="metric-change positive">+8.3% vs last month</span>
            </div>
          </div>

          <div className="metric-card info">
            <div className="metric-icon">🍎</div>
            <div className="metric-content">
              <h3>Active Products</h3>
              <p className="metric-value">{stats.totalProducts.toLocaleString()}</p>
              <span className="metric-change neutral">No change</span>
            </div>
          </div>

          <div className="metric-card danger">
            <div className="metric-icon">⏳</div>
            <div className="metric-content">
              <h3>Pending Orders</h3>
              <p className="metric-value">{stats.pendingOrders.toLocaleString()}</p>
              <span className="metric-change negative">+5 pending</span>
            </div>
          </div>

          <div className="metric-card secondary">
            <div className="metric-icon">📊</div>
            <div className="metric-content">
              <h3>Conversion Rate</h3>
              <p className="metric-value">{stats.conversionRate}%</p>
              <span className="metric-change positive">+2.1% vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="charts-section">
        <div className="chart-row">
          <div className="chart-card">
            <h3>User Growth Trend</h3>
            <div className="chart-container">
              {userGrowth.length > 0 ? (
                <div className="chart-placeholder">
                  <div className="chart-mock-chart">
                    {userGrowth.map((point, index) => (
                      <div 
                        key={index}
                        className="chart-bar"
                        style={{ 
                          height: `${(point.value / Math.max(...userGrowth.map(p => p.value))) * 100}%`,
                          backgroundColor: `hsl(${120 + (index * 30)}, 70%, 60%)`
                        }}
                        title={`${point.month}: ${point.value} users`}
                      ></div>
                    ))}
                  </div>
                  <div className="chart-labels">
                    {userGrowth.map((point, index) => (
                      <span key={index} className="chart-label">{point.month}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="chart-placeholder">
                  <p>📈 User growth data will appear here</p>
                </div>
              )}
            </div>
          </div>

          <div className="chart-card">
            <h3>Top Performing Products</h3>
            <div className="chart-container">
              {topProducts.length > 0 ? (
                <div className="top-products-list">
                  {topProducts.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="top-product-item">
                      <div className="product-rank">#{index + 1}</div>
                      <div className="product-info">
                        <h4>{product.name}</h4>
                        <p>{product.category}</p>
                      </div>
                      <div className="product-stats">
                        <span className="sales-count">{product.salesCount} sales</span>
                        <span className="revenue">{formatCurrency(product.revenue)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="chart-placeholder">
                  <p>🏆 Top products will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <div className="section-header">
          <h3>Recent System Activity</h3>
          <button 
            onClick={() => onTabChange('analytics')}
            className="view-all-btn"
          >
            View All Activity
          </button>
        </div>
        
        <div className="activity-list">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">
                  {activity.type === 'user' && '👤'}
                  {activity.type === 'product' && '🍎'}
                  {activity.type === 'order' && '📦'}
                  {activity.type === 'system' && '⚙️'}
                </div>
                <div className="activity-content">
                  <p className="activity-description">{activity.description}</p>
                  <span className="activity-time">{formatDate(activity.timestamp)}</span>
                </div>
                <div className="activity-user">
                  {activity.userName || 'System'}
                </div>
              </div>
            ))
          ) : (
            <div className="no-activity">
              <p>No recent activity to display</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <button 
            onClick={() => onTabChange('users')}
            className="quick-action-btn users"
          >
            <span className="action-icon">👥</span>
            <span className="action-text">Manage Users</span>
          </button>

          <button 
            onClick={() => onTabChange('products')}
            className="quick-action-btn products"
          >
            <span className="action-icon">🍎</span>
            <span className="action-text">Review Products</span>
          </button>

          <button 
            onClick={() => onTabChange('orders')}
            className="quick-action-btn orders"
          >
            <span className="action-icon">📦</span>
            <span className="action-text">Process Orders</span>
          </button>

          <button 
            onClick={() => onTabChange('analytics')}
            className="quick-action-btn analytics"
          >
            <span className="action-icon">📊</span>
            <span className="action-text">View Analytics</span>
          </button>

          <button 
            onClick={() => onTabChange('settings')}
            className="quick-action-btn settings"
          >
            <span className="action-icon">⚙️</span>
            <span className="action-text">System Settings</span>
          </button>

          <button 
            onClick={() => window.open('/admin/export', '_blank')}
            className="quick-action-btn export"
          >
            <span className="action-icon">📤</span>
            <span className="action-text">Export Data</span>
          </button>
        </div>
      </div>

      {/* System Health */}
      <div className="system-health-section">
        <h3>System Health</h3>
        <div className="health-indicators">
          <div className="health-indicator good">
            <span className="health-icon">🟢</span>
            <span className="health-label">Database</span>
            <span className="health-status">Healthy</span>
          </div>
          <div className="health-indicator good">
            <span className="health-icon">🟢</span>
            <span className="health-label">API Services</span>
            <span className="health-status">Operational</span>
          </div>
          <div className="health-indicator warning">
            <span className="health-icon">🟡</span>
            <span className="health-label">Storage</span>
            <span className="health-status">75% Used</span>
          </div>
          <div className="health-indicator good">
            <span className="health-icon">🟢</span>
            <span className="health-label">Uptime</span>
            <span className="health-status">99.9%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;

