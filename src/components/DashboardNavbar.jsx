import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import krishilinkLogo from '../assets/Images/krishilink.jpg';
import './DashboardNavbar.css';
import GoLiveChatModal from './GoLiveChatModal';
import NatureButton from '../components/NatureButton';

const DashboardNavbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showGoLive, setShowGoLive] = useState(false);

  const isAdminPage = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/dashboard">
            <img src={krishilinkLogo} alt="Krishilink Logo" />
          </Link>
        </div>

        <div className="navbar-links">
          {user?.role === 'admin' ? (
            <>
              <Link to="/admin" className="nav-link admin-link">Admin Panel</Link>
            </>
          ) : (
            <>
              {!isAdminPage && (
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
              )}
              {user?.role === 'farmer' ? (
                <>
                  <Link to="/my-products" className="nav-link">My Products</Link>
                  <Link to="/add-product" className="nav-link">Add Product</Link>
                  <NatureButton
                    className="nav-link go-live-btn"
                    type="button"
                    onClick={() => setShowGoLive(true)}
                    style={{ border: '2px solid #388e3c', background: '#fff', color: '#388e3c', borderRadius: 8, fontWeight: 600, cursor: 'pointer', minWidth: 120, marginLeft: 8 }}
                  >
                    Go Live
                  </NatureButton>
                </>
              ) : (
                <>
                  {!isAdminPage && (
                    <Link to="/marketplace" className="nav-link">Marketplace</Link>
                  )}
                </>
              )}
            </>
          )}
        </div>

        <div className="navbar-auth">
          <span className="user-role">{user?.role}</span>
          <NatureButton onClick={handleLogout} className="auth-link logout">
            Logout
          </NatureButton>
        </div>
      </div>
      <GoLiveChatModal open={showGoLive} onClose={() => setShowGoLive(false)} />
    </nav>
  );
};

export default DashboardNavbar; 