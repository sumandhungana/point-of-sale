// Service for items list-related API calls

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchItemsList() {
  const response = await fetch('/api/Item', { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch items');
  return response.json();
} 