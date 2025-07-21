import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('sipschool_token');
    const savedUser = localStorage.getItem('sipschool_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      api.setToken(savedToken);
      
      // Verify token is still valid
      verifyToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (!data.success) {
          logout();
        }
      } else {
        logout();
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    api.setToken(userToken);
    localStorage.setItem('sipschool_token', userToken);
    localStorage.setItem('sipschool_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    api.setToken(null);
    localStorage.removeItem('sipschool_token');
    localStorage.removeItem('sipschool_user');
    localStorage.removeItem('sipschool_progress'); // Clear old progress
    localStorage.removeItem('sipschool_history');
  };

  const continueAsGuest = () => {
    const guestUser = {
      id: `guest_${Date.now()}`,
      username: 'Guest',
      isGuest: true
    };
    setUser(guestUser);
    setToken(null);
  };

  const getAuthHeaders = () => {
    if (token) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
    }
    return {
      'Content-Type': 'application/json'
    };
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    continueAsGuest,
    getAuthHeaders,
    isAuthenticated: !!user && !user.isGuest,
    isGuest: user?.isGuest || false
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}