// Service for items list-related API calls

export async function fetchItemsList() {
  const response = await fetch('/api/Item');
  if (!response.ok) throw new Error('Failed to fetch items');
  return response.json();
} 