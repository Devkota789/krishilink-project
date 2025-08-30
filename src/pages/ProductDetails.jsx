import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaUser, FaStar, FaRegStar, FaCommentDots, FaShoppingCart, FaShoppingBag, FaMapMarkerAlt, FaSeedling, FaComments } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './ProductDetails.css';
import { useAuth } from '../context/AuthContext';
import GoLiveChatModal from '../components/GoLiveChatModal';

const BASE_URL = 'https://w1vqqn7ucvzpndp9xsvdkd15gzcedswvilahs3agd6b3dljo7tg24pbklk4u.shamir.com.np';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review form state
  const [reviewForm, setReviewForm] = useState({
    name: '',
    rating: 5,
    comment: '',
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const { user } = useAuth();
  const [showGoLive, setShowGoLive] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    // eslint-disable-next-line
  }, [productId]);

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
      // For now, we'll use a placeholder empty array since the reviews endpoint is not implemented yet
      setReviews([]);
      setReviewsLoading(false);
      
      // Uncomment this when the reviews endpoint is implemented
      /*
      const response = await fetch(`${BASE_URL}/api/Krishilink/getProductReviews/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      const data = await response.json();
      setReviews(data);
      */
    } catch (err) {
      console.log('Reviews not available yet:', err);
      setReviews([]);
      setReviewsLoading(false);
    }
  };

  const handleBuy = () => {
    alert('Proceed to buy!');
  };

  const handleAddToCart = () => {
    alert('Added to cart!');
  };

  // Handle review form input
  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle review form submit - Updated to show proper message
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('Reviews feature coming soon! Please check back later.');
    setTimeout(() => setReviewError(''), 3000);
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
        <div className="product-details-reviews">
          <h2>
            <FaCommentDots style={{ color: '#388e3c', marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Reviews
          </h2>
          <div className="reviews-list">
            {reviewsLoading ? (
              <p>Loading reviews...</p>
            ) : (
              <p className="reviews-coming-soon">
                Reviews feature is coming soon! Stay tuned for updates.
              </p>
            )}
          </div>
          
          {/* Review Form */}
          <div className="review-form-section">
            <h3>
              <FaCommentDots style={{ color: '#388e3c', marginRight: '0.4rem', verticalAlign: 'middle' }} />
              Add a Review
            </h3>
            {reviewError && (
              <div className="review-error-message">
                {reviewError}
              </div>
            )}
            <form onSubmit={handleReviewSubmit} className="review-form">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={reviewForm.name}
                onChange={handleReviewChange}
                required
              />
              <select
                name="rating"
                value={reviewForm.rating}
                onChange={handleReviewChange}
                required
              >
                {[5, 4, 3, 2, 1].map((num) => (
                  <option key={num} value={num}>
                    {num} Star{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
              <textarea
                name="comment"
                placeholder="Your Review"
                value={reviewForm.comment}
                onChange={handleReviewChange}
                required
                rows={3}
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Submit Review
              </motion.button>
            </form>
          </div>
        </div>
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