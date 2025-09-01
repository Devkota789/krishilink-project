import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaUser, FaShoppingCart, FaShoppingBag, FaMapMarkerAlt, FaSeedling, FaInfoCircle, FaStar } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './ProductDetails.css';
import { useAuth } from '../context/AuthContext';
import GoLiveChatModal from '../components/GoLiveChatModal';
import { reviewAPI } from '../api/api';

const BASE_URL = 'https://w1vqqn7ucvzpndp9xsvdkd15gzcedswvilahs3agd6b3dljo7tg24pbklk4u.shamir.com.np';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('details'); // 'details' or 'reviews'
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState('');


  const { user } = useAuth();
  const [showGoLive, setShowGoLive] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Check if user is properly authenticated
  const isAuthenticated = user && localStorage.getItem('authToken');

  // Debug logging
  console.log('User object:', user);
  console.log('Auth token:', localStorage.getItem('authToken'));
  console.log('Is authenticated:', isAuthenticated);

  // Validate authentication state
  const validateAuth = () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    // If no token but user data exists, clear the user data
    if (!token && userData) {
      localStorage.removeItem('user');
      console.log('Cleared invalid user data - no token found');
      return false;
    }
    
    // If token exists but no user data, clear the token
    if (token && !userData) {
      localStorage.removeItem('authToken');
      console.log('Cleared invalid token - no user data found');
      return false;
    }
    
    return !!(token && userData);
  };

  const isValidAuth = validateAuth();

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line
  }, [productId]);

  useEffect(() => {
    if (activeSection === 'reviews' && productId) {
      fetchReviews();
    }
  }, [activeSection, productId]);

  // Validate authentication on component mount
  useEffect(() => {
    validateAuth();
  }, []);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/Product/getProduct/${productId}`);
      if (!response.ok) throw new Error('Product not found');
      const data = await response.json();
      console.log('Product data:', data);
      const prod = data.data || data;
      setProduct({
        ...prod,
        imageUrl: prod.imageCode ? `${BASE_URL}/api/Product/getProductImage/${prod.imageCode}` : null
      });
      setLoading(false);
    } catch (err) {
      setError(err.message);
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




  const handleBuy = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      alert('Proceed to buy!');
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      alert('Added to cart!');
    }
  };




  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', margin: '2rem' }}>Loading...</div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div>
        <Navbar />
        <div style={{ textAlign: 'center', margin: '2rem' }}>
          {error || 'Product not found.'}
        </div>
        <Footer />
      </div>
    );
  }

  // Typing indicator component for the FAB
  const TypingDots = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '32px' }}>
      <span className="typing-dot" style={{
        display: 'inline-block',
        width: '10px',
        height: '10px',
        margin: '0 3px',
        borderRadius: '50%',
        background: '#fff',
        animation: 'typing-bounce 1.2s infinite',
        animationDelay: '0s',
      }}></span>
      <span className="typing-dot" style={{
        display: 'inline-block',
        width: '10px',
        height: '10px',
        margin: '0 3px',
        borderRadius: '50%',
        background: '#fff',
        animation: 'typing-bounce 1.2s infinite',
        animationDelay: '0.2s',
      }}></span>
      <span className="typing-dot" style={{
        display: 'inline-block',
        width: '10px',
        height: '10px',
        margin: '0 3px',
        borderRadius: '50%',
        background: '#fff',
        animation: 'typing-bounce 1.2s infinite',
        animationDelay: '0.4s',
      }}></span>
      <style>{`
        @keyframes typing-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  );

  return (
    <div>
      <Navbar />
      
      <motion.div
        className="product-details-container"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Navigation Tabs */}
        <div className="section-navigation" style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem',
          borderBottom: '2px solid #e0e0e0',
          paddingBottom: '1rem'
        }}>
          <button 
            className={`nav-tab ${activeSection === 'details' ? 'active' : ''}`}
            onClick={() => setActiveSection('details')}
            style={{
              padding: '0.75rem 1.5rem',
              margin: '0 0.5rem',
              border: 'none',
              borderRadius: '8px',
              background: activeSection === 'details' ? '#388e3c' : '#f5f5f5',
              color: activeSection === 'details' ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            <FaInfoCircle style={{ marginRight: '0.5rem' }} />
            Product Details
          </button>
          <button 
            className={`nav-tab ${activeSection === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveSection('reviews')}
            style={{
              padding: '0.75rem 1.5rem',
              margin: '0 0.5rem',
              border: 'none',
              borderRadius: '8px',
              background: activeSection === 'reviews' ? '#388e3c' : '#f5f5f5',
              color: activeSection === 'reviews' ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.3s ease'
            }}
          >
            <FaStar style={{ marginRight: '0.5rem' }} />
            Reviews
          </button>
        </div>

        {/* Product Details Section */}
        {activeSection === 'details' && (
          <>
            <div className="product-details-main">
              <motion.img
                src={product.imageUrl || require('../assets/Images/no-image.png')}
                alt={product.productName}
                className="product-details-image"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                onError={(e) => {
                  console.log('Image failed to load:', e.target.src);
                  e.target.onerror = null;
                  e.target.src = require('../assets/Images/no-image.png');
                }}
              />
              <div className="product-details-info">
                <h1>
                  <FaSeedling style={{ color: '#388e3c', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                  {product.productName}
                </h1>
                <p className="product-details-price">
                  <FaShoppingBag style={{ color: '#ff9800', marginRight: '0.4rem', verticalAlign: 'middle' }} />
                  Rs. {product.rate} per kg
                </p>
                <p>
                  <strong>Available:</strong> {product.availableQuantity} kg
                </p>
                <p>
                  <FaMapMarkerAlt style={{ color: '#388e3c', marginRight: '0.3rem', verticalAlign: 'middle' }} />
                  <strong>Location:</strong> {product.city}
                </p>
                <p>
                  <FaUser style={{ color: '#388e3c', marginRight: '0.3rem', verticalAlign: 'middle' }} />
                  <strong>Farmer:</strong> {product.farmerName} ({product.farmerPhoneNumber})
                </p>
                <div className="product-details-buttons">
                  <motion.button
                    className="buy-btn"
                    onClick={handleBuy}
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <FaShoppingBag style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                    Buy
                  </motion.button>
                  <motion.button
                    className="cart-btn"
                    onClick={handleAddToCart}
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <FaShoppingCart style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                    Add to Cart
                  </motion.button>
                </div>
              </div>
            </div>
            <div className="product-details-description">
              <h2>Description</h2>
              <p>{product.description || 'No description available.'}</p>
            </div>
          </>
        )}

        {/* Reviews Section */}
        {activeSection === 'reviews' && (
          <div className="reviews-section" style={{
            padding: '2rem',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <div className="section-header" style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '2rem',
              paddingBottom: '1rem',
              borderBottom: '2px solid #e0e0e0'
            }}>
              <FaStar style={{ color: '#ff9800', marginRight: '0.5rem', fontSize: '1.5rem' }} />
              <h2 style={{ margin: 0, color: '#333' }}>Customer Reviews</h2>
            </div>

            {/* Login Required for Reviews */}
            <div className="add-review-section" style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              background: '#fff3cd',
              borderRadius: '8px',
              border: '1px solid #ffeaa7',
              textAlign: 'center'
            }}>
              <h3 style={{
                margin: '0 0 1rem 0',
                color: '#856404',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FaStar style={{ color: '#ff9800', marginRight: '0.5rem' }} />
                Want to Write a Review?
              </h3>
              <p style={{ margin: '0 0 1rem 0', color: '#856404' }}>
                Please log in to write a review for this product.
              </p>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: '#388e3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.75rem 1.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                Go to Login
              </button>
            </div>
            
            {reviewsLoading && (
              <div className="loading-container" style={{
                textAlign: 'center',
                padding: '2rem'
              }}>
                <div className="loading-spinner" style={{
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #388e3c',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1rem'
                }}></div>
                <p>Loading reviews...</p>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            )}
            
            {reviewsError && !reviewsLoading && (
              <div className="error-container" style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#d32f2f',
                background: '#ffebee',
                borderRadius: '8px',
                border: '1px solid #ffcdd2'
              }}>
                <p>{reviewsError}</p>
              </div>
            )}
            
            {!reviewsLoading && !reviewsError && reviews.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#666'
              }}>
                <FaStar style={{ fontSize: '3rem', color: '#ddd', marginBottom: '1rem' }} />
                <h3>No reviews yet</h3>
                <p>Be the first to review this product!</p>
              </div>
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
                                month: 'numeric',
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
      </motion.div>
      
      <Footer />
      {/* Floating Action Button for Chat - always visible */}
      <button
        className="fab-chat"
        title="Chat with Farmer"
        onClick={() => {
          if (user) {
            setShowGoLive(true);
          } else {
            setShowLoginPrompt(true);
          }
        }}
        style={{
          position: 'fixed',
          bottom: '32px',
          right: '32px',
          zIndex: 1000,
          background: '#388e3c',
          color: 'white',
          border: 'none',
          borderRadius: '32px',
          width: 'auto',
          height: '64px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          cursor: 'pointer',
          transition: 'background 0.2s',
          padding: '0 24px',
          gap: '16px',
        }}
      >
        <TypingDots />
        <span style={{ fontSize: '1.1rem', fontWeight: 600, letterSpacing: 0.2, color: '#fff', marginLeft: 8 }}>
          Chat With Farmer
        </span>
      </button>
      {/* Simple login prompt modal */}
      {showLoginPrompt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            minWidth: '320px',
            textAlign: 'center'
          }}>
            <h2>Please log in to chat with the farmer</h2>
            <button
              style={{
                marginTop: '1.5rem',
                background: '#388e3c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.7rem 1.5rem',
                fontSize: '1.1rem',
                cursor: 'pointer',
              }}
              onClick={() => {
                setShowLoginPrompt(false);
                window.location.href = '/login';
              }}
            >
              Go to Login
            </button>
            <button
              style={{
                marginTop: '1.5rem',
                marginLeft: '1rem',
                background: '#eee',
                color: '#333',
                border: 'none',
                borderRadius: '8px',
                padding: '0.7rem 1.5rem',
                fontSize: '1.1rem',
                cursor: 'pointer',
              }}
              onClick={() => setShowLoginPrompt(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* GoLiveChatModal for real-time chat */}
      <GoLiveChatModal open={showGoLive} onClose={() => setShowGoLive(false)} />
    </div>
  );
};

export default ProductDetails;