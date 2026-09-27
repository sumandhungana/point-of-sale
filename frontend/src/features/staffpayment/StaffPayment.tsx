import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { BackButton } from '@/components/BackButton';
import { AddPayments } from './AddPayments';
import { getPaymentList, GetPaymentResponse } from '../services/paymentService';
import '../../styles/StaffPayment.css';

export const StaffPayment: React.FC = () => {
    // Extract staffId from route parameters
    const { id } = useParams<{ id: string }>();
    const staffId = id ? parseInt(id, 10) : 0;

    // Attendance Modal & Date State
    const [isAttendanceOpen, setIsAttendanceOpen] = useState<boolean>(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
    const [selectedStatus, setSelectedStatus] = useState<string>('present');

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

    useEffect(() => {
        void fetchPayments();
    }, [fetchPayments]);

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
                <div className="staff-payment-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <BackButton to="/staff" label="Back to Staff" />

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        {/* Open Attendance Modal Button */}
                        <button
                            type="button"
                            className="btn-base btn-info"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.6rem 1.2rem',
                                borderRadius: '8px',
                                backgroundColor: '#0dcaf0',
                                color: '#000',
                                border: 'none',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
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
                                                            {/* Entry Badge */}
                                                            <div className="staff-payment-history-row">
                                                                <span className="staff-payment-due" style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem' }}>
                                                                    Payment Given
                                                                </span>
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

                                                        {/* Statement Balance Badge */}
                                                        <div className="staff-payment-history-total">
                                                            रु {Math.abs(transaction.amount).toLocaleString()}
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    ))
                            )}
                        </div>

                        {/* Footer Action */}
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
                    </div>
                </div>
            </div>

            {/* ATTENDANCE POPUP MODAL */}
            {isAttendanceOpen && (
                <div
                    className="popup-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1050,
                        padding: '1rem'
                    }}
                    onClick={() => setIsAttendanceOpen(false)}
                >
                    <div
                        className="popup-content"
                        style={{
                            background: '#ffffff',
                            borderRadius: '16px',
                            width: '100%',
                            maxWidth: '650px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            position: 'relative',
                            padding: '1.5rem',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header & Close Button */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e9ecef', paddingBottom: '0.75rem' }}>
                            <div className="staff-payment-calendar-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div className="staff-payment-calendar-title-icon">
                                    <i className="bi bi-calendar3" style={{ fontSize: '1.5rem', color: '#0d6efd' }}></i>
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Staff Attendance</h3>
                                    <span style={{ fontSize: '0.85rem', color: '#6c757d' }}>Track and update staff attendance details</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsAttendanceOpen(false)}
                                style={{
                                    border: 'none',
                                    background: 'transparent',
                                    fontSize: '1.5rem',
                                    cursor: 'pointer',
                                    color: '#6c757d',
                                    lineHeight: 1
                                }}
                                aria-label="Close"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        {/* Calendar Controls */}
                        <div className="staff-payment-calendar-controls" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                            <select
                                className="staff-payment-calendar-select"
                                value={currentMonth}
                                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                                style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
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
                                style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #ced4da' }}
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

                                return (
                                    <button
                                        type="button"
                                        key={index + 1}
                                        className={`staff-payment-calendar-date ${
                                            isSelected ? 'staff-payment-selected-date' : ''
                                        }`}
                                        onClick={() => setSelectedDate(date)}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Attendance Status Radios */}
                        <div className="staff-payment-attendance-section" style={{ marginTop: '1.25rem' }}>
                            <div className="staff-payment-section-label" style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
                                <i className="bi bi-person-check me-1"></i>
                                Attendance Status {selectedDate ? `for ${selectedDate.toLocaleDateString()}` : ''}
                            </div>

                            <div className="staff-payment-attendance-status" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
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

                        {/* Actions inside Modal */}
                        <div className="staff-payment-bottom-controls" style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                            <div className="staff-payment-date-input-wrapper">
                                <i className="bi bi-calendar-date"></i>
                                <input
                                    type="date"
                                    className="staff-payment-date-picker"
                                    value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                                    onChange={(e) => e.target.value && setSelectedDate(new Date(e.target.value))}
                                />
                            </div>

                            <button
                                type="button"
                                className="staff-payment-view-summary-button"
                                onClick={() => setIsAttendanceOpen(false)}
                            >
                                Done
                            </button>
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