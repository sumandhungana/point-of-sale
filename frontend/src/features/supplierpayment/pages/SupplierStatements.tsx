
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
                {/* 1. Sleek Compact Profile Header */}
                <div className="statements-profile-card">
                    <div className="statements-profile-info">
                        <div
                            className="statements-avatar-wrapper"
                            onClick={handleProfileClick}
                            title="View supplier profile"
                        >
                            {supplierProfileImage ? (
                                <img
                                    src={supplierProfileImage}
                                    alt={supplierName || 'Supplier'}
                                    className="supplier-statements-profile-image"
                                    onError={() => setSupplierProfileImage(null)}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        backgroundColor: '#e9ecef',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.25rem',
                                        fontWeight: '700',
                                        color: '#021861'
                                    }}
                                >
                                    {supplierName ? supplierName.charAt(0).toUpperCase() : <i className="bi bi-truck"></i>}
                                </div>
                            )}
                        </div>
                        <div className="statements-details">
                            <div className="statements-name-row">
                                <h2
                                    className="statements-customer-name"
                                    onClick={handleProfileClick}
                                    title="View supplier profile"
                                >
                                    {supplierName || 'Supplier'}
                                </h2>
                                {id ? (
                                    <span className="statements-id-badge">#SUPP-{id}</span>
                                ) : null}
                            </div>
                            <div className="statements-meta-row">
                                {supplierPhone ? (
                                    <span>
                                        <i className="bi bi-telephone me-1"></i>
                                        {supplierPhone}
                                    </span>
                                ) : (
                                    <span>
                                        <i className="bi bi-telephone me-1"></i>
                                        No phone
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="statements-header-actions">
                        <button
                            type="button"
                            className="btn-statement-action btn-call"
                            onClick={handleCall}
                            title={supplierPhone || 'No phone number available'}
                        >
                            <i className="bi bi-telephone"></i>
                            Call
                        </button>
                        <button
                            type="button"
                            className="btn-statement-close"
                            onClick={handleBack}
                            aria-label="Back to suppliers"
                            title="Back to suppliers"
                        >
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>

                {/* 2. Amount Summary & Reminder Card */}
                <div className="statements-amount-card">
                    <div className="statements-amount-grid">
                        <div className="statements-amount-box box-gave">
                            <div className="statements-amount-label">
                                <i className="bi bi-arrow-up-circle me-2"></i>
                                You Gave
                            </div>
                            <div className="statements-amount-val val-gave">
                                रु{(totals.given || 0).toLocaleString()}
                            </div>
                        </div>
                        <div className="statements-amount-box box-received">
                            <div className="statements-amount-label">
                                <i className="bi bi-arrow-down-circle me-2"></i>
                                You Received
                            </div>
                            <div className="statements-amount-val val-received">
                                रु{(totals.received || 0).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <div className="statements-reminder-strip">
                        <div className="statements-reminder-label">
                            <i className="bi bi-calendar-event me-2"></i>
                            Set Reminder Date
                        </div>
                        <div className="statements-reminder-controls">
                            <input
                                type="date"
                                value={reminderDate}
                                onChange={handleDateChange}
                                ref={dateInputRef}
                                className="statements-date-input"
                            />
                            <button
                                type="button"
                                className="btn-reminder-picker"
                                onClick={() => {
                                    const el = dateInputRef.current;
                                    if (el && typeof el.showPicker === 'function') {
                                        el.showPicker();
                                    } else {
                                        el?.click();
                                    }
                                }}
                                title="Pick reminder date"
                            >
                                <i className="bi bi-calendar2-plus"></i>
                                {reminderDate ? safeFormatDate(reminderDate) : 'Pick Date'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 3. Quick Actions Grid */}
                <div className="statements-quick-actions">
                    <button
                        className="btn-quick-action action-report"
                        onClick={() => navigate(`/parties/suppliers/statements/report/${id}`)}
                    >
                        <i className="bi bi-file-earmark-bar-graph"></i>
                        <span>Report</span>
                    </button>
                    <button
                        className="btn-quick-action action-reminder"
                        onClick={() => {
                            const el = dateInputRef.current;
                            if (el && typeof el.showPicker === 'function') {
                                el.showPicker();
                            } else {
                                el?.click();
                            }
                        }}
                    >
                        <i className="bi bi-alarm"></i>
                        <span>Reminder</span>
                    </button>
                    <button className="btn-quick-action action-sms">
                        <i className="bi bi-chat-dots"></i>
                        <span>SMS</span>
                    </button>
                </div>

                {/* 4. Transactions List */}
                <div className="statements-transactions-card">
                    <div className="statements-transactions-header">
                        <i className="bi bi-clock-history"></i>
                        <span>Recent Transactions</span>
                    </div>

                    <div className="statements-transactions-body">
                        {isLoading ? (
                            <div className="statements-state-msg">
                                <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                                Loading transactions...
                            </div>
                        ) : !paymentHistory || paymentHistory.length === 0 ? (
                            <div className="statements-state-msg">
                                <i className="bi bi-inbox me-2" style={{ fontSize: '18px' }}></i>
                                No transactions recorded yet
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
                                            className="statement-tx-row"
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
                                            <div className="tx-main-col">
                                                <div className="tx-type-line">
                                                    <span className={`tx-type-badge ${isReceived ? 'badge-in' : 'badge-out'}`}>
                                                        <i className={`bi ${isReceived ? 'bi-arrow-down-left' : 'bi-arrow-up-right'} me-1`}></i>
                                                        {isReceived ? 'Payment In' : 'Payment Out'} ({t.paymentType || 'General'})
                                                    </span>
                                                </div>
                                                <div className="tx-date-line">
                                                    <i className="bi bi-calendar3 me-1"></i>
                                                    {safeFormatDate(t.createdAt)}
                                                    <span className="tx-dot">•</span>
                                                    <i className="bi bi-clock me-1"></i>
                                                    {safeFormatTime(t.createdAt)}
                                                </div>
                                                {t.remarks && (
                                                    <div className="tx-remarks-line">
                                                        <i className="bi bi-chat-left-quote me-1"></i>
                                                        {t.remarks}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="tx-amount-col">
                                                <div className={`tx-amount-num ${isReceived ? 'num-received' : 'num-gave'}`}>
                                                    {isReceived ? '+ ' : '- '}रु{amountAbs.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                        )}
                    </div>
                </div>

                {/* 5. Fixed Sticky Bottom Action Bar */}
                <div className="statements-bottom-bar">
                    <button
                        className="btn-bottom-action btn-bottom-gave"
                        onClick={() => setShowPopup(true)}
                    >
                        <i className="bi bi-dash-circle"></i>
                        <span>You Gave</span>
                    </button>
                    <button
                        className="btn-bottom-action btn-bottom-received"
                        onClick={() => setShowReceivedPopup(true)}
                    >
                        <i className="bi bi-plus-circle"></i>
                        <span>You Received</span>
                    </button>
                </div>

                {/* Modal: You Gave */}
                {showPopup && (
                    <div className="popup-overlay" onClick={() => setShowPopup(false)}>
                        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                            <div className="popup-title-container">
                                <h2 className="popup-title">
                                    <i className="bi bi-arrow-up-circle me-2" style={{ color: '#DE1110' }}></i>
                                    Record Payment Given
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowPopup(false)}
                                    className="popup-close-button"
                                    aria-label="Close"
                                    title="Close"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
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

                {/* Modal: You Received */}
                {showReceivedPopup && (
                    <div className="popup-overlay" onClick={() => setShowReceivedPopup(false)}>
                        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                            <div className="popup-title-container">
                                <h2 className="popup-title-received">
                                    <i className="bi bi-arrow-down-circle me-2" style={{ color: '#10b981' }}></i>
                                    Record Payment Received
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowReceivedPopup(false)}
                                    className="popup-close-button"
                                    aria-label="Close"
                                    title="Close"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
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
            </main>
        </div>
    );
};

export default SupplierStatements;