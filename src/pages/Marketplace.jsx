import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';
import { FaUser, FaPhone, FaMapMarkerAlt, FaShoppingCart, FaSeedling } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Marketplace.css';

const Marketplace = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
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
            ? `https://krishilinknew.shamir.com.np/api/KrishilinkAuth/getProductImage/${product.imageCode}`
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

  const handlePlaceOrder = async (product) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const orderData = {
        productId: product.id,
        quantity: 1, // Default quantity
        totalAmount: product.price
      };

      const response = await orderAPI.placeOrder(orderData);
      
      if (response.data) {
        alert('Order placed successfully!');
        fetchProducts(); // Refresh the product list
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order. Please try again.');
    }
  };

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
          <button onClick={fetchProducts} className="retry-button">
            Retry
          </button>
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
          </div>
        </div>

        <div className="products-grid">
          {products.length === 0 ? (
            <div className="no-products">
              <p>No products available at the moment.</p>
            </div>
          ) : (
            products.map((product) => (
              <motion.div
                key={product.id}
                className="product-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="product-image">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
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
                      <FaMapMarkerAlt /> {product.location}
                    </p>
                  </div>
                  <button
                    className="order-button"
                    onClick={() => handlePlaceOrder(product)}
                    disabled={!user}
                  >
                    <FaShoppingCart /> Place Order
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Marketplace; 