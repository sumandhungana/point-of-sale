// Service for category-related API calls

import {apiService} from "@/infrastructure/utils/ApiService";

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? {Authorization: `Bearer ${token}`} : {};
}
export type CategoryTypeEnum = 'GENERAL' | 'INCOME' | 'EXPENSE' | 'PURCHASE' | 'CASHBOOK';

export interface CategoryItem {
    id: number;
    name: string;
    description: string;
    categoryType: CategoryTypeEnum;
    createdBy?: string;
    updatedBy?: string;
    createdAt?: string;
    updatedAt?: string;
}
export interface AddCategoryRequest {
    name: string;
    description: string;
    categoryType: CategoryTypeEnum;
}

export interface EditCategoryRequest extends AddCategoryRequest {
    id: number;
}

export interface AddCategoriesResponse {
    id?: number;
    message?: string;
}

interface RestResponse<T> {
    code: number;
    message: string;
    data: T;

    error?: string;
}

export async function createCategory(formData: AddCategoryRequest) {

    try {
        const res = await apiService.post<RestResponse<any>>(
            'api/v1/categories',
            formData,
            { headers: getAuthHeaders() }
        );
        return !res?.error && res?.response?.code === 0;
    } catch (error) {
        console.error('Error creating category:', error);
        return false;
    }
}

export async function fetchCategories() {
    try {
        const res = await apiService.get<RestResponse<CategoryItem[]>>(
            'api/v1/categories/all-categories',
            {
                headers: {
                    ...getAuthHeaders(),
                },
            },
        );

        // 1. Check for errors first
        if (res?.error || res?.response?.code != 0 || res?.response?.message != 'SUCCESS') {
            console.error('Error fetching customers:', res.error);
            return [];
        }

        // 2. Return data safely with a fallback empty array
        return res?.response?.data ?? [];
    } catch (error) {
        console.error('Error fetching customers:', error);
        return [];
    }

}

export async function updateCategory(id: number, formData: AddCategoryRequest): Promise<boolean> {
    try {
        const res = await apiService.put<RestResponse<any>>(
            `api/v1/categories/${id}`,
            JSON.stringify(formData),
            { headers: getAuthHeaders() }
        );
        return !res?.error && res?.response?.code === 0;
    } catch (error) {
        console.error('Error updating category:', error);
        return false;
    }
}

export async function deleteCategory(id: number): Promise<boolean> {
    try {
        const res = await apiService.delete<RestResponse<any>>(
            `api/v1/categories/${id}`,
            { headers: getAuthHeaders() }
        );
        return !res?.error && res?.response?.code === 0;
    } catch (error) {
        console.error('Error deleting category:', error);
        return false;
    }
}