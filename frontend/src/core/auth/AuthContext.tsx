// // import { useLocalStorage } from '@/hooks/useLocalStorage';
// import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
// import { jwtDecode } from 'jwt-decode';
// import axios from 'axios';
// import {apiService} from "@/infrastructure/utils/ApiService";
//
// interface IAuthContext {
//   user: AppUser | null;
//   login: (username: string, password: string) => Promise<void>;
//   logout: () => Promise<void>;
//   isAuthenticated: boolean;
//   updateUser: (userData: Partial<AppUser>) => void;
//   fetchUserProfile: () => Promise<void>;
// }
// export interface UserInfo {
//   id: number;
//   userId: string;
//   userName: string;
//   email: string;
//   enabled: string;
//   imagePath: string;
//   subscriptionType: string;
//   subscriptionStartDate: string;
//   subscriptionEndDate: string;
//   isSubscriptionActive: boolean;
//   hasUsedTrial: boolean;
//   subscriptionStatus: string;
//   permission: string[];
//   role: string;
// }
//
// export interface LoginUserUseCaseResponse {
//   token: string;
//   message: string;
//   userInfo: UserInfo;
// }
//
// interface RestResponse<T> {
//   status?: string;
//   data?: T;
//   message?: string;
//   error?: string;
// }
//
// const AuthContext = createContext<IAuthContext | undefined>(undefined);
//
// // const TOKEN_EXPIRY_KEY = 'tokenExpiry';
// const TOKEN_KEY = 'authToken';
// const USER_KEY = 'userData';
//
// interface JwtPayload {
//   nameid: string;
//   unique_name: string;
//   role: string;
//   exp: number;
// }
//
// export interface AppUser {
//   id: string;
//   username: string;
//   role: string;
//   name?: string;
//   email?: string;
//   profileImage?: string | null;
//   imagePath?: string | null;
//   branch?: string;
//   company?: string;
//   phone?: string;
//   address?: string;
//   pan?: string;
//   remarks?: string;
//   enable?: boolean;
// }
//
// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<AppUser | null>(null);
//   const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
//
//   // Load user from localStorage on mount
//   useEffect(() => {
//     const token = localStorage.getItem(TOKEN_KEY);
//     const storedUser = localStorage.getItem(USER_KEY);
//
//     if (token && storedUser) {
//       try {
//         const decoded = jwtDecode<JwtPayload>(token);
//         if (decoded.exp * 1000 > Date.now()) {
//           const parsedUser = JSON.parse(storedUser);
//           setUser(parsedUser);
//           setIsAuthenticated(true);
//           console.log('✅ User loaded from storage:', parsedUser);
//         } else {
//           localStorage.removeItem(TOKEN_KEY);
//           localStorage.removeItem(USER_KEY);
//           setUser(null);
//           setIsAuthenticated(false);
//         }
//       } catch (error) {
//         console.error('Error loading user from storage:', error);
//         localStorage.removeItem(TOKEN_KEY);
//         localStorage.removeItem(USER_KEY);
//         setUser(null);
//         setIsAuthenticated(false);
//       }
//     }
//   }, []);
//
//   const fetchUserProfile = async () => {
//     try {
//       const token = localStorage.getItem(TOKEN_KEY);
//       if (!token) return;
//
//       const response = await ApiClient.getCurrentUser(token);
//       console.log('📋 Full user profile from API:', response);
//
//       if (response) {
//         const userData: AppUser = {
//           id: response.id || user?.id || '',
//           username: response.username || user?.username || '',
//           role: response.role || user?.role || '',
//           name: response.name || user?.name || '',
//           email: response.email || user?.email || '',
//           imagePath: response.imagePath || response.profileImage || user?.imagePath || null,
//           profileImage: response.imagePath || response.profileImage || user?.profileImage || null,
//           branch: response.branch || user?.branch || '',
//           company: response.company || user?.company || '',
//           phone: response.phone || user?.phone || '',
//           address: response.address || user?.address || '',
//           pan: response.pan || user?.pan || '',
//           remarks: response.remarks || user?.remarks || '',
//           enable: response.enable !== undefined ? response.enable : user?.enable,
//         };
//
//         console.log('👤 Updated user data with image:', userData);
//         console.log('🖼️ Image path from API:', userData.imagePath);
//
//         localStorage.setItem(USER_KEY, JSON.stringify(userData));
//         setUser(userData);
//       }
//     } catch (error) {
//       console.error('Error fetching user profile:', error);
//     }
//   };
//
//   const login = async (username: string, password: string) => {
//     try {
//       const response = await ApiClient.login(username, password);
//       const token = response?.token?.toString();
//       if (token) {
//         localStorage.setItem(TOKEN_KEY, token);
//         const decoded = jwtDecode<JwtPayload>(token);
//         // ... process decoded token
//
//       // localStorage.setItem(TOKEN_KEY, token);
//
//       // const decoded = jwtDecode<JwtPayload>(token);
//
//       console.log('🔐 Login response:', response);
//
//       // Create basic user data from login response
//       const userData: AppUser = {
//         id: decoded.nameid,
//         username: decoded.unique_name,
//         role: decoded.role,
//         name: response?.userInfo.userName || decoded.unique_name,
//         // name: response.name || decoded.unique_name,
//         email: response?.userInfo.email || '',
//
//         imagePath: response?.userInfo.imagePath || null,
//         profileImage: response?.userInfo.imagePath  || null,
//         // branch: response?.userInfo.branch || '',
//         // company: response?.userInfo.company || '',
//         // phone: response?.userInfo.phone || '',
//         // address: response?.userInfo.address || '',
//         // pan: response?.userInfo.pan || '',
//         // remarks: response?.userInfo.remarks || '',
//         // enable: response?.userInfo.enabled !== undefined ? : true,
//       };
//
//       console.log('👤 Initial user data:', userData);
//
//       // Store in localStorage
//       localStorage.setItem(USER_KEY, JSON.stringify(userData));
//       setUser(userData);
//       setIsAuthenticated(true);
//
//       // Fetch full user profile to get image
//       await fetchUserProfile();
//       } else {
//         console.error('Login failed: Token is missing from response');
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       throw error;
//     }
//   };
//
//   const logout = async () => {
//     try {
//       const token = localStorage.getItem(TOKEN_KEY);
//       if (token) {
//         try {
//           await ApiClient.logout(token);
//         } catch (e) {
//           console.log('Logout API call failed, continuing with local logout');
//         }
//       }
//       setUser(null);
//       localStorage.removeItem(TOKEN_KEY);
//       localStorage.removeItem(USER_KEY);
//       setIsAuthenticated(false);
//     } catch (error) {
//       console.error('Logout error:', error);
//       throw error;
//     }
//   };
//
//   const updateUser = (userData: Partial<AppUser>) => {
//     if (user) {
//       const updatedUser = { ...user, ...userData };
//       setUser(updatedUser);
//       localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
//       console.log('🔄 User updated:', updatedUser);
//     }
//   };
//
//   return (
//     <AuthContext.Provider value={{ user, login, logout, isAuthenticated, updateUser, fetchUserProfile }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
//
// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
//
// export const ApiClient = {
//   login: async (username: string, password: string) => {
//     // const response = await axios.post('/api/User/login', { username, password });
//     // return response.data;
//     const res = await apiService.post<RestResponse<LoginUserUseCaseResponse>>(
//         'api/v1/user/login',
//         { username, password }
//     );
//     return res?.response?.data
//
//   },
//
//   logout: async (token: string) => {
//     await axios.post('/api/User/logout', {}, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//   },
//   getCurrentUser: async (token: string) => {
//     // Try to get user by ID from the token
//     const decoded = jwtDecode<JwtPayload>(token);
//     const userId = decoded.nameid;
//
//     // Fetch user by ID
//     const response = await axios.get(`/api/User/${userId}`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     return response.data;
//   },
// };

// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { jwtDecode } from 'jwt-decode';
// import axios from 'axios';
// import { apiService } from '@/infrastructure/utils/ApiService';
// import {
//   AuthContextType,
//   AppUser,
//   JwtPayload,
//   LoginUserUseCaseResponse,
//   RestResponse
// } from '@/core/auth/types';
//
// const TOKEN_KEY = 'authToken';
// const USER_KEY = 'userData';
//
// // ApiClient helper for authentication endpoints
// export const ApiClient = {
//   login: async (username: string, password: string) => {
//     const res = await apiService.post<RestResponse<LoginUserUseCaseResponse>>(
//         'api/v1/user/login',
//         { username, password }
//     );
//     return res?.response?.data;
//   },
//
//   logout: async (token: string) => {
//     await axios.post(
//         '/api/User/logout',
//         {},
//         { headers: { Authorization: `Bearer ${token}` } }
//     );
//   },
//
//   getCurrentUser: async (token: string) => {
//     const decoded = jwtDecode<JwtPayload>(token);
//     const userId = decoded.nameid;
//     const response = await axios.get(`/api/User/${userId}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return response.data;
//   },
// };
//
// const AuthContext = createContext<AuthContextType | undefined>(undefined);
//
// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<AppUser | null>(null);
//   const [token, setToken] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(true);
//
//   // Load user session on mount & check token expiration
//   useEffect(() => {
//     const storedToken = localStorage.getItem(TOKEN_KEY);
//     const storedUser = localStorage.getItem(USER_KEY);
//
//     if (storedToken && storedUser) {
//       try {
//         const decoded = jwtDecode<JwtPayload>(storedToken);
//         // Verify if token is still unexpired
//         if (decoded.exp * 1000 > Date.now()) {
//           const parsedUser = JSON.parse(storedUser);
//           setToken(storedToken);
//           setUser(parsedUser);
//         } else {
//           clearStorage();
//         }
//       } catch (error) {
//         console.error('Error loading session from storage:', error);
//         clearStorage();
//       }
//     }
//     setIsLoading(false);
//   }, []);
//
//   const clearStorage = () => {
//     localStorage.removeItem(TOKEN_KEY);
//     localStorage.removeItem(USER_KEY);
//     setToken(null);
//     setUser(null);
//   };
//
//   const fetchUserProfile = async () => {
//     try {
//       const currentToken = token || localStorage.getItem(TOKEN_KEY);
//       if (!currentToken) return;
//
//       const response = await ApiClient.getCurrentUser(currentToken);
//
//       if (response) {
//         const userData: AppUser = {
//           id: response.id || user?.id || '',
//           username: response.username || user?.username || '',
//           role: response.role || user?.role || '',
//           name: response.name || user?.name || '',
//           email: response.email || user?.email || '',
//           imagePath: response.imagePath || response.profileImage || user?.imagePath || null,
//           profileImage: response.imagePath || response.profileImage || user?.profileImage || null,
//           branch: response.branch || user?.branch || '',
//           company: response.company || user?.company || '',
//           phone: response.phone || user?.phone || '',
//           address: response.address || user?.address || '',
//           pan: response.pan || user?.pan || '',
//           remarks: response.remarks || user?.remarks || '',
//           enable: response.enable !== undefined ? response.enable : user?.enable,
//         };
//
//         localStorage.setItem(USER_KEY, JSON.stringify(userData));
//         setUser(userData);
//       }
//     } catch (error) {
//       console.error('Error fetching user profile:', error);
//     }
//   };
//
//   const login = async (username: string, password: string) => {
//     try {
//       const response = await ApiClient.login(username, password);
//       const authToken = response?.token?.toString();
//
//       if (authToken) {
//         localStorage.setItem(TOKEN_KEY, authToken);
//         setToken(authToken);
//
//         const decoded = jwtDecode<JwtPayload>(authToken);
//
//         const userData: AppUser = {
//           id: decoded.nameid,
//           username: decoded.unique_name,
//           role: decoded.role,
//           name: response?.userInfo?.userName || decoded.unique_name,
//           email: response?.userInfo?.email || '',
//           imagePath: response?.userInfo?.imagePath || null,
//           profileImage: response?.userInfo?.imagePath || null,
//         };
//
//         localStorage.setItem(USER_KEY, JSON.stringify(userData));
//         setUser(userData);
//
//         // Fetch remaining details asynchronously
//         await fetchUserProfile();
//       } else {
//         throw new Error('Login failed: Token is missing from response');
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       throw error;
//     }
//   };
//
//   const logout = async () => {
//     try {
//       const currentToken = token || localStorage.getItem(TOKEN_KEY);
//       if (currentToken) {
//         try {
//           await ApiClient.logout(currentToken);
//         } catch {
//           console.log('Logout API failed, completing local logout');
//         }
//       }
//     } finally {
//       clearStorage();
//     }
//   };
//
//   const updateUser = (userData: Partial<AppUser>) => {
//     if (user) {
//       const updatedUser = { ...user, ...userData };
//       setUser(updatedUser);
//       localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
//     }
//   };
//
//   return (
//       <AuthContext.Provider
//           value={{
//             user,
//             token,
//             isAuthenticated: Boolean(token && user),
//             isLoading,
//             login,
//             logout,
//             updateUser,
//             fetchUserProfile,
//           }}
//       >
//         {children}
//       </AuthContext.Provider>
//   );
// };
//
// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };
import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { apiService } from '@/infrastructure/utils/ApiService';
import {
  AuthContextType,
  AppUser,
  JwtPayload,
  LoginUserUseCaseResponse,
  RestResponse
} from '@/core/auth/types';

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
    await axios.post(
        '/api/User/logout',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
    );
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