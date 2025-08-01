import axios from 'axios';

const API_URL = 'http://localhost:5120/api';

export interface KhataBook {
  id: number;
  name: string;
  number: string;
  address: string;
  email: string;
  companyName: string;
  companyNumber: string;
  companyAddress: string;
  companyEmail: string;
  schemaName: string;
  businessCategory: number;
  businessType: number;
  taxVat: boolean;
  bookAccount: boolean;
  kyc: boolean;
  imagePath: string;
  createdAt: string;
  updatedAt: string;
}

// Default admin KhataBook
const defaultAdminKhataBook: KhataBook = {
  id: 0,
  name: 'Admin',
  number: '0000000000',
  address: 'Default Address',
  email: 'admin@example.com',
  companyName: 'Admin Company',
  companyNumber: '0000000000',
  companyAddress: 'Default Company Address',
  companyEmail: 'admin@company.com',
  schemaName: 'initSchema',
  businessCategory: 1,
  businessType: 1,
  taxVat: false,
  bookAccount: true,
  kyc: true,
  imagePath: 'https://via.placeholder.com/150?text=Admin',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getKhataBooks = async (): Promise<KhataBook[]> => {
  try {
    const response = await fetch(`${API_URL}/KhataBook`, { headers: getAuthHeaders() });
    const data = await response.json();
    // Add default admin entry if no KhataBooks exist
    if (!data || data.length === 0) {
      return [defaultAdminKhataBook];
    }
    return [defaultAdminKhataBook,...data];
  } catch (error) {
    console.error('Error fetching KhataBooks:', error);
    // Return default admin entry if API call fails
    return [defaultAdminKhataBook];
  }
};

export async function createKhataBook(formData: FormData) {
  try {
    const response = await fetch(`${API_URL}/KhataBook`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        // Do NOT set Content-Type for FormData - browser will set it automatically with boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error creating KhataBook:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to create KhataBook: ${error.message}`);
    }
    throw new Error('Failed to create KhataBook: Unknown error');
  }
} 