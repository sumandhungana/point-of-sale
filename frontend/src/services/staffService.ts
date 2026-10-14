// Service for staff-related API calls
// import axios from 'axios';
import {apiService} from "@/infrastructure/utils/ApiService";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
export interface CreateStaffResponse {
  message: string;
  id: bigint;
}
// Interfaces matching your backend Entities / Response DTOs
export interface StaffSalaryEntity {
  id: number;
  memberId?: number;
  staffId?: number;
  month: number;
  year: number;
  selectedDate: string;
  isSlideOn: boolean;
  calculationDate: string;
  salaryType: string;
  amount: number;
  permission: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffAttendanceEntity {
  id: number;
  memberId?: number;
  staffId?: number;
  status: string; // 'PRESENT' | 'ABSENT' | 'LEAVE' | 'HALF_DAY'
  date: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetStaffResponse {
  id: number;
  name: string;
  phone: string;
  address: string;
  email: string;
  remarks: string;
  profileImageUrl: string;
  createdAt: string;
  updatedAt: string;
  salaryResponses?: StaffSalaryEntity[];
  staffAttendanceEntities?: StaffAttendanceEntity[];
}

export interface CreateStaffResponse {
  message: string;
}

interface RestResponse<T> {
  code: number;
  message: string;
  data: T;
  error?: string;
}

// 1. Fetch all staff members
export async function fetchStaff(): Promise<GetStaffResponse[]> {
  const res = await apiService.get<RestResponse<GetStaffResponse[]>>(
      'api/v1/staff/all-staffs',
      {
        headers: {
          ...getAuthHeaders(),
        },
      }
  );

  if (res.error) {
    throw new Error('Failed to fetch staff');
  }

  // Handle both res.response?.data and direct res.data structure safely
  const staffList = res?.response?.data || [];
  return Array.isArray(staffList) ? staffList : [];
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
}

export async function createStaffSalary(salaryData: any) {
  const res = await apiService.post<RestResponse<CreateStaffResponse>>(
      'api/v1/staff-salary',
      salaryData,
      {
        headers: {
          ...getAuthHeaders(),
        },
      }
  );
  if(res.error) throw new Error('Failed to create staff salaries');
  return res?.response?.data;
}

// Fetch single staff by id
export async function fetchStaffById(id: number): Promise<GetStaffResponse | null> {
  const res = await apiService.get<RestResponse<GetStaffResponse>>(
      `api/v1/staff/${id}`,
      {
        headers: {
          ...getAuthHeaders(),
        },
      }
  );

  if (res.error) {
    // Fallback to fetchStaff list search if single endpoint is restricted
    try {
      const list = await fetchStaff();
      return list.find((s) => s.id === id) || null;
    } catch {
      return null;
    }
  }

  return res?.response?.data || null;
}

// Update staff details including notes/remarks
export async function updateStaff(id: number, staffData: any): Promise<any> {
  const res = await apiService.put<RestResponse<{ message: string }>>(
      `api/v1/staff/${id}`,
      { ...staffData, id },
      {
        headers: {
          ...getAuthHeaders(),
        },
      }
  );

  if (res.error) throw new Error('Failed to update staff notes/details');
  return res?.response?.data;
}