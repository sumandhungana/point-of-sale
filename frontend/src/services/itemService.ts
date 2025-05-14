// Service for item-related API calls

export async function fetchItems() {
  const response = await fetch('/api/Item');
  if (!response.ok) throw new Error('Failed to fetch items');
  return response.json();
}

export async function createItem(formData: FormData) {
  const response = await fetch('/api/Item', {
    method: 'POST',
    body: formData,
  });
  if (response.status === 200 || response.status === 201) {
    return response;
  } else {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create item');
  }
}

export async function updateItem(id: number, formData: FormData) {
  const response = await fetch(`/api/Item/${id}`, {
    method: 'PUT',
    body: formData,
  });
  if (response.status === 200 || response.status === 201) {
    return response;
  } else {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update item');
  }
} 