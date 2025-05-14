// Service for app setting-related API calls

export async function fetchAppSettings() {
  const response = await fetch('/api/AppSettings');
  if (!response.ok) throw new Error('Failed to fetch app settings');
  return response.json();
}

export async function saveAppSettings(settingsId: number | null, formData: any) {
  const url = settingsId ? `/api/AppSettings/${settingsId}` : '/api/AppSettings';
  const method = settingsId ? 'PUT' : 'POST';
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
  if (!response.ok) throw new Error('Failed to save settings');
  return response.json();
} 