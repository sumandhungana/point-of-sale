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
    salesPrice?: number;
    perUnitPurchasePrice?: number;
    grossPurchasePrice?: number;
    totalSalesAmount?: number;
    taxPercentage?: number;
    vatPercentage?: number;
    lowStockAlert?: number;
    isTaxIncluded?: boolean;
    categoryId?: number;
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

export interface EditProductUCRequest {
    itemId: number;
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

export interface EditProductUCResponse {
    id: number;
    message: string;
}

// In-memory cache for products with 30s TTL
let productCache: { data: GetAllProductUCResponse; timestamp: number } | null = null;
const PRODUCT_CACHE_TTL_MS = 30000;

export const invalidateProductCache = (): void => {
    productCache = null;
};

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
        invalidateProductCache();
        success("Product created successfully");
        return res.response?.data;
    }
}

// Updated to return a single ItemsResponse by unwrapping the array
export async function getProduct(forceRefresh: boolean = false): Promise<GetAllProductUCResponse | undefined> {
    const now = Date.now();
    if (!forceRefresh && productCache && now - productCache.timestamp < PRODUCT_CACHE_TTL_MS) {
        return productCache.data;
    }

    try {
        const res = await apiService.get<RestResponse<GetAllProductUCResponse>>('api/v1/product/all-products', {
            headers: {
                ...getAuthHeaders()
            },
        });

        console.log("API RAW RESPONSE:", res);

        // Check response success code
        if (res?.response?.code !== 0 || res?.response?.message !== 'SUCCESS') {
            error("Failed to fetch products");
            throw new Error(res?.error || res?.response?.message || "Failed to fetch products");
        }

        const data = res?.response?.data;
        if (data) {
            productCache = { data, timestamp: Date.now() };
        }
        return data;

    } catch (err) {
        console.error("Error inside getProduct service:", err);
        throw err;
    }
}

export async function updateProduct(
    idOrData: number | EditProductUCRequest,
    data?: Partial<EditProductUCRequest> | AddProductRequest
): Promise<EditProductUCResponse | undefined> {
    const payload: EditProductUCRequest =
        typeof idOrData === 'number'
            ? ({ ...data, itemId: idOrData } as EditProductUCRequest)
            : idOrData;

    let res = await apiService.put<RestResponse<EditProductUCResponse>>(
        'api/v1/product',
        payload,
        {
            headers: {
                ...getAuthHeaders()
            },
        }
    );

    // Fallback if backend was configured with POST instead of PUT
    if (res.failure && (res.error?.includes('405') || res.error?.includes('Method Not Allowed'))) {
        res = await apiService.post<RestResponse<EditProductUCResponse>>(
            'api/v1/product',
            payload,
            {
                headers: {
                    ...getAuthHeaders()
                },
            }
        );
    }

    if (res.response?.code === -1 || (res.response?.message && res.response.message !== 'SUCCESS')) {
        const errorMsg = res.response?.message || res.error || "Failed to update product";
        error(errorMsg);
        throw new Error(errorMsg);
    }

    if (res.error) {
        error(res.error || "Failed to update product");
        throw new Error(res.error || "Failed to update product");
    } else {
        invalidateProductCache();
        success(res.response?.data?.message || "Product updated successfully");
        return res.response?.data;
    }
}

export interface DeleteProductResponse {
    message: string;
}

export async function getSingleProduct(id: number): Promise<Item | undefined> {
    try {
        const res = await apiService.get<RestResponse<Item>>('api/v1/product', {
            params: { id },
            headers: {
                ...getAuthHeaders()
            },
        });

        if (res?.response?.code !== 0 || res?.response?.message !== 'SUCCESS') {
            const errorMsg = res?.response?.message || res?.error || "Failed to fetch product details";
            error(errorMsg);
            throw new Error(errorMsg);
        }

        return res?.response?.data;
    } catch (err) {
        console.error("Error fetching single product:", err);
        throw err;
    }
}

export async function deleteProduct(id: number): Promise<DeleteProductResponse | undefined> {
    try {
        const res = await apiService.delete<RestResponse<DeleteProductResponse>>('api/v1/product', {
            params: { id },
            headers: {
                ...getAuthHeaders()
            },
        });

        if (res?.response?.code === -1 || (res?.response?.message && res.response.message !== 'SUCCESS')) {
            const errorMsg = res?.response?.message || res?.error || "Failed to delete product";
            error(errorMsg);
            throw new Error(errorMsg);
        }

        invalidateProductCache();
        success(res?.response?.data?.message || "Product deleted successfully");
        return res?.response?.data;
    } catch (err) {
        console.error("Error deleting product:", err);
        throw err;
    }
}

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}