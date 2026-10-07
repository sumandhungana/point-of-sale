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
    fixedSellingPrice: number;
    isTaxIncluded?: boolean;
    lowStockAlert: number;
    vatPercentage?: number;
    taxPercentage?: number;
    imageUrl: string;
}

export interface ItemCategory {
    id?: number;
    name?: string;
}

export interface GetAllProductUCResponse {
    items: Item[];
    totalSalesPrice: number;
    totalItems: number;
}
export interface Item {
    id: number;
    name: string;
    itemCount: number;
    unit?: string;
    fixedSellingPrice?: number;
    perUnitPurchasePrice?: number;
    grossPurchasePrice?: number;
    totalSalesAmount?: number;
    taxPercentage?: number;
    vatPercentage?: number;
    imageUrl?: string;
    category?: CategoryDto;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    updatedBy?: string;
}
export interface CategoryDto {
    id: number;
    name: string;
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
export async function getProduct(): Promise<GetAllProductUCResponse | undefined> {
    try {
        const res = await apiService.get<RestResponse<GetAllProductUCResponse>>('api/v1/product/all-products', {
            headers: {
                ...getAuthHeaders()
            },
        });

        console.log("API RAW RESPONSE:", res);

        // Normalize response body structure


        // Check response success code
        if (res?.response?.code !== 0 || res?.response?.message !== 'SUCCESS') {
            error("Failed to fetch products");
            throw new Error(res?.error || res?.response?.message || "Failed to fetch products");
        }

        return  res?.response?.data;

    } catch (err) {
        console.error("Error inside getProduct service:", err);
        throw err;
    }
}

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}