import {apiService} from "@/infrastructure/utils/ApiService";
import {toast} from "react-toastify";
import error = toast.error;

export interface CreateOrganization{
    userName: string;
    phoneNumber: string;
    gmail: string;
    password: string;
    organizationEmail?: string | '';
    organizationContactNumber?: string | '';
    organizationName: string;
    organizationAddress: string;
    panVatNumber: string;
    branch: string;
    organizationType: string;
    notes: string;
    role: string;
}

export interface GetAllMember{
    id:number;
    referenceMemberId: number;
    organizationName: string;
    panVatNumber: string;
    organizationType: string;
    branch: string;
    organizationAddress: string;
    organizationEmail: string;
    organizationContactNumber: string;
    notes: string;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    isActive?: boolean;
    userId?: number;
    userName?: string;
    userEmail?: string;
    roleId?: string;
    roleName?: string;
}


interface RestResponse<T>{
    code:number;
    message :string;
    data: T
}

export interface CreateOrganizationResponse{
    userId?: number;
    gmail?: string;
    userName?: string;
    organizationName?: string;
    message?: string;
    success?: boolean;
    errorMessage?: string;
}

export async function createOrganization(formData: CreateOrganization): Promise<CreateOrganizationResponse | undefined>{
    const res= await apiService.post<RestResponse<CreateOrganizationResponse>>(
        'api/v1/member/organization-register',
        formData,
        {
            headers: {
                ...getAuthHeaders()
            },
        }
    );

    if(res?.response?.code === 0 && res?.response?.message === 'SUCCESS') {
        invalidateOrganizationCache();
        return  res.response.data;
    }
    throw  new Error("Unable to Register Organization")
};




import { isCurrentSuperAdmin } from '@/core/rbac/usePermission';

let orgListCache: { data: GetAllMember[]; timestamp: number } | null = null;
const ORG_CACHE_TTL = 15000; // 15 seconds

export const invalidateOrganizationCache = (): void => {
    orgListCache = null;
};

export async function getAllOrganization(forceRefresh = false): Promise<GetAllMember[]> {
    // 1. Strict Role-Based Execution: Only authenticated Super Admin can trigger organization-list
    if (!isCurrentSuperAdmin()) {
        console.warn('getAllOrganization skipped: current user is not a Super Admin');
        return [];
    }

    // 2. Prevent duplicate requests: Return cached data if fresh
    const now = Date.now();
    if (!forceRefresh && orgListCache && now - orgListCache.timestamp < ORG_CACHE_TTL) {
        return orgListCache.data;
    }

    try {
        const res = await apiService.get<RestResponse<GetAllMember[]>>(
            'api/v1/member/organization-list',
            {
                headers: {
                    ...getAuthHeaders(),
                },
            }
        );

        if (res.response?.code === -1 || (res.response?.message && res.response.message !== 'SUCCESS')) {
            console.error('Failed to fetch organizations:', res.error);
            throw new Error(res.error || 'Failed to fetch organization');
        }

        const data = res?.response?.data || [];
        orgListCache = { data, timestamp: now };
        return data;
    } catch (error) {
        console.error('Error fetching organizations:', error);
        return [];
    }
}

export interface ApproveOrganizationRequest {
    memberId: number;
    userId?: number;
    roleId?: string;
}

export interface ApproveOrganizationResponse {
    memberId: number;
    userId: number;
    status: string;
    message: string;
}

export async function approveOrganization(data: ApproveOrganizationRequest): Promise<ApproveOrganizationResponse> {
    const res = await apiService.post<RestResponse<ApproveOrganizationResponse>>(
        'api/v1/member/approve',
        data,
        {
            headers: {
                ...getAuthHeaders(),
            },
        }
    );

    if (res?.response?.code === 0 && res?.response?.message === 'SUCCESS') {
        invalidateOrganizationCache();
        return res.response.data;
    }
    throw new Error(res?.response?.message || 'Failed to approve organization');
}

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}