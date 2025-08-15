import { useLocalStorage } from '../hooks/useLocalStorage';
import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface IAuthContext {
  user: AppUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<IAuthContext | undefined>(undefined);

const TOKEN_EXPIRY_KEY = 'tokenExpiry';
const TOKEN_KEY = 'authToken';

interface JwtPayload {
  nameid: string;
  unique_name: string;
  role: string;
  exp: number;
}

export interface AppUser {
  id: string;
  username: string;
  role: string;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useLocalStorage<AppUser | null>('user', null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        if (decoded.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
          setUser({
            id: decoded.nameid,
            username: decoded.unique_name,
            role: decoded.role,
          });
        } else {
          localStorage.removeItem(TOKEN_KEY);
          setUser(null);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await ApiClient.login(username, password);
      const token = response.token;
      localStorage.setItem(TOKEN_KEY, token);
      const decoded = jwtDecode<JwtPayload>(token);
      setUser({
        id: decoded.nameid,
        username: decoded.unique_name,
        role: decoded.role,
      });
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        await ApiClient.logout(token);
      }
      setUser(null);
      localStorage.removeItem(TOKEN_KEY);
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

export const ApiClient = {
  login: async (username: string, password: string) => {
    const response = await axios.post('/api/User/login', { username, password });
    return response.data;
  },
  logout: async (token: string) => {
    await axios.post('/api/User/logout', {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
};