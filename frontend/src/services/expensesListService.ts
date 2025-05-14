// Service for expenses list-related API calls

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchExpenses() {
  const response = await fetch('/api/Expenses', { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch expenses');
  return response.json();
} 