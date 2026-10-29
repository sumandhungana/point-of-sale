// Service for sales bill-related API calls

import { apiService } from "@/infrastructure/utils/ApiService";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

interface RestResponse<T> {
  code: number;
  message: string;
  data: T;
  error?: string;
}

export interface BillNumber {
  billNumber?: string;
}

export interface AddSalesBillResponse {
  id?: number;
  message?: string;
}

export interface GetAllSalesBillResponse {
  id?: number;
  billNumber?: string;
  billDate?: string;
  productId?: number;
  productName?: string;
  customerId?: number;
  customerName?: string;
  quantity?: number;
  unitPrice?: number;
  taxPercentage?: number;
  vatPercentage?: number;
  taxAmount?: number;
  vatAmount?: number;
  amount?: number;
  paymentMode?: string;
  paymentStatus?: string;
  remarks?: string;
  photoPath?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface GetSingleSalesBillResponse {
  id?: number;
  billNumber?: string;
  billDate?: string;
  customerId?: number;
  customerName?: string;
  productId?: number;
  productName?: string;
  quantity?: number;
  unitPrice?: number;
  taxPercentage?: number;
  vatPercentage?: number;
  taxAmount?: number;
  vatAmount?: number;
  amount?: number;
  paymentMode?: string;
  paymentStatus?: string;
  remarks?: string;
  photoPath?: string;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
}

// Fetch Auto-generated Bill Number
export const fetchBillNumber = async (): Promise<BillNumber> => {
  const res = await apiService.get<RestResponse<BillNumber>>(
    'api/v1/sales-bill/bill-number',
    {
      headers: {
        ...getAuthHeaders()
      },
    }
  );
  if (res?.response?.code !== 0 || res?.response?.message !== 'SUCCESS') {
    throw new Error(res.error || "Failed to Fetch Bill Number");
  }
  if (res.error) {
    throw new Error(res.error || "Failed to Fetch Bill Number");
  }
  return res?.response?.data ?? {};
};

// Fetch All Sales Bills
export const getAllSalesBill = async (): Promise<GetAllSalesBillResponse[]> => {
  const res = await apiService.get<RestResponse<GetAllSalesBillResponse[]>>(
    `api/v1/sales-bill/all-bills`,
    {
      headers: {
        ...getAuthHeaders()
      },
    }
  );

  if (res?.response?.code !== 0 || res?.response?.message !== 'SUCCESS') {
    throw new Error(res.error || "Failed to Fetch Sales Bills");
  }
  if (res.error) {
    throw new Error(res.error || "Failed to Fetch Sales Bills");
  }
  return res?.response?.data ?? [];
};

// Fetch Single Sales Bill by ID
export const getSingleSalesBill = async (id: number): Promise<GetSingleSalesBillResponse> => {
  const res = await apiService.get<RestResponse<GetSingleSalesBillResponse>>(
    `api/v1/sales-bill?id=${id}`,
    {
      headers: {
        ...getAuthHeaders()
      },
    }
  );
  if (res?.response?.code !== 0 || res?.response?.message !== 'SUCCESS') {
    throw new Error(res.error || "Failed to fetch sales bill details");
  }
  if (res.error) {
    throw new Error(res.error || "Failed to fetch sales bill details");
  }
  return res?.response?.data;
};

// Update Sales Bill (PUT /api/v1/sales-bill)
export const updateSalesBill = async (data: any): Promise<AddSalesBillResponse> => {
  const res = await apiService.put<RestResponse<AddSalesBillResponse>>(
    'api/v1/sales-bill',
    data,
    {
      headers: {
        ...getAuthHeaders()
      },
    }
  );

  if (res?.response?.code !== 0 || res?.response?.message !== 'SUCCESS') {
    throw new Error(res.error || "Failed to update sales bill");
  }
  if (res.error) {
    throw new Error(res.error || "Failed to update sales bill");
  }
  return res?.response?.data ?? {};
};

// Add or Edit Sales Bill
export const addSalesBill = async (data: any, isEditMode: boolean, id?: number): Promise<AddSalesBillResponse> => {
  if (isEditMode) {
    return updateSalesBill({ ...data, id: id ?? data.id });
  }

  const res = await apiService.post<RestResponse<AddSalesBillResponse>>(
    'api/v1/sales-bill',
    data,
    {
      headers: {
        ...getAuthHeaders()
      },
    }
  );

  if (res?.response?.code !== 0 || res?.response?.message !== 'SUCCESS') {
    throw new Error(res.error || "Failed to save sales bill");
  }
  if (res.error) {
    throw new Error(res.error || "Failed to save sales bill");
  }
  return res?.response?.data ?? {};
};
