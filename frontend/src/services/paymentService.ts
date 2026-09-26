
function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}


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