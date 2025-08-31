import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, orderAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';
import { FaUser, FaPhone, FaMapMarkerAlt, FaShoppingCart, FaSeedling, FaInfoCircle, FaStore, FaTags } from 'react-icons/fa';
import NatureButton from '../components/NatureButton';
import './MarketplaceProductDetails.css';

const MarketplaceProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const BASE_URL = 'https://w1vqqn7ucvzpndp9xsvdkd15gzcedswvilahs3agd6b3dljo7tg24pbklk4u.shamir.com.np';

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState('');
  const [orderMessage, setOrderMessage] = useState({ text: '', type: '' });
  const [activeSection, setActiveSection] = useState('details'); // 'details', 'seller', 'order'

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getProductById(productId);
      console.log('API Response:', response);
      
      if (response.data && response.data.data) {
        const apiData = response.data.data;
        const productData = {
          id: apiData.productId,
          name: apiData.productName,
          price: apiData.rate,
          description: apiData.description,
          sellerName: apiData.farmerName,
          sellerPhoneNumber: apiData.farmerEmailorPhone,
          address: apiData.address,
          unit: apiData.unit,
          availableQuantity: apiData.availableQuantity,
          category: apiData.category,
          imageUrl: apiData.imageCode
            ? `${BASE_URL}/api/Product/getProductImage/${apiData.imageCode}`
            : null,
        };
        console.log('Processed Product Data:', productData);
        setProduct(productData);
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'buyer') {
      setOrderMessage({ text: 'Only buyers can place orders', type: 'error' });
      return;
    }
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }
    
    if (!orderQuantity || orderQuantity <= 0) {
      setOrderMessage({ text: 'Please enter a valid quantity', type: 'error' });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('productId', product.id);
      formData.append('productQuantity', orderQuantity);
      formData.append('totalPrice', product.price * orderQuantity);
      formData.append('orderStatus', 'pending');
      formData.append('paymentStatus', 'pending');
      formData.append('refundStatus', 'none');

      const response = await orderAPI.addOrder(formData);
      if (response.data) {
        setOrderMessage({ text: 'Order placed successfully!', type: 'success' });
        setOrderQuantity('');
        setTimeout(() => {
          navigate('/my-orders');
        }, 1500);
      }
    } catch (err) {
      console.error('Order placement error:', err);
      setOrderMessage({ text: err.response?.data?.message || 'Failed to place order. Please try again.', type: 'error' });
    }
  };

  const handleLiveChat = () => {
    if (!user) {
      navigate('/login');
    } else {
      alert(`Open live chat for product: ${product?.name}`);
    }
  };

  if (loading) {
    return (
      <div className="marketplace-product-details-container">
        <DashboardNavbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="marketplace-product-details-container">
        <DashboardNavbar />
        <div className="error-container">
          <p>Error: {error || 'Product not found'}</p>
          <button className="retry-button" onClick={fetchProduct}>
            Retry
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="marketplace-product-details-container">
      <DashboardNavbar />
      
      <div className="marketplace-product-details-content">
        {/* Header Section */}
        <div className="product-details-header">
          <div className="header-content">
            <FaSeedling className="header-icon" />
          <h1>{product.name}</h1>
            <p className="product-category">
              <FaTags /> {product.category || 'Not specified'}
            </p>
          </div>
        </div>

        {/* Message Display */}
        {orderMessage.text && (
          <div className={`order-message ${orderMessage.type}`}>
            {orderMessage.text}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="section-navigation">
          <button 
            className={`nav-tab ${activeSection === 'details' ? 'active' : ''}`}
            onClick={() => setActiveSection('details')}
          >
            <FaInfoCircle /> Product Details
          </button>
          <button 
            className={`nav-tab ${activeSection === 'seller' ? 'active' : ''}`}
            onClick={() => setActiveSection('seller')}
          >
            <FaUser /> Seller Info
          </button>
          <button 
            className={`nav-tab ${activeSection === 'order' ? 'active' : ''}`}
            onClick={() => setActiveSection('order')}
          >
            <FaShoppingCart /> Order
          </button>
              </div>

        {/* Main Content Grid */}
        <div className="product-details-grid">
          {/* Image Section - Always Visible */}
          <div className="product-image-section">
            <div className="product-image-container">
              <div className="product-image">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name || 'Product'} 
                    onError={(e) => {
                      console.log('Image failed to load:', product.imageUrl);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                ) : null}
                <div className="no-image" style={{ display: product.imageUrl ? 'none' : 'block' }}>
                  <FaStore />
                  <p>No Image Available</p>
              </div>
                      </div>
                      </div>
                    </div>

          {/* Content Sections */}
          <div className="content-sections">
            {/* Product Details Section */}
            {activeSection === 'details' && (
              <div className="section-content product-details-section">
                <div className="section-header">
                  <FaInfoCircle />
                  <h2>Product Information</h2>
                </div>
                
                <div className="product-basic-info">
                  <div className="info-item">
                    <label>Product Name:</label>
                    <span>{product.name || 'Product Name Not Available'}</span>
                  </div>
                  
                  <div className="info-item price-item">
                    <label>Price:</label>
                    <span className="price">₹{product.price || '0'} per {product.unit || 'kg'}</span>
                  </div>
                  
                  <div className="info-item">
                    <label>Category:</label>
                    <span>{product.category || 'Not specified'}</span>
                    </div>
                  
                  <div className="info-item">
                    <label>Available Quantity:</label>
                    <span>{product.availableQuantity || '0'} {product.unit || 'kg'}</span>
                    </div>
                  
                  <div className="info-item description-item">
                    <label>Description:</label>
                    <p className="description">{product.description || 'No description available'}</p>
                  </div>
              </div>
          </div>
        )}

            {/* Seller Information Section */}
            {activeSection === 'seller' && (
              <div className="section-content seller-info-section">
                <div className="section-header">
                  <FaUser />
                  <h2>Seller Information</h2>
                </div>
                
                <div className="seller-info">
                  <div className="info-item">
                    <FaUser />
                    <div>
                      <label>Seller Name:</label>
                      <span>{product.sellerName || 'Seller name not available'}</span>
            </div>
          </div>

                  <div className="info-item">
                    <FaPhone />
                    <div>
                      <label>Contact:</label>
                      <span>{product.sellerPhoneNumber || 'Contact not available'}</span>
                    </div>
            </div>

                  <div className="info-item">
                    <FaMapMarkerAlt />
                    <div>
                      <label>Address:</label>
                      <span>{product.address || 'Address not available'}</span>
                    </div>
                  </div>
            </div>

                <div className="action-buttons">
            <NatureButton
              className="live-chat-btn"
              onClick={handleLiveChat}
            >
                    <FaPhone /> Live Chat with Seller
            </NatureButton>
                </div>
              </div>
            )}

            {/* Order Section */}
            {activeSection === 'order' && (
              <div className="section-content order-section">
                <div className="section-header">
                  <FaShoppingCart />
                  <h2>Place Order</h2>
                </div>
                
                {user ? (
                  <div className="order-form">
                    <div className="order-summary">
                      <h3>Order Summary</h3>
                      <div className="summary-item">
                        <span>Product:</span>
                        <span>{product.name}</span>
                      </div>
                      <div className="summary-item">
                        <span>Price per {product.unit || 'kg'}:</span>
                        <span>₹{product.price}</span>
                      </div>
                      <div className="summary-item">
                        <span>Available:</span>
                        <span>{product.availableQuantity} {product.unit || 'kg'}</span>
                      </div>
                    </div>

                    <div className="quantity-input-group">
                      <label htmlFor="quantity">Quantity ({product.unit || 'kg'}):</label>
                <input
                        id="quantity"
                  type="number"
                  min="1"
                        max={product.availableQuantity}
                  value={orderQuantity}
                        onChange={(e) => setOrderQuantity(e.target.value)}
                        placeholder={`Enter quantity in ${product.unit || 'kg'}`}
                  className="quantity-input"
                />
                    </div>

                    {orderQuantity && orderQuantity > 0 && (
                      <div className="total-calculation">
                        <div className="total-item">
                          <span>Total Price:</span>
                          <span className="total-price">₹{product.price * orderQuantity}</span>
                        </div>
                      </div>
                    )}

                <NatureButton
                  className="order-button"
                  onClick={handlePlaceOrder}
                      disabled={!orderQuantity || orderQuantity <= 0}
                >
                  <FaShoppingCart /> Place Order
                </NatureButton>
              </div>
                ) : (
                  <div className="login-required">
                    <div className="login-message">
                      <FaUser />
                      <h3>Login Required</h3>
                      <p>Please log in to place an order for this product.</p>
                          </div>
                            <NatureButton
                      className="login-button"
                          onClick={() => navigate('/login')}
                        >
                      Go to Login
                        </NatureButton>
                      </div>
                )}
                </div>
              )}
            </div>
          </div>
        </div>
      
      <Footer />
    </div>
  );
};

export default MarketplaceProductDetails;
