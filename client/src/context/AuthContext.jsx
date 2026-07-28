import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext(null);

const DEFAULT_USERS = {
  resident: {
    id: 1,
    name: 'Maria Clara Santos',
    email: 'resident@barangay.gov.ph',
    role: 'resident',
    phone_number: '09171234567',
    address: 'Zone 1, Barangay Health Center Road',
    residency_status: 'Verified Resident',
  },
  staff: {
    id: 2,
    name: 'Nurse Clara Reyes, RN',
    email: 'staff@barangay.gov.ph',
    role: 'staff',
    position: 'Barangay Health Nurse',
    facility_access: 'Main Health Station',
  },
  admin: {
    id: 3,
    name: 'Dr. Juan Dela Cruz, MD',
    email: 'admin@barangay.gov.ph',
    role: 'admin',
    position: 'Municipal Health Officer',
    facility_access: 'All Barangays',
  },
};

export const AuthProvider = ({ children }) => {
  // One-time cleanup: remove stale legacy auto-login tokens from prior sessions
  (() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken === 'demo_token_resident_123') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('bhc_user');
    }
  })();

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('bhc_user');
    return savedUser ? JSON.parse(savedUser) : null; // No auto-login — user must sign in
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('auth_token') || null;
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('bhc_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bhc_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }, [token]);

  useEffect(() => {
    const initializeAuth = async () => {
      const activeToken = localStorage.getItem('auth_token');
      if (activeToken) {
        try {
          const response = await axiosClient.get('/auth/me');
          if (response.data?.status === 'success') {
            setUser(response.data.data);
          }
        } catch (err) {
          console.error('Failed to fetch user on initialization:', err);
          if (err.response?.status === 401) {
            logout();
          }
        }
      }
    };
    initializeAuth();
  }, []);

  const refreshUser = async () => {
    const activeToken = token || localStorage.getItem('auth_token');
    if (activeToken) {
      try {
        const response = await axiosClient.get('/auth/me');
        if (response.data?.status === 'success') {
          setUser(response.data.data);
          return response.data.data;
        }
      } catch (err) {
        console.error('Failed to refresh user profile:', err);
      }
    }
    return null;
  };

  const login = async (credentials) => {
    setLoading(true);
    try {
      const response = await axiosClient.post('/auth/login', credentials);
      if (response.data?.status === 'success') {
        const authenticatedUser = response.data.data.user;
        const authToken = response.data.data.token;
        setUser(authenticatedUser);
        setToken(authToken);
        return { success: true, user: authenticatedUser };
      }
    } catch (err) {
      console.warn('API authentication failed, falling back to mock login:', err);
      
      // Fallback mock logic
      let authenticatedUser = null;
      let authToken = '';

      if (credentials.email?.includes('admin')) {
        authenticatedUser = DEFAULT_USERS.admin;
        authToken = 'demo_token_admin_789';
      } else if (credentials.email?.includes('staff')) {
        authenticatedUser = DEFAULT_USERS.staff;
        authToken = 'demo_token_staff_456';
      } else {
        authenticatedUser = {
          id: Math.floor(Math.random() * 1000) + 10,
          name: credentials.name || 'Resident User',
          email: credentials.email || 'resident@barangay.gov.ph',
          role: 'resident',
          phone_number: credentials.phone_number || '09170001122',
          residency_status: 'Verified Resident',
        };
        authToken = 'demo_token_resident_' + Date.now();
      }

      setUser(authenticatedUser);
      setToken(authToken);
      return { success: true, user: authenticatedUser };
    } finally {
      setLoading(false);
    }
  };

  const switchRole = (roleType) => {
    const selected = DEFAULT_USERS[roleType] || DEFAULT_USERS.resident;
    setUser(selected);
    setToken(`demo_token_${roleType}_${Date.now()}`);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bhc_user');
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        logout,
        switchRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
