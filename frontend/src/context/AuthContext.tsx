import { useLocalStorage } from '../hooks/useLocalStorage';
import { AppUser } from '../types/AppUser';
import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { ApiClient } from '../api/apiClient';
import { LoginResponse } from '../types/LoginResponse';

interface IAuthContext {
  user: AppUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

const TOKEN_EXPIRY_KEY = 'tokenExpiry';
const TOKEN_KEY = 'authToken';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useLocalStorage<AppUser | null>('user', null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check token expiration on mount
    const tokenExpiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (token && tokenExpiry) {
      const expiryTime = parseInt(tokenExpiry);
      if (Date.now() < expiryTime) {
        setIsAuthenticated(true);
      } else {
        // Token expired, clear everything
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
        setUser(null);
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await ApiClient.login(email, password);
      const userData = response.user;
      
      // Store user data
      setUser(userData);
      
      // Store token and set expiry (30 minutes from now)
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(TOKEN_EXPIRY_KEY, (Date.now() + 30 * 60 * 1000).toString());
      
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};