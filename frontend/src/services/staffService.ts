// Service for staff-related API calls
// import axios from 'axios';
import {apiService} from "@/infrastructure/utils/ApiService";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
export interface CreateStaffResponse {
  message: string;
}

export interface GetStaffResponse{
  id: number;
  name: string;
  phone:string;
  address:string;
  email:string;
  remarks:string;
  profileImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface RestResponse<T> {
  status?: string;
  data?: T;
  message?: string;
  error?: string;
}

export async function fetchStaff() {
  // const response = await axios.get('/api/Staff', { headers: getAuthHeaders() });
  // return response.data;

  const res= await apiService.get<RestResponse<GetStaffResponse>>(
      'api/v1/staffs',
      {
        headers: {
          ...getAuthHeaders(),
        },
      }
  );
  if(res.error) throw new Error('Failed to create staff');
  return res?.response?.data
}

export async function createStaff(formData: any) {

  const res = await apiService.post<RestResponse<CreateStaffResponse>>(
      'api/v1/staff',
      formData,
  {
    headers: {
    ...getAuthHeaders(),
    },
  }
  );
  if(res.error) throw new Error('Failed to create staff');
  return res?.response?.data
  // const response = await fetch('/api/Staff', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     ...getAuthHeaders(),
  //   },
  //   body: JSON.stringify(formData),
  // });
  // if (!response.ok) throw new Error('Failed to create staff');
  // return response.json();
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