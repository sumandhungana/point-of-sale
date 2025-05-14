// Service for income-related API calls

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

export async function fetchLastIncome() {
  const response = await fetch('/api/Income/last');
  if (!response.ok) throw new Error('Failed to fetch last income');
  return response.json();
} 