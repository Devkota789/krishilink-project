
// export default DashBoard;
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardNavbar from '../components/DashboardNavbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import './DashBoard.css';
import NatureButton from '../components/NatureButton';

function CropDetectionTool() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult("");
    }
  };

  const handleDetect = async () => {
    if (!selectedFile) return;
    const token = localStorage.getItem('authToken');
    if (!token) {
      setResult("You are not logged in. Please log in to use this feature.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("cropImage", selectedFile);
    try {
      const response = await fetch("https://w1vqqn7ucvzpndp9xsvdkd15gzcedswvilahs3agd6b3dljo7tg24pbklk4u.shamir.com.np/api/AI/detectDisease", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });
      if (response.status === 401) {
        setResult("Authentication failed. Please log in again.");
        setLoading(false);
        return;
      }
      const text = await response.text();
      setResult(text);
    } catch (err) {
      setResult("Error detecting disease. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      border: "1px solid #e0e0e0",
      borderRadius: 12,
      padding: 24,
      margin: "24px 0",
      background: "#fafafa",
      maxWidth: 500
    }}>
      <h2>🌱 Crop Disease Detection AI</h2>
      <p>Upload a photo of your crop to detect diseases and get solutions.</p>
      <NatureButton onClick={() => fileInputRef.current.click()} style={{ marginBottom: 12 }}>
        📷 Choose Image
      </NatureButton>
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      {preview && (
        <div style={{ margin: "12px 0" }}>
          <img src={preview} alt="Crop Preview" style={{ maxWidth: 200, borderRadius: 8 }} />
        </div>
      )}
      {selectedFile && (
        <NatureButton onClick={handleDetect} disabled={loading} style={{ marginBottom: 12 }}>
          {loading ? "Detecting..." : "Detect Disease"}
        </NatureButton>
      )}
      {result && (
        <div style={{
          background: "#e8f5e9",
          border: "1px solid #a5d6a7",
          borderRadius: 8,
          padding: 16,
          marginTop: 16,
          whiteSpace: "pre-line"
        }}>
          <strong>Result:</strong>
          <div>{result}</div>
        </div>
      )}
    </div>
  );
}

const DashBoard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  // AI Chat state
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]); // { sender: 'user'|'ai', message: string }
  const [chatOpen, setChatOpen] = useState(false);
  const chatEndRef = useRef(null);

  const handleAddProduct = () => {
    navigate('/add-product');
  };

  const handleViewProducts = () => {
    navigate('/marketplace');
  };

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, chatOpen]);

  // AI Chat handler
  const handleSendToAI = async () => {
    if (!aiInput.trim()) return;
    const userMessage = aiInput;
    setChatHistory(prev => [...prev, { sender: 'user', message: userMessage }]);
    setAiInput("");
    setAiLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch("https://w1vqqn7ucvzpndp9xsvdkd15gzcedswvilahs3agd6b3dljo7tg24pbklk4u.shamir.com.np/api/AI/chatWithAI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(userMessage),
      });
      const text = await res.text();
      setChatHistory(prev => [...prev, { sender: 'ai', message: text }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { sender: 'ai', message: "Error: " + err.message }]);
    }
    setAiLoading(false);
  };

  if (loading) return <div className="dashboard-loading">Loading...</div>;
  if (!user) return <div className="dashboard-unauthorized">Not authorized</div>;
  
  // Redirect admins to admin panel
  if (user.role === 'admin') {
    navigate('/admin');
    return null;
  }

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

        {/* Big Animated Robot Icon for AI Chat - Fixed Bottom Right */}
        {user.role === 'farmer' && !chatOpen && (
          <div
            className="big-robot-icon-animate ai-robot-fixed"
            onClick={() => setChatOpen(true)}
            style={{
              position: 'fixed',
              bottom: 112,
              right: 40,
              width: 110,
              height: 110,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #e8f5e9 60%, #81c784 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 32px #388e3c22',
              zIndex: 1100,
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
              userSelect: 'none',
            }}
            title="Chat with Krishi AI"
          >
            {/* Large Chat Bubble Icon */}
            <span style={{ width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" fill="#e8f5e9" stroke="#81c784" strokeWidth="2" />
                <path d="M16 44V24a8 8 0 0 1 8-8h16a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8H24l-8 8z" fill="#fff" stroke="#388e3c" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="28" cy="34" r="2.5" fill="#81c784" />
                <circle cx="36" cy="34" r="2.5" fill="#81c784" />
              </svg>
            </span>
            {/* Animated chat dots */}
            <span className="chat-dots-animate" style={{
              display: 'flex',
              gap: 4,
              marginTop: 4,
            }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4caf50', opacity: 0.7, animation: 'dot-bounce 1.2s infinite 0s' }}></span>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4caf50', opacity: 0.7, animation: 'dot-bounce 1.2s infinite 0.2s' }}></span>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#4caf50', opacity: 0.7, animation: 'dot-bounce 1.2s infinite 0.4s' }}></span>
            </span>
            <div style={{ fontWeight: 700, color: '#388e3c', fontSize: 16, letterSpacing: 1, textShadow: '0 2px 8px #e8f5e9', marginTop: 2 }}>
              Krishi AI
            </div>
          </div>
        )}
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
                  <NatureButton onClick={handleAddProduct} className="action-button">
                    Add New Product
                  </NatureButton>
                  <NatureButton onClick={() => navigate('/my-products')} className="action-button">
                    View My Products
                  </NatureButton>
                  <NatureButton onClick={() => navigate('/my-orders')} className="action-button">
                    View Orders
                  </NatureButton>
                </>
              ) : (
                <>
                  <NatureButton onClick={handleViewProducts} className="action-button">
                    Browse Products
                  </NatureButton>
                  <NatureButton onClick={() => navigate('/my-orders')} className="action-button">
                    My Orders
                  </NatureButton>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Full Screen AI Chat Modal */}
        {user.role === 'farmer' && chatOpen && (
          <div
            className="ai-chat-modal"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0,0,0,0.18)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{
              width: '100vw',
              height: '100vh',
              background: '#fff',
              borderRadius: 0,
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}>
              <div style={{ background: 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ background: '#fff', borderRadius: '50%', width: 54, height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, marginRight: 12, boxShadow: '0 2px 8px #388e3c22' }}>🤖</span>
                  <div>
                    <h2 style={{ color: '#388e3c', margin: 0, fontWeight: 700, fontSize: 28 }}>Krishi AI Chat</h2>
                    <p style={{ color: '#e8f5e9', margin: 0, fontSize: 15 }}>Ask anything about farming, crops, or your products!</p>
                  </div>
                </div>
                                 <button
                   onClick={() => setChatOpen(false)}
                   style={{
                     background: 'rgba(255, 255, 255, 0.9)',
                     border: '2px solidrgb(142, 56, 77)',
                     borderRadius: '50%',
                     width: 48,
                     height: 48,
                     fontSize: 24,
                     fontWeight: 'bold',
                     color: '#388e3c',
                     boxShadow: '0 4px 12px rgba(56, 142, 60, 0.2)',
                     cursor: 'pointer',
                     transition: 'all 0.2s ease',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     outline: 'none',
                   }}
                   onMouseEnter={(e) => {
                     e.target.style.background = '#388e3c';
                     e.target.style.color = '#fff';
                     e.target.style.transform = 'scale(1.1)';
                     e.target.style.boxShadow = '0 6px 16px rgba(248, 22, 22, 0.47)';
                   }}
                   onMouseLeave={(e) => {
                     e.target.style.background = 'rgba(255, 255, 255, 0.9)';
                     e.target.style.color = 'red';
                     e.target.style.transform = 'scale(1)';
                     e.target.style.boxShadow = '0 4px 12px rgba(56, 142, 60, 0.2)';
                   }}
                   title="Close Chat"
                 >
                   ✕
                 </button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 0', background: '#f7fafc' }}>
                <div style={{ maxWidth: 700, margin: '0 auto' }}>
                  {chatHistory.length === 0 && (
                    <div style={{ color: '#888', textAlign: 'center', marginTop: 32, fontSize: 18 }}>
                      Start a conversation with Krishi AI!
                    </div>
                  )}
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', marginBottom: 18 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                        {msg.sender === 'ai' && (
                          <span style={{ background: '#e8f5e9', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginRight: 4, boxShadow: '0 2px 8px #388e3c11' }}>🤖</span>
                        )}
                        <div
                          style={{
                            maxWidth: 420,
                            padding: '0.9rem 1.3rem',
                            borderRadius: 18,
                            background: msg.sender === 'user' ? 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)' : '#fff',
                            color: msg.sender === 'user' ? '#fff' : '#333',
                            boxShadow: msg.sender === 'user' ? '0 2px 8px rgba(76,175,80,0.10)' : '0 2px 8px rgba(0,0,0,0.04)',
                            borderTopRightRadius: msg.sender === 'user' ? 4 : 18,
                            borderTopLeftRadius: msg.sender === 'user' ? 18 : 4,
                            fontSize: 17,
                            position: 'relative',
                          }}
                        >
                          {msg.message}
                        </div>
                        {msg.sender === 'user' && (
                          <span style={{ background: '#e8f5e9', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginLeft: 4, boxShadow: '0 2px 8px #388e3c11' }}>🧑‍🌾</span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', padding: '2rem', background: '#f7fafc', borderBottomLeftRadius: 0, borderBottomRightRadius: 0, maxWidth: 700, margin: '0 auto', width: '100%' }}>
                <input
                  type="text"
                  placeholder="Type your question..."
                  style={{
                    flex: 1,
                    padding: '1.1rem 1.3rem',
                    borderRadius: 24,
                    border: '1px solid #c8e6c9',
                    fontSize: 17,
                    outline: 'none',
                    background: '#fff',
                    marginRight: 12,
                    boxShadow: '0 1px 2px rgba(76,175,80,0.04)',
                  }}
                  value={aiInput}
                  onChange={e => setAiInput(e.target.value)}
                  disabled={aiLoading}
                  onKeyDown={e => { if (e.key === 'Enter') handleSendToAI(); }}
                  autoFocus
                />
                <button
                  className="action-button"
                  onClick={handleSendToAI}
                  disabled={aiLoading || !aiInput.trim()}
                  style={{
                    borderRadius: '50%',
                    width: 54,
                    height: 54,
                    background: 'linear-gradient(90deg, #4caf50 0%, #81c784 100%)',
                    color: '#fff',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    boxShadow: '0 2px 8px rgba(76,175,80,0.10)',
                    transition: 'background 0.2s',
                    cursor: aiLoading || !aiInput.trim() ? 'not-allowed' : 'pointer',
                    opacity: aiLoading || !aiInput.trim() ? 0.7 : 1,
                  }}
                  title="Send"
                >
                  {aiLoading ? (
                    <span className="loader" style={{ width: 28, height: 28, border: '3px solid #fff', borderTop: '3px solid #81c784', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 20L21 12L3 4V10L17 12L3 14V20Z" fill="currentColor"/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        <CropDetectionTool />
      </div>
      <Footer />
      {/* Loader animation keyframes and chat dots animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.7; }
          40% { transform: translateY(-12px); opacity: 1; }
        }
        .big-robot-icon-animate {
          animation: robot-bounce 1.8s infinite;
        }
        @keyframes robot-bounce {
          0%, 100% { transform: translateY(0) scale(1); box-shadow: 0 8px 32px #388e3c22, 0 0 0 0 #81c78444; }
          20% { transform: translateY(-10px) scale(1.05); box-shadow: 0 16px 32px #388e3c22, 0 0 0 12px #81c78422; }
          40% { transform: translateY(0) scale(1); }
        }
        .ai-robot-fixed:hover {
          box-shadow: 0 12px 40px #388e3c44, 0 0 0 8px #81c78433;
        }
        /* SVG robot animation */
        .robot-eye {
          animation: blink 3.2s infinite;
        }
        @keyframes blink {
          0%, 90%, 100% { ry: 4; }
          92%, 98% { ry: 1; }
        }
        .robot-antenna {
          animation: antenna-pulse 2.2s infinite;
        }
        @keyframes antenna-pulse {
          0%, 100% { r: 4; }
          50% { r: 6; }
        }
        .robot-hand {
          transform-origin: 10px 38px;
          animation: hand-wave 2.5s infinite;
        }
        @keyframes hand-wave {
          0%, 100% { transform: rotate(-10deg); }
          10% { transform: rotate(-30deg); }
          20% { transform: rotate(-10deg); }
        }
      `}</style>
    </div>
  );
};

export default DashBoard;