import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);

const safeParseJSON = (value, fallback = null) => {
  if (value === null || value === undefined || value === '' || value === 'undefined' || value === 'null') {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getStoredAuth = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const rawUser = localStorage.getItem('user');
  const user = safeParseJSON(rawUser, null);

  if (rawUser && user === null && rawUser !== 'null') {
    localStorage.removeItem('user');
  }

  return {
    token,
    role,
    user,
    isAuthenticated: Boolean(token && role),
  };
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(getStoredAuth);

  useEffect(() => {
    const onStorage = () => setAuth(getStoredAuth());
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = ({ token, role, user }) => {
    if (token) localStorage.setItem('token', token);
    if (role) localStorage.setItem('role', role);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    setAuth(getStoredAuth());
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    setAuth(getStoredAuth());
  };

  const value = useMemo(
    () => ({
      ...auth,
      login,
      logout,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
