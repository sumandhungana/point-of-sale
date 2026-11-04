import { apiService } from "@/infrastructure/utils/ApiService";
import { RestResponse } from "@/core/auth/types";

export interface DepositItem {
    id: number;
    paymentParty: 'CUSTOMER' | 'SUPPLIER';
    partyId: number;
    amount: number;
    remarks: string | null;
    createdBy?: string;
    createdAt?: string;
    updatedBy?: string;
    updatedAt?: string;
    member?: any;
}

export interface AddDepositPayload {
    paymentParty: 'CUSTOMER' | 'SUPPLIER';
    partyId: number;
    amount: number;
    remarks?: string;
}

export interface AddDepositResponse {
    id: number;
    message: string;
}

export interface UpdateDepositPayload {
    id: number;
    amount: number;
    remarks?: string;
}

export interface DepositMessageResponse {
    message: string;
}

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Add a new deposit for a customer or supplier.
 * Maps to DepositController: POST /api/v1/deposit/add
 */
export const addDeposit = async (payload: AddDepositPayload): Promise<AddDepositResponse> => {
    const res = await apiService.post<RestResponse<AddDepositResponse>>(
        'api/v1/deposit/add',
        payload,
        {
            headers: {
                ...getAuthHeaders(),
            },
        }
    );

    if (res.failure || res.error || !res.response) {
        const errorMsg = res.error || res.response?.message || 'Failed to add deposit';
        throw new Error(errorMsg);
    }

    if (res.response.data && res.response.data.id === -1) {
        throw new Error(res.response.data.message || 'Amount deposit failed');
    }

    return res.response.data;
};

/**
 * Retrieve all deposits for a given party ID (customer or supplier).
 * Maps to DepositController: GET /api/v1/deposit/all/{id}
 */
export const getDeposits = async (partyId: number): Promise<DepositItem[]> => {
    if (!partyId || partyId <= 0) return [];

    const res = await apiService.get<RestResponse<DepositItem[]>>(
        `api/v1/deposit/all/${partyId}`,
        {
            headers: {
                ...getAuthHeaders(),
            },
        }
    );

    if (res.failure || res.error || !res.response) {
        console.error('Error fetching deposits:', res.error);
        return [];
    }

    return Array.isArray(res.response.data) ? res.response.data : [];
};

/**
 * Update an existing deposit.
 * Maps to DepositController: PUT /api/v1/deposit
 */
export const updateDeposit = async (payload: UpdateDepositPayload): Promise<DepositMessageResponse> => {
    const res = await apiService.put<RestResponse<DepositMessageResponse>>(
        'api/v1/deposit',
        payload,
        {
            headers: {
                ...getAuthHeaders(),
            },
        }
    );

    if (res.failure || res.error || !res.response) {
        const errorMsg = res.error || res.response?.message || 'Failed to update deposit';
        throw new Error(errorMsg);
    }

    return res.response.data;
};

/**
 * Delete a deposit by ID.
 * Maps to DepositController: DELETE /api/v1/deposit/{id}
 */
export const deleteDeposit = async (depositId: number): Promise<DepositMessageResponse> => {
    const res = await apiService.delete<RestResponse<DepositMessageResponse>>(
        `api/v1/deposit/${depositId}`,
        {
            headers: {
                ...getAuthHeaders(),
            },
        }
    );

    if (res.failure || res.error || !res.response) {
        const errorMsg = res.error || res.response?.message || 'Failed to delete deposit';
        throw new Error(errorMsg);
    }

    return res.response.data;
};

