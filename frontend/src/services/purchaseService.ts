// Service for purchase-related API calls

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

export async function fetchLastPurchase() {
  const response = await fetch('/api/Purchase/last');
  if (!response.ok) throw new Error('Failed to fetch last purchase');
  return response.json();
} 