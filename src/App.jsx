import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Products from './pages/Products';
import Register from './pages/Register';
import Login from './pages/Login';
import './App.css';
import Contact from './pages/Contact';
import WhyUs from './pages/WhyUs';
import { AuthProvider } from './context/AuthContext';
import ProductDetails from './pages/ProductDetails';
import Dashboard from './DashBoard/DashBoard'; // Fixed import
import AddProduct from './pages/AddProduct';
import MyProducts from './pages/MyProducts';
import MyOrders from './pages/MyOrders';
import PrivateRoute from './components/PrivateRoute';
import Marketplace from './pages/Marketplace';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/why-us" element={<WhyUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join" element={<Register />} />
          <Route path="/products/:productId" element={<ProductDetails />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/add-product" element={<PrivateRoute><AddProduct /></PrivateRoute>} />
          <Route path="/my-products" element={<PrivateRoute><MyProducts /></PrivateRoute>} />
          <Route path="/my-orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
          <Route path="/marketplace" element={<PrivateRoute><Marketplace /></PrivateRoute>} />
          {/* Fallback route for 404 Not Found */}
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </Router>
      
    </AuthProvider>
  );
}

export default App;