import {apiService} from "@/infrastructure/utils/ApiService";
import {PermissionResponse} from "@/core/auth/types";

// Use relative URLs to work with Vite proxy
const API_URL = '/api';

export interface UserBasedAllMember {
  id: number;
  referenceMemberId: number;
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


export interface UserInfo {
  id: number;
  userId: string;
  userName: string;
  email: string;
  enabled: string;
  imagePath: string;
  subscriptionType: string;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  isSubscriptionActive: boolean;
  hasUsedTrial: boolean;
  permissionResponse?: PermissionResponse | PermissionResponse[];
  subscriptionStatus: string;
  permission: string[];
  role: string;
}

export interface TokenFlushResponse {
  token: string;
  message: string;
  userInfo: UserInfo;
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

// Helper functions to manage full-screen loading overlay directly in DOM
const showFullPageLoader = () => {
  if (document.getElementById('khata-global-loader')) return;

  const overlay = document.createElement('div');
  overlay.id = 'khata-global-loader';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 99999;
    color: #ffffff;
    font-family: sans-serif;
  `;

  overlay.innerHTML = `
    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
      <span class="visually-hidden">Loading...</span>
    </div>
    <p style="margin-top: 1rem; font-weight: 600; font-size: 1.1rem;">Switching KhataBook, please wait...</p>
  `;

  document.body.appendChild(overlay);
};

const hideFullPageLoader = () => {
  const overlay = document.getElementById('khata-global-loader');
  if (overlay) {
    overlay.remove();
  }
};

export async function switchKhataBook(memberId: number, refMember: number) {
  showFullPageLoader();
  let refMemberId = refMember == null ? 0 : refMember
  try {
    const res = await apiService.get<RestResponse<TokenFlushResponse>>(
        'api/v1/user/flush-token',
        {
          headers: {
            ...getAuthHeaders(),
          },
          params: {
            memberId,
            refMemberId,
          },
        }
    );
    if(res?.response?.code !== 0 || res?.response?.message !== 'SUCCESS') {
      // toast("Failed to create KhataBook")
      throw  Error("Failed to flush token ")
    }

    const newToken = res?.response?.data?.token;

    if (newToken) {
      // Remove old token and store the new token
      localStorage.removeItem('authToken');
      localStorage.setItem('authToken', newToken);
    }
    window.location.reload();
    return res?.response?.data;
  } catch (error) {
    hideFullPageLoader();
    console.error('Error switching KhataBook:', error);
    throw error;
  }
}

export async function getSelectedKhataBook() {
  try {

    const res = await apiService.get<RestResponse<UserBasedAllMember>>(
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