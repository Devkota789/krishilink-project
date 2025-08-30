import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productAPI, orderAPI, userAPI } from '../api/api';
import { adminAPI } from '../api/adminAPI';
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';
import AdminDashboard from '../components/AdminDashboard';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    pendingOrders: 0
  });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [userScope, setUserScope] = useState('all'); // all | farmers | buyers | active
  const [productDetailsOpen, setProductDetailsOpen] = useState(false);
  const [productDetails, setProductDetails] = useState(null);
  const [productDetailsLoading, setProductDetailsLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    setLoadingData(true);
    try {
      // Load statistics and data
      await Promise.all([
        loadUsers(),
        loadProducts(),
        loadOrders(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
    setLoadingData(false);
  };

  const loadUsers = async () => {
    try {
      let response;
      switch (userScope) {
        case 'farmers':
          response = await userAPI.getAllFarmers();
          break;
        case 'buyers':
          response = await userAPI.getAllBuyers();
          break;
        case 'active':
          response = await userAPI.getAllActiveUsers();
          break;
        default:
          response = await userAPI.getAllUsers();
      }
      if (response.success) {
        const apiUsers = Array.isArray(response.data) ? response.data : response.data?.users || [];
        const mapped = apiUsers.map((u, idx) => ({
          id: u.id ?? u.userId ?? (idx + 1),
          fullName: u.fullName ?? ((`${u.firstName ?? ''} ${u.lastName ?? ''}`.trim()) || u.name) ?? 'Unknown',
          email: u.email ?? u.emailOrPhone ?? 'N/A',
          role: (u.role ?? u.userRole ?? 'user').toLowerCase(),
          status: (u.status ?? u.accountStatus ?? 'active').toLowerCase(),
          joinDate: u.createdAt ?? u.joinDate ?? u.registeredOn ?? new Date().toISOString().slice(0, 10),
        }));
        setUsers(mapped);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const BASE_URL = 'https://w1vqqn7ucvzpndp9xsvdkd15gzcedswvilahs3agd6b3dljo7tg24pbklk4u.shamir.com.np';

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAllProducts();
      if (response.success) {
        const data = Array.isArray(response.data) ? response.data : response.data?.products || [];
        const mapped = data.map((p, idx) => ({
          ...p,
          id: p.id ?? p.productId ?? (idx + 1),
          backendId: p.productId ?? p.id, // keep real backend id for mutations
          name: p.name ?? p.productName ?? p.title,
          price: p.price ?? p.rate,
          sellerName: p.sellerName ?? p.farmerName,
          description: p.description,
          isActive: typeof p.isActive === 'boolean' ? p.isActive : true,
          imageUrl: p.imageUrl || (p.imageCode ? `${BASE_URL}/api/Product/getProductImage/${p.imageCode}` : ''),
        }));
        setProducts(mapped);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
      if (response.success) {
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadStats = async () => {
    // Mock statistics - replace with actual API calls
    setStats({
      totalUsers: 1250,
      totalProducts: 567,
      totalOrders: 234,
      totalRevenue: 45678,
      activeUsers: 890,
      pendingOrders: 45
    });
  };

  const handleUserAction = async (userId, action) => {
    try {
      switch (action) {
        case 'activate':
          // await userAPI.updateStatus({ userId, status: 'active' });
          break;
        case 'deactivate':
          // await userAPI.updateStatus({ userId, status: 'inactive' });
          break;
        case 'delete':
          // await userAPI.deleteUser(userId);
          break;
        default:
          break;
      }
      await loadUsers();
    } catch (error) {
      console.error(`Error ${action} user:`, error);
    }
  };

  const handleProductAction = async (productId, action) => {
    try {
      switch (action) {
        case 'activate':
          await adminAPI.updateProductStatus(productId, true);
          break;
        case 'deactivate':
          await adminAPI.updateProductStatus(productId, false);
          break;
        case 'delete':
          if (!window.confirm('Are you sure you want to delete this product?')) return;
          try {
            await productAPI.deleteProduct(productId);
          } catch (err) {
            // If the public product endpoint is not available for admins or returns 404,
            // fallback to the admin delete endpoint.
            const status = err?.response?.status;
            if (status === 404 || status === 403) {
              await adminAPI.deleteProductAdmin(productId);
            } else {
              throw err;
            }
          }
          break;
        default:
          break;
      }
      await loadProducts();
    } catch (error) {
      console.error(`Error ${action} product:`, error);
    }
  };

  const openProductDetails = async (product) => {
    try {
      setProductDetailsLoading(true);
      setProductDetails(null);
      setProductDetailsOpen(true);
      const id = product.backendId ?? product.productId ?? product.id;
      if (id) {
        const res = await productAPI.getProductById(id);
        const raw = (res && res.data && res.data.data) ? res.data.data : (res && res.data) ? res.data : res;
        const normalized = {
          ...raw,
          id: raw.id ?? raw.productId ?? id,
          backendId: raw.productId ?? raw.id ?? id,
          name: raw.name ?? raw.productName ?? raw.title,
          price: raw.price ?? raw.rate,
          sellerName: raw.sellerName ?? raw.farmerName,
          sellerPhoneNumber: raw.sellerPhoneNumber ?? raw.farmerPhoneNumber ?? raw.farmerEmailorPhone,
          imageUrl: raw.imageUrl || (raw.imageCode ? `${BASE_URL}/api/Product/getProductImage/${raw.imageCode}` : ''),
        };
        setProductDetails(normalized);
      } else {
        const normalized = {
          ...product,
          id: product.id ?? product.productId,
          backendId: product.productId ?? product.id,
          name: product.name ?? product.productName ?? product.title,
          imageUrl: product.imageUrl || (product.imageCode ? `${BASE_URL}/api/Product/getProductImage/${product.imageCode}` : ''),
        };
        setProductDetails(normalized);
      }
    } catch (e) {
      console.error('Error loading product details:', e);
      const fallback = {
        ...product,
        id: product.id ?? product.productId,
        backendId: product.productId ?? product.id,
        name: product.name ?? product.productName ?? product.title,
        imageUrl: product.imageUrl || (product.imageCode ? `${BASE_URL}/api/Product/getProductImage/${product.imageCode}` : ''),
      };
      setProductDetails(fallback);
    } finally {
      setProductDetailsLoading(false);
    }
  };

  const handleOrderAction = async (orderId, action) => {
    try {
      switch (action) {
        case 'approve':
          await orderAPI.updateOrderStatus(orderId, { status: 'approved' });
          break;
        case 'reject':
          await orderAPI.updateOrderStatus(orderId, { status: 'rejected' });
          break;
        case 'complete':
          await orderAPI.updateOrderStatus(orderId, { status: 'completed' });
          break;
        default:
          break;
      }
      await loadOrders();
    } catch (error) {
      console.error(`Error ${action} order:`, error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product => 
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(order => 
    filterStatus === 'all' || order.status === filterStatus
  );

  if (loading) return <div className="admin-loading">Loading...</div>;
  if (!user || user.role !== 'admin') return <div className="admin-unauthorized">Access Denied</div>;

  return (
    <div className="admin-page">
      <DashboardNavbar />
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">Admin Panel</h1>
          <p className="admin-subtitle">Manage KrishiLink System</p>
        </div>

        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
          <button 
            className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            🍎 Products
          </button>
          <button 
            className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            📦 Orders
          </button>
          <button 
            className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            📈 Analytics
          </button>
          <button 
            className={`admin-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <AdminDashboard onTabChange={setActiveTab} />
          )}

          {activeTab === 'users' && (
            <div className="users-management">
              <div className="section-header">
                <h2>User Management</h2>
                <div className="search-filter">
                  <div className="filter-group">
                    <button className={`admin-tab ${userScope === 'all' ? 'active' : ''}`} onClick={() => { setUserScope('all'); loadUsers(); }}>All</button>
                    <button className={`admin-tab ${userScope === 'farmers' ? 'active' : ''}`} onClick={() => { setUserScope('farmers'); loadUsers(); }}>Farmers</button>
                    <button className={`admin-tab ${userScope === 'buyers' ? 'active' : ''}`} onClick={() => { setUserScope('buyers'); loadUsers(); }}>Buyers</button>
                    <button className={`admin-tab ${userScope === 'active' ? 'active' : ''}`} onClick={() => { setUserScope('active'); loadUsers(); }}>Active</button>
                  </div>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Join Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.fullName}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.status}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>{user.joinDate}</td>
                        <td className="action-buttons">
                          {user.status === 'active' ? (
                            <button 
                              onClick={() => handleUserAction(user.id, 'deactivate')}
                              className="btn-deactivate"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleUserAction(user.id, 'activate')}
                              className="btn-activate"
                            >
                              Activate
                            </button>
                          )}
                          <button 
                            onClick={() => handleUserAction(user.id, 'delete')}
                            className="btn-delete"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="products-management">
              <div className="section-header">
                <h2>Product Management</h2>
                <div className="search-filter">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>
              
              <div className="products-grid">
                {filteredProducts.map(product => {
                  const productName = product.name || product.productName || product.title || 'Unnamed Product';
                  const productImage = product.imageUrl || product.image || product.productImageUrl || '';
                  return (
                  <div key={product.backendId || product.id} className="product-card">
                    <div className="product-image">
                      {productImage ? (
                        <img src={productImage} alt={productName} />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3>{productName}</h3>
                      <p className="product-description">{product.description}</p>
                      <p className="product-price">₹{product.price}</p>
                      <p className="product-seller">Seller: {product.sellerName}</p>
                      <div className="product-status">
                        <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <div className="product-actions">
                      {product.isActive ? (
                        <button 
                          onClick={() => handleProductAction(product.backendId ?? product.id, 'deactivate')}
                          className="btn-deactivate"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleProductAction(product.backendId ?? product.id, 'activate')}
                          className="btn-activate"
                        >
                          Activate
                        </button>
                      )}
                      <button 
                        onClick={() => openProductDetails(product)}
                        className="btn-approve"
                      >
                        View Details
                      </button>
                      <button 
                        onClick={() => handleProductAction(product.backendId ?? product.id, 'delete')}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-management">
              <div className="section-header">
                <h2>Order Management</h2>
                <div className="search-filter">
                  <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Products</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map(order => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.customerName}</td>
                        <td>{order.productCount} items</td>
                        <td>₹{order.totalAmount}</td>
                        <td>
                          <span className={`status-badge ${order.status}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                        <td className="action-buttons">
                          {order.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleOrderAction(order.id, 'approve')}
                                className="btn-approve"
                              >
                                Approve
                              </button>
                              <button 
                                onClick={() => handleOrderAction(order.id, 'reject')}
                                className="btn-reject"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {order.status === 'approved' && (
                            <button 
                              onClick={() => handleOrderAction(order.id, 'complete')}
                              className="btn-complete"
                            >
                              Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="analytics-section">
              <h2>Analytics & Reports</h2>
              <div className="analytics-grid">
                <div className="chart-card">
                  <h3>User Growth</h3>
                  <div className="chart-placeholder">
                    <p>User registration trends over time</p>
                    <div className="chart-mock">📈 Chart visualization would go here</div>
                  </div>
                </div>
                <div className="chart-card">
                  <h3>Revenue Analysis</h3>
                  <div className="chart-placeholder">
                    <p>Monthly revenue breakdown</p>
                    <div className="chart-mock">💰 Revenue chart would go here</div>
                  </div>
                </div>
                <div className="chart-card">
                  <h3>Product Performance</h3>
                  <div className="chart-placeholder">
                    <p>Top selling products</p>
                    <div className="chart-mock">🏆 Product ranking would go here</div>
                  </div>
                </div>
                <div className="chart-card">
                  <h3>Geographic Distribution</h3>
                  <div className="chart-placeholder">
                    <p>User and order distribution by location</p>
                    <div className="chart-mock">🗺️ Map visualization would go here</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-section">
              <h2>System Settings</h2>
              <div className="settings-grid">
                <div className="setting-card">
                  <h3>General Settings</h3>
                  <div className="setting-item">
                    <label>Site Name</label>
                    <input type="text" defaultValue="KrishiLink" />
                  </div>
                  <div className="setting-item">
                    <label>Maintenance Mode</label>
                    <input type="checkbox" />
                  </div>
                  <div className="setting-item">
                    <label>Registration Enabled</label>
                    <input type="checkbox" defaultChecked />
                  </div>
                </div>
                
                <div className="setting-card">
                  <h3>Email Settings</h3>
                  <div className="setting-item">
                    <label>SMTP Server</label>
                    <input type="text" defaultValue="smtp.gmail.com" />
                  </div>
                  <div className="setting-item">
                    <label>SMTP Port</label>
                    <input type="number" defaultValue="587" />
                  </div>
                  <div className="setting-item">
                    <label>Email Notifications</label>
                    <input type="checkbox" defaultChecked />
                  </div>
                </div>
                
                <div className="setting-card">
                  <h3>Security Settings</h3>
                  <div className="setting-item">
                    <label>Session Timeout (minutes)</label>
                    <input type="number" defaultValue="30" />
                  </div>
                  <div className="setting-item">
                    <label>Two-Factor Authentication</label>
                    <input type="checkbox" />
                  </div>
                  <div className="setting-item">
                    <label>Rate Limiting</label>
                    <input type="checkbox" defaultChecked />
                  </div>
                </div>
                
                <div className="setting-card">
                  <h3>Backup & Maintenance</h3>
                  <button className="btn-backup">Create Backup</button>
                  <button className="btn-cleanup">Cleanup Logs</button>
                  <button className="btn-optimize">Optimize Database</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {productDetailsOpen && (
        <div className="modal-overlay" onClick={() => setProductDetailsOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {(() => {
                const p = productDetails || {};
                const headerName = p.name || p.productName || p.title || '';
                return (
                  <h3>
                    Product Details {headerName ? `- ${headerName}` : ''}
                  </h3>
                );
              })()}
              <button className="btn-delete" onClick={() => setProductDetailsOpen(false)}>Close</button>
            </div>
            {productDetailsLoading ? (
              <div className="admin-loading">Loading...</div>
            ) : (
              (() => {
                const p = productDetails || {};
                const id = p.backendId ?? p.productId ?? p.id;
                const name = p.name || p.productName || p.title || 'Unnamed Product';
                const price = p.price ?? p.rate;
                const seller = p.sellerName || p.farmerName;
                const phone = p.sellerPhoneNumber || p.farmerPhoneNumber || p.farmerEmailorPhone;
                const location = p.location || p.address || p.city;
                const category = p.category;
                const qty = p.availableQuantity ?? p.quantity;
                const isActive = typeof p.isActive === 'boolean' ? p.isActive : true;
                const imageUrl = p.imageUrl || (p.imageCode ? `${BASE_URL}/api/Product/getProductImage/${p.imageCode}` : '');
                const created = p.createdAt || p.createdOn || p.addedOn;
                const updated = p.updatedAt || p.updatedOn;
                return (
                  <div className="product-details-modal">
                    <div className="product-hero">
                      <div className="hero-image">
                        {imageUrl ? (
                          <img src={imageUrl} alt={name} onError={(e) => { e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='; }} />
                        ) : (
                          <div className="no-image">No Image</div>
                        )}
                      </div>
                      <div className="hero-info">
                        <h2>{name}</h2>
                        <div className="hero-meta">
                          <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>{isActive ? 'Active' : 'Inactive'}</span>
                          {price != null && <span className="pill">₹{price}</span>}
                          {category && <span className="pill">{category}</span>}
                        </div>
                        <p className="hero-desc">{p.description || 'No description provided.'}</p>
                      </div>
                    </div>
                    <div className="details-grid">
                      {id && (
                        <div className="detail-row"><div className="detail-key">ID</div><div className="detail-value">{id}</div></div>
                      )}
                      {seller && (
                        <div className="detail-row"><div className="detail-key">Seller</div><div className="detail-value">{seller}</div></div>
                      )}
                      {phone && (
                        <div className="detail-row"><div className="detail-key">Contact</div><div className="detail-value">{phone}</div></div>
                      )}
                      {location && (
                        <div className="detail-row"><div className="detail-key">Location</div><div className="detail-value">{location}</div></div>
                      )}
                      {qty != null && (
                        <div className="detail-row"><div className="detail-key">Available Qty</div><div className="detail-value">{qty}</div></div>
                      )}
                      {created && (
                        <div className="detail-row"><div className="detail-key">Created</div><div className="detail-value">{new Date(created).toLocaleString()}</div></div>
                      )}
                      {updated && (
                        <div className="detail-row"><div className="detail-key">Updated</div><div className="detail-value">{new Date(updated).toLocaleString()}</div></div>
                      )}
                    </div>
                    <div className="modal-actions">
                      <button
                        className={isActive ? 'btn-deactivate' : 'btn-activate'}
                        onClick={() => handleProductAction(id, isActive ? 'deactivate' : 'activate')}
                      >
                        {isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleProductAction(id, 'delete')}
                      >
                        Delete
                      </button>
                      {id && (
                        <button
                          className="btn-approve"
                          onClick={() => window.open(`/product/${id}`, '_blank')}
                        >
                          Open Full Page
                        </button>
                      )}
                    </div>
                    <details style={{ marginTop: '0.75rem' }}>
                      <summary style={{ cursor: 'pointer', color: '#388e3c', fontWeight: 600 }}>View Raw JSON</summary>
                      <pre style={{ whiteSpace: 'pre-wrap', background: '#f7f7f7', padding: '0.75rem', borderRadius: 8 }}>
                        {JSON.stringify(productDetails, null, 2)}
                      </pre>
                    </details>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default AdminPanel;
