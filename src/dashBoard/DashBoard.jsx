
// export default DashBoard;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import './DashBoard.css';

const DashBoard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleAddProduct = () => {
    navigate('/add-product');
  };

  const handleViewProducts = () => {
    navigate('/marketplace');
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;
  if (!user) return <div className="dashboard-unauthorized">Not authorized</div>;

  return (
    <div className="dashboard-page">
      <DashboardNavbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            Welcome, {user.fullName || user.name || user.username}
          </h1>
          <p className="dashboard-subtitle">Manage your {user.role === 'farmer' ? 'farm products' : 'purchases'}</p>
        </div>

        <div className="dashboard-grid">
          {/* User Profile Section */}
          <div className="dashboard-card profile-section">
            <h2>Profile Information</h2>
            <div className="user-details">
              <p><strong>Role:</strong> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Phone:</strong> {user.phoneNumber}</p>
            
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="dashboard-card actions-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              {user.role === 'farmer' ? (
                <>
                  <button onClick={handleAddProduct} className="action-button">
                    Add New Product
                  </button>
                  <button onClick={() => navigate('/my-products')} className="action-button">
                    View My Products
                  </button>
                  <button onClick={() => navigate('/my-orders')} className="action-button">
                    View Orders
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleViewProducts} className="action-button">
                    Browse Products
                  </button>
                  <button onClick={() => navigate('/my-orders')} className="action-button">
                    My Orders
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DashBoard;