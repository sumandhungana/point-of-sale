// Service for category-related API calls

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function createCategory(formData: { name: string; description: string; categoryType: number }) {
  const response = await fetch('/api/Category', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(formData),
  });
  if (response.status === 200 || response.status === 201) {
    return response;
  } else {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create category');
  }
}

export async function fetchCategories() {
  const response = await fetch('/api/Category', { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
} 