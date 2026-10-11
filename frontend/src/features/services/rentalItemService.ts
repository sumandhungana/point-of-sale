// Service for rental item-related API calls

import {apiService} from "@/infrastructure/utils/ApiService";

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

export interface AddRentalRequest {
  rentalItemName: string;
  phoneNumber: string;
  address: string;
  rentalAmount: number;
  rentalPeriod: string;
  startDate: string;
  endDate: string;
  remarks?: string;
}

export interface AddRentalResponse {
  id: number;
  rentalItemName: string;
}

export interface RentalItemDto {
  id: number;
  rentalItemName: string;
  phoneNumber: string;
  address: string;
  rentalAmount: number;
  rentalPeriod: string;
  startDate: string;
  endDate: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const addRental = async (data: AddRentalRequest, isEditMode: boolean, id?: number): Promise<AddRentalResponse> => {
  let url: string;
  let res;

  if (isEditMode && id) {
    url = `api/v1/rental/${id}`;
    res = await apiService.put<RestResponse<AddRentalResponse>>(
        url,
        data,
        {
          headers: {
            ...getAuthHeaders()
          },
        }
    );
  } else {
    url = 'api/v1/rental';
    res = await apiService.post<RestResponse<AddRentalResponse>>(
        url,
        data,
        {
          headers: {
            ...getAuthHeaders()
          },
        }
    );
  }

  if (res?.response?.code !== 0 || res?.response?.message !== 'SUCCESS') {
    throw new Error(res.error || "Failed to save rental item");
  }
  if (res.error) {
    throw new Error(res.error || "Failed to save rental item");
  }
  return res?.response?.data ?? ({} as AddRentalResponse);
};

export const fetchRental = async (): Promise<RentalItemDto[]> => {
  const res = await apiService.get<RestResponse<RentalItemDto[]>>(
      `api/v1/rental/list`,
      {
        headers: {
          ...getAuthHeaders()
        },
      }
  );

  if (res?.response?.code !== 0 || res?.response?.message !== 'SUCCESS') {
    throw new Error(res.error || "Failed to fetch rental items");
  }
  if (res.error) {
    throw new Error(res.error || "Failed to fetch rental items");
  }
  return res?.response?.data ?? [];
};

export const fetchRentalItems = fetchRental;