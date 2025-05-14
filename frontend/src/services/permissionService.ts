// Service for permission-related API calls

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchRoles() {
  const response = await fetch('/api/Role', { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch roles');
  return response.json();
}

export async function fetchPermissions() {
  const response = await fetch('/api/Permission', { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch permissions');
  return response.json();
} 