import { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('raksha_token');
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.data);
          } else {
            localStorage.removeItem('raksha_token');
          }
        } catch (error) {
          console.error('[AUTH CONTEXT ERROR] Failed to fetch user profile', error);
          localStorage.removeItem('raksha_token');
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Register User
  const register = async (userData) => {
    try {
      const res = await API.post('/auth/register', userData);
      if (res.data.success) {
        const { token, ...profile } = res.data.data;
        localStorage.setItem('raksha_token', token);
        setUser(profile);
        return { success: true, user: profile };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  };

  // Login User
  const login = async (emailOrPhone, password) => {
    try {
      const res = await API.post('/auth/login', { emailOrPhone, password });
      if (res.data.success) {
        const { token, ...profile } = res.data.data;
        localStorage.setItem('raksha_token', token);
        setUser(profile);
        return { success: true, user: profile };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem('raksha_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
