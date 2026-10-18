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

// Memory cache for rental items
let rentalCache: { data: RentalItemDto[]; timestamp: number } | null = null;
const RENTAL_CACHE_TTL_MS = 30000; // 30 seconds

export const invalidateRentalCache = (): void => {
  rentalCache = null;
};

export const addRental = async (data: AddRentalRequest, isEditMode: boolean = false, id?: number): Promise<AddRentalResponse> => {
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

  // Invalidate cache after create/update
  invalidateRentalCache();

  return res?.response?.data ?? ({} as AddRentalResponse);
};

export const fetchRental = async (forceRefresh: boolean = false): Promise<RentalItemDto[]> => {
  const now = Date.now();
  if (!forceRefresh && rentalCache && now - rentalCache.timestamp < RENTAL_CACHE_TTL_MS) {
    return rentalCache.data;
  }

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

  const items = res?.response?.data ?? [];
  rentalCache = { data: items, timestamp: Date.now() };
  return items;
};

export const fetchRentalItems = fetchRental;