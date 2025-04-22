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
}

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await fetch(`/api/Customer`);
    return response.json();
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
}; 