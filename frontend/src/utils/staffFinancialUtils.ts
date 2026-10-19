/**
 * Staff Financial & Accrual Calculation Utilities
 * 
 * Computes:
 * - Accrued salary up to current date based on calculationDate and salaryType (Monthly, Daily, Weekly)
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
}

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
 * Computes accrued salary to date based on calculation date and payment type
 */
export const calculateAccruedSalary = (staff: any): number => {
  const salary = getPrimarySalary(staff);
  if (!salary) return 0;

  const rawAmount = Number(salary.amount);
  if (isNaN(rawAmount) || rawAmount <= 0) return 0;

  const dateValue = salary.calculationDate || salary.selectedDate;
  if (!dateValue) return 0;

  const rawDateString = String(dateValue).split('T')[0];
  const dateParts = rawDateString.split('-');
  if (dateParts.length !== 3) return 0;

  const startYear = parseInt(dateParts[0], 10);
  const startMonth = parseInt(dateParts[1], 10) - 1;
  const startDay = parseInt(dateParts[2], 10);

  if (isNaN(startYear) || startYear < 2000 || isNaN(startMonth) || isNaN(startDay)) {
    return 0;
  }

  const startUtc = Date.UTC(startYear, startMonth, startDay);
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  if (todayUtc < startUtc) {
    return 0;
  }

  const diffInMs = todayUtc - startUtc;
  const elapsedDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;
  if (elapsedDays < 1) return 0;

  const type = (salary.salaryType || '').toLowerCase();

  switch (type) {
    case 'monthly': {
      const daysInMonth = new Date(startYear, startMonth + 1, 0).getDate();
      if (!daysInMonth || daysInMonth <= 0) return 0;
      const dailySalary = rawAmount / daysInMonth;
      return Math.round(dailySalary * elapsedDays);
    }
    case 'daily': {
      return Math.round(rawAmount * elapsedDays);
    }
    case 'weekly': {
      const dailySalary = rawAmount / 7;
      return Math.round(dailySalary * elapsedDays);
    }
    default:
      return 0;
  }
};

/**
 * Calculates due left or advance amount given a staff member and their total payments given
 */
export const calculateStaffFinancials = (staff: any, paymentGiven: number = 0): StaffFinancials => {
  const accrued = calculateAccruedSalary(staff);
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
  };
};
