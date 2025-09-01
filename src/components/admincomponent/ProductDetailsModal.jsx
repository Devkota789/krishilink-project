import React from 'react';

const ProductDetailsModal = ({ 
  isOpen, 
  onClose, 
  productDetails, 
  loading, 
  onProductAction 
}) => {
  if (!isOpen) return null;

  const BASE_URL = 'https://w1vqqn7ucvzpndp9xsvdkd15gzcedswvilahs3agd6b3dljo7tg24pbklk4u.shamir.com.np';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          {(() => {
            const p = productDetails || {};
            const headerName = p.name || p.productName || p.title || '';
            return (
              <h3>
                Product Details {headerName ? `- ${headerName}` : ''}
              </h3>
            );
          })()}
          <button className="btn-delete" onClick={onClose}>Close</button>
        </div>
        {loading ? (
          <div className="admin-loading">Loading...</div>
        ) : (
          (() => {
            const p = productDetails || {};
            const id = p.backendId ?? p.productId ?? p.id;
            const name = p.name || p.productName || p.title || 'Unnamed Product';
            const price = p.price ?? p.rate;
            const seller = p.sellerName || p.farmerName;
            const phone = p.sellerPhoneNumber || p.farmerPhoneNumber || p.farmerEmailorPhone;
            const location = p.location || p.address || p.city;
            const category = p.category;
            const qty = p.availableQuantity ?? p.quantity;
            const isActive = typeof p.isActive === 'boolean' ? p.isActive : true;
            const imageUrl = p.imageUrl || (p.imageCode ? `${BASE_URL}/api/Product/getProductImage/${p.imageCode}` : '');
            const created = p.createdAt || p.createdOn || p.addedOn;
            const updated = p.updatedAt || p.updatedOn;
            return (
              <div className="product-details-modal">
                <div className="product-hero">
                  <div className="hero-image">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={name} 
                        onError={(e) => { 
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='; 
                        }} 
                      />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>
                  <div className="hero-info">
                    <h2>{name}</h2>
                    <div className="hero-meta">
                      <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                      {price != null && <span className="pill">₹{price}</span>}
                      {category && <span className="pill">{category}</span>}
                    </div>
                    <p className="hero-desc">{p.description || 'No description provided.'}</p>
                  </div>
                </div>
                <div className="details-grid">
                  {id && (
                    <div className="detail-row">
                      <div className="detail-key">ID</div>
                      <div className="detail-value">{id}</div>
                    </div>
                  )}
                  {seller && (
                    <div className="detail-row">
                      <div className="detail-key">Seller</div>
                      <div className="detail-value">{seller}</div>
                    </div>
                  )}
                  {phone && (
                    <div className="detail-row">
                      <div className="detail-key">Contact</div>
                      <div className="detail-value">{phone}</div>
                    </div>
                  )}
                  {location && (
                    <div className="detail-row">
                      <div className="detail-key">Location</div>
                      <div className="detail-value">{location}</div>
                    </div>
                  )}
                  {qty != null && (
                    <div className="detail-row">
                      <div className="detail-key">Available Qty</div>
                      <div className="detail-value">{qty}</div>
                    </div>
                  )}
                  {created && (
                    <div className="detail-row">
                      <div className="detail-key">Created</div>
                      <div className="detail-value">{new Date(created).toLocaleString()}</div>
                    </div>
                  )}
                  {updated && (
                    <div className="detail-row">
                      <div className="detail-key">Updated</div>
                      <div className="detail-value">{new Date(updated).toLocaleString()}</div>
                    </div>
                  )}
                </div>
                <div className="modal-actions">
                  <button
                    className={isActive ? 'btn-deactivate' : 'btn-activate'}
                    onClick={() => onProductAction(id, isActive ? 'deactivate' : 'activate')}
                  >
                    {isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => onProductAction(id, 'delete')}
                  >
                    Delete
                  </button>
                  {id && (
                    <button
                      className="btn-approve"
                      onClick={() => window.open(`/product/${id}`, '_blank')}
                    >
                      Open Full Page
                    </button>
                  )}
                </div>
                <details style={{ marginTop: '0.75rem' }}>
                  <summary style={{ cursor: 'pointer', color: '#388e3c', fontWeight: 600 }}>
                    View Raw JSON
                  </summary>
                  <pre style={{ whiteSpace: 'pre-wrap', background: '#f7f7f7', padding: '0.75rem', borderRadius: 8 }}>
                    {JSON.stringify(productDetails, null, 2)}
                  </pre>
                </details>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};

export default ProductDetailsModal;
