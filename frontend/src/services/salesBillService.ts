// Service for sales bill-related API calls

export async function fetchCustomers() {
  const response = await fetch('/api/Customer');
  if (!response.ok) throw new Error('Failed to fetch customers');
  return response.json();
}

export async function fetchLastBillNumber() {
  const response = await fetch('/api/SalesBill/last');
  if (!response.ok) throw new Error('Failed to fetch last bill number');
  return response.json();
} 