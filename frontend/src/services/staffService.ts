// Service for staff-related API calls
import axios from 'axios';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchStaff() {
  const response = await axios.get('/api/Staff', { headers: getAuthHeaders() });
  return response.data;
}

export async function createStaff(formData: any) {
  const response = await fetch('/api/Staff', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(formData),
  });
  if (!response.ok) throw new Error('Failed to create staff');
  return response.json();
}

export async function createStaffSalary(salaryData: any) {
  const response = await fetch('/api/StaffSalary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(salaryData),
  });
  if (!response.ok) throw new Error('Failed to create salary record');
  return response.json();
} 