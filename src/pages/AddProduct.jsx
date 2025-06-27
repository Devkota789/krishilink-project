import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';
import { productAPI } from '../api/api';
import './AddProduct.css';

const AddProduct = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    productName: '',
    rate: '',
    availableQuantity: '',
    category: '',
    location: '',
    description: ''
  });
  
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  if (!user) {
    return (
      <div className="add-product-page">
        <div className="unauthorized">
          <p>Please log in to add products.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select a valid image file.' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size should be less than 5MB.' });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      setMessage({ type: '', text: '' });
    }
  };

  const validateForm = () => {
    if (!formData.productName.trim()) {
      setMessage({ type: 'error', text: 'Product name is required.' });
      return false;
    }
    if (!formData.rate || parseFloat(formData.rate) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid rate.' });
      return false;
    }
    if (!formData.availableQuantity || parseFloat(formData.availableQuantity) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid quantity.' });
      return false;
    }
    if (!formData.category.trim()) {
      setMessage({ type: 'error', text: 'Category is required.' });
      return false;
    }
    if (!formData.location.trim()) {
      setMessage({ type: 'error', text: 'Location is required.' });
      return false;
    }
    if (!imageFile) {
      setMessage({ type: 'error', text: 'Please select an image.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('ProductName', formData.productName ?? '');
      formDataToSend.append('Image', imageFile ?? '');
      formDataToSend.append('Rate', formData.rate !== undefined && formData.rate !== null ? formData.rate : '');
      formDataToSend.append('AvailableQuantity', formData.availableQuantity !== undefined && formData.availableQuantity !== null ? formData.availableQuantity : '');
      formDataToSend.append('Category', formData.category ?? '');
      formDataToSend.append('Location', formData.location ?? '');
      if (formData.description && formData.description.trim()) {
        formDataToSend.append('Description', formData.description.trim());
      }

      // Debug log: show the token being used
      const token = localStorage.getItem('authToken');
      console.log('Token used for addProduct:', token ? token.substring(0, 30) + '...' : 'No token');

      const config = {
         headers: {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${token}`
  }
      };

      const response = await productAPI.addProduct(formDataToSend, config);
      
      if (response.data) {
        setMessage({ type: 'success', text: 'Product added successfully! Redirecting to dashboard...' });
        setFormData({
          productName: '', rate: '', availableQuantity: '', category: '', location: '', description: ''
        });
        setImageFile(null);
        setImagePreview(null);
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to add product.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-product-page">
      <DashboardNavbar />
      
      <div className="add-product-container">
        <div className="button-container">
          <button className="dashboard-button" onClick={() => navigate('/dashboard')}>
            ← Back to Dashboard
          </button>
        </div>

        <h1>Add New Product</h1>

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="productName">Product Name *</label>
            <input
              type="text"
              id="productName"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Product Image *</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {imagePreview && (
              <div style={{ marginTop: '10px' }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '5px' }} 
                />
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="rate">Rate (Price) *</label>
            <input
              type="number"
              id="rate"
              name="rate"
              value={formData.rate}
              onChange={handleInputChange}
              placeholder="Enter price"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="availableQuantity">Available Quantity *</label>
            <input
              type="number"
              id="availableQuantity"
              name="availableQuantity"
              value={formData.availableQuantity}
              onChange={handleInputChange}
              placeholder="Enter available quantity"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a category</option>
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Books">Books</option>
              <option value="Home & Garden">Home & Garden</option>
              <option value="Sports">Sports</option>
              <option value="Automotive">Automotive</option>
              <option value="Health & Beauty">Health & Beauty</option>
              <option value="Toys & Games">Toys & Games</option>
              <option value="Food & Beverages">Food & Beverages</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter product location"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter product description (optional)"
              rows="4"
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
        </form>
      </div>
      
      <Footer />
    </div>
  );
};

export default AddProduct;
