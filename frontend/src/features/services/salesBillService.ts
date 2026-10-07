// Service for sales bill-related API calls

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
    remarks?: string;
    photoPath?: string;
    createdBy?: string;
    createdAt?: string;
    updatedBy?: string;
    updatedAt?: string;
}

//fetch Bill Number

export const fetchBillNumber = async (): Promise<BillNumber> => {
  const res= await apiService.get<RestResponse<BillNumber>>(
      'api/v1/sales-bill/bill-number',
      {
        headers:{
          ...getAuthHeaders()
        },
      }
  );
  if(res?.response?.code != 0 || res?.response?.message != 'SUCCESS') {
    throw new Error(res.error || "Failed to Fetch Bill Number");
  }
  if(res.error){
    throw new Error(res.error || "Failed to Fetch Bill Number");
  }
  return res?.response?.data ?? [];
};


export const getAllSalesBill = async( ): Promise<GetAllSalesBillResponse[]> => {

   const res = await apiService.get<RestResponse<GetAllSalesBillResponse[]>>(
        `api/v1/sales-bill/all-bills`,

        {
          headers:{
            ...getAuthHeaders()
          },
        }
    );

  if(res?.response?.code != 0 || res?.response?.message != 'SUCCESS') {
    throw new Error(res.error || "Failed to Add Bill Number");
  }
  if(res.error){
    throw new Error(res.error || "Failed to Add Bill Number");
  }
  return res?.response?.data ?? [];
};


export const addSalesBill = async (data: any, isEditMode: boolean, id?: number): Promise<AddSalesBillResponse> => {
  const url = isEditMode && id ? `api/v1/sales-bill/${id}` : 'api/v1/sales-bill';
  let res;
  if(isEditMode && id) {
    res = await apiService.post<RestResponse<AddSalesBillResponse>>(
        url,
        data,
        {
          headers:{
            ...getAuthHeaders()
          },
        }
    );
  } else {
    res = await apiService.post<RestResponse<AddSalesBillResponse>>(
        url,
        data,
        {
          headers: {
            ...getAuthHeaders()
          },
        }
    );
  }
  if(res?.response?.code != 0 || res?.response?.message != 'SUCCESS') {
    throw new Error(res.error || "Failed to Add Bill Number");
  }
  if(res.error){
    throw new Error(res.error || "Failed to Add Bill Number");
  }
  return res?.response?.data ?? [];
};
