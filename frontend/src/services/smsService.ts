// Service for SMS gateway-related API calls

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchSmsGateways() {
  const response = await fetch('/api/SmsGateway', { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch SMS gateways');
  return response.json();
}

export async function createSmsGateway(formData: any) {
  const response = await fetch('/api/SmsGateway', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(formData),
  });
  if (response.status === 200 || response.status === 201) {
    return response;
  } else {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create SMS Gateway');
  }
} 