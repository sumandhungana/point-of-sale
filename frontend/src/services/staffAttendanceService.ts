import { apiService } from "@/infrastructure/utils/ApiService";
import { RestResponse } from "@/core/auth/types";
import { toast } from "react-toastify";

export type AttendanceStatusType = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';

export interface StaffAttendanceRecord {
  id: number;
  staffId: number;
  date: string;
  status: AttendanceStatusType;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAttendancePayload {
  staffId: number;
  date?: string;
  status: AttendanceStatusType;
  note?: string;
}

export interface UpdateAttendancePayload {
  id: number;
  status: AttendanceStatusType;
  note?: string;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch all attendance records for the current khata book/organization
 */
export const fetchStaffAttendances = async (): Promise<StaffAttendanceRecord[]> => {
  try {
    const res = await apiService.get<RestResponse<StaffAttendanceRecord[]>>(
      'api/v1/staff-attendance',
      {
        headers: getAuthHeaders(),
      }
    );

    if (res.error) {
      console.error('Error fetching staff attendances:', res.error);
      return [];
    }

    return res?.response?.data ?? [];
  } catch (error) {
    console.error('Exception fetching staff attendances:', error);
    return [];
  }
};

/**
 * Fetch attendance history for a specific staff member
 */
export const fetchStaffAttendanceByStaffId = async (
  staffId: number
): Promise<StaffAttendanceRecord[]> => {
  try {
    const res = await apiService.get<RestResponse<StaffAttendanceRecord[]>>(
      `api/v1/staff-attendance/staff/${staffId}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (res.error) {
      console.error(`Error fetching attendance for staff #${staffId}:`, res.error);
      return [];
    }

    return res?.response?.data ?? [];
  } catch (error) {
    console.error(`Exception fetching attendance for staff #${staffId}:`, error);
    return [];
  }
};

/**
 * Record or update staff attendance for a specific date (idempotent upsert in backend)
 */
export const recordStaffAttendance = async (
  payload: CreateAttendancePayload
): Promise<boolean> => {
  try {
    const res = await apiService.post<RestResponse<{ message: string }>>(
      'api/v1/staff-attendance',
      payload,
      {
        headers: getAuthHeaders(),
      }
    );

    if (res.error) {
      toast.error('Failed to record attendance: ' + res.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error recording staff attendance:', error);
    toast.error('Unexpected error while recording attendance');
    return false;
  }
};

/**
 * Update an existing attendance record
 */
export const updateStaffAttendance = async (
  payload: UpdateAttendancePayload
): Promise<boolean> => {
  try {
    const res = await apiService.put<RestResponse<{ message: string }>>(
      'api/v1/staff-attendance',
      payload,
      {
        headers: getAuthHeaders(),
      }
    );

    if (res.error) {
      toast.error('Failed to update attendance: ' + res.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating staff attendance:', error);
    toast.error('Unexpected error while updating attendance');
    return false;
  }
};

/**
 * Delete an attendance record
 */
export const deleteStaffAttendance = async (id: number): Promise<boolean> => {
  try {
    const res = await apiService.delete<RestResponse<{ message: string }>>(
      `api/v1/staff-attendance/${id}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (res.error) {
      toast.error('Failed to delete attendance: ' + res.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting staff attendance:', error);
    toast.error('Unexpected error while deleting attendance');
    return false;
  }
};
