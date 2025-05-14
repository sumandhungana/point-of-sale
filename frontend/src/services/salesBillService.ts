// Service for sales bill-related API calls

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchCustomers() {
  const response = await fetch('/api/Customer', { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch customers');
  return response.json();
}

export async function fetchLastBillNumber() {
  const response = await fetch('/api/SalesBill/last', { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch last bill number');
  return response.json();
}

export async function fetchSalesBills() {
  const response = await fetch('/api/SalesBill', { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch sales bills');
  return response.json();
}

export async function saveSalesBill(data: any, isEditMode: boolean, id?: number) {
  const url = isEditMode && id ? `/api/SalesBill/${id}` : '/api/SalesBill';
  const method = isEditMode ? 'PUT' : 'POST';
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'create'} sales bill`);
  }
  return response.json();
} 