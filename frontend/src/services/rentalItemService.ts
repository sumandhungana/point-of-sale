// Service for rental item-related API calls

export async function fetchRentalItems() {
  const response = await fetch('/api/RentalItem');
  if (!response.ok) throw new Error('Failed to fetch rental items');
  return response.json();
}

export async function createRentalItem(formData: any) {
  const response = await fetch('/api/RentalItem', {
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
    throw new Error(errorData.message || 'Failed to create rental item');
  }
} 