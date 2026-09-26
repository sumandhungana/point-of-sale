import {apiService} from "@/infrastructure/utils/ApiService";

// Use relative URLs to work with Vite proxy
const API_URL = '/api';

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
  businessCategory: number;
  businessType: number;
  taxVat: boolean;
  bookAccount: boolean;
  kyc: boolean;
  imagePath: string;
  createdAt: string;
  updatedAt: string;
}

interface RestResponse<T> {
  code: number;
  message: string;
  data: T;
  error?: string;
}

export interface CreateKhatBookRequest{

  userName: string;
  phoneNumber:string;
  gmail:string;
  organizationName:string;
  panVatNumber:string;
  branch:string;
  organizationType:string;
  organizationAddress:string;
  notes:string;
  password:string;
  userId:string;
  role:string;
  isExternalOnboarding:boolean;
}

export interface CreateKhataBookResponse{
  userId: number;
  gmail: string;
  userName: string;
  organizationName: string;
  memberId:string;
  message:string;
  success:boolean;
  errorMessage:string;
}

export async function createNewKhataBook(formData: CreateKhatBookRequest): Promise<CreateKhataBookResponse | undefined>{
  const res= await apiService.post<RestResponse<CreateKhataBookResponse>>(
      'api/v1/user/onboarding',
      formData,
      {
        headers:{
          ...getAuthHeaders()
        },
      }
  );
  if(res.error){
    throw new Error(res.error || "Failed to create khatabook");
  }
  return res?.response?.data;
}


function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getKhataBooks = async (): Promise<KhataBook[]> => {
  try {
    const response = await fetch(`${API_URL}/KhataBook`, { headers: getAuthHeaders() });
    const data = await response.json();
    
    // Return the data as is - the backend migration ensures a default KhataBook exists
    return data || [];
  } catch (error) {
    console.error('Error fetching KhataBooks:', error);
    // Return empty array if API call fails
    return [];
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

export async function switchKhataBook(khataBookId: number) {
  try {
    const response = await fetch(`${API_URL}/KhataBook/switch/${khataBookId}`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error switching KhataBook:', error);
    throw error;
  }
}

export async function getSelectedKhataBook() {
  try {

    const res = await apiService.get<RestResponse<KhataBook>>(
        'api/v1/member/selected-member',
        {
          headers: {
            ...getAuthHeaders(),
          },
        }
    );

    if (res.error) {
      throw new Error('Failed to fetch selected khatabook/member');
    }

    const selectedKhataBook = res?.response?.data;

    // If the selected KhataBook is null or undefined, throw an error
    if (!selectedKhataBook || !selectedKhataBook.id) {
      throw new Error('Selected KhataBook is null or undefined');
    }

    return selectedKhataBook;
  } catch (error) {
    console.error('Error getting selected KhataBook:', error);
    throw error;
  }
} 

export async function updateKhataBook(
  id: number,
  formData: FormData
): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/KhataBook/${id}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        errorText || `Failed to update KhataBook. HTTP ${response.status}`
      );
    }
  } catch (error) {
    console.error('Error updating KhataBook:', error);
    throw error;
  }}