// Service for purchase list-related API calls

export async function fetchPurchases() {
  const response = await fetch('/api/Purchase');
  if (!response.ok) throw new Error('Failed to fetch purchases');
  return response.json();
} 