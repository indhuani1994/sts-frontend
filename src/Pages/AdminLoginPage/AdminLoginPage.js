// src/pages/AdminLogin.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../../MainLayout.js/MainLayout';
import apiClient from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please fill in both username and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const res = await apiClient.post('/api/user/admin-login', {
        username,
        password,
      });

      const payload = res.data?.data;
      login({
        token: payload?.token,
        role: payload?.user?.role || 'admin',
        user: payload?.user,
      });
      navigate('/admin-dashboard'); 
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <MainLayout minimal>
    <div style={styles.container} className='bglog'>
      <div style={styles.loginCard}>
        <h2 style={styles.title}>Admin Login</h2>
        
        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Username</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>
        
        <button 
          style={styles.loginButton}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

           <div>Are You a Student Or Staff? <Link to="/login">Click Here</Link></div>
      </div>
   
    </div>
    </MainLayout>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  loginCard: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    textAlign: 'center',
    margin: '0 0 30px 0',
    color: '#2c3e50',
    fontSize: '24px'
  },
  error: {
    backgroundColor: '#e74c3c',
    color: 'white',
    padding: '12px',
    borderRadius: '5px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#2c3e50',
    fontWeight: '500'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #bdc3c7',
    borderRadius: '5px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  loginButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '20px'
  }
};

export default AdminLogin;
