import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <p>&copy; {new Date().getFullYear()} Krishilink. All rights reserved </p>
   
    </div>
  </footer>
);

export default Footer;