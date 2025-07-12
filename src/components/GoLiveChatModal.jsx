import React, { useState, useRef } from 'react';

const SIGNALR_URL = 'https://krishilink.shamir.com.np/chatHub';
const LOGIN_URL = 'https://krishilink.shamir.com.np/api/KrishilinkAuth/passwordLogin';
const HISTORY_URL = 'https://krishilink.shamir.com.np/api/Chat/getChatHistory/';

const modalStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
const boxStyle = {
  background: '#fff', borderRadius: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.1)', maxWidth: 400, width: '100%', padding: '30px 40px 40px 40px',
};

export default function GoLiveChatModal({ open, onClose }) {
  const [step, setStep] = useState('login'); // 'login' | 'chat'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
      setStep('login');
      setError('');
      setToken(null);
      setFullName('');
      setUserId(null);
      setReceiverId('');
      setMessages([]);
      setChatInput('');
    }
  }, [open]);

  React.useEffect(() => {
    if (messagesDivRef.current) {
      messagesDivRef.current.scrollTop = messagesDivRef.current.scrollHeight;
    }
  }, [messages]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const email = e.target.emailOrPhone.value.trim();
    const pass = e.target.password.value;
    if (!email || !pass) {
      setError('Please enter both Email/Phone and Password.');
      setLoading(false);
      return;
    }
    const deviceId = 'web-' + Math.random().toString(36).substring(2, 12);
    const formData = new FormData();
    formData.append('EmailorPhone', email);
    formData.append('Password', pass);
    formData.append('DeviceId', deviceId);
    try {
      const res = await fetch(LOGIN_URL, { method: 'POST', body: formData });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = null; }
      if (res.ok && data && data.success) {
        setToken(data.data.token);
        setFullName(data.data.fullName || email);
        setUserId(data.data.id);
        setStep('chat');
      } else {
        setError((data && data.message) || 'Login failed.');
      }
    } catch (e) {
      setError('Network error.');
    }
    setLoading(false);
  };

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
    setStep('login');
    setMessages([]);
    setReceiverId('');
    setChatInput('');
    if (connectionRef.current) connectionRef.current.stop();
  };

  if (!open) return null;
  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={boxStyle} onClick={e => e.stopPropagation()}>
        {step === 'login' ? (
          <form onSubmit={handleLogin}>
            <h2 style={{ textAlign: 'center', marginBottom: 30 }}>Login</h2>
            {error && <div style={{ color: '#d8000c', background: '#ffd2d2', padding: 10, borderRadius: 5, marginBottom: 15 }}>{error}</div>}
            <div style={{ marginBottom: 20 }}>
              <label>Email or Phone</label>
              <input name="emailOrPhone" type="text" required style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 5 }} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label>Password</label>
              <input name="password" type="password" required style={{ width: '100%', padding: 10, border: '1px solid #ccc', borderRadius: 5 }} />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: 12, background: '#0078d7', color: '#fff', border: 'none', borderRadius: 5, fontSize: 16, cursor: 'pointer' }}>{loading ? 'Logging in...' : 'Login'}</button>
          </form>
        ) : (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: 10, textAlign: 'center' }}>Realtime CCChat</div>
            <div style={{ marginBottom: 10 }}>
              <label><b>Receiver User ID:</b></label>
              <input
                type="text"
                value={receiverId}
                onChange={e => setReceiverId(e.target.value)}
                placeholder="Enter receiver user id"
                style={{ width: '100%', marginBottom: 5, padding: 10, borderRadius: 5, border: '1px solid #ccc' }}
              />
              <button onClick={handleLoadHistory} style={{ width: '100%', marginBottom: 10, padding: 10, borderRadius: 5, background: '#eee', border: 'none', cursor: 'pointer' }} disabled={historyLoading}>{historyLoading ? 'Loading...' : 'Load Chat History'}</button>
            </div>
            <div ref={messagesDivRef} style={{ height: 250, overflowY: 'auto', background: '#f9f9f9', border: '1px solid #eee', borderRadius: 5, padding: 10, marginBottom: 10 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ fontWeight: msg.isOwn ? 'bold' : 'normal', color: msg.sender === 'System' ? '#d8000c' : undefined }}>{msg.sender ? `${msg.sender}: ` : ''}{msg.text}</div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Type a message..."
                autoComplete="off"
                style={{ flex: 1, minWidth: 0, padding: 12, fontSize: 16, borderRadius: 5, border: '1px solid #ccc', margin: 0 }}
                onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
              />
              <button onClick={handleSend} style={{ width: 'auto', minWidth: 80, padding: '12px 20px', margin: 0, background: '#0078d7', color: '#fff', border: 'none', borderRadius: 5, fontSize: 16, cursor: 'pointer' }}>Send</button>
            </div>
            <button onClick={handleLogout} style={{ marginTop: 10, background: '#d8000c', color: '#fff', width: '100%', padding: 10, border: 'none', borderRadius: 5, fontSize: 16, cursor: 'pointer' }}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
} 