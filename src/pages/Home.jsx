import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaSeedling, FaShoppingBasket, FaUserPlus } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <Navbar />
      <motion.div
        className="hero-section"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <motion.h1
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <FaSeedling style={{ color: '#388e3c', marginRight: '0.5rem', verticalAlign: 'middle' }} />
          Welcome to Krishilink
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
        >
          <FaShoppingBasket style={{ color: '#ff9800', marginRight: '0.4rem', verticalAlign: 'middle' }} />
          Connecting Farmers with Quality Products
        </motion.p>
        <div className="cta-buttons">
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Link to="/products" className="cta-button discover">
              <FaShoppingBasket style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
              Discover Products
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Link to="/join" className="cta-button join">
              <FaUserPlus style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
              Join Krishilink
            </Link>
          </motion.div>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default Home;