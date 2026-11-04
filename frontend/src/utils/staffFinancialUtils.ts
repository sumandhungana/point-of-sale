/**
 * Staff Financial & Accrual Calculation Utilities
 * 
 * Computes:
 * - Accrued salary up to current date based on calculationDate, salaryType (Monthly, Daily, Weekly),
 *   and staff attendance records.
 * - Attendance impact on salary / due:
 *   * PRESENT: full day salary accrued (1.0 day).
 *   * No attendance (unmarked): full day salary accrued (1.0 day).
 *   * ABSENT: 0 salary accrued for that day (deduct 1.0 day).
 *   * LEAVE: 0 salary accrued for that day (deduct 1.0 day).
 *   * HALF_DAY: half day salary accrued (deduct 0.5 day).
 * - Due Payment Left (when payment given < accrued salary)
 * - Advance Payment (when payment given > accrued salary)
 */

export interface StaffSalaryEntityLike {
  id?: number;
  salaryType?: string;
  amount?: number | string;
  calculationDate?: string;
  selectedDate?: string;
  month?: number;
  year?: number;
}

export interface StaffFinancials {
  accrued: number;
  paid: number;
  due: number;
  advance: number;
  netBalance: number; // positive = amount owed to staff (due), negative = excess given (advance)
  primarySalary: StaffSalaryEntityLike | null;
  elapsedDays?: number;
  effectiveDays?: number;
  absentDays?: number;
  leaveDays?: number;
  halfDays?: number;
  deductedDays?: number;
}

export interface AccrualBreakdown {
  accrued: number;
  elapsedDays: number;
  effectiveDays: number;
  absentDays: number;
  leaveDays: number;
  halfDays: number;
  deductedDays: number;
}

/**
 * Normalizes any string, Date, or timestamp into 'YYYY-MM-DD' calendar date
 */
export const toCalendarDateString = (val: any): string | null => {
  if (!val) return null;
  if (typeof val === 'string') {
    const match = val.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (match) {
      const y = match[1];
      const m = match[2].padStart(2, '0');
      const d = match[3].padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Normalizes attendance status string to standard enum
 */
export const normalizeAttendanceStatus = (
  status?: string | null
): 'PRESENT' | 'HALF_DAY' | 'ABSENT' | 'LEAVE' | null => {
  if (!status) return null;
  const s = String(status).trim().toUpperCase().replace(/[-\s]/g, '_');
  if (s === 'PRESENT') return 'PRESENT';
  if (s === 'HALF_DAY' || s === 'HALFDAY') return 'HALF_DAY';
  if (s === 'ABSENT') return 'ABSENT';
  if (s === 'LEAVE') return 'LEAVE';
  return null;
};

/**
 * Extracts salaries array from different backend/frontend response shapes
 */
export const getStaffSalaries = (staff: any): StaffSalaryEntityLike[] => {
  if (!staff) return [];
  if (Array.isArray(staff.salaryResponses) && staff.salaryResponses.length > 0) {
    return staff.salaryResponses;
  }
  if (Array.isArray(staff.salaries) && staff.salaries.length > 0) {
    return staff.salaries;
  }
  if (Array.isArray(staff.staffSalaries) && staff.staffSalaries.length > 0) {
    return staff.staffSalaries;
  }
  if (staff.salary) {
    return [staff.salary];
  }
  return [];
};

/**
 * Returns the primary salary record (excluding any tagged as 'advance' type)
 */
export const getPrimarySalary = (staff: any): StaffSalaryEntityLike | null => {
  const salaries = getStaffSalaries(staff);
  if (salaries.length === 0) return null;
  return (
    salaries.find(
      (s) => s?.salaryType?.toLowerCase() !== 'advance'
    ) || salaries[0]
  );
};

/**
 * Computes accrued salary with detailed breakdown of days and deductions based on attendance
 */
export const calculateAccruedSalaryWithDetails = (
  staff: any,
  attendances?: any[]
): AccrualBreakdown => {
  const fallback: AccrualBreakdown = {
    accrued: 0,
    elapsedDays: 0,
    effectiveDays: 0,
    absentDays: 0,
    leaveDays: 0,
    halfDays: 0,
    deductedDays: 0,
  };

  const salary = getPrimarySalary(staff);
  if (!salary) return fallback;

  const rawAmount = Number(salary.amount);
  if (isNaN(rawAmount) || rawAmount <= 0) return fallback;

  const dateValue =
    salary.calculationDate ||
    salary.selectedDate ||
    staff?.calculationDate ||
    staff?.selectedDate;
  if (!dateValue) return fallback;

  const startDateStr = toCalendarDateString(dateValue);
  if (!startDateStr) return fallback;

  const now = new Date();
  const todayDateStr = toCalendarDateString(now);
  if (!todayDateStr || todayDateStr < startDateStr) return fallback;

  const [startYear, startMonth, startDay] = startDateStr.split('-').map((v) => parseInt(v, 10));
  if (isNaN(startYear) || startYear < 2000 || isNaN(startMonth) || isNaN(startDay)) {
    return fallback;
  }

  const startUtc = Date.UTC(startYear, startMonth - 1, startDay);
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  const diffInMs = todayUtc - startUtc;
  const elapsedDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;
  if (elapsedDays < 1) return fallback;

  // 1. Gather all attendance records for this staff member
  const staffId = staff?.id;
  const allAttendances: any[] = [];

  if (Array.isArray(attendances)) {
    for (const a of attendances) {
      if (!staffId || a.staffId === staffId || a.staff?.id === staffId || a.staffId == null) {
        allAttendances.push(a);
      }
    }
  }

  // Also include any nested attendance records on the staff object itself
  const nested =
    staff?.attendanceResponses ||
    staff?.staffAttendanceEntities ||
    staff?.attendances ||
    staff?.attendanceList ||
    staff?.attendanceRecords ||
    [];

  if (Array.isArray(nested)) {
    allAttendances.push(...nested);
  }

  // 2. Map attendance statuses by calendar day (YYYY-MM-DD)
  // If duplicate records exist for the same day, the latest entry takes precedence
  const dayStatusMap = new Map<string, 'PRESENT' | 'HALF_DAY' | 'ABSENT' | 'LEAVE'>();
  for (const a of allAttendances) {
    const dStr = toCalendarDateString(a.date || a.attendanceDate);
    const status = normalizeAttendanceStatus(a.status);
    if (dStr && status) {
      dayStatusMap.set(dStr, status);
    }
  }

  // 3. Count deductions for days falling within [startDateStr, todayDateStr]:
  // - ABSENT: deduct 1.0 day
  // - LEAVE: deduct 1.0 day
  // - HALF_DAY: deduct 0.5 day
  // - PRESENT: deduct 0.0 day
  // - Unmarked / No attendance: deduct 0.0 day (default full day)
  let totalDeductedDays = 0;
  let absentCount = 0;
  let leaveCount = 0;
  let halfDayCount = 0;

  for (const [dateKey, status] of dayStatusMap.entries()) {
    if (dateKey >= startDateStr && dateKey <= todayDateStr) {
      if (status === 'ABSENT') {
        totalDeductedDays += 1.0;
        absentCount++;
      } else if (status === 'LEAVE') {
        totalDeductedDays += 1.0;
        leaveCount++;
      } else if (status === 'HALF_DAY') {
        totalDeductedDays += 0.5;
        halfDayCount++;
      }
    }
  }

  // Effective days worked since calculation date
  const effectiveDays = Math.max(0, elapsedDays - totalDeductedDays);

  let accrued = 0;
  const type = (salary.salaryType || '').toLowerCase();

  switch (type) {
    case 'monthly': {
      // Days in start month
      const daysInMonth = new Date(startYear, startMonth, 0).getDate();
      if (!daysInMonth || daysInMonth <= 0) return fallback;
      const dailySalary = rawAmount / daysInMonth;
      accrued = Math.round(dailySalary * effectiveDays);
      break;
    }
    case 'daily': {
      accrued = Math.round(rawAmount * effectiveDays);
      break;
    }
    case 'weekly': {
      const dailySalary = rawAmount / 7;
      accrued = Math.round(dailySalary * effectiveDays);
      break;
    }
    default:
      accrued = 0;
  }

  return {
    accrued,
    elapsedDays,
    effectiveDays,
    absentDays: absentCount,
    leaveDays: leaveCount,
    halfDays: halfDayCount,
    deductedDays: totalDeductedDays,
  };
};

/**
 * Computes accrued salary to date based on calculation date, salary type, and attendance records
 */
export const calculateAccruedSalary = (staff: any, attendances?: any[]): number => {
  return calculateAccruedSalaryWithDetails(staff, attendances).accrued;
};

/**
 * Calculates due left or advance amount given a staff member, their total payments given,
 * and their attendance history.
 */
export const calculateStaffFinancials = (
  staff: any,
  paymentGiven: number = 0,
  attendances?: any[]
): StaffFinancials => {
  const breakdown = calculateAccruedSalaryWithDetails(staff, attendances);
  const accrued = breakdown.accrued;
  const paid = Math.max(0, paymentGiven || 0);
  const primarySalary = getPrimarySalary(staff);

  let due = 0;
  let advance = 0;

  if (paid < accrued) {
    due = accrued - paid;
    advance = 0;
  } else if (paid > accrued) {
    due = 0;
    advance = paid - accrued;
  } else {
    due = 0;
    advance = 0;
  }

  return {
    accrued,
    paid,
    due,
    advance,
    netBalance: accrued - paid,
    primarySalary,
    elapsedDays: breakdown.elapsedDays,
    effectiveDays: breakdown.effectiveDays,
    absentDays: breakdown.absentDays,
    leaveDays: breakdown.leaveDays,
    halfDays: breakdown.halfDays,
    deductedDays: breakdown.deductedDays,
  };
};
