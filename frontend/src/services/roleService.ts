// Service for role-related API calls

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchRoles() {
  const response = await fetch('/api/Role', { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch roles');
  return response.json();
}

export async function createRole(formData: any) {
  const response = await fetch('/api/Role', {
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
    throw new Error(errorData.message || 'Failed to create role');
  }
} 