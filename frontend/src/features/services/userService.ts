import { apiService } from "@/infrastructure/utils/ApiService";

export interface User {
    id: number;
    phoneNumber?: string;
    userId: number;
    userName: string;
    role: string;
    email: string;
    isActive: boolean;
    createdBy?: string;
    createdAt?: string;
    updatedBy?: string;
    updatedAt?: string;
    memberId?: number | null;
}

export interface RestResponse<T> {
    code: number;
    message: string;
    data: T;
    error?: string;
}

export interface AddUserRequest {
    userName: string;
    email: string;
    password?: string;
    phoneNumber?: string;
    role: string;
    enable?: boolean;
    memberId?: number;
}

export interface AddUserResponse {
    id: number;
    userId: number;
    userName: string;
    email: string;
    phoneNumber?: string;
    role: string;
    isActive: boolean;
    memberId?: number;
    memberName?: string;
    createdBy?: string;
    createdAt?: string;
}

export interface UserPayload {
    fullName?: string;
    userName?: string;
    email: string;
    phoneNumber?: string;
    password?: string;
    roleId?: number | string;
    role?: string;
    status?: 'ACTIVE' | 'INACTIVE';
    isActive?: boolean;
    memberId?: number;
}

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export const fetchUsers = async (memberId?: number): Promise<User[]> => {
    const query = memberId ? `?memberId=${memberId}` : '';
    const res = await apiService.get<RestResponse<User[]>>(
        `api/v1/user/list${query}`,
        {
            headers: {
                ...getAuthHeaders()
            },
        }
    );
    if (res?.response?.code !== 0 || res?.response?.message !== 'SUCCESS') {
        throw new Error(res.error || res?.response?.error || "Failed to Fetch User");
    }
    return res?.response?.data ?? [];
};

export const addUser = async (payload: AddUserRequest): Promise<AddUserResponse> => {
    const res = await apiService.post<RestResponse<AddUserResponse>>(
        'api/v1/user/add',
        payload,
        {
            headers: {
                ...getAuthHeaders()
            }
        }
    );
    if (res?.response?.code !== 0 || res?.response?.message !== 'SUCCESS') {
        throw new Error(res?.error || res?.response?.error || 'Failed to add user');
    }
    return res.response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
    const res = await apiService.delete<RestResponse<void>>(
        `api/v1/user/${id}`,
        {
            headers: {
                ...getAuthHeaders()
            }
        }
    );
    if (res?.response?.code !== 0 && res?.response?.message !== 'SUCCESS') {
        console.warn('Delete user endpoint warning:', res?.error);
    }
};