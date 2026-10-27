import {apiService} from "@/infrastructure/utils/ApiService";

import {RestResponse} from "@/core/auth/types"
import {toast} from "react-toastify";

export interface AddPaymentPayload {
    paymentParty: 'CUSTOMER' | 'SUPPLIER' | 'STAFF' | 'AUDIT' | 'RENTAL';
    customerId?: number;
    supplierId?: number;
    staffId?: number;
    rentalId?: number;
    amount: number;
    paymentType: 'CARD' | 'QR' | 'CASH';
    paymentCategory: 'GIVEN' | 'RECEIVED';
    billPath?: string;
    remarks?: string;
}
export interface UpdatePaymentPayload {
    paymentId: number;
    amount: number;
    paymentType: 'CARD' | 'QR' | 'CASH';
    paymentCategory: 'GIVEN' | 'RECEIVED';
    billPath?: string | null;
    remarks?: string | null;
}

export interface UpdatePaymentResponse {
    message?: string;
}

export interface PaymentCreatedResponse {
    message: string;
    id: number;
}

export interface GetPaymentListRequest {
    paymentParty: 'CUSTOMER' | 'SUPPLIER' | 'STAFF' | 'AUDIT' | 'RENTAL';
    partyId: number;
}
export interface CustomerData {
    id: number;
    customerId?: number;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    company: string | null;
    pan: string | null;
    contactPerson: string | null;
    isSupplier: boolean;
    createdAt: string;
    updatedAt: string;
    bankAccount: string | null;
    cashBalance: number;
    profileImage: string | null;
    customerSmsSetting: boolean;
    smsLanguage: boolean;
    transactionHistoryCheck: boolean;
    paymentHistory: GetPaymentResponse[];
    paymentDateReminder: string | null;
}

export interface SupplierData {
    name: string;
    phoneNumber: string;
    profileImage: string | null;
    balance: number;
    paymentHistory: GetPaymentResponse[];
}


export interface GetPaymentResponse {
    id: number;
    paymentParty: 'CUSTOMER' | 'SUPPLIER' | 'STAFF' | 'AUDIT' | 'RENTAL';
    customerId?: number;
    supplierId?: number;
    staffId?: number;
    rentalId?: number;
    amount: number;
    paymentType: 'CARD' | 'QR' | 'CASH';
    paymentCategory: 'GIVEN' | 'RECEIVED';
    billPath?: string;
    remarks?: string;
    createdAt: string;
    oldBalance?: number;
    newBalance: number;
    updatedAt: string;
}

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export const createPayment = async (payment: AddPaymentPayload) => {
    try {
        const res = await apiService.post<RestResponse<PaymentCreatedResponse>>(
            'api/v1/payment/add',
            payment,
            {
                headers: {
                    ...getAuthHeaders(),
                },
            }
        );

        if (res.error) {
            console.log("Payment Created Failed:: " +  res.error)
            toast("Payment Created Failed");
        }
    } catch (error) {
        if (error instanceof Error) {
             toast('An unknown error occurred');
        }
        toast('An unknown error occurred');
    }
};

export const getPaymentList = async (request: GetPaymentListRequest): Promise<GetPaymentResponse[]> => {
    try {
        const res = await apiService.post<RestResponse<GetPaymentResponse[]>>(
            'api/v1/payment/list',
            request,
            {
                headers: {
                    ...getAuthHeaders(),
                },
            }
        );

        // 1. Check for errors first
        if (res.error) {
            console.error('Error fetching payments:', res.error);
            return [];
        }

        // 2. Return data safely with a fallback empty array
        return res?.response?.data ?? [];
    } catch (error) {
        console.error('Error fetching payments:', error);
        return [];
    }
};

export const updatePayment = async (payment: UpdatePaymentPayload): Promise<UpdatePaymentResponse | null> => {
    try {
        const res = await apiService.put<RestResponse<UpdatePaymentResponse>>(
            'api/v1/payment/update',
            payment,
            {
                headers: {
                    ...getAuthHeaders(),
                },
            }
        );

        if (res.error) {
            console.error("Payment Update Failed::", res.error);
            const errorMsg = typeof res.error === 'string' ? res.error : "Payment Update Failed";
            toast.error(errorMsg);
            throw new Error(errorMsg);
        }

        const responseData = (res.response as any)?.data || (res.response as any);
        return responseData || null;
    } catch (error) {
        console.error('Error updating payment:', error);
        throw error;
    }
};

export interface DeletePaymentResponse {
    message?: string;
}

export const deletePayment = async (id: number | string): Promise<DeletePaymentResponse | null> => {
    try {
        const res = await apiService.delete<RestResponse<DeletePaymentResponse>>(
            `api/v1/payment/delete/${id}`,
            {
                headers: {
                    ...getAuthHeaders(),
                },
            }
        );

        if (res.error) {
            console.error("Payment Delete Failed::", res.error);
            let errorMsg = typeof res.error === 'string' ? res.error : "Payment Delete Failed";
            try {
                const jsonMatch = res.error.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                    errorMsg = parsed.message || parsed.error || parsed._embedded?.errors?.[0]?.message || errorMsg;
                }
            } catch (_) {}
            throw new Error(errorMsg);
        }

        const responseData = (res.response as any)?.data || (res.response as any);
        return responseData || null;
    } catch (error) {
        console.error('Error deleting payment:', error);
        throw error;
    }
};