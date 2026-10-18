import { apiService } from "@/infrastructure/utils/ApiService";
import { hasStoredModule } from "@/core/rbac/usePermission"

let loansCache: { data: Loan[]; timestamp: number } | null = null;
const LOANS_CACHE_TTL = 15000; // 15 seconds

export const invalidateLoansCache = (): void => {
    loansCache = null;
};

interface RestResponse<T> {
    code: number;
    message: string;
    data: T;
}

export type LenderType = 'BANK' | 'PERSON' | 'INSTITUTION' | 'OTHER';
export type InterestType = 'REDUCING' | 'FLAT';
export type LoanStatus = 'ACTIVE' | 'CLOSED' | 'OVERDUE';
export type TransactionType = 'PAYMENT_GIVEN' | 'PAYMENT_RECEIVED';
export type PaymentMode = 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'DIGITAL';

export interface EMIScheduleItem {
    installmentNo: number;
    dueDate: string;
    beginningBalance: number;
    emiAmount: number;
    principalComponent: number;
    interestComponent: number;
    endingBalance: number;
    status: 'PAID' | 'PENDING' | 'OVERDUE';
    paidDate?: string;
    paidAmount?: number;
}

export interface LoanTransaction {
    id: string;
    loanId: string;
    date: string;
    type: TransactionType; // PAYMENT_GIVEN = Repayment paid out; PAYMENT_RECEIVED = Loan disbursement received / other inflow
    amount: number;
    principalComponent: number;
    interestComponent: number;
    paymentMode: PaymentMode;
    referenceNo?: string;
    remarks?: string;
    balanceAfter: number;
    createdAt: string;
}

export interface Loan {
    id: string;
    loanNumber: string; // e.g. LN-2026-001
    lenderName: string; // e.g. Global IME Bank or Hari Sharma
    lenderType: LenderType;
    phoneNumber?: string;
    accountNumber?: string;
    principalAmount: number;
    interestRate: number; // annual rate %
    tenureMonths: number;
    interestType: InterestType;
    startDate: string; // YYYY-MM-DD
    monthlyEmi: number;
    totalInterest: number;
    totalPayable: number;
    totalPaid: number;
    remainingBalance: number;
    status: LoanStatus;
    purpose?: string;
    remarks?: string;
    createdAt: string;
    updatedAt: string;
    schedule: EMIScheduleItem[];
}

export interface CreateLoanPayload {
    loanNumber?: string;
    lenderName: string;
    lenderType: LenderType;
    phoneNumber?: string;
    accountNumber?: string;
    principalAmount: number;
    interestRate: number;
    tenureMonths: number;
    interestType: InterestType;
    startDate: string;
    purpose?: string;
    remarks?: string;
}

export interface RecordPaymentPayload {
    loanId: string;
    type: TransactionType;
    amount: number;
    paymentDate: string;
    paymentMode: PaymentMode;
    principalComponent?: number;
    interestComponent?: number;
    referenceNo?: string;
    remarks?: string;
}

// ==========================================
// Financial Calculations
// ==========================================

export const calculateEMI = (
    principal: number,
    annualRate: number,
    tenureMonths: number,
    type: InterestType = 'REDUCING'
): { monthlyEmi: number; totalInterest: number; totalPayable: number } => {
    if (principal <= 0 || tenureMonths <= 0) {
        return { monthlyEmi: 0, totalInterest: 0, totalPayable: 0 };
    }

    if (type === 'FLAT') {
        const years = tenureMonths / 12;
        const totalInterest = (principal * annualRate * years) / 100;
        const totalPayable = principal + totalInterest;
        const monthlyEmi = totalPayable / tenureMonths;
        return {
            monthlyEmi: Math.round(monthlyEmi * 100) / 100,
            totalInterest: Math.round(totalInterest * 100) / 100,
            totalPayable: Math.round(totalPayable * 100) / 100,
        };
    }

    // Reducing balance (standard banking EMI)
    const monthlyRate = annualRate / 12 / 100;
    if (monthlyRate === 0) {
        const monthlyEmi = principal / tenureMonths;
        return {
            monthlyEmi: Math.round(monthlyEmi * 100) / 100,
            totalInterest: 0,
            totalPayable: principal,
        };
    }

    const emi =
        (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    const totalPayable = emi * tenureMonths;
    const totalInterest = totalPayable - principal;

    return {
        monthlyEmi: Math.round(emi * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        totalPayable: Math.round(totalPayable * 100) / 100,
    };
};

export const generateAmortizationSchedule = (
    principal: number,
    annualRate: number,
    tenureMonths: number,
    startDateStr: string,
    type: InterestType = 'REDUCING'
): EMIScheduleItem[] => {
    const { monthlyEmi, totalInterest } = calculateEMI(principal, annualRate, tenureMonths, type);
    const schedule: EMIScheduleItem[] = [];
    const monthlyRate = annualRate / 12 / 100;

    let balance = principal;
    const startDate = new Date(startDateStr || new Date().toISOString());

    for (let i = 1; i <= tenureMonths; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        const dueDateStr = dueDate.toISOString().split('T')[0];

        let interest = 0;
        let principalPart = 0;

        if (type === 'FLAT') {
            interest = totalInterest / tenureMonths;
            principalPart = monthlyEmi - interest;
        } else {
            interest = balance * monthlyRate;
            principalPart = monthlyEmi - interest;
        }

        // On last installment or if principal exceeds remaining balance
        if (i === tenureMonths || principalPart > balance) {
            principalPart = balance;
        }

        const endingBalance = Math.max(0, balance - principalPart);

        schedule.push({
            installmentNo: i,
            dueDate: dueDateStr,
            beginningBalance: Math.round(balance * 100) / 100,
            emiAmount: Math.round((principalPart + interest) * 100) / 100,
            principalComponent: Math.round(principalPart * 100) / 100,
            interestComponent: Math.round(interest * 100) / 100,
            endingBalance: Math.round(endingBalance * 100) / 100,
            status: 'PENDING',
        });

        balance = endingBalance;
        if (balance <= 0) break;
    }

    return schedule;
};

// ==========================================
// Storage Keys & Seed Data
// ==========================================

const LOANS_STORAGE_KEY = 'pos_loans_data_v2';
const TRANSACTIONS_STORAGE_KEY = 'pos_loan_transactions_v2';

const getInitialSeedLoans = (): Loan[] => {
    const today = new Date().toISOString().split('T')[0];
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    const date1 = sixMonthsAgo.toISOString().split('T')[0];

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 2);
    const date2 = threeMonthsAgo.toISOString().split('T')[0];

    const loan1Schedule = generateAmortizationSchedule(1200000, 10.5, 24, date1, 'REDUCING');
    // Mark first 4 installments as paid
    let loan1Paid = 0;
    for (let i = 0; i < 4 && i < loan1Schedule.length; i++) {
        loan1Schedule[i].status = 'PAID';
        loan1Schedule[i].paidDate = loan1Schedule[i].dueDate;
        loan1Schedule[i].paidAmount = loan1Schedule[i].emiAmount;
        loan1Paid += loan1Schedule[i].emiAmount;
    }

    const loan2Schedule = generateAmortizationSchedule(350000, 12, 12, date2, 'FLAT');
    let loan2Paid = 0;
    for (let i = 0; i < 2 && i < loan2Schedule.length; i++) {
        loan2Schedule[i].status = 'PAID';
        loan2Schedule[i].paidDate = loan2Schedule[i].dueDate;
        loan2Schedule[i].paidAmount = loan2Schedule[i].emiAmount;
        loan2Paid += loan2Schedule[i].emiAmount;
    }

    const { monthlyEmi: emi1, totalInterest: int1, totalPayable: pay1 } = calculateEMI(1200000, 10.5, 24, 'REDUCING');
    const { monthlyEmi: emi2, totalInterest: int2, totalPayable: pay2 } = calculateEMI(350000, 12, 12, 'FLAT');

    return [
        {
            id: 'loan-1',
            loanNumber: 'LN-2026-001',
            lenderName: 'Global IME Bank',
            lenderType: 'BANK',
            phoneNumber: '+977-1-4221122',
            accountNumber: 'GBIME-TRM-88902',
            principalAmount: 1200000,
            interestRate: 10.5,
            tenureMonths: 24,
            interestType: 'REDUCING',
            startDate: date1,
            monthlyEmi: emi1,
            totalInterest: int1,
            totalPayable: pay1,
            totalPaid: Math.round(loan1Paid),
            remainingBalance: Math.max(0, Math.round(pay1 - loan1Paid)),
            status: 'ACTIVE',
            purpose: 'Working capital & warehouse inventory expansion',
            remarks: 'Collateral against warehouse stock. Quarterly review.',
            createdAt: date1,
            updatedAt: today,
            schedule: loan1Schedule,
        },
        {
            id: 'loan-2',
            loanNumber: 'LN-2026-002',
            lenderName: 'Rameshwor Shrestha',
            lenderType: 'PERSON',
            phoneNumber: '+977-9841234567',
            accountNumber: 'N/A (Cash / Cheque)',
            principalAmount: 350000,
            interestRate: 12,
            tenureMonths: 12,
            interestType: 'FLAT',
            startDate: date2,
            monthlyEmi: emi2,
            totalInterest: int2,
            totalPayable: pay2,
            totalPaid: Math.round(loan2Paid),
            remainingBalance: Math.max(0, Math.round(pay2 - loan2Paid)),
            status: 'ACTIVE',
            purpose: 'Short-term festive bulk purchasing',
            remarks: 'Personal promoter loan. Monthly repayment agreement.',
            createdAt: date2,
            updatedAt: today,
            schedule: loan2Schedule,
        },
    ];
};

// ==========================================
// Service Implementation
// ==========================================

export const getStoredLoans = (): Loan[] => {
    try {
        const data = localStorage.getItem(LOANS_STORAGE_KEY);
        if (!data) {
            const seed = getInitialSeedLoans();
            localStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(seed));
            return seed;
        }
        return JSON.parse(data);
    } catch {
        return getInitialSeedLoans();
    }
};

export const saveStoredLoans = (loans: Loan[]): void => {
    localStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(loans));
};

export const getStoredTransactions = (): LoanTransaction[] => {
    try {
        const data = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
        if (!data) return [];
        return JSON.parse(data);
    } catch {
        return [];
    }
};

export const saveStoredTransactions = (transactions: LoanTransaction[]): void => {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
};

// ==========================================
// Backend API Requests & Fallbacks
// ==========================================

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export const calculateLoanEmiBackend = async (payload: {
    principalAmount: number;
    interestRate: number;
    tenureMonths: number;
    interestType: InterestType;
    startDate?: string;
}): Promise<{ monthlyEmi: number; totalInterest: number; totalPayable: number; schedule: EMIScheduleItem[] }> => {
    try {
        const res = await apiService.post<RestResponse<any>>('api/v1/loans/calculate', payload, {
            headers: getAuthHeaders(),
        });
        if (res && res.response?.data) {
            return res.response.data;
        }
    } catch (e) {
        console.warn('Backend calculate failed, using client calculation:', e);
    }
    const calc = calculateEMI(payload.principalAmount, payload.interestRate, payload.tenureMonths, payload.interestType);
    const schedule = generateAmortizationSchedule(
        payload.principalAmount,
        payload.interestRate,
        payload.tenureMonths,
        payload.startDate || new Date().toISOString(),
        payload.interestType
    );
    return { ...calc, schedule };
};

export const fetchAllLoans = async (forceRefresh = false): Promise<Loan[]> => {
    // 1. Role-based guard: only authorized users (Super Admin or user with loan module) can trigger loan API
    if (!hasStoredModule('loan')) {
        console.warn('fetchAllLoans skipped: current user is not authorized for loans');
        return [];
    }

    // 2. Prevent duplicate requests: Return cached data if fresh
    const now = Date.now();
    if (!forceRefresh && loansCache && now - loansCache.timestamp < LOANS_CACHE_TTL) {
        return loansCache.data;
    }

    try {
        const res = await apiService.get<RestResponse<any[]>>('api/v1/loans', {
            headers: getAuthHeaders(),
        });
        if (res && res.response?.data && Array.isArray(res.response.data)) {
            const mapped: Loan[] = res.response.data.map((l: any) => ({
                ...l,
                id: String(l.id),
                schedule: (l.schedule || []).map((s: any) => ({
                    ...s,
                    id: String(s.id),
                })),
            }));
            saveStoredLoans(mapped);
            loansCache = { data: mapped, timestamp: now };
            return mapped;
        }
    } catch (e) {
        console.warn('Backend fetchAllLoans failed, falling back to local cache:', e);
    }
    const fallback = getStoredLoans();
    loansCache = { data: fallback, timestamp: now };
    return fallback;
};

export const fetchLoanById = async (id: string): Promise<Loan | null> => {
    try {
        const res = await apiService.get<RestResponse<any>>(`api/v1/loans/${id}`, {
            headers: getAuthHeaders(),
        });
        if (res && res.response?.data && res.response.data.loan) {
            const l = res.response.data.loan;
            return {
                ...l,
                id: String(l.id),
                schedule: (l.schedule || []).map((s: any) => ({
                    ...s,
                    id: String(s.id),
                })),
            };
        }
    } catch (e) {
        console.warn('Backend fetchLoanById failed, falling back to local cache:', e);
    }
    const loans = getStoredLoans();
    return loans.find((l) => l.id === id) || null;
};

export const createLoan = async (payload: CreateLoanPayload): Promise<Loan> => {
    try {
        const res = await apiService.post<RestResponse<any>>('api/v1/loans', payload, {
            headers: getAuthHeaders(),
        });
        if (res && res.response?.data && res.response.data.loan) {
            const l = res.response.data.loan;
            const mapped: Loan = {
                ...l,
                id: String(l.id),
                schedule: (l.schedule || []).map((s: any) => ({
                    ...s,
                    id: String(s.id),
                })),
            };
            const current = getStoredLoans();
            saveStoredLoans([mapped, ...current]);
            invalidateLoansCache();
            return mapped;
        }
    } catch (e) {
        console.warn('Backend createLoan failed, falling back to local storage:', e);
    }

    const loans = getStoredLoans();
    const id = `loan-${Date.now()}`;
    const loanNumber = payload.loanNumber || `LN-${new Date().getFullYear()}-${String(loans.length + 1).padStart(3, '0')}`;

    const { monthlyEmi, totalInterest, totalPayable } = calculateEMI(
        payload.principalAmount,
        payload.interestRate,
        payload.tenureMonths,
        payload.interestType
    );

    const schedule = generateAmortizationSchedule(
        payload.principalAmount,
        payload.interestRate,
        payload.tenureMonths,
        payload.startDate,
        payload.interestType
    );

    const now = new Date().toISOString();

    const newLoan: Loan = {
        id,
        loanNumber,
        lenderName: payload.lenderName,
        lenderType: payload.lenderType,
        phoneNumber: payload.phoneNumber,
        accountNumber: payload.accountNumber,
        principalAmount: payload.principalAmount,
        interestRate: payload.interestRate,
        tenureMonths: payload.tenureMonths,
        interestType: payload.interestType,
        startDate: payload.startDate,
        monthlyEmi,
        totalInterest,
        totalPayable,
        totalPaid: 0,
        remainingBalance: totalPayable,
        status: 'ACTIVE',
        purpose: payload.purpose,
        remarks: payload.remarks,
        createdAt: now,
        updatedAt: now,
        schedule,
    };

    const updated = [newLoan, ...loans];
    saveStoredLoans(updated);

    // Record initial disbursement transaction
    const initialTx: LoanTransaction = {
        id: `tx-${Date.now()}`,
        loanId: id,
        date: payload.startDate,
        type: 'PAYMENT_RECEIVED',
        amount: payload.principalAmount,
        principalComponent: payload.principalAmount,
        interestComponent: 0,
        paymentMode: 'BANK_TRANSFER',
        referenceNo: 'DISBURSAL-INIT',
        remarks: `Initial loan disbursement for ${loanNumber}`,
        balanceAfter: totalPayable,
        createdAt: now,
    };

    const transactions = getStoredTransactions();
    saveStoredTransactions([initialTx, ...transactions]);
    invalidateLoansCache();

    return newLoan;
};

export const recordLoanTransaction = async (payload: RecordPaymentPayload): Promise<{ loan: Loan; transaction: LoanTransaction }> => {
    try {
        const res = await apiService.post<RestResponse<any>>(`api/v1/loans/${payload.loanId}/payments`, payload, {
            headers: getAuthHeaders(),
        });
        if (res && res.response?.data && res.response.data.loan && res.response.data.transaction) {
            const l = res.response.data.loan;
            const t = res.response.data.transaction;
            const mappedLoan: Loan = {
                ...l,
                id: String(l.id),
                schedule: (l.schedule || []).map((s: any) => ({
                    ...s,
                    id: String(s.id),
                })),
            };
            const mappedTx: LoanTransaction = {
                ...t,
                id: String(t.id),
                loanId: String(t.loanId),
            };
            const loans = getStoredLoans().map((item) => (item.id === mappedLoan.id ? mappedLoan : item));
            saveStoredLoans(loans);
            const txs = getStoredTransactions();
            saveStoredTransactions([mappedTx, ...txs]);
            invalidateLoansCache();
            return { loan: mappedLoan, transaction: mappedTx };
        }
    } catch (e) {
        console.warn('Backend recordPayment failed, falling back to local calculation:', e);
    }

    const loans = getStoredLoans();
    const loanIndex = loans.findIndex((l) => l.id === payload.loanId);
    if (loanIndex === -1) {
        throw new Error('Loan not found');
    }

    const loan = { ...loans[loanIndex] };
    const now = new Date().toISOString();
    let newBalance = loan.remainingBalance;
    let newPaid = loan.totalPaid;

    if (payload.type === 'PAYMENT_GIVEN') {
        newPaid += payload.amount;
        newBalance = Math.max(0, newBalance - payload.amount);

        let remainingPayment = payload.amount;
        loan.schedule = loan.schedule.map((item) => {
            if (item.status === 'PENDING' && remainingPayment > 0) {
                if (remainingPayment >= item.emiAmount) {
                    remainingPayment -= item.emiAmount;
                    return {
                        ...item,
                        status: 'PAID' as const,
                        paidDate: payload.paymentDate,
                        paidAmount: item.emiAmount,
                    };
                }
            }
            return item;
        });

        if (newBalance <= 0) {
            loan.status = 'CLOSED';
        }
    } else {
        newBalance += payload.amount;
        loan.status = 'ACTIVE';
    }

    loan.remainingBalance = Math.round(newBalance * 100) / 100;
    loan.totalPaid = Math.round(newPaid * 100) / 100;
    loan.updatedAt = now;

    loans[loanIndex] = loan;
    saveStoredLoans(loans);

    const transaction: LoanTransaction = {
        id: `tx-${Date.now()}`,
        loanId: loan.id,
        date: payload.paymentDate,
        type: payload.type,
        amount: payload.amount,
        principalComponent: payload.principalComponent || payload.amount,
        interestComponent: payload.interestComponent || 0,
        paymentMode: payload.paymentMode,
        referenceNo: payload.referenceNo,
        remarks: payload.remarks,
        balanceAfter: loan.remainingBalance,
        createdAt: now,
    };

    const transactions = getStoredTransactions();
    saveStoredTransactions([transaction, ...transactions]);
    invalidateLoansCache();

    return { loan, transaction };
};

export const deleteLoanRecord = async (loanId: string): Promise<boolean> => {
    try {
        await apiService.delete<RestResponse<any>>(`api/v1/loans/${loanId}`, {
            headers: getAuthHeaders(),
        });
    } catch (e) {
        console.warn('Backend deleteLoan failed:', e);
    }

    const loans = getStoredLoans().filter((l) => l.id !== loanId);
    saveStoredLoans(loans);

    const transactions = getStoredTransactions().filter((t) => t.loanId !== loanId);
    saveStoredTransactions(transactions);
    invalidateLoansCache();

    return true;
};

export const fetchLoanMetrics = async () => {
    try {
        const res = await apiService.get<RestResponse<any>>('api/v1/loans/metrics', {
            headers: getAuthHeaders(),
        });
        if (res && res.response?.data) return res.response.data;
    } catch (e) {
        console.warn('Backend fetchLoanMetrics failed:', e);
    }
    return null;
};


