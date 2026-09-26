
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { getPaymentList, GetPaymentResponse} from '@/features/services/paymentService';
import { fetchCustomerData } from '@/features/services/customerService';
import { getSuppliers, GetSupplierResponse } from '@/features/services/supplierService';
import { toast } from 'react-toastify';

import { YouGave } from '../../supplierpayment/components/YouGave';
import { YouReceived } from '../../supplierpayment/components/YouReceived';

import '../../../styles/SupplierStatements.css';

// Helper to decode double Base64 safely
const formatImageSrc = (src?: string | null): string => {
    if (!src) return '';
    let clean = src.trim().replace(/(\r\n|\n|\r)/gm, '');

    if (clean.startsWith('ZGF0YT')) {
        try {
            clean = clean.replace(/-/g, '+').replace(/_/g, '/');
            while (clean.length % 4) {
                clean += '=';
            }
            clean = atob(clean).trim().replace(/(\r\n|\n|\r)/gm, '');
        } catch (e) {
            console.error('Failed to decode double-base64 image string:', e);
        }
    }

    if (clean.startsWith('data:image/') || clean.startsWith('http://') || clean.startsWith('https://')) {
        return clean;
    }

    let mimeType = 'image/png';
    if (clean.startsWith('/9j/')) {
        mimeType = 'image/jpeg';
    } else if (clean.startsWith('iVBORw0KGgo')) {
        mimeType = 'image/png';
    } else if (clean.startsWith('R0lGOD')) {
        mimeType = 'image/gif';
    } else if (clean.startsWith('UklGR')) {
        mimeType = 'image/webp';
    }

    return `data:${mimeType};base64,${clean}`;
};

// Safe date formatter helper
const safeFormatDate = (dateStr?: string | Date): string => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString();
};

const safeFormatTime = (dateStr?: string | Date): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString();
};

export const SupplierStatements: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [paymentHistory, setPaymentHistory] = useState<GetPaymentResponse[]>([]);

    const [reminderDate, setReminderDate] = useState<string>('');
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

    const datePickerRef = useRef<HTMLDivElement>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);

    const [supplierName, setSupplierName] = useState<string>('');
    const [supplierPhone, setSupplierPhone] = useState<string>('');

    const [supplierProfileImage, setSupplierProfileImage] = useState<string | null>(null);

    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [showReceivedPopup, setShowReceivedPopup] = useState<boolean>(false);

    const fetchPayments = useCallback(async () => {
        if (!id) return;

        setIsLoading(true);
        try {
            const payments = await getPaymentList({
                paymentParty: 'SUPPLIER',
                partyId: parseInt(id, 10)
            });
            setPaymentHistory(Array.isArray(payments) ? payments : []);
        } catch (error) {
            console.error('Error fetching supplier payment list:', error);
            toast.error('Failed to fetch supplier payment list');
            setPaymentHistory([]);
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    const loadSupplierData = useCallback(async () => {
        if (!id) return;

        try {
            const [customerRes, suppliersRes] = await Promise.allSettled([
                fetchCustomerData(id),
                getSuppliers()
            ]);

            const customerSupplier = customerRes.status === 'fulfilled' ? customerRes.value : null;
            const directSuppliers: GetSupplierResponse[] = suppliersRes.status === 'fulfilled' && Array.isArray(suppliersRes.value)
                ? suppliersRes.value
                : [];
            const directSupplier = directSuppliers.find((s) => String(s.id) === String(id));

            const finalName = directSupplier?.name || customerSupplier?.name || '';
            const finalPhone = directSupplier?.phone || customerSupplier?.phoneNumber || customerSupplier?.phone || '';

            const rawImage =
                directSupplier?.profileImage ||
                (directSupplier as any)?.profile_image ||
                customerSupplier?.profileImage ||
                (customerSupplier as any)?.profile_image ||
                null;

            setSupplierName(finalName);
            setSupplierPhone(finalPhone);

            const formatted = formatImageSrc(rawImage);
            setSupplierProfileImage(formatted || null);

        } catch (err) {
            console.error('Error loading supplier profile:', err);
        }
    }, [id]);

    useEffect(() => {
        loadSupplierData();
        fetchPayments();
    }, [loadSupplierData, fetchPayments]);

    useEffect(() => {
        const onDocClick = (e: MouseEvent) => {
            if (
                datePickerRef.current &&
                !datePickerRef.current.contains(e.target as Node)
            ) {
                setShowDatePicker(false);
            }
        };

        document.addEventListener('mousedown', onDocClick);
        return () => {
            document.removeEventListener('mousedown', onDocClick);
        };
    }, []);

    const totals = useMemo(() => {
        if (!Array.isArray(paymentHistory)) return { given: 0, received: 0 };

        const result = paymentHistory.reduce((acc, payment) => {
            const category = (payment?.paymentCategory || '').toUpperCase();
            if (category === 'GIVEN') {
                acc.given += payment.amount || 0;
            } else if (category === 'RECEIVED') {
                acc.received += payment.amount || 0;
            }
            return acc;
        }, { given: 0, received: 0 });

        return {
            given: Math.max(result.given - result.received, 0),
            received: Math.max(result.received - result.given, 0)
        };
    }, [paymentHistory]);

    const handleBack = () => {
        navigate('/parties/suppliers');
    };

    const handleCall = () => {
        if (!supplierPhone) {
            toast.error('No phone number available');
            return;
        }

        window.open(`tel:${supplierPhone.replace(/\D/g, '')}`, '_blank');
    };

    const handleProfileClick = () => {
        if (!id) return;
        navigate(`/parties/supplier/profile/${id}`);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReminderDate(e.target.value);
    };

    const handleGaveSuccess = async () => {
        setShowPopup(false);
        await fetchPayments();
    };

    const handleReceivedSuccess = async () => {
        setShowReceivedPopup(false);
        await fetchPayments();
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <Sidebar />

            <main className="supplier-statements-main-content">
                <div className="supplier-statements-profile-container">
                    <div className="supplier-statements-profile-header-grid">
                        <div className="supplier-statements-header-left">
                            <button
                                className="supplier-statements-back-button"
                                onClick={handleBack}
                            >
                                <i className="bi bi-arrow-left"></i>
                                Back
                            </button>
                        </div>

                        <div
                            className="supplier-statements-header-center"
                            onClick={handleProfileClick}
                            title="Open profile"
                            style={{ cursor: 'pointer' }}
                        >
                            {supplierProfileImage ? (
                                <img
                                    src={supplierProfileImage}
                                    alt={supplierName || 'Supplier'}
                                    className="supplier-statements-profile-image"
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        display: 'block'
                                    }}
                                    onError={() => {
                                        setSupplierProfileImage(null);
                                    }}
                                />
                            ) : (
                                <div
                                    className="supplier-statements-profile-image-placeholder"
                                    style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        backgroundColor: '#e9ecef',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        fontWeight: '600',
                                        color: '#6c757d'
                                    }}
                                >
                                    {supplierName ? supplierName.charAt(0).toUpperCase() : <i className="bi bi-person"></i>}
                                </div>
                            )}
                        </div>

                        <div className="supplier-statements-header-right">
                            <button
                                className="btn-base btn-primary"
                                onClick={handleCall}
                            >
                                <i className="bi bi-telephone"></i>
                                Call
                            </button>
                        </div>
                    </div>

                    <div
                        className="supplier-statements-customer-name"
                        style={{
                            textAlign: 'center',
                            marginTop: '0.5rem',
                            cursor: 'pointer'
                        }}
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
                                रु{(totals.given || 0).toLocaleString()}
                            </div>
                        </div>

                        <div className="supplier-statements-amount-item">
                            <div className="supplier-statements-amount-label">
                                <i className="bi bi-arrow-down-circle me-2"></i>
                                You Received
                            </div>
                            <div className="supplier-statements-amount-value supplier-statements-amount-green">
                                रु{(totals.received || 0).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <div className="supplier-statements-reminder-row">
                        <div className="supplier-statements-reminder-label">
                            Set Date Reminder
                        </div>

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
                                if (el && typeof el.showPicker === 'function') {
                                    el.showPicker();
                                } else {
                                    el?.click();
                                }
                            }}
                            aria-label="Select reminder date"
                            title={
                                reminderDate
                                    ? safeFormatDate(reminderDate)
                                    : 'Select Date'
                            }
                        >
                            <i className="bi bi-calendar2-plus"></i>
                            {reminderDate
                                ? safeFormatDate(reminderDate)
                                : 'Select Date'}
                        </button>
                    </div>
                </div>

                <div className="supplier-statements-actions-row">
                    <div className="supplier-statements-action-slot-left">
                        <button
                            className="btn-base btn-info"
                            onClick={() =>
                                navigate(`/parties/suppliers/statements/report/${id}`)
                            }
                        >
                            <i className="bi bi-bar-chart"></i>
                            Report
                        </button>
                    </div>

                    <div className="supplier-statements-action-slot-center">
                        <button
                            className="btn-base btn-warning"
                            onClick={() =>
                                dateInputRef.current
                                    ? dateInputRef.current.click()
                                    : null
                            }
                        >
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
                        <div className="supplier-statements-no-transactions">
                            Loading transactions...
                        </div>
                    ) : !paymentHistory || paymentHistory.length === 0 ? (
                        <div className="supplier-statements-no-transactions">
                            No transactions found
                        </div>
                    ) : (
                        paymentHistory
                            .slice()
                            .sort((a, b) => {
                                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                                return timeB - timeA;
                            })
                            .map((t) => {
                                const isReceived = t.paymentCategory === 'RECEIVED';
                                const amountAbs = Math.abs(t.amount || 0);

                                return (
                                    <div
                                        key={t.id}
                                        className="supplier-statements-transaction-card"
                                        onClick={() => {
                                            navigate(
                                                `/parties/supplier/statement/${t.id}`,
                                                {
                                                    state: {
                                                        transaction: {
                                                            customerName: supplierName || 'Supplier',
                                                            date: safeFormatDate(t.createdAt),
                                                            totalAmount: amountAbs,
                                                            phoneNumber: supplierPhone || '',
                                                            type: isReceived ? 'payment_in' : 'payment_out',
                                                            customerId: parseInt(id || '0', 10),
                                                            details: `${isReceived ? 'Payment Received' : 'Payment Given'} - ${safeFormatDate(t.createdAt)}`,
                                                            remarks: t.remarks || '',
                                                            sms: `Dear ${supplierName || 'Supplier'}, your payment of रु${amountAbs} has been ${isReceived ? 'received' : 'processed'}. Thank you.`
                                                        }
                                                    }
                                                }
                                            );
                                        }}
                                        role="button"
                                        tabIndex={0}
                                    >
                                        <div className="supplier-statements-transaction-info">
                                            <div className="supplier-statements-transaction-row">
                                                <div className="supplier-statements-transaction-label">
                                                    Payment Type:
                                                </div>
                                                <div className="supplier-statements-transaction-value">
                                                    {isReceived ? (
                                                        <span className="supplier-statements-payment-in">
                                                            Payment In ({t.paymentType || 'General'})
                                                        </span>
                                                    ) : (
                                                        <span className="supplier-statements-payment-out">
                                                            Payment Out ({t.paymentType || 'General'})
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="supplier-statements-transaction-row">
                                                <div className="supplier-statements-transaction-label">
                                                    Date/Time:
                                                </div>
                                                <div className="supplier-statements-transaction-value">
                                                    {safeFormatDate(t.createdAt)} {safeFormatTime(t.createdAt)}
                                                </div>
                                            </div>

                                            <div className="supplier-statements-transaction-row">
                                                <div className="supplier-statements-transaction-label">
                                                    Remarks:
                                                </div>
                                                <div className="supplier-statements-transaction-value">
                                                    {t.remarks || '-'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="supplier-statements-transaction-amounts">
                                            <div
                                                className={
                                                    isReceived
                                                        ? 'supplier-statements-current-amount'
                                                        : 'supplier-statements-current-amount-red'
                                                }
                                            >
                                                रु {amountAbs.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                    )}
                </div>

                <div className="supplier-statements-bottom-row">
                    <button
                        className="btn-base btn-red"
                        onClick={() => setShowPopup(true)}
                        style={{
                            backgroundColor: 'red',
                            color: 'white',
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <i className="bi bi-arrow-up-circle"></i>
                        You Gave
                    </button>

                    {showPopup && (
                        <div className="popup-overlay">
                            <div className="popup-content">
                                <button
                                    type="button"
                                    onClick={() => setShowPopup(false)}
                                    className="popup-close-button"
                                    aria-label="Close"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>

                                <div className="popup-title-container">
                                    <h2 style={{ color: 'red', textAlign: 'center', margin: '0', padding: '0' }}>
                                        You Gave
                                    </h2>
                                </div>

                                <div className="you-gave-popup-body">
                                    <YouGave
                                        supplierId={parseInt(id || '0', 10)}
                                        onSuccess={handleGaveSuccess}
                                        onClose={() => setShowPopup(false)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        className="btn-base btn-green"
                        onClick={() => setShowReceivedPopup(true)}
                        style={{
                            backgroundColor: 'green',
                            color: 'white',
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <i className="bi bi-arrow-down-circle"></i>
                        You Received
                    </button>

                    {showReceivedPopup && (
                        <div className="popup-overlay">
                            <div className="popup-content">
                                <button
                                    type="button"
                                    onClick={() => setShowReceivedPopup(false)}
                                    className="popup-close-button"
                                    aria-label="Close"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>

                                <div className="popup-title-container">
                                    <h2 style={{ color: 'green', textAlign: 'center', margin: '0', padding: '0' }}>
                                        You Received
                                    </h2>
                                </div>

                                <div className="you-received-popup-body">
                                    <YouReceived
                                        supplierId={parseInt(id || '0', 10)}
                                        onSuccess={handleReceivedSuccess}
                                        onClose={() => setShowReceivedPopup(false)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {showDatePicker && (
                    <div className="supplier-statements-date-overlay" ref={datePickerRef}></div>
                )}
            </main>
        </div>
    );
};

export default SupplierStatements;