import { LoginResponse } from '../types/LoginResponse';

// Use relative URLs to work with Vite proxy
const API_BASE = '/api';

export class ApiClient {
  static async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/User/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  }

  static async logout(token: string): Promise<void> {
    const response = await fetch(`${API_BASE}/User/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }
  }
} 