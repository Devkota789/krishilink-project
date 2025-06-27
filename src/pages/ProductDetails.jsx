import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaUser, FaStar, FaRegStar, FaCommentDots, FaShoppingCart, FaShoppingBag, FaMapMarkerAlt, FaSeedling } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './ProductDetails.css';

const BASE_URL = 'https://krishilink.shamir.com.np';

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
      setProduct(data);
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
            src={`${BASE_URL}/api/Product/getProductImage/${product.imageCode}`}
            alt={product.productName}
            className="product-details-image"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            onError={(e) => {
              console.log('Image failed to load:', e.target.src);
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/400x300?text=No+Image+Available';
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
              <strong>Location:</strong> {product.location}
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
    </div>
  );
};

export default ProductDetails;