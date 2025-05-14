// Service for service-related API calls

export async function fetchServices() {
  const response = await fetch('/api/Service');
  if (!response.ok) throw new Error('Failed to fetch services');
  return response.json();
}

export async function createService(formData: FormData) {
  const response = await fetch('/api/Service', {
    method: 'POST',
    body: formData,
  });
  if (response.ok) {
    return response;
  } else {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create service');
  }
}

export async function updateService(id: number, formData: FormData) {
  const response = await fetch(`/api/Service/${id}`, {
    method: 'PUT',
    body: formData,
  });
  if (response.ok) {
    return response;
  } else {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update service');
  }
} 