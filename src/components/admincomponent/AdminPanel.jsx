import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardNavbar from '../DashboardNavbar';
import Footer from '../Footer';
import AdminTabs from './AdminTabs';
import DashboardSection from './DashboardSection';
import UsersManagement from './UsersManagement';
import ProductsManagement from './ProductsManagement';
import OrdersManagement from './OrdersManagement';
import AnalyticsSection from './AnalyticsSection';
import SettingsSection from './SettingsSection';
import ProductDetailsModal from './ProductDetailsModal';
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
  const [userScope, setUserScope] = useState('all');
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
      const { userAPI } = await import('../../api/api');
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

  const loadProducts = async () => {
    try {
      const { productAPI } = await import('../../api/api');
      const BASE_URL = 'https://w1vqqn7ucvzpndp9xsvdkd15gzcedswvilahs3agd6b3dljo7tg24pbklk4u.shamir.com.np';
      
      const response = await productAPI.getAllProducts();
      if (response.success) {
        const data = Array.isArray(response.data) ? response.data : response.data?.products || [];
        const mapped = data.map((p, idx) => {
          console.log('Raw product data:', p); // Debug: Log raw product data
          return {
            ...p,
            // Ensure productId is the primary field, matching the API expectation
            productId: p.productId || p.id || (idx + 1),
            id: p.productId || p.id || (idx + 1),
            backendId: p.productId || p.id,
            name: p.name ?? p.productName ?? p.title,
            price: p.price ?? p.rate,
            sellerName: p.sellerName ?? p.farmerName,
            description: p.description,
            isActive: typeof p.isActive === 'boolean' ? p.isActive : true,
            imageUrl: p.imageUrl || (p.imageCode ? `${BASE_URL}/api/Product/getProductImage/${p.imageCode}` : ''),
          };
        });
        console.log('Mapped products:', mapped); // Debug: Log mapped products
        setProducts(mapped);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const { orderAPI } = await import('../../api/api');
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
      const { userAPI } = await import('../../api/api');
      const { adminAPI } = await import('../../api/adminAPI');
      
      switch (action) {
        case 'activate':
          const activateResult = await userAPI.updateStatus({ userId, status: true });
          if (activateResult.success) {
            alert('User activated successfully!');
            await loadUsers();
          } else {
            alert(`Failed to activate user: ${activateResult.error || 'Unknown error'}`);
          }
          break;
        case 'deactivate':
          const deactivateResult = await userAPI.updateStatus({ userId, status: false });
          if (deactivateResult.success) {
            alert('User deactivated successfully!');
            await loadUsers();
          } else {
            alert(`Failed to deactivate user: ${deactivateResult.error || 'Unknown error'}`);
          }
          break;
        case 'delete':
          // Enhanced confirmation with user details
          const userToDelete = users.find(u => u.id === userId);
          const confirmMessage = userToDelete 
            ? `Are you sure you want to delete user "${userToDelete.fullName}" (${userToDelete.email})?\n\nThis action cannot be undone and will permanently remove the user from the system.`
            : 'Are you sure you want to delete this user? This action cannot be undone.';
          
          if (!window.confirm(confirmMessage)) {
            return;
          }
          
          // Use admin-specific delete endpoint for better security
          const deleteResult = await adminAPI.deleteUser(userId);
          if (deleteResult.success) {
            alert('User deleted successfully!');
            await loadUsers();
          } else {
            // If admin endpoint fails, try regular endpoint as fallback
            console.warn('Admin delete failed, trying regular endpoint:', deleteResult.error);
            const fallbackResult = await userAPI.deleteUser(userId);
            if (fallbackResult.success) {
              alert('User deleted successfully! (via fallback endpoint)');
              await loadUsers();
            } else {
              alert(`Failed to delete user: ${fallbackResult.error || deleteResult.error || 'Unknown error'}`);
            }
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Error ${action} user:`, error);
      alert(`Error ${action} user: ${error.message || 'Unknown error'}`);
    }
  };

  const handleProductAction = async (productId, action) => {
    console.log(`Handling product action: ${action} for productId: ${productId}`);
    console.log('Product ID type:', typeof productId);
    console.log('Product ID value:', productId);
    
    if (!productId) {
      alert('Error: No product ID provided for deletion');
      return;
    }
    
    try {
      const { productAPI } = await import('../../api/api');
      const { adminAPI } = await import('../../api/adminAPI');
      
      switch (action) {
        case 'activate':
          await adminAPI.updateProductStatus(productId, true);
          alert('Product activated successfully!');
          break;
        case 'deactivate':
          await adminAPI.updateProductStatus(productId, false);
          alert('Product deactivated successfully!');
          break;
        case 'delete':
          try {
            console.log('Attempting to delete product with ID:', productId);
            
            // First try the regular product API delete
            const deleteResult = await productAPI.deleteProduct(productId);
            console.log('Delete result:', deleteResult);
            
            if (deleteResult && deleteResult.success) {
              alert('Product deleted successfully!');
            } else {
              throw new Error(deleteResult?.error || 'Delete failed');
            }
          } catch (err) {
            console.warn('Regular delete failed, trying admin delete:', err);
            
            // If regular delete fails, try admin delete as fallback
            try {
              const adminDeleteResult = await adminAPI.deleteProductAdmin(productId);
              console.log('Admin delete result:', adminDeleteResult);
              
              if (adminDeleteResult && adminDeleteResult.success) {
                alert('Product deleted successfully! (via admin endpoint)');
              } else {
                throw new Error(adminDeleteResult?.error || 'Admin delete failed');
              }
            } catch (adminErr) {
              console.error('Admin delete also failed:', adminErr);
              throw new Error(`Failed to delete product: ${adminErr.message || 'Unknown error'}`);
            }
          }
          break;
        default:
          break;
      }
      await loadProducts();
    } catch (error) {
      console.error(`Error ${action} product:`, error);
      alert(`Error ${action} product: ${error.message || 'Unknown error'}`);
    }
  };

  const openProductDetails = async (product) => {
    try {
      setProductDetailsLoading(true);
      setProductDetails(null);
      setProductDetailsOpen(true);
      
      const { productAPI } = await import('../../api/api');
      const BASE_URL = 'https://w1vqqn7ucvzpndp9xsvdkd15gzcedswvilahs3agd6b3dljo7tg24pbklk4u.shamir.com.np';
      
      const id = product.productId;
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
      const { orderAPI } = await import('../../api/api');
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

        <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <DashboardSection onTabChange={setActiveTab} />
          )}

          {activeTab === 'users' && (
            <UsersManagement
              users={filteredUsers}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              userScope={userScope}
              setUserScope={setUserScope}
              onUserAction={handleUserAction}
              onLoadUsers={loadUsers}
            />
          )}

          {activeTab === 'products' && (
            <ProductsManagement
              products={filteredProducts}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onProductAction={handleProductAction}
              onOpenProductDetails={openProductDetails}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersManagement
              orders={filteredOrders}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onOrderAction={handleOrderAction}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsSection />
          )}

          {activeTab === 'settings' && (
            <SettingsSection />
          )}
        </div>
      </div>
      
      <ProductDetailsModal
        isOpen={productDetailsOpen}
        onClose={() => setProductDetailsOpen(false)}
        productDetails={productDetails}
        loading={productDetailsLoading}
        onProductAction={handleProductAction}
      />
      
      <Footer />
    </div>
  );
};

export default AdminPanel;
