import {apiService} from "@/infrastructure/utils/ApiService";
interface RestResponse<T>{
    code: number;
    message: string;
    data: T;
    error?: string;

}
export interface CreateSupplierRequest{
    profileImage?: string | null |'';
    name: string;
    phone:string;
    email:string;
    address:string;
    company:string;
    pan:string;
    contactPerson:string;
}

export interface CreateSupplierResponse{
    message: string;
}

export interface GetSupplierResponse{
    id: number;
    name: string;
    phone:string;
    email:string;
    address:string;
    company:string
    pan:string;
    contactPerson:string;
    profileImage:string;
    createdAt:string;
   updatedAt:string;
}

export interface UpdateSupplierRequest {
    id: number | string;
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    company?: string | null;
    pan?: string | null;
    contactPerson?: string | null;
    profileImage?: string | null;
}
export interface UpdateSupplierResponse {
    message: string;
}

export interface DeleteSupplierUseCaseResponse{
    message: string;
}

export async function createSupplier(formData: CreateSupplierRequest): Promise <CreateSupplierResponse | undefined>{
    const res = await apiService.post<RestResponse<CreateSupplierResponse>>(
        'api/v1/supplier',
        formData,
        {
            headers: {
                ...getAuthHeaders(),
            },
        }

    );
    if(res.error){
        throw new Error(res.error || "failed to create supplier");
    }else{
        return res?.response?.data
    }
}

export async function getSuppliers(): Promise<GetSupplierResponse[]> {
    const res = await apiService.get<RestResponse<GetSupplierResponse[]>>(
        'api/v1/supplier/all',
        {
            headers: {
                ...getAuthHeaders(),
            },
        }
    );

    if (res.error) {
        throw new Error(res.error || 'Failed to fetch suppliers');
    }

    const rawList: any[] = res?.response?.data || [];

    if (!Array.isArray(rawList)) {
        return [];
    }

    // Normalize fields so ID, contactPerson, and profileImage are always populated
    return rawList.map((supplier) => ({
        ...supplier,
        id: supplier.id ?? supplier.supplier_id ?? supplier.supplierId,
        contactPerson: supplier.contactPerson ?? supplier.contact_person ?? '',
        profileImage: supplier.profileImage ?? supplier.profile_image ?? '',
    }));
}

export async function fetchSingleSupplierData(id: string | number): Promise<GetSupplierResponse | undefined> {
    const res = await apiService.get<RestResponse<GetSupplierResponse>>(
        `api/v1/supplier/${id}`,
        {
            headers: {
                ...getAuthHeaders(),
            },
        }
    );

    if (res.error) {
        throw new Error(res.error || 'Failed to fetch supplier data');
    }

    return res?.response?.data;
}

export async function updateSupplier(
    formData: UpdateSupplierRequest
): Promise<UpdateSupplierResponse | undefined> {
    const supplierId = formData.id;

    if (!supplierId) {
        throw new Error('Supplier ID is required for update');
    }

    // Build payload — only include profileImage if explicitly provided
    const payload: any = {
        id: Number(supplierId),
        name: formData.name.trim(),
        phone: formData.phone ?? null,
        email: formData.email ?? null,
        address: formData.address ?? null,
        company: formData.company ?? null,
        pan: formData.pan ?? null,
        contactPerson: formData.contactPerson ?? null,
    };

    // Only include profileImage when it's a non-empty string.
    // Omitting the key tells the backend "don't touch the image".
    if (formData.profileImage) {
        payload.profileImage = formData.profileImage;
    }

    const res = await apiService.put<RestResponse<UpdateSupplierResponse>>(
        'api/v1/supplier',
        payload,
        {
            headers: {
                ...getAuthHeaders(),
            },
        }
    );

    if (res.failure || res.error) {
        throw new Error(res.error || 'Failed to update supplier');
    }

    if (res.response && res.response.code !== 0) {
        throw new Error(res.response.message || 'Server returned an error');
    }

    return res.response?.data;
}

export async function deleteSingleSuppplier(
    id: string | number
): Promise<DeleteSupplierUseCaseResponse | undefined> {
    const res = await apiService.delete<RestResponse<DeleteSupplierUseCaseResponse>>(
        `api/v1/supplier/${id}`,
        {
            headers: {
                ...getAuthHeaders(),
            },
        }
    );

    if (res.error) {
        throw new Error(res.error || 'Failed to delete customer');
    }

    return res?.response?.data;
}


function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}