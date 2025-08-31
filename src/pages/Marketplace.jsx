import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';
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
  const BASE_URL = 'https://w1vqqn7ucvzpndp9xsvdkd15gzcedswvilahs3agd6b3dljo7tg24pbklk4u.shamir.com.np';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAllProducts();
      console.log('Products response:', response);
      if (response.data) {
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

  const handleProductClick = (productId) => {
    navigate(`/marketplace-product/${productId}`);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(products.map(product => product.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="marketplace-container">
        <DashboardNavbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="marketplace-container">
        <DashboardNavbar />
        <div className="error-container">
          <p>Error: {error}</p>
          <button className="retry-button" onClick={fetchProducts}>
            Retry
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="marketplace-container">
      <DashboardNavbar />
      <div className="marketplace-content">
        <div className="marketplace-header">
          <h1>Marketplace</h1>
          <div className="marketplace-filters">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <p>No products found.</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                className="product-card"
                onClick={() => handleProductClick(product.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
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
                  <p className="click-hint">Click here for more details</p>
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