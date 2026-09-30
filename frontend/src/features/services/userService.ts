import {apiService} from "@/infrastructure/utils/ApiService";

// ============================================================
// GET USERS
// ============================================================

export interface User {
    id: number;
    phoneNumber: string;
    userId: number;
    userName: string;
    role: string;
    email: string;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedBy: string;
    updatedAt: string;
    memberId?: number | null; // Selected member association
}
interface RestResponse<T> {
    code: number;
    message: string;
    data: T;
    error?: string;
}
export interface UserPayload {
    fullName: string;
    email: string;
    phoneNumber?: string;
    roleId: number;
    status: 'ACTIVE' | 'INACTIVE';
}

// Simulated API Endpoints (Replace base URLs with your Micronaut endpoint)
const BASE_URL = '/api/users';

function getAuthHeaders(): Record<string, string> {
    const token =
        localStorage.getItem('authToken');

    if (!token) {
        return {};
    }

    return {
        Authorization: `Bearer ${token}`,
    };
}

export const fetchUsers = async (): Promise<User[] | any[]> => {
    const res= await apiService.get<RestResponse<User[]>>(
        'api/v1/user/list',
        {
            headers:{
                ...getAuthHeaders()
            },
        }
    );
    if(res?.response?.code != 0 || res?.response?.message != 'SUCCESS') {
        throw new Error(res.error || "Failed to Fetch User");
    }
    if(res.error){
        throw new Error(res.error || "Failed to Fetch User");
    }
    return res?.response?.data ?? [];
};



export const addUser = async (payload: UserPayload): Promise<User> => {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
};

export const updateUser = async (id: number, payload: UserPayload): Promise<User> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
};

export const deleteUser = async (id: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete user');
};