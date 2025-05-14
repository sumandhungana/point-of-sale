// Service for cashbook-related API calls

export async function fetchCategories() {
  const response = await fetch('/api/Category');
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
}

export async function fetchItems() {
  const response = await fetch('/api/Item');
  if (!response.ok) throw new Error('Failed to fetch items');
  return response.json();
}

export async function createCashbookEntry(formDataToSend: FormData) {
  const response = await fetch('/api/Cashbook', {
    method: 'POST',
    body: formDataToSend,
  });
  if (response.status === 200 || response.status === 201) {
    return response;
  } else {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create cashbook entry');
  }
}

export async function fetchCashbooks() {
  const response = await fetch('/api/Cashbook');
  if (!response.ok) throw new Error('Failed to fetch cashbooks');
  return response.json();
} 