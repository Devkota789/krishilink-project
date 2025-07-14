import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';
import './MyProducts.css';
import { productAPI } from '../api/api';
import noImage from '../assets/Images/no-image.png';
import GoLiveChatModal from '../components/GoLiveChatModal';

const BASE_URL = 'https://krishilink.shamir.com.np';

const ProductImage = ({ product }) => {
  const handleImageError = (e) => {
    e.target.src = noImage;
  };

  return (
    <div className="product-image">
      <img 
        src={product.imageUrl || noImage}
        alt={product.productName || 'Product Image'}
        onError={handleImageError}
        loading="lazy"
        style={{ 
          width: '100%', 
          height: '200px', 
          objectFit: 'cover'
        }}
      />
    </div>
  );
};

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    productName: '',
    rate: 0,
    availableQuantity: 0,
    category: '',
    location: '',
    description: '',
    image: null
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [editError, setEditError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showGoLive, setShowGoLive] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getMyProducts();
      if (!response.success) throw new Error(response.error || "Failed to fetch products");
      const data = response.data;
      const validProducts = Array.isArray(data) ? data.map(product => ({
        ...product,
        productId: product.productId || product.id,
        productName: product.productName || 'Unnamed Product',
        description: product.description || 'No description available',
        rate: product.rate || 0,
        availableQuantity: product.availableQuantity || 0,
        location: product.location || 'Location not specified',
        category: product.category || 'Uncategorized',
        imageUrl: product.imageCode ? `${BASE_URL}/api/Product/getProductImage/${product.imageCode}` : null
      })) : [];
      setProducts(validProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.message);
      if (err.message.includes('Unauthorized') || err.message.includes('No authentication token found')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetails = async (productId) => {
    try {
      const response = await productAPI.getMyProduct(productId);
      const productData = response.data;
      setProducts(prevProducts => prevProducts.map(product => 
        product.productId === productId ? { ...product, ...productData } : product
      ));
      setSelectedProduct(productData);
    } catch (err) {
      console.error(`Error fetching details for product ${productId}:`, err);
    }
  };

  const handleProductClick = (productId) => {
    setIsEditing(false);
    fetchProductDetails(productId);
  };

  const handleEditClick = (e, product) => {
    e.stopPropagation();
    setSelectedProduct(null);
    
    setEditFormData({
      productName: product.productName,
      rate: product.rate,
      availableQuantity: product.availableQuantity,
      category: product.category,
      location: product.address,
      description: product.description,
      image: null
    });
    setIsEditing(true);
    setSelectedProduct(product);
  };

  const handleInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEditError('');
    try {
      const formData = new FormData();
      formData.append('ProductName', editFormData.productName);
      formData.append('Rate', editFormData.rate);
      formData.append('AvailableQuantity', editFormData.availableQuantity);
      formData.append('Category', editFormData.category);
      formData.append('Location', editFormData.location);
      formData.append('Description', editFormData.description);
      if (editFormData.image) {
        formData.append('Image', editFormData.image);
      }
      await productAPI.updateProduct(selectedProduct.productId, formData);
      setIsEditing(false);
      fetchProducts();
    } catch (err) {
      let errorMsg = 'Failed to update product';
      if (err.response && err.response.data) {
        const data = err.response.data;
        errorMsg = data.title || data.message || errorMsg;
        if (data.errors) {
          const details = Array.isArray(data.errors)
            ? data.errors
            : Object.values(data.errors).flat();
          errorMsg += ': ' + details.join(', ');
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      setEditError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (e, productId) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await productAPI.deleteProduct(productId);
      fetchProducts();
    } catch (err) {
      setError('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGoLive = (product) => {
    alert(`Go Live for product: ${product.productName}`);
  };

  if (loading) return <div className="loading-container">Loading...</div>;
  if (error && error.toLowerCase().includes('not found')) {
    return (
      <div className='dashboard-container'>
        <DashboardNavbar />
        <div className="my-products-container">
          <h1>My Products</h1>
          <div className="product-list-view">
            <div className="no-products-message">
              <h2>No products found.</h2>
              <p>
                Please <Link to="/add-product" className="add-product-link">add your first product!</Link>
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  if (error) return <div className="error-container">Error: {error}</div>;

  return (
    <div className='dashboard-container'>
      <DashboardNavbar />
      <div className="my-products-container">
          <h1>My Products</h1>
        <div className="product-list-view">
          {products.length === 0 ? (
            <div className="no-products-message">
              <h2>No products found.</h2>
              <p>
                Please <Link to="/add-product" className="add-product-link">add your first product!</Link>
              </p>
            </div>
          ) : (
            products.map(product => (
              <div 
                key={product.productId} 
                className="product-list-item" 
                onClick={() => handleProductClick(product.productId)}
              >
                <ProductImage product={product} />
                <div className="product-details">
                  <h3>{product.productName}</h3>
                  <div className="product-meta">
                    <span>Category: <b>{product.category}</b></span>
                    <span>Location: <b>{product.city}</b></span>
                  </div>
                  <div className="product-stats">
                    <p className="rate">Rate: ₹{product.rate}</p>
                    <p className="available">Available: {product.availableQuantity} {product.unit || 'kg'}</p>
                  </div>
                  </div>
                  <div className="product-actions">
                    <button 
                      className="edit-btn"
                      onClick={(e) => handleEditClick(e, product)}
                    >
                      <span role="img" aria-label="edit">✏️</span> Update
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={(e) => handleDeleteClick(e, product.productId)}
                      disabled={isDeleting}
                    >
                      <span role="img" aria-label="delete">🗑️</span> {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                      className="live-chat-btn"
                      onClick={(e) => { e.stopPropagation(); setShowGoLive(true); }}
                      title="Go Live"
                      type="button"
                    >
                      Go Live
                    </button>
                  </div>
              </div>
            ))
          )}
        </div>

        {isEditing && (
          <div className="edit-form-modal">
            <form onSubmit={handleUpdateProduct}>
              <h2>Edit Product</h2>
              {editError && <div className="edit-error-message">{editError}</div>}
              <input type="text" name="productName" value={editFormData.productName} onChange={handleInputChange} />
              <input type="number" name="rate" value={editFormData.rate} onChange={handleInputChange} />
              <input type="number" name="availableQuantity" value={editFormData.availableQuantity} onChange={handleInputChange} />
              <input type="text" name="category" value={editFormData.category} onChange={handleInputChange} />
              <input type="text" name="location" value={editFormData.location} onChange={handleInputChange} />
              <textarea name="description" value={editFormData.description} onChange={handleInputChange}></textarea>
              <input type="file" name="image" onChange={handleInputChange} />
              <div className="form-actions">
                <button type="submit" disabled={loading}>Update</button>
                <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
      <Footer />
      <GoLiveChatModal open={showGoLive} onClose={() => setShowGoLive(false)} />
    </div>
  );
};

export default MyProducts; 