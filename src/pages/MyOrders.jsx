import React, { useState, useEffect } from 'react';
import { orderAPI, productAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';
import NatureButton from '../components/NatureButton';
import { FaBox, FaUser, FaPhone, FaMapMarkerAlt, FaCalendar, FaRupeeSign, FaEye, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './MyOrders.css';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const { user } = useAuth();
  const BASE_URL = 'https://w1vqqn7ucvzpndp9xsvdkd15gzcedswvilahs3agd6b3dljo7tg24pbklk4u.shamir.com.np';

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await orderAPI.getMyOrders();
      
      if (response.data) {
        // Fetch product details for each order
        const ordersWithProducts = await Promise.all(
          response.data.map(async (order) => {
            try {
              const productResponse = await productAPI.getProductById(order.productId);
              return {
                ...order,
                product: productResponse.data,
                productImageUrl: productResponse.data?.imageCode 
                  ? `${BASE_URL}/api/Product/getProductImage/${productResponse.data.imageCode}`
                  : null
              };
            } catch (err) {
              console.error(`Error fetching product ${order.productId}:`, err);
              return {
                ...order,
                product: null,
                productImageUrl: null
              };
            }
          })
        );
        setOrders(ordersWithProducts);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, { orderStatus: newStatus });
      // Refresh orders after update
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status. Please try again.');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await orderAPI.deleteOrder(orderId);
        // Refresh orders after deletion
        fetchOrders();
      } catch (err) {
        console.error('Error deleting order:', err);
        alert('Failed to delete order. Please try again.');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'confirmed':
      case 'accepted':
        return 'confirmed';
      case 'rejected':
      case 'cancelled':
        return 'rejected';
      case 'completed':
      case 'delivered':
        return 'completed';
      default:
        return 'pending';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'paid':
      case 'cod':
        return 'paid';
      case 'failed':
      case 'refunded':
        return 'failed';
      default:
        return 'pending';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="orders-page">
        <DashboardNavbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <DashboardNavbar />
        <div className="error-container">
          <p>{error}</p>
          <NatureButton onClick={fetchOrders} className="retry-button">
            Retry
          </NatureButton>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="orders-page">
      <DashboardNavbar />
      <div className="orders-container">
        <h1>
          <FaBox /> My Orders
        </h1>
        
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found.</p>
            <p>Start shopping to see your orders here!</p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <motion.div
                key={order.orderId}
                className="order-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="order-header">
                  <h3>Order #{order.orderId}</h3>
                  <div className="order-statuses">
                    <span className={`order-status ${getStatusColor(order.orderStatus)}`}>
                      {order.orderStatus || 'Pending'}
                    </span>
                    <span className={`payment-status ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus || 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="order-details">
                  {order.product && (
                    <div className="product-info">
                      <div className="product-image">
                        <img 
                          src={order.productImageUrl || 'https://via.placeholder.com/80x80?text=No+Image'} 
                          alt={order.product.productName}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                          }}
                        />
                      </div>
                      <div className="product-details">
                        <h4>{order.product.productName}</h4>
                        <p><strong>Quantity:</strong> {order.productQuantity} kg</p>
                        <p><strong>Price:</strong> ₹{order.totalPrice}</p>
                      </div>
                    </div>
                  )}

                  <div className="order-meta">
                    <p><FaCalendar /> <strong>Order Date:</strong> {formatDate(order.orderDate)}</p>
                    {order.refundStatus && (
                      <p><strong>Refund Status:</strong> {order.refundStatus}</p>
                    )}
                  </div>

                  <div className="order-actions">
                    <NatureButton
                      className="view-details-btn"
                      onClick={() => handleViewOrderDetails(order)}
                    >
                      <FaEye /> View Details
                    </NatureButton>
                    
                    {user?.role === 'farmer' && order.orderStatus?.toLowerCase() === 'pending' && (
                      <div className="farmer-actions">
                        <NatureButton
                          className="accept-btn"
                          onClick={() => handleUpdateOrderStatus(order.orderId, 'confirmed')}
                        >
                          Accept
                        </NatureButton>
                        <NatureButton
                          className="reject-btn"
                          onClick={() => handleUpdateOrderStatus(order.orderId, 'rejected')}
                        >
                          Reject
                        </NatureButton>
                      </div>
                    )}
                    
                    {user?.role === 'buyer' && order.orderStatus?.toLowerCase() === 'pending' && (
                      <NatureButton
                        className="cancel-btn"
                        onClick={() => handleUpdateOrderStatus(order.orderId, 'cancelled')}
                      >
                        Cancel Order
                      </NatureButton>
                    )}
                    
                    <NatureButton
                      className="delete-btn"
                      onClick={() => handleDeleteOrder(order.orderId)}
                    >
                      <FaTrash /> Delete
                    </NatureButton>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="modal-overlay" onClick={handleCloseOrderDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details - #{selectedOrder.orderId}</h2>
              <NatureButton className="close-btn" onClick={handleCloseOrderDetails}>×</NatureButton>
            </div>
            
            <div className="modal-body">
              {selectedOrder.product && (
                <div className="product-detail-section">
                  <h3>Product Information</h3>
                  <div className="product-detail-grid">
                    <div className="product-image-large">
                      <img 
                        src={selectedOrder.productImageUrl || 'https://via.placeholder.com/200x200?text=No+Image'} 
                        alt={selectedOrder.product.productName}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="product-info-detailed">
                      <h4>{selectedOrder.product.productName}</h4>
                      <p><strong>Description:</strong> {selectedOrder.product.description}</p>
                      <p><strong>Category:</strong> {selectedOrder.product.category}</p>
                      <p><strong>Price per kg:</strong> ₹{selectedOrder.product.rate}</p>
                      <p><strong>Quantity Ordered:</strong> {selectedOrder.productQuantity} kg</p>
                      <p><strong>Total Price:</strong> ₹{selectedOrder.totalPrice}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="order-detail-section">
                <h3>Order Information</h3>
                <div className="order-info-grid">
                  <p><strong>Order ID:</strong> {selectedOrder.orderId}</p>
                  <p><strong>Order Date:</strong> {formatDate(selectedOrder.orderDate)}</p>
                  <p><strong>Order Status:</strong> 
                    <span className={`status-badge ${getStatusColor(selectedOrder.orderStatus)}`}>
                      {selectedOrder.orderStatus || 'Pending'}
                    </span>
                  </p>
                  <p><strong>Payment Status:</strong> 
                    <span className={`status-badge ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                      {selectedOrder.paymentStatus || 'Pending'}
                    </span>
                  </p>
                  {selectedOrder.refundStatus && (
                    <p><strong>Refund Status:</strong> {selectedOrder.refundStatus}</p>
                  )}
                </div>
              </div>

              {selectedOrder.product && (
                <div className="seller-detail-section">
                  <h3>Seller Information</h3>
                  <div className="seller-info">
                    <p><FaUser /> <strong>Name:</strong> {selectedOrder.product.farmerName}</p>
                    <p><FaPhone /> <strong>Contact:</strong> {selectedOrder.product.farmerEmailorPhone}</p>
                    <p><FaMapMarkerAlt /> <strong>Location:</strong> {selectedOrder.product.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyOrders;
