import { apiService } from "@/infrastructure/utils/ApiService";
import { RestResponse } from "@/core/auth/types";
import { toast } from "react-toastify";

export type AttendanceStatusType = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE';

export interface AttendanceStatusConfig {
  key: AttendanceStatusType;
  label: string;
  color: string;       // Primary status color: Present #059669, Half-day #d97706, Absent #dc2626, Leave #6366f1
  bgColor: string;     // Soft background tint: #ecfdf5, #fffbeb, #fef2f2, #eef2ff
  textColor: string;   // High-contrast text on solid color: #ffffff
  darkColor: string;   // Dark text on light background tint: #065f46, #92400e, #991b1b, #3730a3
  icon: string;        // Bootstrap icon class
  radioValue: string;  // Value for form controls ('present', 'halfDay', 'absent', 'leave')
}

export const ATTENDANCE_STATUS_MAP: Record<AttendanceStatusType, AttendanceStatusConfig> = {
  PRESENT: {
    key: 'PRESENT',
    label: 'Present',
    color: '#059669',
    bgColor: '#ecfdf5',
    textColor: '#ffffff',
    darkColor: '#065f46',
    icon: 'bi-check-circle-fill',
    radioValue: 'present',
  },
  HALF_DAY: {
    key: 'HALF_DAY',
    label: 'Half-day',
    color: '#d97706',
    bgColor: '#fffbeb',
    textColor: '#ffffff',
    darkColor: '#92400e',
    icon: 'bi-clock-fill',
    radioValue: 'halfDay',
  },
  ABSENT: {
    key: 'ABSENT',
    label: 'Absent',
    color: '#dc2626',
    bgColor: '#fef2f2',
    textColor: '#ffffff',
    darkColor: '#991b1b',
    icon: 'bi-x-circle-fill',
    radioValue: 'absent',
  },
  LEAVE: {
    key: 'LEAVE',
    label: 'Leave',
    color: '#6366f1',
    bgColor: '#eef2ff',
    textColor: '#ffffff',
    darkColor: '#3730a3',
    icon: 'bi-calendar2-minus',
    radioValue: 'leave',
  },
};

export const ATTENDANCE_STATUS_LIST: AttendanceStatusConfig[] = [
  ATTENDANCE_STATUS_MAP.PRESENT,
  ATTENDANCE_STATUS_MAP.HALF_DAY,
  ATTENDANCE_STATUS_MAP.ABSENT,
  ATTENDANCE_STATUS_MAP.LEAVE,
];

export const getAttendanceConfig = (status?: string | null): AttendanceStatusConfig | undefined => {
  if (!status) return undefined;
  const upper = status.toUpperCase().replace('-', '_').replace(' ', '_');
  if (upper === 'PRESENT') return ATTENDANCE_STATUS_MAP.PRESENT;
  if (upper === 'HALF_DAY' || upper === 'HALFDAY') return ATTENDANCE_STATUS_MAP.HALF_DAY;
  if (upper === 'ABSENT') return ATTENDANCE_STATUS_MAP.ABSENT;
  if (upper === 'LEAVE') return ATTENDANCE_STATUS_MAP.LEAVE;
  return undefined;
};

export const isSameCalendarDay = (target: Date, candidate: string | Date | undefined | null): boolean => {
  if (!candidate) return false;

  if (typeof candidate === 'string') {
    const isoMatch = candidate.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const year = parseInt(isoMatch[1], 10);
      const month = parseInt(isoMatch[2], 10) - 1;
      const day = parseInt(isoMatch[3], 10);
      return (
        target.getFullYear() === year &&
        target.getMonth() === month &&
        target.getDate() === day
      );
    }
  }

  const cDate = new Date(candidate);
  if (isNaN(cDate.getTime())) return false;

  return (
    target.getFullYear() === cDate.getFullYear() &&
    target.getMonth() === cDate.getMonth() &&
    target.getDate() === cDate.getDate()
  );
};

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

// In-memory cache for staff attendances with 30s TTL
let attendanceCache: { data: StaffAttendanceRecord[]; timestamp: number } | null = null;
const ATTENDANCE_CACHE_TTL_MS = 30000;

export const invalidateStaffAttendanceCache = (): void => {
  attendanceCache = null;
};

/**
 * Fetch all attendance records for the current khata book/organization
 */
export const fetchStaffAttendances = async (forceRefresh: boolean = false): Promise<StaffAttendanceRecord[]> => {
  const now = Date.now();
  if (!forceRefresh && attendanceCache && now - attendanceCache.timestamp < ATTENDANCE_CACHE_TTL_MS) {
    return attendanceCache.data;
  }

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

    const data = res?.response?.data ?? [];
    attendanceCache = { data, timestamp: Date.now() };
    return data;
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

    invalidateStaffAttendanceCache();
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
      `api/v1/staff-attendance/${payload.id}`,
      payload,
      {
        headers: getAuthHeaders(),
      }
    );

    if (res.error) {
      toast.error('Failed to update attendance: ' + res.error);
      return false;
    }

    invalidateStaffAttendanceCache();
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

    invalidateStaffAttendanceCache();
    return true;
  } catch (error) {
    console.error('Error deleting staff attendance:', error);
    toast.error('Unexpected error while deleting attendance');
    return false;
  }
};
