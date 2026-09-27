import {apiService} from "@/infrastructure/utils/ApiService";

// Use relative URLs to work with Vite proxy
const API_URL = '/api';

export interface UserBasedAllMember {
  id: number;
  refMemberId: number;
  organizationName: string;
  organizationContactNumber: string;
  organizationAddress: string;
  organizationEmail: string;
  organizationType: string;
  panVatNumber: string;
  branch: string;
  notes: string;
  createdAt: string;
  updatedAt: string;

}


export interface GetSelectedMember {
  id: number;
  refMemberId: number;
  organizationName: string;
  organizationContactNumber: string;
  organizationAddress: string;
  organizationEmail: string;
  organizationType: string;
  panVatNumber: string;
  branch: string;
  notes: string;
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
  organizationName:string;
  organizationPhoneNumber:string;
  organizationEmail:string;
  panVatNumber:string;
  branch:string;
  organizationType:string;
  organizationAddress:string;
  notes:string;
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
      'api/v1/user/member-onboarding',
      formData,
      {
        headers:{
          ...getAuthHeaders()
        },
      }
  );
  if(res?.response?.code !== 0 || res?.response?.message !== 'SUCCESS') {
    // toast("Failed to create KhataBook")
    throw  Error("Failed to create KhataBook")
  }

  return res?.response?.data;
}


function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getKhataBooks = async (): Promise<UserBasedAllMember[]> => {
  try {
    const res= await apiService.get<RestResponse<UserBasedAllMember[]>>(
        'api/v1/member/user-all-member',
        {
          headers:{
            ...getAuthHeaders()
          },
        }
    );
    if(res?.response?.code !== 0 || res?.response?.message !== 'SUCCESS') {
      // toast("Failed to create KhataBook")
      throw  Error("Failed to fetch KhataBook")
    }

    return res?.response?.data;
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

    const res = await apiService.get<RestResponse<GetSelectedMember>>(
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