// Service for expenses-related API calls

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

export async function fetchLastExpenses() {
  const response = await fetch('/api/Expenses/last');
  if (!response.ok) throw new Error('Failed to fetch last expenses');
  return response.json();
} 