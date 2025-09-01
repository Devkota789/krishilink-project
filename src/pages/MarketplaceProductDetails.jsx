import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, orderAPI, reviewAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';
import { FaUser, FaPhone, FaMapMarkerAlt, FaShoppingCart, FaSeedling, FaInfoCircle, FaStore, FaTags, FaStar } from 'react-icons/fa';
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
  const [activeSection, setActiveSection] = useState('details'); // 'details', 'seller', 'order', 'reviews'
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');
  const [newReview, setNewReview] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  useEffect(() => {
    if (activeSection === 'reviews' && productId) {
      fetchReviews();
    }
  }, [activeSection, productId]);

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

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      setReviewsError('');
      const res = await reviewAPI.getProductReviews(productId);
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : [];
        setReviews(list);
      } else {
        setReviewsError(res.error || 'Failed to load reviews');
      }
    } catch (e) {
      setReviewsError('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/login');
      return;
    }

    if (!newReview.trim()) {
      setReviewMessage({ text: 'Please enter a review', type: 'error' });
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewMessage({ text: '', type: '' });

      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('review', newReview.trim());

      const response = await reviewAPI.addReview(formData);
      
      if (response.success) {
        setReviewMessage({ text: 'Review submitted successfully!', type: 'success' });
        setNewReview('');
        // Refresh reviews to show the new one
        setTimeout(() => {
          fetchReviews();
        }, 1000);
      } else {
        setReviewMessage({ 
          text: response.error || 'Failed to submit review. Please try again.', 
          type: 'error' 
        });
      }
    } catch (err) {
      console.error('Review submission error:', err);
      setReviewMessage({ 
        text: 'An error occurred while submitting your review. Please try again.', 
        type: 'error' 
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId, reviewerId) => {
    // Check if the current user is the one who wrote the review
    if (!user || user.id !== reviewerId) {
      setReviewMessage({ text: 'You can only delete your own reviews', type: 'error' });
      return;
    }

    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await reviewAPI.deleteReview(reviewId);
      
      if (response.success) {
        setReviewMessage({ text: 'Review deleted successfully!', type: 'success' });
        // Refresh reviews to remove the deleted one
        setTimeout(() => {
          fetchReviews();
        }, 1000);
      } else {
        setReviewMessage({ 
          text: response.error || 'Failed to delete review. Please try again.', 
          type: 'error' 
        });
      }
    } catch (err) {
      console.error('Review deletion error:', err);
      setReviewMessage({ 
        text: 'An error occurred while deleting your review. Please try again.', 
        type: 'error' 
      });
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
          <button 
            className={`nav-tab ${activeSection === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveSection('reviews')}
          >
            Reviews
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
            {/* Reviews Section */}
            {activeSection === 'reviews' && (
              <div className="section-content reviews-section">
                <div className="section-header">
                  <FaStar />
                  <h2>Customer Reviews</h2>
                </div>
                
                {/* Add Review Section */}
                <div className="add-review-section" style={{
                  marginBottom: '2rem',
                  padding: '1.5rem',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <h3 style={{
                    margin: '0 0 1rem 0',
                    color: '#333',
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <FaStar style={{ color: '#ff9800', marginRight: '0.5rem' }} />
                    Write a Review
                  </h3>
                  
                  <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <label htmlFor="reviewText" style={{
                        display: 'block',
                        marginBottom: '0.5rem',
                        fontWeight: '500',
                        color: '#333'
                      }}>
                        Your Review *
                      </label>
                      <textarea
                        id="reviewText"
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        placeholder="Share your experience with this product..."
                        required
                        rows="4"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          fontFamily: 'inherit',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                    
                    {reviewMessage.text && (
                      <div style={{
                        padding: '0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        background: reviewMessage.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: reviewMessage.type === 'success' ? '#155724' : '#721c24',
                        border: `1px solid ${reviewMessage.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
                      }}>
                        {reviewMessage.text}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setNewReview('')}
                        style={{
                          padding: '0.75rem 1.5rem',
                          border: '1px solid #ddd',
                          borderRadius: '6px',
                          background: '#fff',
                          color: '#666',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        Clear
                      </button>
                      <NatureButton
                        type="submit"
                        disabled={!newReview.trim() || submittingReview}
                        style={{
                          padding: '0.75rem 1.5rem',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          opacity: !newReview.trim() || submittingReview ? 0.6 : 1,
                          cursor: !newReview.trim() || submittingReview ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </NatureButton>
                    </div>
                  </form>
                </div>
                
                {reviewsLoading && (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading reviews...</p>
                  </div>
                )}
                {reviewsError && !reviewsLoading && (
                  <div className="error-container">
                    <p>{reviewsError}</p>
                  </div>
                )}
                {!reviewsLoading && !reviewsError && reviews.length === 0 && (
                  <p>No reviews yet.</p>
                )}
                {!reviewsLoading && !reviewsError && reviews.length > 0 && (
                  <div className="reviews-list">
                    {reviews.map((rev, idx) => (
                      <div key={rev.reviewId || rev.id || idx} className="review-item" style={{
                        padding: '1.5rem',
                        marginBottom: '1rem',
                        background: '#f9f9f9',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}>
                        <div className="review-header" style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '1rem',
                          paddingBottom: '0.5rem',
                          borderBottom: '1px solid #e0e0e0'
                        }}>
                          <div className="reviewer-info" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <FaUser style={{ color: '#388e3c', fontSize: '1rem' }} />
                            <span className="review-author" style={{
                              fontWeight: '600',
                              color: '#333',
                              fontSize: '1.1rem'
                            }}>
                              {rev.reviewerName || rev.userName || rev.user?.name || 'Anonymous User'}
                            </span>
                          </div>
                          <div className="review-actions" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            {rev.rating != null && (
                              <span className="review-rating" style={{
                                background: '#388e3c',
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                <FaStar style={{ fontSize: '0.8rem' }} />
                                {String(rev.rating)} / 5
                              </span>
                            )}
                            {/* Delete button - only show for user's own reviews */}
                            {user && (user.id === rev.userId || user.userId === rev.userId) && (
                              <button
                                onClick={() => handleDeleteReview(rev.id || rev.reviewId, rev.userId)}
                                style={{
                                  background: '#dc3545',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '0.25rem 0.5rem',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                  transition: 'background 0.2s'
                                }}
                                onMouseEnter={(e) => e.target.style.background = '#c82333'}
                                onMouseLeave={(e) => e.target.style.background = '#dc3545'}
                                title="Delete this review"
                              >
                                <span style={{ fontSize: '0.7rem' }}>×</span>
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="review-body" style={{
                          marginBottom: '1rem'
                        }}>
                          <p style={{
                            margin: 0,
                            lineHeight: '1.6',
                            color: '#555',
                            fontSize: '0.95rem',
                            fontStyle: rev.review || rev.comment || rev.reviewText ? 'normal' : 'italic'
                          }}>
                            {rev.review || rev.comment || rev.reviewText || 'No comment provided'}
                          </p>
                        </div>
                        {(rev.timeStamp || rev.createdAt || rev.dateCreated || rev.timestamp) && (
                          <div className="review-date" style={{
                            textAlign: 'right',
                            paddingTop: '0.5rem',
                            borderTop: '1px solid #f0f0f0'
                          }}>
                            <small style={{
                              color: '#888',
                              fontSize: '0.85rem',
                              fontStyle: 'italic'
                            }}>
                              {(() => {
                                try {
                                  const date = new Date(rev.timeStamp || rev.createdAt || rev.dateCreated || rev.timestamp);
                                  if (isNaN(date.getTime())) {
                                    return 'Date not available';
                                  }
                                  return date.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  });
                                } catch (error) {
                                  return 'Date not available';
                                }
                              })()}
                            </small>
                          </div>
                        )}
                      </div>
                    ))}
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
