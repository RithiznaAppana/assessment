import React, { useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to construct URL without double slashes
const buildApiUrl = (endpoint) => {
  const baseUrl = API_URL.replace(/\/+$/, ''); // Remove trailing slashes
  const cleanEndpoint = endpoint.replace(/^\/+/, ''); // Remove leading slashes
  return `${baseUrl}/${cleanEndpoint}`;
};

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? 'auth/login' : 'auth/register';
      const url = buildApiUrl(endpoint);
      console.log('API URL:', url); // Debug log
      const response = await axios.post(url, formData);

      if (isLogin) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        window.location.href = '/dashboard';
      } else {
        alert('Registration successful! Please login.');
        setIsLogin(true);
      }
    } catch (error) {
      alert(error.response?.data?.error || 'An error occurred');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="App">
      <div className="header">
        <h1>Learning Platform</h1>
        <p>AI-Powered Personalized Education</p>
        <div className="trust-indicators">
          <div className="trust-indicator">
            <div className="trust-number">10k+</div>
            <div className="trust-label">Active Learners</div>
          </div>
          <div className="trust-indicator">
            <div className="trust-number">95%</div>
            <div className="trust-label">Success Rate</div>
          </div>
          <div className="trust-indicator">
            <div className="trust-number">AI-Driven</div>
            <div className="trust-label">Recommendations</div>
          </div>
        </div>
      </div>
      <div className="container">
        <h2>{isLogin ? '🚀 Welcome Back!' : '🎓 Join Our Learning Community'}</h2>
        <p style={{ color: '#718096', marginBottom: '30px' }}>
          {isLogin 
            ? 'Continue your personalized learning journey' 
            : 'Get started with AI-powered education tailored just for you'
          }
        </p>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
              />
            </div>
          )}
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px',
                  color: '#718096',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? '⊗' : '○'}
              </button>
            </div>
          </div>
          <button type="submit" className="btn">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        <p>
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;