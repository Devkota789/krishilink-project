import React, { useState, useEffect } from "react";
import { productAPI, orderAPI } from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./Products.css";
import { useNavigate, Link } from "react-router-dom";
import {
  FaSeedling,
  FaMapMarkerAlt,
  FaUser,
  FaPhone,
  FaBoxOpen,
  FaShoppingCart,
  FaComments,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import noImage from "../assets/Images/no-image.png";
import GoLiveChatModal from "../components/GoLiveChatModal";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [nearbyProducts, setNearbyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState({});
  const [orderMessage, setOrderMessage] = useState({ text: "", type: "" });
  const [showGoLive, setShowGoLive] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyProductsLoaded, setNearbyProductsLoaded] = useState(false);
  const BASE_URL = "https://krishilink.shamir.com.np";
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Get user's location first, then fetch products
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Print latitude and longitude to console
        console.log("=== USER LOCATION RETRIEVED ===");
        console.log(`Latitude: ${latitude}`);
        console.log(`Longitude: ${longitude}`);
        console.log("===============================");

        setUserLocation({ latitude, longitude });

        // Fetch nearby products first, then all products
        fetchNearbyProducts(latitude, longitude);
        fetchProducts();
      },
      (error) => {
        console.error("Location error:", error);
        console.log(
          "Location access denied or failed, fetching all products only"
        );
        setLocationLoading(false);
        // If location fails, just fetch all products
        fetchProducts();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  // Fallback timeout for nearby products
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (!nearbyProductsLoaded && products.length === 0) {
        console.log(
          "15 seconds timeout reached - ensuring regular products are loaded"
        );
        fetchProducts();
        setLocationLoading(false);
      }
    }, 15000);

    // Cleanup timeout when nearby products are loaded or component unmounts
    return () => clearTimeout(fallbackTimeout);
  }, [nearbyProductsLoaded, products.length]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching all products...");
      const response = await productAPI.getAllProducts();

      // Log the full response data for debugging
      console.log("Products API response:", response);

      let productsArray = [];
      if (Array.isArray(response.data)) {
        productsArray = response.data;
        console.log("Products array from response.data:", productsArray.length);
      } else if (response.data && Array.isArray(response.data.data)) {
        productsArray = response.data.data;
        console.log(
          "Products array from response.data.data:",
          productsArray.length
        );
      } else {
        console.error("Unexpected API response format:", response);
        setError("Unexpected API response format.");
        setLoading(false);
        return;
      }

      // Map the products to include the image URL
      const productsWithImages = productsArray.map((product) => ({
        ...product,
        imageUrl: product.imageCode
          ? `${BASE_URL}/api/Product/getProductImage/${product.imageCode}`
          : null,
      }));
      console.log("Products with images:", productsWithImages.length);
      setProducts(productsWithImages);
    } catch (err) {
      console.error("Error fetching products:", err);
      console.error("Error details:", err.response?.data);
      setError(
        err.message || "Failed to load products. Please try again later."
      );
    } finally {
      setLoading(false);
      console.log("fetchProducts completed");
    }
  };

  const fetchNearbyProducts = async (latitude, longitude) => {
    try {
      setLocationLoading(true);
      console.log("=== CALLING NEARBY PRODUCTS API ===");
      console.log(
        `API URL: /api/Product/getNearProducts/${latitude},${longitude}`
      );
      console.log(`Latitude being sent: ${latitude}`);
      console.log(`Longitude being sent: ${longitude}`);
      console.log("==================================");

      const response = await productAPI.getNearProducts(latitude, longitude);

      console.log("Nearby Products API response:", response);

      let nearbyProductsArray = [];
      if (response.success && Array.isArray(response.data)) {
        nearbyProductsArray = response.data;
        console.log("Nearby products found:", nearbyProductsArray.length);
      } else if (response.data && Array.isArray(response.data.data)) {
        nearbyProductsArray = response.data.data;
        console.log(
          "Nearby products found (nested):",
          nearbyProductsArray.length
        );
      } else {
        console.log("No nearby products found or unexpected format");
      }

      // Log each product's distance for debugging
      nearbyProductsArray.forEach((product, index) => {
        console.log(
          `Product ${index + 1} distance:`,
          product.distance,
          typeof product.distance
        );
      });

      // Map the nearby products to include the image URL
      const nearbyProductsWithImages = nearbyProductsArray.map((product) => ({
        ...product,
        imageUrl: product.imageCode
          ? `${BASE_URL}/api/Product/getProductImage/${product.imageCode}`
          : null,
      }));
      setNearbyProducts(nearbyProductsWithImages);
      setNearbyProductsLoaded(true);
    } catch (err) {
      console.error("Error fetching nearby products:", err);
      console.error("Nearby products error details:", err.response?.data);
      // If nearby products fail, ensure regular products are loaded
      setNearbyProductsLoaded(true);
    } finally {
      setLocationLoading(false);
      console.log("fetchNearbyProducts completed");
    }
  };

  const handleImageError = (e) => {
    e.target.src = noImage;
  };

  const handleSeeDetails = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleQuantityChange = (productId, value) => {
    setOrderQuantity((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  const handlePlaceOrder = async (product) => {
    if (!user) {
      setOrderMessage({
        text: "Please login to place an order",
        type: "error",
      });
      return;
    }

    if (user.role !== "buyer") {
      setOrderMessage({ text: "Only buyers can place orders", type: "error" });
      return;
    }

    const quantity = orderQuantity[product.productId];
    if (!quantity || quantity <= 0) {
      setOrderMessage({ text: "Please enter a valid quantity", type: "error" });
      return;
    }

    if (quantity > product.availableQuantity) {
      setOrderMessage({
        text: "Order quantity exceeds available quantity",
        type: "error",
      });
      return;
    }

    try {
      const orderData = {
        productId: product.productId,
        quantity: parseInt(quantity),
        buyerId: user.id,
        farmerId: product.farmerId,
        totalAmount: product.rate * quantity,
      };

      const response = await orderAPI.addOrder(orderData);

      setOrderMessage({ text: "Order placed successfully!", type: "success" });
      // Clear the quantity input for this product
      setOrderQuantity((prev) => ({
        ...prev,
        [product.productId]: "",
      }));
      // Refresh products to update available quantity
      fetchProducts();
    } catch (err) {
      console.error("Error placing order:", err);
      setOrderMessage({
        text: err.response?.data?.message || "Failed to place order",
        type: "error",
      });
    }
  };

  const handleLiveChat = (product) => {
    if (!user) {
      navigate("/login");
    } else {
      alert(`Open live chat for product: ${product.productName}`);
    }
  };

  const renderProductCard = (product, isNearby = false) => (
    <motion.div
      key={product.productId}
      className={`product-card ${isNearby ? "nearby-product" : ""}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="product-image" style={{ position: 'relative' }}>
        <img
          src={product.imageUrl || noImage}
          alt={product.productName}
          onError={handleImageError}
        />
        {isNearby && product.distance && (
          <div className="distance-badge">
            📍{" "}
            {typeof product.distance === "string" &&
            product.distance.includes("Km")
              ? product.distance
              : `${product.distance} Km`}
          </div>
        )}
      </div>
      <div className="product-info">
        <h3>{product.productName}</h3>
        {isNearby && product.distance && (
          <div className="distance-info" style={{ color: "#388e3c", fontWeight: 600, marginBottom: 4 }}>
            📍 {typeof product.distance === "string" && product.distance.includes("Km")
              ? product.distance
              : `${product.distance} Km`} away from you
          </div>
        )}
        <p className="price">
          ₹{product.rate} per {product.unit || "kg"}
        </p>
        <p className="description">{product.description}</p>
        <div className="seller-info">
          <p>
            <FaUser /> {product.farmerName}
          </p>
          <p>
            <FaMapMarkerAlt /> {product.city}
          </p>
        </div>
        <div
          className="product-actions"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <button
            className="view-details-btn"
            onClick={() => handleSeeDetails(product.productId)}
          >
            View Details
          </button>
          <button
            className="live-chat-btn"
            onClick={() => setShowGoLive(true)}
            title="Go Live"
            type="button"
          >
            Go Live
          </button>
        </div>
        {user && user.role === "buyer" && (
          <div className="order-section">
            <input
              type="number"
              min="1"
              max={product.availableQuantity}
              value={orderQuantity[product.productId] || ""}
              onChange={(e) =>
                handleQuantityChange(product.productId, e.target.value)
              }
              placeholder="Quantity"
              className="quantity-input"
            />
            <button
              className="order-btn"
              onClick={() => handlePlaceOrder(product)}
            >
              <FaShoppingCart /> Order
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );

  if (loading || locationLoading) {
    return (
      <div>
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (
    error &&
    (error.toLowerCase().includes("not found") ||
      error === "Unexpected API response format.")
  ) {
    // Try to extract a message from the error or API response
    let apiMessage =
      error === "Unexpected API response format."
        ? "No products found."
        : error;
    return (
      <div>
        <Navbar />
        <div className="products-container">
          <h1>Our Products</h1>
          <div className="no-products-message">
            <h2>{apiMessage}</h2>
            <p>
              Please{" "}
              <Link to="/add-product" className="add-product-link">
                add your first product!
              </Link>
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchProducts} className="retry-button">
            Retry
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="products-container">
        <h1>Our Products</h1>
        {orderMessage.text && (
          <div className={`order-message ${orderMessage.type}`}>
            {orderMessage.text}
          </div>
        )}
        {nearbyProducts.length === 0 && products.length === 0 ? (
          <div className="no-products-message">
            <h2>
              {error &&
              (error.toLowerCase().includes("not found") ||
                error === "Unexpected API response format.")
                ? error === "Unexpected API response format."
                  ? "No products found."
                  : error
                : "No products found."}
            </h2>
            <p>
              Please{" "}
              <Link to="/add-product" className="add-product-link">
                add your first product!
              </Link>
            </p>
          </div>
        ) : (
          <>
            {/* Nearby Products Section */}
            {nearbyProducts.length > 0 && (
              <div className="nearby-products-section">
                <h2 className="section-title">
                  📍 Products Near You ({nearbyProducts.length})
                </h2>
                <div className="products-grid">
                  {nearbyProducts.map((product) =>
                    renderProductCard(product, true)
                  )}
                </div>
              </div>
            )}

            {/* All Other Products Section */}
            {products.length > 0 && (
              <div className="all-products-section">
                <h2 className="section-title">
                  🌾 All Products ({products.length})
                </h2>
                <div className="products-grid">
                  {products
                    .filter(
                      (product) =>
                        !nearbyProducts.find(
                          (nearby) => nearby.productId === product.productId
                        )
                    )
                    .map((product) => renderProductCard(product, false))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
      <GoLiveChatModal open={showGoLive} onClose={() => setShowGoLive(false)} />
    </div>
  );
};

export default Products;