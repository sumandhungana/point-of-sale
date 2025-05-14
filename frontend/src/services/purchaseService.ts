// Service for purchase-related API calls

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchCategories() {
  const response = await fetch('/api/Category', { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
}

export async function fetchItems() {
  const response = await fetch('/api/Item', { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch items');
  return response.json();
}

export async function fetchLastPurchase() {
  const response = await fetch('/api/Purchase/last', { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch last purchase');
  return response.json();
}

export async function savePurchase(formData: FormData, isEditMode: boolean, id?: number) {
  const url = isEditMode && id ? `/api/Purchase/${id}` : '/api/Purchase';
  const method = isEditMode ? 'PUT' : 'POST';
  const response = await fetch(url, {
    method,
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
  });
  if (response.status === 200 || response.status === 201) {
    return response.json();
  } else {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'create'} purchase entry`);
  }
} 