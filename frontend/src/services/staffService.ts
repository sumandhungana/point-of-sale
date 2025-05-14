// Service for staff-related API calls
import axios from 'axios';

export async function fetchStaff() {
  const response = await axios.get('/api/Staff');
  return response.data;
} 