import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { BackButton } from '@/components/BackButton';
import { AddPayments } from './AddPayments';
import { toast } from 'react-toastify';
import { getPaymentList, GetPaymentResponse } from '../services/paymentService';
import { fetchStaffById, updateStaff, GetStaffResponse } from '@/features/services/staffService';
import {
    fetchStaffAttendanceByStaffId,
    recordStaffAttendance,
    StaffAttendanceRecord,
    AttendanceStatusType
} from '@/features/services/staffAttendanceService';
import { usePermission } from '@/core/rbac/usePermission';
import '../../styles/StaffPayment.css';

export const StaffPayment: React.FC = () => {
    // Permission checks
    const { hasModule, hasPermission } = usePermission();
    const canViewAttendance = hasModule('staffAttendance') || hasPermission('staffAttendance:list') || hasPermission('staff:list');
    const canMarkAttendance = hasPermission('staffAttendance:create') || hasPermission('staffAttendance:update') || hasPermission('staff:update') || hasPermission('staff:create');
    const canMakePayment = hasPermission('staff:payment');

    // Extract staffId from route parameters
    const { id } = useParams<{ id: string }>();
    const staffId = id ? parseInt(id, 10) : 0;

    // Staff Profile and Notes State
    const [staffInfo, setStaffInfo] = useState<GetStaffResponse | null>(null);
    const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
    const [notesText, setNotesText] = useState<string>('');
    const [isSavingNotes, setIsSavingNotes] = useState<boolean>(false);

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
                setNotesText(data.remarks || '');
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
        const targetStr = date.toDateString();
        return attendanceList.find(
            (a) => a.date && new Date(a.date).toDateString() === targetStr
        );
    }, [attendanceList]);

    const todayAttendance = useMemo(() => {
        const todayStr = new Date().toDateString();
        return attendanceList.find(
            (a) => a.date && new Date(a.date).toDateString() === todayStr
        );
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

    // Monthly attendance metrics
    const monthlyStats = useMemo(() => {
        const thisMonthRecords = attendanceList.filter((a) => {
            if (!a.date) return false;
            const d = new Date(a.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        const presentCount = thisMonthRecords.filter((a) => a.status === 'PRESENT').length;
        const absentCount = thisMonthRecords.filter((a) => a.status === 'ABSENT').length;
        const halfDayCount = thisMonthRecords.filter((a) => a.status === 'HALF_DAY').length;
        const leaveCount = thisMonthRecords.filter((a) => a.status === 'LEAVE').length;
        const totalLogged = thisMonthRecords.length;
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
    }, [attendanceList, currentMonth, currentYear]);

    // Save attendance for the selected date
    const handleSaveAttendance = async () => {
        if (!staffId || !selectedDate) return;
        setIsSavingAttendance(true);
        try {
            const statusUpper = (
                selectedStatus === 'halfDay' ? 'HALF_DAY' : selectedStatus.toUpperCase()
            ) as AttendanceStatusType;

            const success = await recordStaffAttendance({
                staffId,
                date: selectedDate.toISOString(),
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
            const success = await recordStaffAttendance({
                staffId,
                date: new Date().toISOString(),
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

    // Save notes directly to backend
    const handleSaveNotes = async () => {
        if (!staffId || !staffInfo) return;
        setIsSavingNotes(true);
        try {
            await updateStaff(staffId, {
                ...staffInfo,
                remarks: notesText,
            });
            setStaffInfo((prev) => (prev ? { ...prev, remarks: notesText } : prev));
            setIsEditingNotes(false);
            toast.success('Staff notes updated successfully in backend!', {
                position: 'top-right',
                autoClose: 3000,
            });
        } catch (err: any) {
            console.error('Failed to update staff notes:', err);
            toast.error(err.message || 'Failed to save notes to backend');
        } finally {
            setIsSavingNotes(false);
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
                    <BackButton to="/staff" label="Back to Staff" />

                    <div className="staff-payment-header-actions">
                        {/* Open Attendance Modal Button */}
                        <button
                            type="button"
                            className="staff-payment-btn-attendance"
                            onClick={() => setIsAttendanceOpen(true)}
                        >
                            <i className="bi bi-calendar-check"></i>
                            Attendance
                        </button>

                        {/* Open Add Payment Modal Button */}
                        <button
                            type="button"
                            className="staff-payment-add-payment-button"
                            style={{ margin: 0 }}
                            onClick={handleOpenAddPayment}
                        >
                            <i className="bi bi-plus-circle me-1"></i>
                            Add Payment
                        </button>
                    </div>
                </div>

                {/* Staff Profile & Backend Notes Card */}
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

                        {/* Quick Actions (Notes & Attendance) */}
                        <div className="staff-profile-quick-actions">
                            {canViewAttendance && (
                                <button
                                    type="button"
                                    onClick={() => setIsAttendanceOpen(true)}
                                    className="staff-profile-btn-attendance"
                                >
                                    <i className="bi bi-calendar3" />
                                    Attendance Calendar
                                </button>
                            )}
                            {!isEditingNotes && (
                                <button
                                    type="button"
                                    onClick={() => setIsEditingNotes(true)}
                                    className="staff-profile-btn-notes"
                                >
                                    <i className="bi bi-pencil-square" />
                                    {staffInfo?.remarks ? 'Edit Notes' : 'Add Note'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Staff Notes Content Box */}
                    <div className="staff-profile-notes-box">
                        <div className="staff-profile-notes-box-header">
                            <i className="bi bi-journal-text" style={{ color: '#2563eb', fontSize: '1rem' }} />
                            <span>Staff Notes / Remarks</span>
                        </div>

                        {isEditingNotes ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.4rem' }}>
                                <textarea
                                    value={notesText}
                                    onChange={(e) => setNotesText(e.target.value)}
                                    rows={3}
                                    placeholder="Enter any notes or remarks about this staff member (stored in backend)..."
                                    className="staff-profile-notes-textarea"
                                    disabled={isSavingNotes}
                                    autoFocus
                                />
                                <div className="staff-profile-notes-actions">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setNotesText(staffInfo?.remarks || '');
                                            setIsEditingNotes(false);
                                        }}
                                        disabled={isSavingNotes}
                                        style={{
                                            padding: '0.4rem 0.85rem',
                                            borderRadius: '6px',
                                            border: '1px solid #cbd5e1',
                                            background: '#fff',
                                            color: '#64748b',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSaveNotes}
                                        disabled={isSavingNotes}
                                        style={{
                                            padding: '0.4rem 1rem',
                                            borderRadius: '6px',
                                            border: 'none',
                                            background: '#2563eb',
                                            color: '#fff',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.4rem',
                                        }}
                                    >
                                        {isSavingNotes ? (
                                            <>
                                                <i className="bi bi-arrow-clockwise spinning" /> Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check2-circle" /> Save Notes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p className="staff-profile-notes-text" style={{ color: staffInfo?.remarks ? '#1e293b' : '#94a3b8', fontStyle: staffInfo?.remarks ? 'normal' : 'italic' }}>
                                {staffInfo?.remarks || 'No notes added yet for this staff member. Click "Add Note" to record notes in backend.'}
                            </p>
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
                                    <span
                                        style={{
                                            padding: '0.2rem 0.6rem',
                                            borderRadius: '6px',
                                            fontWeight: 700,
                                            fontSize: '0.78rem',
                                            letterSpacing: '0.3px',
                                            background:
                                                todayAttendance.status === 'PRESENT'
                                                    ? '#d1fae5'
                                                    : todayAttendance.status === 'ABSENT'
                                                    ? '#fee2e2'
                                                    : todayAttendance.status === 'HALF_DAY'
                                                    ? '#fef3c7'
                                                    : '#e0e7ff',
                                            color:
                                                todayAttendance.status === 'PRESENT'
                                                    ? '#065f46'
                                                    : todayAttendance.status === 'ABSENT'
                                                    ? '#991b1b'
                                                    : todayAttendance.status === 'HALF_DAY'
                                                    ? '#92400e'
                                                    : '#3730a3',
                                        }}
                                    >
                                        {todayAttendance.status.replace('_', ' ')}
                                    </span>
                                ) : (
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                        Not recorded
                                    </span>
                                )}

                                {/* Quick Action Buttons */}
                                {canMarkAttendance && (
                                    <div className="staff-attendance-mark-btns">
                                        {(
                                            [
                                                { status: 'PRESENT' as const, label: 'Present', color: '#059669', bg: '#ecfdf5' },
                                                { status: 'HALF_DAY' as const, label: 'Half Day', color: '#d97706', bg: '#fffbeb' },
                                                { status: 'ABSENT' as const, label: 'Absent', color: '#dc2626', bg: '#fef2f2' },
                                                { status: 'LEAVE' as const, label: 'Leave', color: '#6366f1', bg: '#eef2ff' },
                                            ]
                                        ).map((btn) => (
                                            <button
                                                key={btn.status}
                                                type="button"
                                                disabled={isSavingAttendance}
                                                onClick={() => void handleQuickMarkToday(btn.status)}
                                                className="staff-attendance-mark-btn"
                                                style={{
                                                    border: `1px solid ${btn.color}40`,
                                                    background: todayAttendance?.status === btn.status ? btn.color : btn.bg,
                                                    color: todayAttendance?.status === btn.status ? '#ffffff' : btn.color,
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
                                <span style={{ color: '#059669', fontWeight: 700 }}>
                                    <i className="bi bi-check-circle-fill me-1" />
                                    {monthlyStats.presentCount} Present
                                </span>
                                <span style={{ color: '#d97706', fontWeight: 700 }}>
                                    <i className="bi bi-clock-fill me-1" />
                                    {monthlyStats.halfDayCount} Half-day
                                </span>
                                <span style={{ color: '#dc2626', fontWeight: 700 }}>
                                    <i className="bi bi-x-circle-fill me-1" />
                                    {monthlyStats.absentCount} Absent
                                </span>
                                <span style={{ color: '#6366f1', fontWeight: 700 }}>
                                    <i className="bi bi-calendar2-minus me-1" />
                                    {monthlyStats.leaveCount} Leave
                                </span>
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
                    {/* Total Given / Disbursed Card */}
                    <div className="staff-payment-summary-card staff-payment-due-card">
                        <div className="staff-payment-card-content">
                            <div className="staff-payment-icon staff-payment-icon-danger">
                                <i className="bi bi-cash-stack"></i>
                            </div>
                            <div className="staff-payment-card-info">
                                <span className="staff-payment-summary-title">Total Payments Given</span>
                                <div className="staff-payment-summary-amount">
                                    रु {totals.totalGiven.toLocaleString()}
                                </div>
                                <span className="staff-payment-card-subtitle">Total salary & advance payouts</span>
                            </div>
                        </div>
                    </div>

                    {/* Staff View Permission Card */}
                    <div className="staff-payment-summary-card staff-payment-permission-card">
                        <div className="staff-payment-card-content">
                            <div className="staff-payment-icon staff-payment-icon-primary">
                                <i className="bi bi-eye"></i>
                            </div>
                            <div className="staff-payment-card-info">
                                <span className="staff-payment-summary-title">Payment Permission</span>
                                <span className="staff-payment-card-subtitle">Allow staff to view payment details</span>
                            </div>
                            <button type="button" className="staff-payment-permission-button">
                                <i className="bi bi-eye me-1"></i>
                                Show
                            </button>
                        </div>
                    </div>
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

                        {/* Footer Action */}
                        {canMakePayment && (
                            <div className="staff-payment-history-footer">
                                <button
                                    type="button"
                                    className="staff-payment-add-payment-button"
                                    onClick={handleOpenAddPayment}
                                >
                                    <i className="bi bi-plus-circle me-1"></i>
                                    Add Payment
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
                                const date = new Date(currentYear, currentMonth, index + 1);
                                const isSelected =
                                    selectedDate &&
                                    date.getDate() === selectedDate.getDate() &&
                                    date.getMonth() === selectedDate.getMonth() &&
                                    date.getFullYear() === selectedDate.getFullYear();
                                const rec = getAttendanceForDate(date);

                                let dotColor: string | null = null;
                                if (rec) {
                                    if (rec.status === 'PRESENT') dotColor = '#10b981';
                                    else if (rec.status === 'ABSENT') dotColor = '#ef4444';
                                    else if (rec.status === 'HALF_DAY') dotColor = '#f59e0b';
                                    else if (rec.status === 'LEAVE') dotColor = '#6366f1';
                                }

                                return (
                                    <button
                                        type="button"
                                        key={index + 1}
                                        className={`staff-payment-calendar-date ${
                                            isSelected ? 'staff-payment-selected-date' : ''
                                        }`}
                                        onClick={() => setSelectedDate(date)}
                                        style={{ position: 'relative' }}
                                    >
                                        <span>{index + 1}</span>
                                        {dotColor && (
                                            <span
                                                style={{
                                                    position: 'absolute',
                                                    bottom: '3px',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    width: '6px',
                                                    height: '6px',
                                                    borderRadius: '50%',
                                                    backgroundColor: isSelected ? '#ffffff' : dotColor,
                                                }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Attendance Status Radios */}
                        <div className="staff-payment-attendance-section">
                            <div className="staff-payment-section-label">
                                <i className="bi bi-person-check me-1"></i>
                                Attendance Status {selectedDate ? `for ${selectedDate.toLocaleDateString()}` : ''}
                            </div>

                            <div className="staff-payment-attendance-status">
                                <label className="staff-payment-status-item">
                                    <input
                                        type="radio"
                                        name="attendance"
                                        value="present"
                                        checked={selectedStatus === 'present'}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="staff-payment-radio-button"
                                    />
                                    <span className="staff-payment-status-label">
                                        <i className="bi bi-check-circle me-1"></i> Present
                                    </span>
                                </label>

                                <label className="staff-payment-status-item">
                                    <input
                                        type="radio"
                                        name="attendance"
                                        value="absent"
                                        checked={selectedStatus === 'absent'}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="staff-payment-radio-button"
                                    />
                                    <span className="staff-payment-status-label">
                                        <i className="bi bi-x-circle me-1"></i> Absent
                                    </span>
                                </label>

                                <label className="staff-payment-status-item">
                                    <input
                                        type="radio"
                                        name="attendance"
                                        value="halfDay"
                                        checked={selectedStatus === 'halfDay'}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="staff-payment-radio-button"
                                    />
                                    <span className="staff-payment-status-label">
                                        <i className="bi bi-clock me-1"></i> Half Day
                                    </span>
                                </label>

                                <label className="staff-payment-status-item">
                                    <input
                                        type="radio"
                                        name="attendance"
                                        value="leave"
                                        checked={selectedStatus === 'leave'}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="staff-payment-radio-button"
                                    />
                                    <span className="staff-payment-status-label">
                                        <i className="bi bi-calendar-x me-1"></i> Leave
                                    </span>
                                </label>
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
                                    value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                                    onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value))}
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