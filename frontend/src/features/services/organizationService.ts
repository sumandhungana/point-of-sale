import {apiService} from "@/infrastructure/utils/ApiService";

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
}

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}