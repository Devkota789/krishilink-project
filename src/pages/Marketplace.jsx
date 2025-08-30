import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, orderAPI, checkAuthStatus } from '../api/api';
import { useAuth } from '../context/AuthContext';
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';
import { FaUser, FaPhone, FaMapMarkerAlt, FaShoppingCart, FaSeedling } from 'react-icons/fa';
import { motion } from 'framer-motion';
import BulkOrderModal from '../components/BulkOrderModal';
import './Marketplace.css';
import NatureButton from '../components/NatureButton';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orderQuantity, setOrderQuantity] = useState({});
  const [orderMessage, setOrderMessage] = useState({ text: '', type: '' });
  const { user } = useAuth();
  const navigate = useNavigate();
  const BASE_URL = 'https://w1vqqn7ucvzpndp9xsvdkd15gzcedswvilahs3agd6b3dljo7tg24pbklk4u.shamir.com.np';

  useEffect(() => {
    fetchProducts();
    // Check authentication status for debugging
    checkAuthStatus();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAllProducts();
      console.log('Products response:', response); // Debug log
      if (response.data) {
        // Map API fields to UI fields for consistency
        const mappedProducts = response.data.map(product => ({
          ...product,
          id: product.productId,
          name: product.productName,
          price: product.rate,
          sellerName: product.farmerName,
          sellerPhoneNumber: product.farmerEmailorPhone,
          imageUrl: product.imageCode
            ? `${BASE_URL}/api/Product/getProductImage/${product.imageCode}`
            : null,
        }));
        setProducts(mappedProducts);
      } else {
        setError('No products found');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId, value) => {
    setOrderQuantity(prev => ({
      ...prev,
      [productId]: value
    }));
  };

  const handlePlaceOrder = async (product) => {
    if (!user) {
      setOrderMessage({ text: 'Please login to place an order', type: 'error' });
      return;
    }
    if (user.role !== 'buyer') {
      setOrderMessage({ text: 'Only buyers can place orders', type: 'error' });
      return;
    }
    
    // Check if user has valid authentication
    const token = localStorage.getItem('authToken');
    if (!token) {
      setOrderMessage({ text: 'Authentication token missing. Please login again.', type: 'error' });
      return;
    }
    
    console.log('User authenticated:', !!user);
    console.log('Token exists:', !!token);
    console.log('User role:', user.role);
    
    const quantity = orderQuantity[product.id];
    if (!quantity || quantity <= 0) {
      setOrderMessage({ text: 'Please enter a valid quantity', type: 'error' });
      return;
    }
    try {
      // Create FormData for multipart/form-data with exact API field names
      const formData = new FormData();
      formData.append('productId', product.id);
      formData.append('productQuantity', quantity);
      formData.append('totalPrice', product.price * quantity);
      formData.append('orderStatus', 'pending');
      formData.append('paymentStatus', 'pending');
      formData.append('refundStatus', 'none');

      console.log('Sending order request with token:', token.substring(0, 20) + '...');
      const response = await orderAPI.addOrder(formData);
      if (response.data) {
        setOrderMessage({ text: 'Order placed successfully!', type: 'success' });
        setOrderQuantity(prev => ({ ...prev, [product.id]: '' }));
        fetchProducts();
        setTimeout(() => {
          navigate('/my-orders');
        }, 1500);
      }
    } catch (err) {
      console.error('Order placement error:', err);
      console.error('Error response:', err.response);
      setOrderMessage({ text: err.response?.data?.message || 'Failed to place order. Please try again.', type: 'error' });
    }
  };

  // Remove cart-related state and handlers

  const handleImageError = (e) => {
    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  };

  const handleLiveChat = (product) => {
    if (!user) {
      navigate('/login');
    } else {
      alert(`Open live chat for product: ${product.name}`);
    }
  };

  const sproutSVG = (
    <svg viewBox="0 0 24 24" fill="none" width="24" height="24">
      <ellipse cx="12" cy="18" rx="6" ry="4" fill="#A5D6A7" />
      <path d="M12 18 Q13 10 22 8" stroke="#4CAF50" strokeWidth="2" fill="none" />
      <ellipse cx="16" cy="10" rx="1.5" ry="2.5" fill="#81C784" />
    </svg>
  );

  if (loading) {
    return (
      <div className="marketplace-container">
        <DashboardNavbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="marketplace-container">
        <DashboardNavbar />
        <div className="error-container">
          <p>{error}</p>
          <NatureButton onClick={fetchProducts} className="retry-button">
            Retry
          </NatureButton>
        </div>
      </div>
    );
  }

  return (
    <div className="marketplace-container">
      <DashboardNavbar />
      <div className="marketplace-content">
        <div className="marketplace-header">
          <h1>Marketplace</h1>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* Remove cart icon/button */}
          </div>
        </div>

        {orderMessage.text && (
          <div className={`order-message ${orderMessage.type}`}>
            {orderMessage.text}
          </div>
        )}

        <div className="products-grid">
          {products.filter(p => p.isActive).length === 0 ? (
            <div className="no-products">
              <p>No products available at the moment.</p>
            </div>
          ) : (
            products.filter(p => p.isActive).map((product) => (
              <motion.div
                key={product.id}
                className="nature-card product-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <span className="sprout-corner top-left">{sproutSVG}</span>
                <span className="sprout-corner top-right">{sproutSVG}</span>
                <span className="sprout-corner bottom-left">{sproutSVG}</span>
                <span className="sprout-corner bottom-right">{sproutSVG}</span>
                <div className="product-image">
                  <img 
                    src={product.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='} 
                    alt={product.name}
                    onError={handleImageError}
                  />
                </div>
                <div className="product-info">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '0.2em' }}>
                    <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>{product.isActive ? 'Active' : 'Inactive'}</span>
                    <h3 style={{ margin: 0 }}>{product.name}</h3>
                  </div>
                  <p className="price">₹{product.price} per kg</p>
                  <p className="description">{product.description}</p>
                  <div className="seller-info">
                    <p>
                      <FaUser /> {product.sellerName}
                    </p>
                    <p>
                      <FaPhone /> {product.sellerPhoneNumber}
                    </p>
                    <p>
                      <FaMapMarkerAlt /> {product.address}
                    </p>
                  </div>
                  {/* Live Chat Button */}
                  <NatureButton
                    className="live-chat-btn"
                    onClick={() => handleLiveChat(product)}
                    style={{ marginTop: '8px', marginBottom: '8px' }}
                  >
                    Live Chat
                  </NatureButton>
                  {user && (
                    <div className="order-section">
                      <input
                        type="number"
                        min="1"
                        value={orderQuantity[product.id] || ''}
                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                        placeholder="Enter Quantity (kg)"
                        className="quantity-input"
                      />
                      <NatureButton
                        className="order-button"
                        onClick={() => handlePlaceOrder(product)}
                        disabled={!user}
                      >
                        <FaShoppingCart /> Place Order
                      </NatureButton>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
      {/* Remove BulkOrderModal */}
      <Footer />
    </div>
  );
};

export default Marketplace; 