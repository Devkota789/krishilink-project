import React from 'react';

const ProductDeleteModal = ({ 
  isOpen, 
  onClose, 
  product, 
  onConfirmDelete 
}) => {
  if (!isOpen || !product) return null;

  const handleConfirm = () => {
    onConfirmDelete(product.productId ?? product.backendId ?? product.id);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Delete Product</h3>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="user-delete-warning">
            <div className="warning-icon">⚠️</div>
            <h4>Are you sure you want to delete this product?</h4>
            <p>This action cannot be undone and will permanently remove the product from the system.</p>
          </div>

          <div className="user-details">
            <div className="detail-row">
              <span className="detail-label">Product Name:</span>
              <span className="detail-value">{product.name || product.productName || product.title || 'Unknown'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Price:</span>
              <span className="detail-value">₹{product.price || product.rate || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Seller:</span>
              <span className="detail-value">{product.sellerName || product.farmerName || 'Unknown'}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className="detail-value">
                <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Product ID:</span>
              <span className="detail-value">{product.productId || product.backendId || product.id}</span>
            </div>
          </div>

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
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-delete-confirm" onClick={handleConfirm}>
            Delete Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDeleteModal;

