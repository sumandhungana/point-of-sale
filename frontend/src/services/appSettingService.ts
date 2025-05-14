// Service for app setting-related API calls

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchAppSettings() {
  const response = await fetch('/api/AppSettings', {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch app settings');
  return response.json();
}

export async function saveAppSettings(settingsId: number | null, formData: any) {
  const url = settingsId ? `/api/AppSettings/${settingsId}` : '/api/AppSettings';
  const method = settingsId ? 'PUT' : 'POST';
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(formData),
  });
  if (!response.ok) throw new Error('Failed to save settings');
  return response.json();
}

export async function fetchInvoiceSettings() {
  const response = await fetch('/api/InvoiceSettings', { headers: getAuthHeaders() });
  if (!response.ok) throw new Error('Failed to fetch invoice settings');
  return response.json();
}

export async function saveInvoiceSettings(data: any, isUpdate: boolean, id?: number) {
  const url = isUpdate && id ? `/api/InvoiceSettings/${id}` : '/api/InvoiceSettings';
  const method = isUpdate ? 'PUT' : 'POST';
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to save settings');
  }
  return response.json();
} 