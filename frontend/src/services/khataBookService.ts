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
    const response = await fetch(`/api/KhataBook`, { headers: getAuthHeaders() });
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
  const response = await fetch('/api/KhataBook', {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });
  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to create Khata Book');
  }
  return responseData;
} 