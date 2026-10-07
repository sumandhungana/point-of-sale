import { apiService } from "@/infrastructure/utils/ApiService";

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

export interface PurchaseBillNumber {
    purchaseNo?: string;
}
export interface PurchaseItemPayload {
    productId: number;
    itemCount: number;
    perUnitPurchasePrice: number;
}

export interface AddPurchaseBillRequest {
    purchaseNo?: string;
    purchaseDate: string; // YYYY-MM-DD
    paymentMode: string;
    supplierId?: number;
    remarks?: string;
    photoPath?: string;
    items: PurchaseItemPayload[];
}

export interface AddPurchaseBillResponse {
    id?: number;
    purchaseNo?: string;
}

export interface GetAllPurchaseBillResponse {
    id?: number;
    purchaseNo?: string;
    date?: string;
    amount?: number;
    paymentMode?: string;
    remarks?: string;
    photoPath?: string;
    category?: {
        name?: string;
    };
    item?: {
        name?: string;
        imageUrl?: string;
    };
}


export const fetchPurchaseBillNumber = async (): Promise<PurchaseBillNumber> => {
    const res= await apiService.get<RestResponse<PurchaseBillNumber>>(
        'api/v1/purchase-bill/bill-number',
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
export const fetchPurchases = async (): Promise<GetAllPurchaseBillResponse[]> => {
    const res = await apiService.get<RestResponse<GetAllPurchaseBillResponse[]>>(
        `api/v1/purchase-bill/all-bills`,
        {
            headers: {
                ...getAuthHeaders()
            },
        }
    );

    if (res?.response?.code !== 0 || res?.response?.message !== 'SUCCESS') {
        throw new Error(res.error || "Failed to fetch purchase bills");
    }
    if (res.error) {
        throw new Error(res.error || "Failed to fetch purchase bills");
    }
    return res?.response?.data ?? [];
};

export const savePurchase = async (data: AddPurchaseBillRequest, isEditMode: boolean, id?: number): Promise<AddPurchaseBillResponse> => {
    // Note: If you implement update support in the backend later, adjust the URL if needed.
    let url;
    if (isEditMode && id) {
        url = 'api/v1/purchase-bill/{id}'
    } else {
        url = 'api/v1/purchase-bill';
    }

    const res = await apiService.post<RestResponse<AddPurchaseBillResponse>>(
        url,
        data,
        {
            headers: {
                ...getAuthHeaders()
            },
        }
    );

    if (res?.response?.code !== 0 || res?.response?.message !== 'SUCCESS') {
        throw new Error(res.error || "Failed to save purchase bill");
    }
    if (res.error) {
        throw new Error(res.error || "Failed to save purchase bill");
    }
    return res?.response?.data ?? {};
};