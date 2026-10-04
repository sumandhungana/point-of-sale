import { apiService } from "@/infrastructure/utils/ApiService";
import { toast } from "react-toastify";

const error = toast.error;
const success = toast.success;

export interface RestResponse<T> {
    code: number;
    message: string;
    data: T;
}

export interface AddProductRequest {
    name: string;
    categoryId: number;
    itemCount: number;
    unit: string;
    perUnitPurchasePrice: number;
    grossPurchasePrice: number;
    salesPrice: number;
    isTaxIncluded?: boolean;
    openingStock: number;
    lowStockAlert: number;
    vatPercentage?: number;
    vatDate: string;
    imageUrl: string;
}

export interface ItemCategory {
    id?: number;
    name?: string;
}

export interface Item {
    id: number;
    sku?: string;
    name: string;
    itemCount: number;
    unit: string;
    salesPrice: number;
    perUnitPurchasePrice: number;
    grossPurchasePrice: number;
    openingStock: number;
    category?: ItemCategory;
    imageUrl?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;

    /** @deprecated Use perUnitPurchasePrice instead */
    purchasePrice?: number;
}

export interface ItemsResponse {
    items: Item[];
    totalSalesPrice: number;
    totalItems: number;
}

export interface AddProductResponse {
    id: number;
    message: string;
}

export async function addProduct(formData: AddProductRequest): Promise<AddProductResponse | undefined> {
    const res = await apiService.post<RestResponse<AddProductResponse>>(
        'api/v1/product',
        formData,
        {
            headers: {
                ...getAuthHeaders()
            },
        }
    );

    if (res.response?.code === -1 || res.response?.message !== 'SUCCESS') {
        error("Failed to create product");
        throw new Error(res.error || "Failed to create product");
    }

    if (res.error) {
        throw new Error(res.error || "Failed to create product");
    } else {
        success("Product created successfully");
        return res.response?.data;
    }
}

// Updated to return a single ItemsResponse by unwrapping the array
export async function getProduct(): Promise<ItemsResponse | undefined> {
    try {
        const res = await apiService.get<any>('api/v1/product/all-products', {
            headers: {
                ...getAuthHeaders()
            },
        });

        console.log("API RAW RESPONSE:", res);

        // Normalize response body structure


        // Check response success code
        if (res?.response.code !== 0 || res?.response?.message !== 'SUCCESS') {
            error("Failed to fetch products");
            throw new Error(res?.error || res?.response?.message || "Failed to fetch products");
        }

        const responseData = res?.response?.data;

        // If backend returns data object directly: { items: [...], totalSalesPrice: 0, totalItems: 2 }
        if (responseData && !Array.isArray(responseData)) {
            return {
                items: responseData.items || [],
                totalSalesPrice: responseData.totalSalesPrice || 0,
                totalItems: responseData.totalItems || 0
            };
        }

        // Fallback if data is wrapped inside an array
        if (Array.isArray(responseData) && responseData.length > 0) {
            return {
                items: responseData[0].items || [],
                totalSalesPrice: responseData[0].totalSalesPrice || 0,
                totalItems: responseData[0].totalItems || 0
            };
        }

        return {
            items: [],
            totalSalesPrice: 0,
            totalItems: 0
        };
    } catch (err) {
        console.error("Error inside getProduct service:", err);
        throw err;
    }
}

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}