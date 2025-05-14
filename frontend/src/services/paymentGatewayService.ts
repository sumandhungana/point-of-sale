// Service for payment gateway-related API calls

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchPaymentGateways() {
  const response = await fetch('/api/PaymentGateway', { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch payment gateways');
  return response.json();
}

export async function createPaymentGateway(formData: any) {
  const response = await fetch('/api/PaymentGateway', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(formData),
  });

  if (response.status === 200 || response.status === 201) {
    return response.json();
  } else {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create Payment Gateway');
  }
} 