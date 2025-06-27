import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import krishilinkLogo from '../assets/Images/krishilink.jpg';
import './DashboardNavbar.css';

const DashboardNavbar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

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
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          {user?.role === 'farmer' ? (
            <>
              <Link to="/my-products" className="nav-link">My Products</Link>
              <Link to="/add-product" className="nav-link">Add Product</Link>
            </>
          ) : (
            <>
              <Link to="/marketplace" className="nav-link">Marketplace</Link>
              <Link to="/my-orders" className="nav-link">My Orders</Link>
            </>
          )}
        </div>

        <div className="navbar-auth">
          <span className="user-role">{user?.role}</span>
          <button onClick={handleLogout} className="auth-link logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNavbar; 