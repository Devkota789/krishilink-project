import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import NatureButton from '../components/NatureButton';
import InputSprout from '../components/InputSprout';
import FormProgressBar from '../components/FormProgressBar';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, sendOTP, verifyOTP } = useAuth();
  const [activeTab, setActiveTab] = useState('otp');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [validationErrors, setValidationErrors] = useState({});

  // Password Login State
  const [passwordLogin, setPasswordLogin] = useState({
    emailOrPhone: '',
    password: ''
  });

  // OTP Login State
  const [otpLogin, setOtpLogin] = useState({
    emailOrPhone: '',
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // OTP Timer countdown
  useEffect(() => {
    let timer;
    if (otpSent && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, otpTimer]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validateInput = (value) => {
    if (!value) return 'This field is required';
    if (value.includes('@')) {
      if (!validateEmail(value)) return 'Please enter a valid email address';
    } else {
      if (!validatePhone(value)) return 'Please enter a valid 10-digit phone number';
    }
    return '';
  };

  const handlePasswordLoginChange = (e) => {
    const { name, value } = e.target;
    setPasswordLogin(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when user types
    setValidationErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleOtpLoginChange = (e) => {
    const { name, value } = e.target;
    setOtpLogin(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when user types
    setValidationErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    // Validate inputs
    const emailOrPhoneError = validateInput(passwordLogin.emailOrPhone);
    const passwordError = !passwordLogin.password ? 'Password is required' : '';

    if (emailOrPhoneError || passwordError) {
      setValidationErrors({
        emailOrPhone: emailOrPhoneError,
        password: passwordError
      });
      setLoading(false);
      return;
    }

    try {
      const result = await login({
        emailOrPhone: passwordLogin.emailOrPhone,
        password: passwordLogin.password
      });

      if (result.success) {
        setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
        
        // Redirect based on user role
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setMessage({ text: result.error || 'Login failed', type: 'error' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({
        text: 'Network error or server is not responding. Please try again later.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    // Validate input
    const emailOrPhoneError = validateInput(otpLogin.emailOrPhone);
    if (emailOrPhoneError) {
      setValidationErrors({ emailOrPhone: emailOrPhoneError });
      setLoading(false);
      return;
    }

    try {
      const result = await sendOTP(otpLogin.emailOrPhone);

      if (result.success) {
        const isEmail = otpLogin.emailOrPhone.includes('@');
        setMessage({ 
          text: `OTP sent successfully! Please check your ${isEmail ? 'email' : 'phone'}.`, 
          type: 'success' 
        });
        setOtpSent(true);
        setOtpTimer(600); // 10 minutes in seconds
      } else {
        setMessage({ text: result.error || 'Failed to send OTP', type: 'error' });
      }
    } catch (error) {
      console.error('OTP sending error:', error);
      setMessage({ 
        text: 'Network error or server is not responding. Please try again later.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    if (!otpLogin.otp || otpLogin.otp.length !== 6) {
      setValidationErrors({ otp: 'Please enter a valid 6-digit OTP' });
      setLoading(false);
      return;
    }

    try {
      const result = await verifyOTP(otpLogin.emailOrPhone, otpLogin.otp);
      console.log('OTP verify result:', result);
      console.log('User in localStorage:', localStorage.getItem('user'));
      console.log('Auth token in localStorage:', localStorage.getItem('authToken'));

      if (result.success) {
        setMessage({ text: 'Login successful! Redirecting...', type: 'success' });
        // Redirect based on user role
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        // Show all error details if present
        let errorMsg = result.error || 'Invalid OTP';
        if (Array.isArray(result.errorDetails) && result.errorDetails.length > 0) {
          errorMsg += '\n' + result.errorDetails.join('\n');
        }
        setMessage({ text: errorMsg, type: 'error' });
        if (typeof result.error === 'string' && result.error.toLowerCase().includes('expired')) {
          setOtpSent(false);
          setOtpTimer(0);
        }
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setMessage({
        text: 'Network error or server is not responding. Please try again later.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="login-page">
      <Navbar />
      <div className="login-container">
        <h1>Welcome Back</h1>
        <div className="login-form-container">
          <div className="login-tabs">
            <NatureButton
              className={`tab ${activeTab === 'otp' ? 'active' : ''}`}
              onClick={() => setActiveTab('otp')}
            >
              Login with OTP
            </NatureButton>
            <NatureButton
              className={`tab ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              Login with Password
            </NatureButton>
          </div>

          {activeTab === 'password' ? (
            <form onSubmit={handlePasswordLogin} className="login-form">
              <div className="input-sprout-group">
                <input
                  type="text"
                  id="emailOrPhone"
                  name="emailOrPhone"
                  value={passwordLogin.emailOrPhone}
                  onChange={handlePasswordLoginChange}
                  placeholder="Enter your email or phone number"
                  required
                  className={validationErrors.emailOrPhone ? 'error' : ''}
                />
                <span className="input-sprout-underline" />
                <span className="input-sprout"><InputSprout /></span>
              </div>
              {validationErrors.emailOrPhone && (
                <span className="error-message">{validationErrors.emailOrPhone}</span>
              )}

              <div className="input-sprout-group">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={passwordLogin.password}
                  onChange={handlePasswordLoginChange}
                  required
                  placeholder="Enter your password"
                  className={validationErrors.password ? 'error' : ''}
                />
                <span className="input-sprout-underline" />
                <span className="input-sprout"><InputSprout /></span>
              </div>
              {validationErrors.password && (
                <span className="error-message">{validationErrors.password}</span>
              )}

              {message.text && (
                <div className={`message ${message.type}`} style={{ marginBottom: '1rem' }}>
                  {message.text}
                </div>
              )}

              {loading && <FormProgressBar progress={100} />}

              <NatureButton
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </NatureButton>
            </form>
          ) : (
            <form onSubmit={otpSent ? handleOtpLogin : handleSendOtp} className="login-form">
              <div className="input-sprout-group">
                <input
                  type="text"
                  id="otpEmailOrPhone"
                  name="emailOrPhone"
                  value={otpLogin.emailOrPhone}
                  onChange={handleOtpLoginChange}
                  placeholder="Enter your email or phone number"
                  disabled={otpSent}
                  required
                  className={validationErrors.emailOrPhone ? 'error' : ''}
                />
                <span className="input-sprout-underline" />
                <span className="input-sprout"><InputSprout /></span>
              </div>
              {validationErrors.emailOrPhone && (
                <span className="error-message">{validationErrors.emailOrPhone}</span>
              )}

              {otpSent && (
                <>
                  <div className="input-sprout-group">
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      value={otpLogin.otp}
                      onChange={handleOtpLoginChange}
                      required
                      placeholder="Enter OTP"
                      maxLength="6"
                      className={validationErrors.otp ? 'error' : ''}
                    />
                    <span className="input-sprout-underline" />
                    <span className="input-sprout"><InputSprout /></span>
                  </div>
                  {validationErrors.otp && (
                    <span className="error-message">{validationErrors.otp}</span>
                  )}
                  {otpTimer > 0 && (
                    <div className="otp-timer">
                      OTP expires in: {formatTime(otpTimer)}
                    </div>
                  )}
                </>
              )}

              {message.text && (
                <div className={`message ${message.type}`} style={{ marginBottom: '1rem' }}>
                  {message.text}
                </div>
              )}

              <NatureButton
                type="submit"
                className="submit-button"
                disabled={loading || (otpSent && otpTimer === 0)}
              >
                {loading
                  ? (otpSent ? 'Verifying...' : 'Sending OTP...')
                  : (otpSent ? 'Verify OTP' : 'Send OTP')}
              </NatureButton>

              {otpSent && (
                <NatureButton
                  type="button"
                  className="resend-button"
                  onClick={() => {
                    setOtpSent(false);
                    setOtpTimer(0);
                    setOtpLogin({ emailOrPhone: otpLogin.emailOrPhone, otp: '' });
                    setValidationErrors({});
                    setMessage({ text: '', type: '' });
                  }}
                  disabled={loading}
                >
                  Change Email/Phone
                </NatureButton>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
