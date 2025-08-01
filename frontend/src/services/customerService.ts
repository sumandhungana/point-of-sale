const API_URL = '/api';

export interface Customer {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  company?: string;
  pan?: string;
  phoneNumber: string;
  isSupplier: boolean;
  ContactPerson?: string;
  createdAt: string;
  updatedAt: string;
  profileImage?: string;
}


export const getSuppliers = async (): Promise<Customer[]> => {
  try {
    const response = await fetch(`/api/Customer/suppliers`, { headers: getAuthHeaders() });
    return response.json();
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return [];
  } 
}; 

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await fetch(`/api/Customer`, { headers: getAuthHeaders() });
    console.log(response);
    return response.json();
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}; 

// Service for customer-related API calls

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchCustomerData(id: string) {
  const response = await fetch(`/api/Customer/${id}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch customer data');
  return response.json();
} 

export async function createCustomer(formData: any) {
  const response = await fetch('/api/Customer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(formData),
  });
  if (response.ok) {
    return response;
  } else {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to add customer');
  }
} 

export async function updateCustomer(customerId: string | number, data: any) {
  const response = await fetch(`/api/Customer/${customerId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update customer');
  }
  return response.json();
} 