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
        return  res.response.data;
    }
    throw  new Error("Unable to Register Organization")
};




export async function getAllOrganization(): Promise<GetAllMember[]>{
    try{
        const res= await apiService.get<RestResponse<GetAllMember[]>>(
            'api/v1/member/organization-list',

            {
                headers: {
                    ...getAuthHeaders(),
                },
            }
        );

        if(res.response?.code== -1 || res.response?.message!= 'SUCCESS' ){
            console.error('Failed to fetch organizations:', res.error);
            throw error("Failed to fetch organization");
        }
        return res?.response?.data;
    } catch (error) {
        console.error('Error fetching KhataBooks:', error);
        // Return empty array if API call fails
        return [];
    }
}

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}