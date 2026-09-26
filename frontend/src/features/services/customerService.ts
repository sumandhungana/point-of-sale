import {apiService} from "@/infrastructure/utils/ApiService";

export interface Customer {
  id: number;
  customerId?: number; // Backend key
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  company?: string;
  pan?: string;
  contactPerson?: string;
  isSupplier: boolean;

  bankAccount?: string;
  cashBalance?: number;
  profileImage?: string;

  customerSmsSetting?: boolean;
  smsLanguage?: boolean;
  transactionHistoryCheck?: boolean;

  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;

  paymentDateReminder?: string; // Optional UI/derived field
}


export interface Supplier {
  id: number;
  supplierId?: number; // Backend key
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  company?: string;
  pan?: string;
  contactPerson?: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;

  paymentDateReminder?: string; // Optional UI/derived field
}

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  company?: string;
  pan?: string;
  contactPerson?: string;
  isSupplier: boolean;

  bankAccount?: string;
  cashBalance?: number;
  profileImage?: string;

  customerSmsSetting?: boolean;
  smsLanguage?: boolean;
  transactionHistoryCheck?: boolean;
}

export interface CreateCustomerResponse {
  message: string;
  id: number;
}

export interface UpdateCustomerRequest {
  customerId: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  company?: string | null;
  pan?: string | null;
  contactPerson?: string | null;
  bankAccount?: string | null;
  cashBalance?: number;
  profileImage?: string | null;
}
export interface UpdateCustomerResponse {
  message: string;
  id: number;
}

interface RestResponse<T> {
  code: number;
  message: string;
  data: T;

  error?: string;
}

export interface DeleteCustomerUseCaseResponse {
  message: string;
}

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const res = await apiService.get<RestResponse<Customer[]>>(
        'api/v1/customer/all-customers',
        {
          headers: {
            ...getAuthHeaders(),
          },
        }
    );

    // 1. Check for errors first
    if (res.error) {
      console.error('Error fetching customers:', res.error);
      return [];
    }

    // 2. Return data safely with a fallback empty array
    return res?.response?.data ?? [];
  } catch (error) {
    console.error('Error fetching customers:', error);
    return [];
  }
};

export async function fetchCustomers(): Promise<Customer[]> {
  const res = await apiService.get<RestResponse<Customer[]>>(
      'api/v1/customer/all-customers',
      {
        headers: {
          ...getAuthHeaders(),
        },
      }
  );

  if (res.error) {
    throw new Error(res.error || 'Failed to fetch customers');
  }

  const rawList: any[] = res?.response?.data || [];

  if (!Array.isArray(rawList)) {
    return [];
  }

  // Normalize so customer.id is always populated
  return rawList.map((customer) => ({
    ...customer,
    id: customer.id ?? customer.customerId,
  }));
}

export async function fetchSuppliers(): Promise<Customer[]> {
  const res = await apiService.get<RestResponse<Customer[]>>(
      'api/v1/customer/suppliers',
      {
        headers: {
          ...getAuthHeaders(),
        },
      }
  );

  if (res.error) {
    throw new Error(res.error || 'Failed to fetch suppliers');
  }

  const rawList: any[] = res?.response?.data || [];

  if (!Array.isArray(rawList)) {
    return [];
  }

  // Normalize so customer.id is always populated
  return rawList.map((customer) => ({
    ...customer,
    id: customer.id ?? customer.customerId,
  }));
}

// Service for customer-related API calls

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchCustomerData(id: string) {
  const response = await fetch(`/api/v1/Customer/${id}`, { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch customer data');
  return response.json();
}

export async function fetchSingleCustomerData(id: string | number): Promise<Customer | undefined> {
  const res = await apiService.get<RestResponse<Customer>>(
      `api/v1/customer/${id}`,
      {
        headers: {
          ...getAuthHeaders(),
        },
      }
  );

  if (res.error) {
    throw new Error(res.error || 'Failed to fetch customer data');
  }

  return res?.response?.data;
}


export async function createCustomer(formData: CreateCustomerRequest): Promise<CreateCustomerResponse | undefined> {
  const res = await apiService.post<RestResponse<CreateCustomerResponse>>(
      'api/v1/customer', // Or '/api/Customer' if your backend endpoint uses that exact path
      formData,
      {
        headers: {
          ...getAuthHeaders(),
        },
      }
  );

  if (res.error) {
    throw new Error(res.error || 'Failed to create customer');
  }

  return res?.response?.data;
}

//method to update user


export async function updateCustomer(
    formData: UpdateCustomerRequest
): Promise<UpdateCustomerResponse | undefined> {
  const customerId = formData.customerId ?? formData.customerId;

  if (!customerId) {
    throw new Error('Customer ID is required for update');
  }

  // Build clean payload without foreign/duplicate keys
  const payload = {
    customerId: Number(customerId),
    name: formData.name,
    phone: formData.phone ?? null,
    email: formData.email ?? null,
    address: formData.address ?? null,
    company: formData.company ?? null,
    pan: formData.pan ?? null,
    contactPerson: formData.contactPerson ?? null,
    bankAccount: formData.bankAccount ?? null,
    cashBalance: Number(formData.cashBalance) || 0,
    profileImage: formData.profileImage || "",
  };

  const res = await apiService.put<RestResponse<UpdateCustomerResponse>>(
      'api/v1/customer',
      payload,
      {
        headers: {
          ...getAuthHeaders(),
        },
      }
  );

  // Check HTTP failure from apiService wrapper
  if (res.failure || res.error) {
    throw new Error(res.error || 'Failed to update customer');
  }

  // Check business error from backend RestResponse
  if (res.response && res.response.code !== 0) {
    throw new Error(res.response.message || 'Server returned an error');
  }

  return res.response?.data;
}


export async function deleteSingleCustomer(
    id: string | number
): Promise<DeleteCustomerUseCaseResponse | undefined> {
  const res = await apiService.delete<RestResponse<DeleteCustomerUseCaseResponse>>(
      `api/v1/customer/${id}`,
      {
        headers: {
          ...getAuthHeaders(),
        },
      }
  );

  if (res.error) {
    throw new Error(res.error || 'Failed to delete customer');
  }

  return res?.response?.data;
}