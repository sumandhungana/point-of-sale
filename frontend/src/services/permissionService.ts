// Service for permission-related API calls

export async function fetchRoles() {
  const response = await fetch('/api/Role');
  if (!response.ok) throw new Error('Failed to fetch roles');
  return response.json();
}

export async function fetchPermissions() {
  const response = await fetch('/api/Permission');
  if (!response.ok) throw new Error('Failed to fetch permissions');
  return response.json();
} 