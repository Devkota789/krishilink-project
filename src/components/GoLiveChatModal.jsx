import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NatureButton from '../components/NatureButton';
import './GoLiveChatModal.css';

const SIGNALR_URL = 'https://krishilink.shamir.com.np/chatHub';
const LOGIN_URL = 'https://krishilink.shamir.com.np/api/KrishilinkAuth/passwordLogin';
const HISTORY_URL = 'https://krishilink.shamir.com.np/api/Chat/getChatHistory/';

function getInitials(name) {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function GoLiveChatModal({ open, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [fullName, setFullName] = useState('');
  const [userId, setUserId] = useState(null);
  const [receiverId, setReceiverId] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [historyLoading, setHistoryLoading] = useState(false);
  const connectionRef = useRef(null);
  const messagesDivRef = useRef(null);

  // Load SignalR if not present
  React.useEffect(() => {
    if (!window.signalR) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@microsoft/signalr@7.0.5/dist/browser/signalr.min.js';
      document.body.appendChild(script);
    }
  }, []);

  React.useEffect(() => {
    if (open) {
      setToken(null);
      setFullName('');
      setUserId(null);
      setReceiverId('');
      setMessages([]);
      setChatInput('');
      if (user) {
        setFullName(user.fullName || user.email || user.phoneNumber || 'You');
        setUserId(user.id);
        setToken(localStorage.getItem('authToken'));
      } else {
        if (onClose) onClose();
        navigate('/login');
      }
    }
  }, [open, user, navigate, onClose]);

  React.useEffect(() => {
    if (messagesDivRef.current) {
      messagesDivRef.current.scrollTop = messagesDivRef.current.scrollHeight;
    }
  }, [messages]);

  // SignalR connection
  async function startSignalR() {
    if (!window.signalR) return;
    if (connectionRef.current) await connectionRef.current.stop();
    const connection = new window.signalR.HubConnectionBuilder()
      .withUrl(SIGNALR_URL, { accessTokenFactory: () => token })
      .configureLogging(window.signalR.LogLevel.Information)
      .build();
    connection.on('ReceiveMessage', (senderUserId, message) => {
      setMessages((msgs) => [...msgs, { sender: senderUserId, text: message, isOwn: false }]);
    });
    connection.on('Error', (msg) => {
      setMessages((msgs) => [...msgs, { sender: 'System', text: 'Error: ' + msg, isOwn: false }]);
    });
    try {
      await connection.start();
    } catch (err) {
      setMessages((msgs) => [...msgs, { sender: 'System', text: 'Could not connect to chat server.', isOwn: false }]);
    }
    connectionRef.current = connection;
  }

  const handleSend = async () => {
    const msg = chatInput.trim();
    if (!msg || !receiverId) return;
    if (!connectionRef.current || connectionRef.current.state !== 'Connected') {
      await startSignalR();
    }
    try {
      await connectionRef.current.invoke('SendMessage', receiverId, msg);
      setMessages((msgs) => [...msgs, { sender: fullName || 'You', text: msg, isOwn: true }]);
      setChatInput('');
    } catch (e) {
      setMessages((msgs) => [...msgs, { sender: 'System', text: 'Failed to send message.', isOwn: false }]);
    }
  };

  const handleLoadHistory = async () => {
    if (!receiverId) {
      setMessages((msgs) => [...msgs, { sender: 'System', text: 'Please enter a receiver user id.', isOwn: false }]);
      return;
    }
    setHistoryLoading(true);
    setMessages([{ sender: 'System', text: 'Loading chat history...', isOwn: false }]);
    try {
      const res = await fetch(HISTORY_URL + receiverId, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load history');
      const history = await res.json();
      if (history.length === 0) {
        setMessages([{ sender: 'System', text: 'No chat history.', isOwn: false }]);
      } else {
        setMessages(history.map((msg) => ({
          sender: msg.senderUserId === userId ? fullName || 'You' : msg.senderUserId,
          text: msg.message,
          isOwn: msg.senderUserId === userId,
        })));
      }
    } catch (e) {
      setMessages([{ sender: 'System', text: 'Could not load chat history.', isOwn: false }]);
    }
    setHistoryLoading(false);
  };

  const handleLogout = () => {
    setToken(null);
    setFullName('');
    setUserId(null);
    setMessages([]);
    setReceiverId('');
    setChatInput('');
    if (connectionRef.current) connectionRef.current.stop();
  };

  if (!open) return null;
  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal" onClick={e => e.stopPropagation()}>
        <div className="chat-modal-header">
          <span className="chat-modal-title">Live Chat</span>
          <button className="chat-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="chat-area-wrapper">
          <div className="chat-user-bar">
            <span className="chat-user-name">
              <span className="chat-avatar" aria-label="User avatar">{getInitials(fullName)}</span>
              {fullName}
            </span>
            <NatureButton onClick={handleLogout} className="chat-logout-btn">Logout</NatureButton>
          </div>
          <div className="chat-receiver-bar">
            <input
              type="text"
              value={receiverId}
              onChange={e => setReceiverId(e.target.value)}
              placeholder="Enter receiver user id"
              className="chat-receiver-input"
            />
            <NatureButton onClick={handleLoadHistory} className="chat-history-btn" disabled={historyLoading}>{historyLoading ? 'Loading...' : 'Load History'}</NatureButton>
          </div>
          <div ref={messagesDivRef} className="chat-messages">
            {messages.filter(msg => {
              const sender = (msg.sender || '').toString().toLowerCase();
              return !sender.includes('krishi ai') && !sender.includes('krishi link ai');
            }).map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.isOwn ? 'chat-bubble-own' : 'chat-bubble-other'}${msg.sender === 'System' ? ' chat-bubble-system' : ''}`}
                style={{ animation: 'fadeInBubble 0.4s cubic-bezier(.4,2,.6,1)' }}>
                {msg.sender !== 'System' && (
                  <span className="chat-avatar" aria-label="Sender avatar">{getInitials(msg.sender)}</span>
                )}
                <span>
                  {msg.sender ? <span className="chat-bubble-sender">{msg.sender}: </span> : ''}{msg.text}
                </span>
              </div>
            ))}
          </div>
          <div className="chat-input-bar">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Type a message..."
              autoComplete="off"
              className="chat-input"
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            />
            <NatureButton onClick={handleSend} className="chat-send-btn">Send</NatureButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add fadeInBubble animation
const style = document.createElement('style');
style.innerHTML = `@keyframes fadeInBubble { 0% { opacity: 0; transform: translateY(16px) scale(0.96); } 100% { opacity: 1; transform: translateY(0) scale(1); } }`;
document.head.appendChild(style); 