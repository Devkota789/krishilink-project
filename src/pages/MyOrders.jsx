import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';
import { FaBox, FaUser, FaPhone, FaCalendarAlt, FaCheck, FaTimes } from 'react-icons/fa';
import './MyOrders.css';

const MyOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BASE_URL = 'https://krishilinknew.shamir.com.np';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const endpoint = user.role === 'farmer' 
        ? `${BASE_URL}/api/KrishilinkAuth/getFarmerOrders`
        : `${BASE_URL}/api/KrishilinkAuth/getBuyerOrders`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (user.role !== 'farmer') return;

    try {
      const response = await fetch(`${BASE_URL}/api/KrishilinkAuth/updateOrderStatus`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          orderId,
          status: newStatus


          
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Refresh orders after successful update
      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="orders-page">
        <DashboardNavbar />
        <div className="loading">Loading orders...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <DashboardNavbar />
        <div className="error">Error: {error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="orders-page">
      <DashboardNavbar />
      <div className="orders-container">
        <h1>
          <FaBox style={{ color: '#388e3c', marginRight: '0.5rem', verticalAlign: 'middle' }} />
          {user.role === 'farmer' ? 'Orders Received' : 'My Orders'}
        </h1>

        {orders.length === 0 ? (
          <div className="no-orders">No orders found</div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <div key={order.orderId} className="order-card">
                <div className="order-header">
                  <h3>Order #{order.orderId}</h3>
                  <span className={`order-status ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>

                <div className="order-details">
                  <div className="product-info">
                    <h4>{order.productName}</h4>
                    <p>Quantity: {order.quantity} kg</p>
                    <p>Total: Rs. {order.totalAmount}</p>
                  </div>

                  <div className="user-info">
                    {user.role === 'farmer' ? (
                      <>
                        <p>
                          <FaUser style={{ marginRight: '0.3rem' }} />
                          Buyer: {order.buyerName}
                        </p>
                        <p>
                          <FaPhone style={{ marginRight: '0.3rem' }} />
                          Contact: {order.buyerPhone}
                        </p>
                      </>
                    ) : (
                      <>
                        <p>
                          <FaUser style={{ marginRight: '0.3rem' }} />
                          Farmer: {order.farmerName}
                        </p>
                        <p>
                          <FaPhone style={{ marginRight: '0.3rem' }} />
                          Contact: {order.farmerPhone}
                        </p>
                      </>
                    )}
                    <p>
                      <FaCalendarAlt style={{ marginRight: '0.3rem' }} />
                      Date: {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>

                  {user.role === 'farmer' && order.status === 'Pending' && (
                    <div className="order-actions">
                      <button
                        className="accept-btn"
                        onClick={() => handleUpdateOrderStatus(order.orderId, 'Accepted')}
                      >
                        <FaCheck /> Accept
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleUpdateOrderStatus(order.orderId, 'Rejected')}
                      >
                        <FaTimes /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyOrders; 