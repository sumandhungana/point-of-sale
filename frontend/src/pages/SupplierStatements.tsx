import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { getPaymentHistory, PaymentHistory } from '../services/paymentService';
import { fetchCustomerData } from '../services/customerService';
import { toast } from 'react-toastify';
import '../styles/SupplierStatements.css';

export const SupplierStatements: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
    const [reminderDate, setReminderDate] = useState<string>('');
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const datePickerRef = useRef<HTMLDivElement>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);

    const [supplierName, setSupplierName] = useState<string>('');
    const [supplierPhone, setSupplierPhone] = useState<string>('');
    const [supplierContactPerson, setSupplierContactPerson] = useState<string>('');
    const [supplierProfileImage, setSupplierProfileImage] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const load = async () => {
            try {
                const [history, supplier] = await Promise.all([
                    getPaymentHistory(parseInt(id)),
                    fetchCustomerData(id)
                ]);

                setPaymentHistory(history || []);
                setSupplierName(supplier?.name || '');
                setSupplierPhone(supplier?.phoneNumber || supplier?.phone || '');
                setSupplierContactPerson(supplier?.ContactPerson || '');
                // Match CustomerProfile behavior: use the value as-is
                setSupplierProfileImage(supplier?.profileImage || null);
            } catch (err) {
                toast.error('Failed to load supplier statements');
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, [id]);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
                setShowDatePicker(false);
            }
        };
        document.addEventListener('mousedown', onDocClick);
        return () => document.removeEventListener('mousedown', onDocClick);
    }, []);

    const totals = useMemo(() => {
        const given = paymentHistory.filter(p => {
            const t = (p.type || '').toLowerCase();
            return t === 'given' || t === 'payment_out' || t === 'you_gave';
        }).reduce((s, p) => s + p.amount, 0);
        const received = paymentHistory.filter(p => {
            const t = (p.type || '').toLowerCase();
            return t === 'received' || t === 'payment_in' || t === 'you_received';
        }).reduce((s, p) => s + p.amount, 0);
        const net = received - given;
        return { given, received, net };
    }, [paymentHistory]);

    const gaveDelta = Math.max(totals.given - totals.received, 0);
    const receiveDelta = Math.max(totals.received - totals.given, 0);

    const handleBack = () => navigate('/parties/suppliers');
    const handleCall = () => {
        if (!supplierPhone) return;
        window.open(`tel:${supplierPhone.replace(/\D/g, '')}`, '_blank');
    };
    const handleProfileClick = () => {
        if (!id) return;
        navigate(`/parties/supplier/profile/${id}`);
    };
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setReminderDate(e.target.value);

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <Sidebar />
            <main className="supplier-statements-main-content">
                <div className="supplier-statements-profile-container">
                    <div className="supplier-statements-profile-header-grid">
                        <div className="supplier-statements-header-left">
                                                       <button className="supplier-statements-back-button" onClick={handleBack}>
                               <i className="bi bi-arrow-left"></i>
                               Back
                           </button>
                        </div>
                        <div className="supplier-statements-header-center" onClick={handleProfileClick} title="Open profile" style={{ cursor: 'pointer' }}>
                            {supplierProfileImage ? (
                                <img 
                                    src={supplierProfileImage} 
                                    alt={supplierName} 
                                    className="supplier-statements-profile-image" 
                                    onError={() => setSupplierProfileImage(null)}
                                />
                            ) : (
                                <div className="supplier-statements-profile-image-placeholder">
                                    <i className="bi bi-person"></i>
                                </div>
                            )}
                        </div>
                        <div className="supplier-statements-header-right">
                            <button className="btn-base btn-primary" onClick={handleCall}>
                                <i className="bi bi-telephone"></i>
                                Call
                            </button>
                        </div>
                    </div>
                    <div 
                        className="supplier-statements-customer-name" 
                        style={{ textAlign: 'center', marginTop: '0.5rem', cursor: 'pointer' }}
                        onClick={handleProfileClick}
                        title="Open profile"
                    >
                        {supplierName || 'Supplier'}
                    </div>
                    
                </div>

                <div className="supplier-statements-amount-card">
                    <div className="supplier-statements-amount-row">
                        <div className="supplier-statements-amount-item">
                            <div className="supplier-statements-amount-label">
                                <i className="bi bi-arrow-up-circle me-2"></i>
                                You Gave
                            </div>
                            <div className="supplier-statements-amount-value supplier-statements-amount-red">
                                रु{totals.given.toLocaleString()}
                            </div>
                        </div>
                        <div className="supplier-statements-amount-item">
                            <div className="supplier-statements-amount-label">
                                <i className="bi bi-arrow-down-circle me-2"></i>
                                You Received
                            </div>
                            <div className="supplier-statements-amount-value supplier-statements-amount-green">
                                रु{totals.received.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div className="supplier-statements-reminder-row">
                        <div className="supplier-statements-reminder-label">Set Date Reminder</div>
                        <input
                            type="date"
                            value={reminderDate}
                            onChange={handleDateChange}
                            ref={dateInputRef}
                            className="supplier-statements-date-input"
                        />
                        <button
                            type="button"
                            className="btn-base btn-secondary"
                            onClick={() => {
                                const el = dateInputRef.current;
                                // @ts-ignore - showPicker not in all TS lib versions
                                if (el && typeof el.showPicker === 'function') { el.showPicker(); }
                                else { el?.click(); }
                            }}
                            aria-label="Select reminder date"
                            title={reminderDate ? new Date(reminderDate).toLocaleDateString() : 'Select Date'}
                        >
                            <i className="bi bi-calendar2-plus"></i>
                            {reminderDate ? new Date(reminderDate).toLocaleDateString() : 'Select Date'}
                        </button>
                    </div>
                </div>

                {/* Quick Actions: Report (left), Reminder (center), SMS (right) */}
                <div className="supplier-statements-actions-row">
                    <div className="supplier-statements-action-slot-left">
                        <button className="btn-base btn-info" onClick={() => navigate(`/parties/suppliers/statements/report/${id}`)}>
                            <i className="bi bi-bar-chart"></i>
                            Report
                        </button>
                    </div>
                    <div className="supplier-statements-action-slot-center">
                        <button className="btn-base btn-warning" onClick={() => (dateInputRef.current ? (dateInputRef.current.click()) : null)}>
                            <i className="bi bi-alarm"></i>
                            Reminder
                        </button>
                    </div>
                    <div className="supplier-statements-action-slot-right">
                        <button className="btn-base btn-purple">
                            <i className="bi bi-chat-dots"></i>
                            SMS
                        </button>
                    </div>
                </div>

                <div className="supplier-statements-transactions-container">
                    <div className="supplier-statements-transactions-title">
                        <i className="bi bi-clock-history"></i>
                        Recent Transactions
                    </div>

                    {isLoading ? (
                        <div className="supplier-statements-no-transactions">Loading transactions...</div>
                    ) : paymentHistory.length === 0 ? (
                        <div className="supplier-statements-no-transactions">No transactions found</div>
                    ) : (
                        paymentHistory
                            .slice()
                            .sort((a, b) => {
                                const ta = new Date(a.createdAt || a.date).getTime();
                                const tb = new Date(b.createdAt || b.date).getTime();
                                return tb - ta;
                            })
                            .map((t) => (
                                <div
                                    key={t.id}
                                    className="supplier-statements-transaction-card"
                                    onClick={() => {
                                        const isReceived = (t.type || '').toLowerCase() === 'received';
                                        const amountAbs = Math.abs(t.amount);
                                        navigate(`/parties/supplier/statement/${t.id}`, {
                                            state: {
                                                transaction: {
                                                    customerName: supplierName || 'Supplier',
                                                    date: new Date(t.date).toISOString().split('T')[0],
                                                    totalAmount: amountAbs,
                                                    phoneNumber: supplierPhone || '',
                                                    type: isReceived ? 'payment_in' : 'payment_out',
                                                    customerId: parseInt(id || '0'),
                                                    details: `${isReceived ? 'Payment Received' : 'Payment Given'} - ${new Date(t.date).toLocaleDateString()}`,
                                                    remarks: t.remarks || '',
                                                    sms: `Dear ${supplierName || 'Supplier'}, your payment of रु${amountAbs} has been ${isReceived ? 'received' : 'processed'}. Current balance: रु${t.newBalance}. Thank you.`,
                                                },
                                            },
                                        });
                                    }}
                                    role="button"
                                    tabIndex={0}
                                >
                                    <div className="supplier-statements-transaction-info">
                                        <div className="supplier-statements-transaction-row">
                                            <div className="supplier-statements-transaction-label">Payment Type:</div>
                                            <div className="supplier-statements-transaction-value">
                                                {(t.type || '').toLowerCase() === 'received' || (t.type || '').toLowerCase() === 'payment_in' || (t.type || '').toLowerCase() === 'you_received' ? (
                                                    <span className="supplier-statements-payment-in">Payment In</span>
                                                ) : (
                                                    <span className="supplier-statements-payment-out">Payment Out</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="supplier-statements-transaction-row">
                                            <div className="supplier-statements-transaction-label">Date/Time:</div>
                                            <div className="supplier-statements-transaction-value">
                                                {new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <div className="supplier-statements-transaction-row">
                                            <div className="supplier-statements-transaction-label">Balance:</div>
                                            <div className="supplier-statements-transaction-value">रु{Math.abs(t.amount).toLocaleString()}</div>
                                        </div>
                                        <div className="supplier-statements-transaction-row">
                                            <div className="supplier-statements-transaction-label">Remarks:</div>
                                            <div className="supplier-statements-transaction-value">{t.remarks}</div>
                                        </div>
                                    </div>
                                    <div className="supplier-statements-transaction-amounts">
                                        <div className={(t.type || '').toLowerCase() === 'received' ? 'supplier-statements-current-amount' : 'supplier-statements-current-amount-red'}>
                                            रु{Math.abs(t.amount).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))
                    )}
                </div>

                <div className="supplier-statements-bottom-row">
                    <button
                        className="btn-base btn-red"
                        onClick={() => navigate(`/parties/supplier/statements/you-gave/${id}`)}
                    >
                        <i className="bi bi-arrow-up-circle"></i>
                        You Gave
                    </button>
                    <button
                        className="btn-base btn-green"
                        onClick={() => navigate(`/parties/supplier/statements/you-received/${id}`)}
                    >
                        <i className="bi bi-arrow-down-circle"></i>
                        You Received
                    </button>
                </div>
            </main>

            {showDatePicker && (
                <div className="supplier-statements-date-overlay" ref={datePickerRef}>
                    {/* Kept placeholder for any future modal-based date picker */}
                </div>
            )}
        </div>
    );
};

export default SupplierStatements;

