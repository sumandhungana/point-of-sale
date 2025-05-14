// Service for purchase list-related API calls

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchPurchases() {
  const response = await fetch('/api/Purchase', { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch purchases');
  return response.json();
} 