import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { apiService } from '@/infrastructure/utils/ApiService';
import {
  AuthContextType,
  AppUser,
  JwtPayload,
  LoginUserUseCaseResponse,
  RestResponse, LogoutUserUCResponse
} from '@/core/auth/types';
import {toast} from "react-toastify";

const TOKEN_KEY = 'authToken';
const USER_KEY = 'userData';

export const ApiClient = {
  login: async (username: string, password: string) => {
    const res = await apiService.post<RestResponse<LoginUserUseCaseResponse>>(
        'api/v1/user/login',
        { username, password }
    );
    return res?.response?.data;
  },

  logout: async (token: string) => {
    const res = await apiService.post<RestResponse<LogoutUserUCResponse>>(
        'api/v1/user/logout',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if(res?.response?.code === 0 && res?.response?.message === 'SUCCESS') {
      return res?.response?.data
    } else {
      toast("Logout Failed")
    }
  },

  getCurrentUser: async (token: string) => {
    const decoded = jwtDecode<JwtPayload>(token);
    const userId = decoded.nameid;
    const response = await axios.get(`/api/User/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      try {
        const decoded = jwtDecode<JwtPayload>(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          clearStorage();
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        clearStorage();
      }
    }
    setIsLoading(false);
  }, []);

  const clearStorage = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const fetchUserProfile = async () => {
    try {
      const currentToken = token || localStorage.getItem(TOKEN_KEY);
      if (!currentToken) return;

      const response = await ApiClient.getCurrentUser(currentToken);

      if (response) {
        const userData: AppUser = {
          id: response.id || user?.id || '',
          username: response.username || user?.username || '',
          role: response.role || user?.role || '',
          name: response.name || user?.name || '',
          email: response.email || user?.email || '',
          imagePath: response.imagePath || response.profileImage || user?.imagePath || null,
          profileImage: response.imagePath || response.profileImage || user?.profileImage || null,
          branch: response.branch || user?.branch || '',
          company: response.company || user?.company || '',
          phone: response.phone || user?.phone || '',
          address: response.address || user?.address || '',
          pan: response.pan || user?.pan || '',
          remarks: response.remarks || user?.remarks || '',
          enable: response.enable !== undefined ? response.enable : user?.enable,
          permissionResponse: response.permissionResponse || user?.permissionResponse || null,
          permissions: response.permission || user?.permissions || [],
        };

        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await ApiClient.login(username, password);
      const authToken = response?.token?.toString();

      if (authToken) {
        localStorage.setItem(TOKEN_KEY, authToken);
        setToken(authToken);

        const decoded = jwtDecode<JwtPayload>(authToken);

        const userData: AppUser = {
          id: decoded.nameid,
          username: decoded.unique_name,
          role: decoded.role,
          name: response?.userInfo?.userName || decoded.unique_name,
          email: response?.userInfo?.email || '',
          imagePath: response?.userInfo?.imagePath || null,
          profileImage: response?.userInfo?.imagePath || null,
          permissionResponse: response?.userInfo?.permissionResponse || null,
          permissions: response?.userInfo?.permission || [],
        };

        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setUser(userData);

        await fetchUserProfile();
      } else {
        throw new Error('Login failed: Token missing from response');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const currentToken = token || localStorage.getItem(TOKEN_KEY);
      if (currentToken) {
        try {
          await ApiClient.logout(currentToken);
        } catch {
          console.log('Logout API call failed, proceeding with local logout');
        }
      }
    } finally {
      clearStorage();
    }
  };

  const updateUser = (userData: Partial<AppUser>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    }
  };

  const hasPermission = (permissionName: string): boolean => {
    if (!user?.permissions) return false;
    return user.permissions.includes(permissionName);
  };

  return (
      <AuthContext.Provider
          value={{
            user,
            token,
            isAuthenticated: Boolean(token && user),
            isLoading,
            login,
            logout,
            updateUser,
            fetchUserProfile,
            hasPermission,
          }}
      >
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};