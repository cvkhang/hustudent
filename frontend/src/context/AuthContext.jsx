import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { getMe, login as apiLogin, register as apiRegister, logout as apiLogout } from '@/features/auth/api/auth';


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check valid session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await getMe();
        setUser(response.data.data); // Extract data.data
      } catch (error) {
        // Not logged in or token expired
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await apiLogin(credentials);
    const user = response.data?.data?.user || response.data?.user || response.data;
    setUser(user);
    return response.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
    }
  }, []);

  const register = useCallback(async (data) => {
    const response = await apiRegister(data); // Assume imported as apiRegister
    // Check if registration returns token/user or just success
    // If it returns user/token, we can set user immediately
    // For now assuming it works like login
    if (response.data && response.data.user) {
      setUser(response.data.user);
    }
    return response.data;
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await getMe();
      setUser(response.data.data);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({ user, isLoading, login, register, logout, setUser, refreshProfile }),
    [user, isLoading, login, register, logout, refreshProfile]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  return useContext(AuthContext);
};
