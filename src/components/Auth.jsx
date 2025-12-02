import React, { useState } from 'react';
import apiService from '../services/api.js';
import './Auth.css';

const Auth = ({ onLogin, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.username.trim() || !formData.password.trim()) {
        throw new Error('Username and password are required');
      }

      if (!isLogin && formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (!isLogin && formData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (!isLogin && formData.username.length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      let response;
      if (isLogin) {
        response = await apiService.loginPlayer(formData.username, formData.password);
      } else {
        response = await apiService.registerPlayer(formData.username, formData.password);
      }

      // Notify parent component about successful login
      if (onLogin && response.player) {
        onLogin(response.player);
      }

      // Close the auth modal
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError(error.message || `Failed to ${isLogin ? 'login' : 'register'}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      username: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <div className="auth-header">
          <h2>{isLogin ? 'Login' : 'Create Account'}</h2>
          {onClose && (
            <button className="close-btn" onClick={onClose} aria-label="Close">
              ×
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter your username"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              disabled={loading}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                disabled={loading}
                required
              />
            </div>
          )}

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              className="toggle-mode-btn" 
              onClick={toggleMode}
              disabled={loading}
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </p>
        </div>

        <div className="auth-info">
          <small>
            {isLogin 
              ? 'Login to save your progress and compete on the leaderboard!'
              : 'Create an account to track your wins and see how you rank against other players!'
            }
          </small>
        </div>
      </div>
    </div>
  );
};

export default Auth;