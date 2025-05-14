// Service for payment gateway-related API calls

export async function fetchPaymentGateways() {
  const response = await fetch('/api/PaymentGateway');
  if (!response.ok) throw new Error('Failed to fetch payment gateways');
  return response.json();
} 