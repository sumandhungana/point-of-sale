// Service for handling Rental Item payments integrated with backend shared 'payments' table

import { createPayment, getPaymentList, AddPaymentPayload, GetPaymentResponse } from './paymentService';

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

// In-memory cache for rental payments with 30s TTL
const paymentMemoryCache: Map<number, { data: RentalPaymentTransaction[]; timestamp: number }> = new Map();
const PAYMENT_CACHE_TTL_MS = 30000;

export const invalidateRentalPaymentCache = (rentalId?: number): void => {
  if (rentalId !== undefined) {
    paymentMemoryCache.delete(rentalId);
  } else {
    paymentMemoryCache.clear();
  }
};

/**
 * Fetch all payments recorded for a specific rental item synchronously from local cache
 */
export const getRentalPayments = (rentalId: number): RentalPaymentTransaction[] => {
  try {
    const memCached = paymentMemoryCache.get(rentalId);
    if (memCached) {
      return memCached.data;
    }
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
 * Fetch rental payments from backend API and update local cache
 */
export const fetchRentalPaymentsApi = async (rentalId: number, forceRefresh: boolean = false): Promise<RentalPaymentTransaction[]> => {
  const now = Date.now();
  if (!forceRefresh) {
    const cachedEntry = paymentMemoryCache.get(rentalId);
    if (cachedEntry && now - cachedEntry.timestamp < PAYMENT_CACHE_TTL_MS) {
      return cachedEntry.data;
    }
  }

  try {
    const backendPayments: GetPaymentResponse[] = await getPaymentList({
      paymentParty: 'RENTAL',
      partyId: rentalId,
    });

    if (Array.isArray(backendPayments)) {
      const mapped: RentalPaymentTransaction[] = backendPayments.map((item) => {
        // Parse remarks for optional reference prefix if present (e.g., "REF123 - Note")
        let referenceNo: string | undefined = undefined;
        let remarks = item.remarks || '';
        if (remarks.includes(' [Ref: ')) {
          const parts = remarks.split(' [Ref: ');
          remarks = parts[0];
          referenceNo = parts[1].replace(']', '').trim();
        }

        return {
          id: String(item.id),
          rentalId,
          amount: Number(item.amount) || 0,
          paymentCategory: item.paymentCategory,
          paymentType: (item.paymentType || 'CASH') as 'CASH' | 'CARD' | 'QR',
          date: item.createdAt,
          referenceNo,
          remarks: remarks || undefined,
          createdAt: item.createdAt,
        };
      });

      // Update in-memory cache
      paymentMemoryCache.set(rentalId, { data: mapped, timestamp: Date.now() });

      // Update local storage cache
      try {
        localStorage.setItem(`${STORAGE_PREFIX}${rentalId}`, JSON.stringify(mapped));
      } catch (cacheErr) {
        console.warn('Failed to cache rental payments in localStorage:', cacheErr);
      }

      return mapped;
    }
  } catch (error) {
    console.error('Failed to fetch rental payments from backend API:', error);
  }

  // Fallback to local cache if network call fails
  return getRentalPayments(rentalId);
};

/**
 * Record a new payment for a rental item directly to the shared backend payments table
 */
export const addRentalPayment = async (
  rentalId: number,
  data: {
    amount: number;
    paymentCategory: 'GIVEN' | 'RECEIVED';
    paymentType: 'CASH' | 'CARD' | 'QR' | 'BANK' | 'CHEQUE';
    date?: string;
    referenceNo?: string;
    remarks?: string;
  }
): Promise<RentalPaymentTransaction> => {
  const amt = Math.abs(Number(data.amount) || 0);
  const now = new Date().toISOString();

  // Map paymentType to backend enum ('CARD' | 'QR' | 'CASH')
  let backendPaymentType: 'CASH' | 'CARD' | 'QR' = 'CASH';
  if (data.paymentType === 'CARD') backendPaymentType = 'CARD';
  else if (data.paymentType === 'QR') backendPaymentType = 'QR';

  // Embed referenceNo in remarks if provided
  let formattedRemarks = data.remarks?.trim() || '';
  if (data.referenceNo?.trim()) {
    formattedRemarks = formattedRemarks
      ? `${formattedRemarks} [Ref: ${data.referenceNo.trim()}]`
      : `[Ref: ${data.referenceNo.trim()}]`;
  }

  const payload: AddPaymentPayload = {
    paymentParty: 'RENTAL',
    rentalId,
    amount: amt,
    paymentCategory: data.paymentCategory,
    paymentType: backendPaymentType,
    remarks: formattedRemarks || undefined,
  };

  try {
    await createPayment(payload);
  } catch (err) {
    console.error('Error invoking createPayment for rental:', err);
  }

  // Also construct and save local optimistic record
  const newPayment: RentalPaymentTransaction = {
    id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    rentalId,
    amount: amt,
    paymentCategory: data.paymentCategory,
    paymentType: data.paymentType,
    date: data.date || now,
    referenceNo: data.referenceNo?.trim() || undefined,
    remarks: data.remarks?.trim() || undefined,
    createdAt: now,
  };

  const existing = getRentalPayments(rentalId);
  const updated = [newPayment, ...existing.filter((p) => p.id !== newPayment.id)];
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${rentalId}`, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save rental payment to localStorage:', error);
  }

  // Invalidate in-memory cache for this rental item
  invalidateRentalPaymentCache(rentalId);

  return newPayment;
};

/**
 * Delete a payment record from local cache
 */
export const deleteRentalPayment = (rentalId: number, paymentId: string): boolean => {
  try {
    const existing = getRentalPayments(rentalId);
    const filtered = existing.filter((p) => p.id !== paymentId);
    localStorage.setItem(`${STORAGE_PREFIX}${rentalId}`, JSON.stringify(filtered));
    invalidateRentalPaymentCache(rentalId);
    return true;
  } catch (error) {
    console.error('Failed to delete rental payment:', error);
    return false;
  }
};

/**
 * Calculate payment summary and remaining balance for a rental item from transaction list or cache
 */
export const getRentalSummary = (
  rentalId: number,
  rentalAmount: number,
  transactions?: RentalPaymentTransaction[]
): RentalPaymentSummary => {
  const payments = transactions !== undefined ? transactions : getRentalPayments(rentalId);

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
 * Sync payments from backend API for all rental items in parallel and cache them
 */
export const syncAllRentalPayments = async (
  rentalIds: number[],
  forceRefresh: boolean = false
): Promise<Record<number, RentalPaymentTransaction[]>> => {
  const result: Record<number, RentalPaymentTransaction[]> = {};
  if (!rentalIds || rentalIds.length === 0) return result;

  await Promise.all(
    rentalIds.map(async (id) => {
      try {
        const txs = await fetchRentalPaymentsApi(id, forceRefresh);
        result[id] = txs;
      } catch (err) {
        console.error(`Error syncing rental payments for item ${id}:`, err);
        result[id] = getRentalPayments(id);
      }
    })
  );

  return result;
};

/**
 * Calculate overall summary across all rentals in list
 */
export const getGlobalRentalSummary = (
  rentalItems: Array<{ id: number; rentalAmount: number }>,
  paymentsMap?: Record<number, RentalPaymentTransaction[]>
): { totalAmount: number; totalPaid: number; remainingDue: number } => {
  let totalAmount = 0;
  let totalPaid = 0;

  rentalItems.forEach((item) => {
    const amt = Number(item.rentalAmount) || 0;
    totalAmount += amt;
    const txs = paymentsMap && paymentsMap[item.id] !== undefined ? paymentsMap[item.id] : undefined;
    const summary = getRentalSummary(item.id, amt, txs);
    totalPaid += summary.netPaid;
  });

  return {
    totalAmount,
    totalPaid,
    remainingDue: Math.max(0, totalAmount - totalPaid),
  };
};
