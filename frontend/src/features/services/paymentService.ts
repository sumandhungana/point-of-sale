import {apiService} from "@/infrastructure/utils/ApiService";

import {RestResponse} from "@/core/auth/types"
import {toast} from "react-toastify";

export interface AddPaymentPayload {
    paymentParty: 'CUSTOMER' | 'SUPPLIER' | 'STAFF' | 'AUDIT';
    customerId?: number;
    supplierId?: number;
    staffId?: number;
    amount: number;
    paymentType: 'CARD' | 'QR' | 'CASH';
    paymentCategory: 'GIVEN' | 'RECEIVED';
    billPath?: string;
    remarks?: string;
}

export interface PaymentCreatedResponse {
    message: string;
    id: number;
}

export interface GetPaymentListRequest {
    paymentParty: 'CUSTOMER' | 'SUPPLIER' | 'STAFF' | 'AUDIT';
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
    paymentParty: 'CUSTOMER' | 'SUPPLIER' | 'STAFF' | 'AUDIT';
    customerId?: number;
    supplierId?: number;
    staffId?: number;
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