// Service for role-related API calls

export async function fetchRoles() {
  const response = await fetch('/api/Role');
  if (!response.ok) throw new Error('Failed to fetch roles');
  return response.json();
} 