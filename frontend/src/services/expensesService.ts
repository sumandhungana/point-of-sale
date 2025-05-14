// Service for expenses-related API calls

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

export async function fetchLastExpenses() {
  const response = await fetch('/api/Expenses/last', { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch last expenses');
  return response.json();
}

export async function saveExpense(formData: FormData, isEditMode: boolean, id?: number) {
  const url = isEditMode && id ? `/api/Expenses/${id}` : '/api/Expenses';
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
    throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'create'} expense entry`);
  }
} 