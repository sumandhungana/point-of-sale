// Service for SMS gateway-related API calls

export async function fetchSmsGateways() {
  const response = await fetch('/api/SmsGateway');
  if (!response.ok) throw new Error('Failed to fetch SMS gateways');
  return response.json();
}

export async function createSmsGateway(formData: any) {
  const response = await fetch('/api/SmsGateway', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  if (response.status === 200 || response.status === 201) {
    return response;
  } else {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create SMS Gateway');
  }
} 