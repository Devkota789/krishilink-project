import React, { useState } from 'react';

const ProductsManagement = ({ 
  products, 
  searchTerm, 
  setSearchTerm, 
  onProductAction, 
  onOpenProductDetails 
}) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedProduct) {
      // Debug: Log the selected product to see its structure
      console.log('Selected product for deletion:', selectedProduct);
      
      // Use the primary productId field
      const productId = selectedProduct.productId;
      console.log('Product ID to delete:', productId);
      
      if (!productId) {
        alert('Error: No product ID found for deletion');
        return;
      }
      
      onProductAction(productId, 'delete');
      setShowDeleteModal(false);
      setSelectedProduct(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedProduct(null);
  };
  return (
    <div className="products-management">
      <div className="section-header">
        <h2>Product Management</h2>
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      <div className="products-grid">
        {products.map(product => {
          const productName = product.name || product.productName || product.title || 'Unnamed Product';
          const productImage = product.imageUrl || product.image || product.productImageUrl || '';
          return (
            <div key={product.productId} className="product-card">
              <div className="product-image">
                {productImage ? (
                  <img src={productImage} alt={productName} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
              </div>
              <div className="product-info">
                <h3>{productName}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-price">₹{product.price}</p>
                <p className="product-seller">Seller: {product.sellerName}</p>
                <div className="product-status">
                  <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              <div className="product-actions">
                {product.isActive ? (
                  <button 
                    onClick={() => onProductAction(product.productId, 'deactivate')}
                    className="btn-deactivate"
                  >
                    Deactivate
                  </button>
                ) : (
                  <button 
                    onClick={() => onProductAction(product.productId, 'activate')}
                    className="btn-activate"
                  >
                    Activate
                  </button>
                )}
                <button 
                  onClick={() => onOpenProductDetails(product)}
                  className="btn-approve"
                >
                  View Details
                </button>
                <button 
                  onClick={() => handleDeleteClick(product)}
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content user-delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Product</h3>
              <button className="btn-close" onClick={cancelDelete}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="user-delete-warning">
                <div className="warning-icon">⚠️</div>
                <h4>Are you sure you want to delete this product?</h4>
                <p>This action cannot be undone and will permanently remove the product from the system.</p>
              </div>

              {selectedProduct && (
                <div className="user-details">
                  <div className="detail-row">
                    <span className="detail-label">Product Name:</span>
                    <span className="detail-value">{selectedProduct.name || selectedProduct.productName || selectedProduct.title || 'Unknown'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Price:</span>
                    <span className="detail-value">₹{selectedProduct.price || selectedProduct.rate || 'N/A'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Seller:</span>
                    <span className="detail-value">{selectedProduct.sellerName || selectedProduct.farmerName || 'Unknown'}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Status:</span>
                    <span className="detail-value">
                      <span className={`status-badge ${selectedProduct.isActive ? 'active' : 'inactive'}`}>
                        {selectedProduct.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Product ID:</span>
                    <span className="detail-value">{selectedProduct.productId}</span>
                  </div>
                </div>
              )}

              <div className="delete-consequences">
                <h5>⚠️ This will permanently:</h5>
                <ul>
                  <li>Remove the product from the marketplace</li>
                  <li>Delete all associated product images</li>
                  <li>Cancel any pending orders for this product</li>
                  <li>Remove product from seller's inventory</li>
                </ul>
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn-delete-confirm" onClick={confirmDelete}>
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManagement;
