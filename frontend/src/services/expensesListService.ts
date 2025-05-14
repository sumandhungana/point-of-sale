// Service for expenses list-related API calls

export async function fetchExpenses() {
  const response = await fetch('/api/Expenses');
  if (!response.ok) throw new Error('Failed to fetch expenses');
  return response.json();
} 