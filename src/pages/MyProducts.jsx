import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';
import './MyProducts.css';
import { productAPI } from '../api/api';

// Default placeholder image
const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

const getImageUrl = async (productId) => {
  const token = localStorage.getItem('authToken');
  if (!token || !productId) {
    console.log('No token or productId available');
    return DEFAULT_PLACEHOLDER;
  }

  try {
    const imageUrl = `https://krishilinknew.shamir.com.np/api/KrishilinkAuth/getProductImage/${productId}`;
    const response = await fetch(imageUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.log(`Failed to load image for product ${productId}`);
      return DEFAULT_PLACEHOLDER;
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      console.log(`Empty image blob for product ${productId}`);
      return DEFAULT_PLACEHOLDER;
    }

    return URL.createObjectURL(blob);
  } catch (error) {
    console.error(`Error loading image for product ${productId}:`, error);
    return DEFAULT_PLACEHOLDER;
  }
};

const ProductImage = ({ product }) => {
  const [imageSrc, setImageSrc] = useState(DEFAULT_PLACEHOLDER);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;

  const cleanupBlobUrl = (url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let currentBlobUrl = null;
    
    const loadImage = async () => {
      if (!product?.productId) {
        setImageSrc(DEFAULT_PLACEHOLDER);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const url = await getImageUrl(product.productId);
        
        if (isMounted) {
          cleanupBlobUrl(currentBlobUrl);
          currentBlobUrl = url.startsWith('blob:') ? url : null;
          setImageSrc(url);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading image:', error);
        if (isMounted) {
          if (retryCount < MAX_RETRIES) {
            console.log(`Retrying image load (${retryCount + 1}/${MAX_RETRIES})`);
            setRetryCount(prev => prev + 1);
          } else {
            setImageSrc(DEFAULT_PLACEHOLDER);
            setIsLoading(false);
          }
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
      cleanupBlobUrl(currentBlobUrl);
    };
  }, [product?.productId, retryCount]);

  const handleImageError = (e) => {
    console.log('Image failed to load:', e.target.src);
    if (!e.target.src.startsWith('data:image/svg+xml')) {
      setImageSrc(DEFAULT_PLACEHOLDER);
    }
  };

  return (
    <div className="product-image">
      {isLoading && (
        <div className="image-loading">
          <div className="loading-spinner"></div>
          <div>Loading image...</div>
        </div>
      )}
      <img 
        src={imageSrc}
        alt={product.productName || 'Product Image'}
        onError={handleImageError}
        loading="lazy"
        style={{ 
          width: '100%', 
          height: '200px', 
          objectFit: 'cover',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease'
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const BASE_URL = 'https://krishilink.shamir.com.np';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getMyProducts();
      const data = response.data;
      const validProducts = Array.isArray(data) ? data.map(product => ({
        ...product,
        productId: product.productId || product.id,
        productName: product.productName || 'Unnamed Product',
        description: product.description || 'No description available',
        rate: product.rate || 0,
        availableQuantity: product.availableQuantity || 0,
        location: product.location || 'Location not specified',
        category: product.category || 'Uncategorized'
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
      location: product.location,
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
      setError('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (e, productId) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await productAPI.deleteProduct(productId);
      setProducts(products.filter(product => product.productId !== productId));
        setSelectedProduct(null);
    } catch (err) {
      setError('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return <div className="unauthorized">Please login to view your products</div>;
  }

  return (
    <div className="my-products-page">
      <DashboardNavbar />
      <div className="my-products-container">
        <div className="header-section">
          <h1>My Products</h1>
          <button onClick={() => navigate('/add-product')} className="add-product-button">
            Add New Product
          </button>
        </div>

        {loading && (
          <div className="loading-message">Loading your products...</div>
        )}

        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}

        <div className="products-grid">
          {products.map((product) => (
            <div 
              key={product.productId} 
              className="product-card"
            >
              <ProductImage product={product} />
              <div className="product-info">
                <h3>{product.productName}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-details">
                  <span className="price">Rs. {product.rate}</span>
                  <span className="quantity">Qty: {product.availableQuantity}</span>
                </div>
                <div className="product-location">
                  <i className="fas fa-map-marker-alt"></i> {product.location}
                </div>
                <div className="product-category">
                  Category: {product.category}
                </div>
                <div className="product-actions">
                  <button className="view-btn" onClick={() => handleProductClick(product.productId)}>View</button>
                  <button className="edit-btn" onClick={(e) => handleEditClick(e, product)}>Edit</button>
                  <button 
                    className="delete-btn" 
                    onClick={(e) => handleDeleteProduct(e, product.productId)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View Modal */}
        {selectedProduct && !isEditing && (
          <div className="product-modal">
            <div className="modal-content">
              <h2>{selectedProduct.productName}</h2>
              <p>{selectedProduct.description}</p>
              <div className="modal-details">
                <p><strong>Price:</strong> Rs. {selectedProduct.rate}</p>
                <p><strong>Quantity:</strong> {selectedProduct.availableQuantity}</p>
                <p><strong>Location:</strong> {selectedProduct.location}</p>
                <p><strong>Category:</strong> {selectedProduct.category}</p>
              </div>
              <button onClick={() => setSelectedProduct(null)}>Close</button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditing && selectedProduct && (
          <div className="edit-modal">
            <div className="modal-content">
              <h2>Edit Product</h2>
              <form onSubmit={handleUpdateProduct}>
                <div className="form-group">
                  <label>Product Name:</label>
                  <input
                    type="text"
                    name="productName"
                    value={editFormData.productName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Price (Rs.):</label>
                  <input
                    type="number"
                    name="rate"
                    value={editFormData.rate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Available Quantity:</label>
                  <input
                    type="number"
                    name="availableQuantity"
                    value={editFormData.availableQuantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category:</label>
                  <input
                    type="text"
                    name="category"
                    value={editFormData.category}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Location:</label>
                  <input
                    type="text"
                    name="location"
                    value={editFormData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description:</label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>New Image (optional):</label>
                  <input
                    type="file"
                    name="image"
                    onChange={handleInputChange}
                    accept="image/*"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit">Update Product</button>
                  <button type="button" onClick={() => {
                    setIsEditing(false);
                    setSelectedProduct(null);
                  }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="no-products-message">
            You haven't added any products yet. Click the button above to add your first product!
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyProducts; 