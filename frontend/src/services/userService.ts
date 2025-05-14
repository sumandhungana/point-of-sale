// Service for user-related API calls

export async function fetchUsers() {
  const response = await fetch('/api/User');
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

export async function createUser(formData: any) {
  const response = await fetch('/api/User', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  if (response.status === 200 || response.status === 201) {
    return response;
  } else {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create user');
  }
}

export async function updateUser(id: number, formData: any) {
  const response = await fetch(`/api/User/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  if (response.status === 200 || response.status === 201) {
    return response;
  } else {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update user');
  }
} 