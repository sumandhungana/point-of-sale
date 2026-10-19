import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { AddPayments } from './AddPayments';
import { toast } from 'react-toastify';
import { getPaymentList, GetPaymentResponse } from '../services/paymentService';
import { fetchStaffById, GetStaffResponse } from '@/features/services/staffService';
import {
    fetchStaffAttendanceByStaffId,
    recordStaffAttendance,
    StaffAttendanceRecord,
    AttendanceStatusType,
    ATTENDANCE_STATUS_LIST,
    getAttendanceConfig,
    isSameCalendarDay,
} from '@/features/services/staffAttendanceService';
import { usePermission } from '@/core/rbac/usePermission';
import { calculateStaffFinancials } from '@/utils/staffFinancialUtils';
import '../../styles/StaffPayment.css';

export const StaffPayment: React.FC = () => {
    const navigate = useNavigate();

    // Permission checks
    const { hasModule, hasPermission } = usePermission();
    const canViewAttendance = hasModule('staffAttendance') || hasPermission('staffAttendance:list') || hasPermission('staff:list');
    const canMarkAttendance = hasPermission('staffAttendance:create') || hasPermission('staffAttendance:update') || hasPermission('staff:update') || hasPermission('staff:create');
    const canMakePayment = hasPermission('staff:payment') || hasPermission('staff:update') || hasPermission('staff:create') || hasModule('staff');

    // Extract staffId from route parameters
    const { id } = useParams<{ id: string }>();
    const staffId = id ? parseInt(id, 10) : 0;

    // Staff Profile State
    const [staffInfo, setStaffInfo] = useState<GetStaffResponse | null>(null);

    // Attendance Modal & Date State
    const [isAttendanceOpen, setIsAttendanceOpen] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
    const [selectedStatus, setSelectedStatus] = useState<string>('present');
    const [attendanceList, setAttendanceList] = useState<StaffAttendanceRecord[]>([]);
    const [attendanceNote, setAttendanceNote] = useState<string>('');
    const [isSavingAttendance, setIsSavingAttendance] = useState<boolean>(false);

    // Add Payment Modal State
    const [isAddPaymentOpen, setIsAddPaymentOpen] = useState<boolean>(false);

    // Payment List State
    const [paymentHistory, setPaymentHistory] = useState<GetPaymentResponse[]>([]);
    const [isLoadingPayments, setIsLoadingPayments] = useState<boolean>(true);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

    // Calendar helper functions
    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentYear, currentMonth);

    // Fetch payments using getPaymentList API
    const fetchPayments = useCallback(async () => {
        if (!staffId) return;

        setIsLoadingPayments(true);
        try {
            const payments = await getPaymentList({
                paymentParty: 'STAFF',
                partyId: staffId
            });
            setPaymentHistory(Array.isArray(payments) ? payments : []);
        } catch (error) {
            console.error('Error fetching staff payment list:', error);
        } finally {
            setIsLoadingPayments(false);
        }
    }, [staffId]);

    // Fetch staff member profile details
    const fetchStaffDetails = useCallback(async () => {
        if (!staffId) return;
        try {
            const data = await fetchStaffById(staffId);
            if (data) {
                setStaffInfo(data);
            }
        } catch (error) {
            console.error('Error fetching staff profile details:', error);
        }
    }, [staffId]);

    // Fetch attendance records from backend
    const fetchAttendances = useCallback(async () => {
        if (!staffId || !canViewAttendance) return;
        try {
            const records = await fetchStaffAttendanceByStaffId(staffId);
            setAttendanceList(Array.isArray(records) ? records : []);
        } catch (err) {
            console.error('Failed to fetch staff attendance records:', err);
        }
    }, [staffId, canViewAttendance]);

    useEffect(() => {
        void fetchPayments();
        void fetchStaffDetails();
        void fetchAttendances();
    }, [staffId, canViewAttendance]);

    // Helpers to lookup attendance
    const getAttendanceForDate = useCallback((date: Date): StaffAttendanceRecord | undefined => {
        return attendanceList.find((a) => isSameCalendarDay(date, a.date));
    }, [attendanceList]);

    const todayAttendance = useMemo(() => {
        const now = new Date();
        return attendanceList.find((a) => isSameCalendarDay(now, a.date));
    }, [attendanceList]);

    // When selected date changes in calendar, sync the form inputs
    useEffect(() => {
        if (selectedDate) {
            const existing = getAttendanceForDate(selectedDate);
            if (existing) {
                const s = existing.status.toLowerCase();
                setSelectedStatus(s === 'half_day' ? 'halfDay' : s);
                setAttendanceNote(existing.note || '');
            } else {
                setSelectedStatus('present');
                setAttendanceNote('');
            }
        }
    }, [selectedDate, getAttendanceForDate]);

    // Helper to compute stats for any month/year
    const computeStats = useCallback((targetMonth: number, targetYear: number) => {
        const records = attendanceList.filter((a) => {
            if (!a.date) return false;
            if (typeof a.date === 'string') {
                const m = a.date.match(/^(\d{4})-(\d{2})/);
                if (m) {
                    const y = parseInt(m[1], 10);
                    const mo = parseInt(m[2], 10) - 1;
                    return y === targetYear && mo === targetMonth;
                }
            }
            const d = new Date(a.date);
            return !isNaN(d.getTime()) && d.getMonth() === targetMonth && d.getFullYear() === targetYear;
        });

        const presentCount = records.filter((a) => a.status === 'PRESENT').length;
        const absentCount = records.filter((a) => a.status === 'ABSENT').length;
        const halfDayCount = records.filter((a) => a.status === 'HALF_DAY').length;
        const leaveCount = records.filter((a) => a.status === 'LEAVE').length;
        const totalLogged = records.length;
        const effectivePresent = presentCount + halfDayCount * 0.5;
        const percentage = totalLogged > 0 ? Math.round((effectivePresent / totalLogged) * 100) : 0;

        return {
            presentCount,
            absentCount,
            halfDayCount,
            leaveCount,
            totalLogged,
            percentage,
        };
    }, [attendanceList]);

    // This Month summary stats (strictly for current calendar month)
    const thisMonthStats = useMemo(() => {
        const now = new Date();
        return computeStats(now.getMonth(), now.getFullYear());
    }, [computeStats]);

    // Save attendance for the selected date
    const handleSaveAttendance = async () => {
        if (!staffId || !selectedDate) return;
        setIsSavingAttendance(true);
        try {
            const statusUpper = (
                selectedStatus === 'halfDay' ? 'HALF_DAY' : selectedStatus.toUpperCase()
            ) as AttendanceStatusType;

            const y = selectedDate.getFullYear();
            const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const d = String(selectedDate.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}T12:00:00.000Z`;

            const success = await recordStaffAttendance({
                staffId,
                date: dateStr,
                status: statusUpper,
                note: attendanceNote,
            });

            if (success) {
                toast.success(
                    `Attendance for ${selectedDate.toLocaleDateString()} marked as ${statusUpper.replace('_', ' ')}!`,
                    { position: 'top-right', autoClose: 3000 }
                );
                await fetchAttendances();
            } else {
                toast.error('Failed to save attendance record');
            }
        } catch (err) {
            console.error('Error saving attendance:', err);
            toast.error('Unexpected error while saving attendance');
        } finally {
            setIsSavingAttendance(false);
        }
    };

    // Quick mark today's attendance
    const handleQuickMarkToday = async (status: AttendanceStatusType) => {
        if (!staffId) return;
        setIsSavingAttendance(true);
        try {
            const today = new Date();
            const y = today.getFullYear();
            const m = String(today.getMonth() + 1).padStart(2, '0');
            const d = String(today.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}T12:00:00.000Z`;

            const success = await recordStaffAttendance({
                staffId,
                date: dateStr,
                status,
            });
            if (success) {
                toast.success(`Today's attendance recorded as ${status.replace('_', ' ')}!`, {
                    position: 'top-right',
                    autoClose: 2500,
                });
                await fetchAttendances();
            }
        } finally {
            setIsSavingAttendance(false);
        }
    };


    // Calculate total money given / total paid to staff
    const calculateTotals = (history: GetPaymentResponse[]) => {
        return history.reduce(
            (acc, payment) => {
                acc.totalGiven += Math.abs(payment.amount || 0);
                return acc;
            },
            { totalGiven: 0 }
        );
    };

    const totals = calculateTotals(paymentHistory);

    // Live financial balance: Due Left or Advance
    const financials = useMemo(() => {
        return calculateStaffFinancials(staffInfo, totals.totalGiven);
    }, [staffInfo, totals.totalGiven]);

    const handleOpenAddPayment = () => setIsAddPaymentOpen(true);
    const handleCloseAddPayment = () => setIsAddPaymentOpen(false);

    const handleSavePayment = () => {
        void fetchPayments();
        handleCloseAddPayment();
    };

    return (
        <div className="staff-payment-container">
            <Sidebar />

            <div className="staff-payment-main">
                {/* Header Navigation & Actions */}
                <div className="staff-payment-header">
                    <div className="staff-payment-header-left">
                        <div className="staff-payment-header-icon">
                            <i className="bi bi-wallet2"></i>
                        </div>
                        <div>
                            <h1 className="staff-payment-header-title">Staff Payment & Statements</h1>
                            <p className="staff-payment-header-subtitle">
                                Payout records and attendance tracking for {staffInfo?.name || `Staff #${staffId}`}
                            </p>
                        </div>
                    </div>

                    <div className="staff-payment-header-actions">
                        {/* Open Attendance Modal Button */}
                        {canViewAttendance && (
                            <button
                                type="button"
                                className="staff-payment-btn-attendance"
                                onClick={() => setIsAttendanceOpen(true)}
                                title="View Attendance Calendar"
                            >
                                <i className="bi bi-calendar-check"></i>
                                <span>Attendance</span>
                            </button>
                        )}

                        {/* Cross Sign on Right Side instead of Back to Staff button */}
                        <button
                            type="button"
                            className="staff-payment-close-btn"
                            onClick={() => navigate('/staff')}
                            aria-label="Back to Staff"
                            title="Back to Staff"
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>

                {/* Staff Profile Banner */}
                <div className="staff-profile-notes-banner">
                    <div className="staff-profile-header-row">
                        <div className="staff-profile-user-info">
                            <div className="staff-profile-avatar">
                                {staffInfo?.profileImageUrl ? (
                                    <img
                                        src={staffInfo.profileImageUrl}
                                        alt={staffInfo.name}
                                    />
                                ) : (
                                    <i className="bi bi-person-fill" />
                                )}
                            </div>
                            <div className="staff-profile-meta">
                                <h2 className="staff-profile-name">
                                    {staffInfo?.name || `Staff Member #${staffId}`}
                                </h2>
                                <div className="staff-profile-contact-list">
                                    {staffInfo?.phone && (
                                        <span className="staff-profile-contact-item">
                                            <i className="bi bi-telephone" />
                                            {staffInfo.phone}
                                        </span>
                                    )}
                                    {staffInfo?.email && (
                                        <span className="staff-profile-contact-item">
                                            <i className="bi bi-envelope" />
                                            {staffInfo.email}
                                        </span>
                                    )}
                                    {staffInfo?.address && (
                                        <span className="staff-profile-contact-item">
                                            <i className="bi bi-geo-alt" />
                                            {staffInfo.address}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Quick Action: Attendance Calendar */}
                        {canViewAttendance && (
                            <div className="staff-profile-quick-actions">
                                <button
                                    type="button"
                                    onClick={() => setIsAttendanceOpen(true)}
                                    className="staff-profile-btn-attendance"
                                    title="Open Attendance Calendar"
                                >
                                    <i className="bi bi-calendar3" />
                                    <span>Attendance Calendar</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Attendance Overview & Quick Log Bar */}
                    {canViewAttendance && (
                        <div className="staff-attendance-quick-bar">
                            <div className="staff-attendance-today-section">
                                <div className="staff-attendance-today-label">
                                    <i className="bi bi-calendar-check" />
                                    <span>Today:</span>
                                </div>
                                {todayAttendance ? (
                                    (() => {
                                        const cfg = getAttendanceConfig(todayAttendance.status);
                                        return (
                                            <span
                                                style={{
                                                    padding: '0.2rem 0.6rem',
                                                    borderRadius: '6px',
                                                    fontWeight: 700,
                                                    fontSize: '0.78rem',
                                                    letterSpacing: '0.3px',
                                                    background: cfg ? cfg.bgColor : '#e2e8f0',
                                                    color: cfg ? cfg.darkColor : '#334155',
                                                    border: cfg ? `1px solid ${cfg.color}40` : 'none',
                                                }}
                                            >
                                                {cfg ? cfg.label : todayAttendance.status.replace('_', ' ')}
                                            </span>
                                        );
                                    })()
                                ) : (
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                        Not recorded
                                    </span>
                                )}

                                {/* Quick Action Buttons */}
                                {canMarkAttendance && (
                                    <div className="staff-attendance-mark-btns">
                                        {ATTENDANCE_STATUS_LIST.map((btn) => (
                                            <button
                                                key={btn.key}
                                                type="button"
                                                disabled={isSavingAttendance}
                                                onClick={() => void handleQuickMarkToday(btn.key)}
                                                className="staff-attendance-mark-btn"
                                                style={{
                                                    border: `1px solid ${btn.color}40`,
                                                    background: todayAttendance?.status === btn.key ? btn.color : btn.bgColor,
                                                    color: todayAttendance?.status === btn.key ? btn.textColor : btn.color,
                                                }}
                                            >
                                                {btn.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Monthly summary pill tags */}
                            <div className="staff-attendance-monthly-stats">
                                <span style={{ color: '#64748b', fontWeight: 600 }}>This Month:</span>
                                {ATTENDANCE_STATUS_LIST.map((statusItem) => {
                                    const count =
                                        statusItem.key === 'PRESENT'
                                            ? thisMonthStats.presentCount
                                            : statusItem.key === 'HALF_DAY'
                                            ? thisMonthStats.halfDayCount
                                            : statusItem.key === 'ABSENT'
                                            ? thisMonthStats.absentCount
                                            : thisMonthStats.leaveCount;
                                    return (
                                        <span key={statusItem.key} style={{ color: statusItem.color, fontWeight: 700 }}>
                                            <i className={`bi ${statusItem.icon} me-1`} />
                                            {count} {statusItem.label}
                                        </span>
                                    );
                                })}
                                <button
                                    type="button"
                                    onClick={() => setIsAttendanceOpen(true)}
                                    className="staff-attendance-calendar-link"
                                >
                                    Calendar &rarr;
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary Cards */}
                <div className="staff-payment-summary-cards">
                    {/* Due Left or Advance Balance Card */}
                    {financials.due > 0 ? (
                        <div className="staff-payment-summary-card staff-payment-due-card">
                            <div className="staff-payment-card-content">
                                <div className="staff-payment-icon staff-payment-icon-danger">
                                    <i className="bi bi-clock-history"></i>
                                </div>
                                <div className="staff-payment-card-info">
                                    <span className="staff-payment-summary-title">Due Amount Left</span>
                                    <div className="staff-payment-summary-amount" style={{ color: '#dc2626' }}>
                                        रु {financials.due.toLocaleString()}
                                    </div>
                                    <span className="staff-payment-card-subtitle">
                                        Accrued रु {financials.accrued.toLocaleString()} − Paid रु {financials.paid.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : financials.advance > 0 ? (
                        <div className="staff-payment-summary-card staff-payment-advance-card">
                            <div className="staff-payment-card-content">
                                <div className="staff-payment-icon staff-payment-icon-primary">
                                    <i className="bi bi-arrow-up-right-circle-fill"></i>
                                </div>
                                <div className="staff-payment-card-info">
                                    <span className="staff-payment-summary-title">Advance Payment</span>
                                    <div className="staff-payment-summary-amount" style={{ color: '#255DCE' }}>
                                        रु {financials.advance.toLocaleString()}
                                    </div>
                                    <span className="staff-payment-card-subtitle">
                                        Advance payout exceeding accrued salary
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="staff-payment-summary-card staff-payment-settled-card">
                            <div className="staff-payment-card-content">
                                <div className="staff-payment-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>
                                    <i className="bi bi-check-circle-fill"></i>
                                </div>
                                <div className="staff-payment-card-info">
                                    <span className="staff-payment-summary-title">Balance Settled</span>
                                    <div className="staff-payment-summary-amount" style={{ color: '#16a34a' }}>
                                        रु 0
                                    </div>
                                    <span className="staff-payment-card-subtitle">
                                        All accrued salary fully paid
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Total Given / Disbursed Card */}
                    <div className="staff-payment-summary-card">
                        <div className="staff-payment-card-content">
                            <div className="staff-payment-icon staff-payment-icon-success">
                                <i className="bi bi-cash-stack"></i>
                            </div>
                            <div className="staff-payment-card-info">
                                <span className="staff-payment-summary-title">Payment Given</span>
                                <div className="staff-payment-summary-amount" style={{ color: '#059669' }}>
                                    रु {totals.totalGiven.toLocaleString()}
                                </div>
                                <span className="staff-payment-card-subtitle">Total payments disbursed to staff</span>
                            </div>
                        </div>
                    </div>

                    {/* Accrued Salary to Date Card */}
                    <div className="staff-payment-summary-card">
                        <div className="staff-payment-card-content">
                            <div className="staff-payment-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                                <i className="bi bi-calendar3-range"></i>
                            </div>
                            <div className="staff-payment-card-info">
                                <span className="staff-payment-summary-title">Accrued Salary</span>
                                <div className="staff-payment-summary-amount" style={{ color: '#0284c7' }}>
                                    रु {financials.accrued.toLocaleString()}
                                </div>
                                <span className="staff-payment-card-subtitle">
                                    {financials.primarySalary?.salaryType || 'Salary'} salary calculated to date
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Total Transactions Card */}
                    <div className="staff-payment-summary-card staff-payment-transactions-card">
                        <div className="staff-payment-card-content">
                            <div className="staff-payment-icon staff-payment-icon-primary">
                                <i className="bi bi-receipt-cutoff"></i>
                            </div>
                            <div className="staff-payment-card-info">
                                <span className="staff-payment-summary-title">Payment Transactions</span>
                                <div className="staff-payment-summary-amount" style={{ color: '#021861' }}>
                                    {paymentHistory.length} {paymentHistory.length === 1 ? 'Record' : 'Records'}
                                </div>
                                <span className="staff-payment-card-subtitle">Total payouts recorded</span>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Rate Card */}
                    {canViewAttendance && (
                        <div className="staff-payment-summary-card staff-payment-attendance-card">
                            <div className="staff-payment-card-content">
                                <div className="staff-payment-icon staff-payment-icon-success">
                                    <i className="bi bi-calendar2-check"></i>
                                </div>
                                <div className="staff-payment-card-info">
                                    <span className="staff-payment-summary-title">Present This Month</span>
                                    <div className="staff-payment-summary-amount" style={{ color: '#059669' }}>
                                        {thisMonthStats.presentCount} {thisMonthStats.presentCount === 1 ? 'Day' : 'Days'}
                                    </div>
                                    <span className="staff-payment-card-subtitle">
                                        {thisMonthStats.totalLogged > 0
                                            ? `${thisMonthStats.percentage}% attendance rate`
                                            : 'No logs for this month'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Content Area: Payment History Statement List */}
                <div className="staff-payment-card" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                    <div className="staff-payment-history-card" style={{ width: '100%' }}>
                        <div className="staff-payment-history-header">
                            <div className="staff-payment-history-title">
                                <i className="bi bi-clock-history"></i>
                                <div>
                                    <h3>Salary & Payment History</h3>
                                    <span>Statement record of payments made to staff</span>
                                </div>
                            </div>
                        </div>

                        {/* Transaction List */}
                        <div className="staff-payment-history-list" style={{ maxHeight: '550px', overflowY: 'auto' }}>
                            {isLoadingPayments ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
                                    <i className="bi bi-hourglass-split me-2"></i>
                                    Loading statement history...
                                </div>
                            ) : paymentHistory.length === 0 ? (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#6c757d' }}>
                                    <i className="bi bi-inbox me-2"></i>
                                    No payment records found
                                </div>
                            ) : (
                                Object.entries(
                                    paymentHistory.reduce((groups, transaction) => {
                                        const date = new Date(transaction.createdAt).toISOString().split('T')[0];
                                        if (!groups[date]) groups[date] = [];
                                        groups[date].push(transaction);
                                        return groups;
                                    }, {} as Record<string, GetPaymentResponse[]>)
                                )
                                    .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                                    .map(([date, transactions]) => (
                                        <div key={date} style={{ marginBottom: '1.25rem' }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#6c757d', marginBottom: '0.5rem' }}>
                                                {new Date(date).toLocaleDateString(undefined, {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>

                                            {transactions
                                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                                .map((transaction) => (
                                                    <div key={transaction.id} className="staff-payment-history-item">
                                                        <div className="staff-payment-history-details">
                                                            {/* Top Row: Badge & Total Amount */}
                                                            <div className="staff-payment-history-top-row">
                                                                <span className="staff-payment-due" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                                                                    Payment Given
                                                                </span>
                                                                <div className="staff-payment-history-total">
                                                                    रु {Math.abs(transaction.amount).toLocaleString()}
                                                                </div>
                                                            </div>

                                                            {/* Mode / Type */}
                                                            <div className="staff-payment-history-row">
                                                                <span className="staff-payment-history-label">
                                                                    <i className="bi bi-credit-card"></i>
                                                                    Payment Mode
                                                                </span>
                                                                <span className="staff-payment-history-value">
                                                                    {transaction.paymentType || 'Cash'}
                                                                </span>
                                                            </div>

                                                            {/* Time */}
                                                            <div className="staff-payment-history-row">
                                                                <span className="staff-payment-history-label">
                                                                    <i className="bi bi-clock"></i>
                                                                    Time
                                                                </span>
                                                                <span className="staff-payment-history-value">
                                                                    {new Date(transaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>

                                                            {/* Remarks */}
                                                            {transaction.remarks && (
                                                                <div className="staff-payment-history-row">
                                                                    <span className="staff-payment-history-label">
                                                                        <i className="bi bi-chat-text"></i>
                                                                        Remarks
                                                                    </span>
                                                                    <span className="staff-payment-history-value">
                                                                        {transaction.remarks}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom-Right Add Payment Button (Fixed viewport position) */}
            {canMakePayment && (
                <button
                    type="button"
                    className="staff-payment-sticky-add-button"
                    onClick={handleOpenAddPayment}
                    aria-label="Add Payment"
                    title="Add Payment to Staff"
                >
                    <i className="bi bi-plus-lg"></i>
                    <span>Add Payment</span>
                </button>
            )}

            {/* ATTENDANCE POPUP MODAL */}
            {isAttendanceOpen && (
                <div
                    className="staff-payment-attendance-modal-overlay"
                    onClick={() => setIsAttendanceOpen(false)}
                >
                    <div
                        className="staff-payment-attendance-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header & Close Button */}
                        <div className="staff-payment-modal-header">
                            <div className="staff-payment-calendar-title">
                                <div className="staff-payment-calendar-title-icon">
                                    <i className="bi bi-calendar3"></i>
                                </div>
                                <div>
                                    <h3 style={{ margin: 0 }}>Staff Attendance</h3>
                                    <span>Track and update staff attendance details</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsAttendanceOpen(false)}
                                className="staff-payment-modal-close"
                                aria-label="Close"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        {/* Calendar Controls */}
                        <div className="staff-payment-calendar-controls">
                            <select
                                className="staff-payment-calendar-select"
                                value={currentMonth}
                                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                            >
                                {months.map((month, index) => (
                                    <option key={month} value={index}>
                                        {month}
                                    </option>
                                ))}
                            </select>

                            <select
                                className="staff-payment-calendar-select staff-payment-year-select"
                                value={currentYear}
                                onChange={(e) => setCurrentYear(Number(e.target.value))}
                            >
                                {years.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Calendar Grid */}
                        <div className="staff-payment-calendar-grid">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <div
                                    key={day}
                                    className={`staff-payment-calendar-day ${
                                        day === 'Sun' || day === 'Sat' ? 'staff-payment-weekend-day' : ''
                                    }`}
                                >
                                    {day}
                                </div>
                            ))}

                            {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                                <div
                                    key={`empty-${index}`}
                                    className="staff-payment-calendar-date staff-payment-empty-date"
                                />
                            ))}

                            {Array.from({ length: daysInMonth }).map((_, index) => {
                                const date = new Date(currentYear, currentMonth, index + 1, 12, 0, 0);
                                const isSelected =
                                    selectedDate &&
                                    date.getDate() === selectedDate.getDate() &&
                                    date.getMonth() === selectedDate.getMonth() &&
                                    date.getFullYear() === selectedDate.getFullYear();
                                const rec = getAttendanceForDate(date);
                                const statusConfig = rec ? getAttendanceConfig(rec.status) : undefined;

                                const dateClassName = [
                                    'staff-payment-calendar-date',
                                    statusConfig ? `attendance-${statusConfig.key.toLowerCase().replace('_', '-')}` : '',
                                    isSelected ? 'staff-payment-selected-date' : '',
                                ].filter(Boolean).join(' ');

                                return (
                                    <button
                                        type="button"
                                        key={index + 1}
                                        className={dateClassName}
                                        data-has-attendance={statusConfig ? 'true' : 'false'}
                                        data-status={statusConfig?.key || 'none'}
                                        onClick={() => setSelectedDate(date)}
                                        title={
                                            statusConfig
                                                ? `${date.toLocaleDateString()}: ${statusConfig.label}${rec?.note ? ` (${rec.note})` : ''}`
                                                : date.toLocaleDateString()
                                        }
                                        style={{
                                            position: 'relative',
                                            ...(statusConfig ? {
                                                backgroundColor: statusConfig.color,
                                                color: statusConfig.textColor,
                                                borderColor: statusConfig.color,
                                                fontWeight: 700,
                                            } : {}),
                                            ...(isSelected && statusConfig ? {
                                                boxShadow: '0 0 0 2px #ffffff, 0 0 0 4.5px #255DCE, 0 4px 10px rgba(0, 0, 0, 0.25)',
                                                transform: 'scale(1.05)',
                                                zIndex: 2,
                                            } : {}),
                                        }}
                                    >
                                        <span>{index + 1}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Calendar Attendance Legend */}
                        <div className="staff-payment-calendar-legend">
                            {ATTENDANCE_STATUS_LIST.map((item) => (
                                <span key={item.key} className="staff-payment-legend-item">
                                    <span
                                        className="staff-payment-legend-color"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="staff-payment-legend-label">{item.label}</span>
                                </span>
                            ))}
                        </div>

                        {/* Attendance Status Radios */}
                        <div className="staff-payment-attendance-section">
                            <div className="staff-payment-section-label">
                                <i className="bi bi-person-check me-1"></i>
                                Attendance Status {selectedDate ? `for ${selectedDate.toLocaleDateString()}` : ''}
                            </div>

                            <div className="staff-payment-attendance-status">
                                {ATTENDANCE_STATUS_LIST.map((item) => {
                                    const isChecked = selectedStatus === item.radioValue;
                                    return (
                                        <label key={item.key} className="staff-payment-status-item">
                                            <input
                                                type="radio"
                                                name="attendance"
                                                value={item.radioValue}
                                                checked={isChecked}
                                                onChange={(e) => setSelectedStatus(e.target.value)}
                                                className="staff-payment-radio-button"
                                            />
                                            <span
                                                className={`staff-payment-status-label ${isChecked ? 'active' : ''}`}
                                                style={
                                                    isChecked
                                                        ? {
                                                              borderColor: item.color,
                                                              background: item.bgColor,
                                                              color: item.color,
                                                              boxShadow: `0 0 0 2px ${item.color}30`,
                                                              fontWeight: 700,
                                                          }
                                                        : undefined
                                                }
                                            >
                                                <i
                                                    className={`bi ${item.icon} me-1`}
                                                    style={{ color: item.color }}
                                                />
                                                {item.label}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Attendance Note / Remarks */}
                        <div style={{ marginTop: '0.85rem' }}>
                            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem', display: 'block' }}>
                                <i className="bi bi-chat-left-text me-1" />
                                Attendance Note / Remarks (Optional)
                            </label>
                            <input
                                type="text"
                                value={attendanceNote}
                                onChange={(e) => setAttendanceNote(e.target.value)}
                                placeholder="e.g. Approved sick leave, worked extra hours, etc."
                                style={{
                                    width: '100%',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '0.88rem',
                                    boxSizing: 'border-box',
                                }}
                            />
                        </div>

                        {/* Actions inside Modal */}
                        <div className="staff-payment-bottom-controls">
                            <div className="staff-payment-date-input-wrapper">
                                <i className="bi bi-calendar-date"></i>
                                <input
                                    type="date"
                                    className="staff-payment-date-picker"
                                    value={
                                        selectedDate
                                            ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
                                            : ''
                                    }
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            const [y, m, d] = e.target.value.split('-').map(Number);
                                            setSelectedDate(new Date(y, m - 1, d, 12, 0, 0));
                                            setCurrentMonth(m - 1);
                                            setCurrentYear(y);
                                        }
                                    }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '0.6rem', flex: 1, justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    className="staff-payment-cancel-button"
                                    onClick={() => setIsAttendanceOpen(false)}
                                    style={{
                                        padding: '0.45rem 1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #cbd5e1',
                                        background: '#f8fafc',
                                        color: '#475569',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    disabled={isSavingAttendance || !selectedDate}
                                    onClick={() => void handleSaveAttendance()}
                                    style={{
                                        padding: '0.45rem 1.2rem',
                                        borderRadius: '8px',
                                        border: 'none',
                                        background: '#2563eb',
                                        color: '#ffffff',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.4rem',
                                    }}
                                >
                                    {isSavingAttendance ? (
                                        <>
                                            <i className="bi bi-arrow-clockwise spinning" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check2-circle" /> Save Attendance
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD PAYMENTS POPUP MODAL */}
            <AddPayments
                isOpen={isAddPaymentOpen}
                staffId={staffId}
                onClose={handleCloseAddPayment}
                onSave={handleSavePayment}
            />
        </div>
    );
};