// Service for handling Rental Item payments on the frontend with localStorage persistence

export interface RentalPaymentTransaction {
  id: string;
  rentalId: number;
  amount: number;
  paymentCategory: 'GIVEN' | 'RECEIVED'; // 'GIVEN': Paid for rental ("You Gave" / "Pay Rental"), 'RECEIVED': Advance / Deposit received
  paymentType: 'CASH' | 'CARD' | 'QR' | 'BANK' | 'CHEQUE';
  date: string; // ISO date string or formatted date
  referenceNo?: string;
  remarks?: string;
  createdAt: string;
}

export interface RentalPaymentSummary {
  totalRentalAmount: number;
  totalGiven: number; // Total payments made ("You Gave")
  totalReceived: number; // Advance or payments collected ("You Received")
  netPaid: number; // net paid towards the rental
  remainingBalance: number; // remaining due
  isFullyPaid: boolean;
}

const STORAGE_PREFIX = 'pos_rental_payments_';

/**
 * Fetch all payments recorded for a specific rental item
 */
export const getRentalPayments = (rentalId: number): RentalPaymentTransaction[] => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${rentalId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());
    }
    return [];
  } catch (error) {
    console.error('Failed to load rental payments from localStorage:', error);
    return [];
  }
};

/**
 * Record a new payment for a rental item
 */
export const addRentalPayment = (
  rentalId: number,
  data: {
    amount: number;
    paymentCategory: 'GIVEN' | 'RECEIVED';
    paymentType: 'CASH' | 'CARD' | 'QR' | 'BANK' | 'CHEQUE';
    date?: string;
    referenceNo?: string;
    remarks?: string;
  }
): RentalPaymentTransaction => {
  const existing = getRentalPayments(rentalId);
  const now = new Date().toISOString();
  
  const newPayment: RentalPaymentTransaction = {
    id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    rentalId,
    amount: Math.abs(Number(data.amount) || 0),
    paymentCategory: data.paymentCategory,
    paymentType: data.paymentType,
    date: data.date || now,
    referenceNo: data.referenceNo?.trim() || undefined,
    remarks: data.remarks?.trim() || undefined,
    createdAt: now,
  };

  const updated = [newPayment, ...existing];
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${rentalId}`, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save rental payment to localStorage:', error);
  }

  return newPayment;
};

/**
 * Delete a payment record
 */
export const deleteRentalPayment = (rentalId: number, paymentId: string): boolean => {
  try {
    const existing = getRentalPayments(rentalId);
    const filtered = existing.filter((p) => p.id !== paymentId);
    localStorage.setItem(`${STORAGE_PREFIX}${rentalId}`, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Failed to delete rental payment:', error);
    return false;
  }
};

/**
 * Calculate payment summary and remaining balance for a rental item
 */
export const getRentalSummary = (rentalId: number, rentalAmount: number): RentalPaymentSummary => {
  const payments = getRentalPayments(rentalId);
  
  let totalGiven = 0;
  let totalReceived = 0;

  payments.forEach((p) => {
    if (p.paymentCategory === 'GIVEN') {
      totalGiven += p.amount;
    } else if (p.paymentCategory === 'RECEIVED') {
      totalReceived += p.amount;
    }
  });

  // Net paid represents payments made towards satisfying the rental amount
  const netPaid = totalGiven + totalReceived;
  const remainingBalance = Math.max(0, rentalAmount - netPaid);
  const isFullyPaid = remainingBalance <= 0;

  return {
    totalRentalAmount: rentalAmount,
    totalGiven,
    totalReceived,
    netPaid,
    remainingBalance,
    isFullyPaid,
  };
};

/**
 * Calculate overall summary across all rentals in list
 */
export const getGlobalRentalSummary = (
  rentalItems: Array<{ id: number; rentalAmount: number }>
): { totalAmount: number; totalPaid: number; remainingDue: number } => {
  let totalAmount = 0;
  let totalPaid = 0;

  rentalItems.forEach((item) => {
    const amt = Number(item.rentalAmount) || 0;
    totalAmount += amt;
    const summary = getRentalSummary(item.id, amt);
    totalPaid += summary.netPaid;
  });

  return {
    totalAmount,
    totalPaid,
    remainingDue: Math.max(0, totalAmount - totalPaid),
  };
};
