export interface PaymentReceived {
    partyId: number;
    amount: number;
    remarks: string;
    date: string;
    billPath: string;
}

export interface PaymentHistory {
    id: number;
    partyId: number;
    partyName: string;
    amount: number;
    remarks: string;
    date: string;
    billPath: string;
    type: string;
    oldBalance: number;
    newBalance: number;
    createdAt: string;
}

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export const createPaymentReceived = async (payment: PaymentReceived) => {
    try {
        const response = await fetch('/api/PaymentsReceived', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify(payment)
        });
        return response.json();
    } catch (error) {
        if (error instanceof Error) {
            throw error.message;
        }
        throw 'An unknown error occurred';
    }
};

export const getPaymentHistory = async (partyId: number): Promise<PaymentHistory[]> => {
    try {
        const response = await fetch(`/api/PaymentsGiven/history/party/${partyId}`, { headers: getAuthHeaders() });
        if (!response.ok) {
            throw new Error('Failed to fetch payment history');
        }
        return response.json();
    } catch (error) {
        if (error instanceof Error) {
            throw error.message;
        }
        throw 'An unknown error occurred';
    }
};

export interface PaymentGiven {
    partyId: number;
    amount: number;
    remarks: string;
    date: string;
    billPath: string;
}

export const createPaymentGiven = async (payment: PaymentGiven) => {
    try {
        const response = await fetch('/api/PaymentsGiven', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify(payment)
        });
        return response.json();
    } catch (error) {
        if (error instanceof Error) {
            throw error.message;
        }
        throw 'An unknown error occurred';
    }
};

export const updatePaymentGiven = async (id: number, paymentData: PaymentGiven) => {
    const response = await fetch(`/api/PaymentsGiven/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
        throw new Error('Failed to update payment');
    }

    return response.json();
};

export const updatePaymentReceived = async (id: number, paymentData: PaymentReceived) => {
    const response = await fetch(`/api/PaymentsReceived/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(paymentData)
    });

    if (!response.ok) {
        throw new Error('Failed to update payment');
    }

    return response.json();
};

export const deletePaymentGiven = async (id: number) => {
    try {
        const response = await fetch(`/api/PaymentsGiven/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            }
        });
        if (!response.ok) {
            throw new Error('Failed to delete payment');
        }
        return response.json();
    } catch (error) {
        if (error instanceof Error) {
            throw error.message;
        }
        throw 'An unknown error occurred';
    }
};

export const deletePaymentReceived = async (id: number) => {
    try {
        const response = await fetch(`/api/PaymentsReceived/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            }
        });
        if (!response.ok) {
            throw new Error('Failed to delete payment');
        }
        return response.json();
    } catch (error) {
        if (error instanceof Error) {
            throw error.message;
        }
        throw 'An unknown error occurred';
    }
};

export const getDashboardPaymentTotals = async (): Promise<{ totalGiven: number; totalReceived: number }> => {
    try {
        const response = await fetch('/api/PaymentsGiven/dashboard/totals', { headers: getAuthHeaders() });
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard payment totals');
        }
        return response.json();
    } catch (error) {
        if (error instanceof Error) {
            throw error.message;
        }
        throw 'An unknown error occurred';
    }
}; 