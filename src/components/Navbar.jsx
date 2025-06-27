import React from 'react';
import { Link } from 'react-router-dom';
import krishilinkLogo from '../assets/Images/krishilink.jpg';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <img src={krishilinkLogo} alt="Krishilink Logo" />
        </div>
        
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/products" className="nav-link">Discover Products</Link>
          <Link to="/contact" className="nav-link">Contact Us</Link>
          <Link to="/why-us" className="nav-link">Why Us</Link>
        </div>

        <div className="navbar-auth">
          <Link to="/login" className="auth-link login">Login</Link>
          <Link to="/register" className="auth-link register">Register</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;