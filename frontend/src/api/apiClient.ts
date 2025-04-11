import { LoginResponse } from '../types/LoginResponse';

const API_URL = 'http://localhost:5000/api';

export class ApiClient {
  static async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/accounts/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    return response.json();
  }
} 