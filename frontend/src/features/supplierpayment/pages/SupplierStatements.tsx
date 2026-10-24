import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { getPaymentList, GetPaymentResponse } from '@/features/services/paymentService';
import { fetchCustomerData } from '@/features/services/customerService';
import { getSuppliers, GetSupplierResponse } from '@/features/services/supplierService';
import { toast } from 'react-toastify';
import '../../../styles/SupplierStatements.css';
import { YouGave } from '../../supplierpayment/components/YouGave';
import { YouReceived } from '../../supplierpayment/components/YouReceived';
import { resolveImageSrc } from '@/utils/ImageResolver';
import { useAppSettings } from '@/context/AppSettingsContext';

/**
 * Avatar that validates the resolved image before rendering it.
 * Shows a truck/initial icon if the image is missing or fails to load.
 */
const SupplierAvatar = ({ name, imageSrc }: { name?: string; imageSrc: string }) => {
    const [status, setStatus] = useState<'loading' | 'ok' | 'failed'>(
        imageSrc ? 'loading' : 'failed'
    );

    useEffect(() => {
        if (!imageSrc) {
            setStatus('failed');
            return;
        }
        setStatus('loading');

        let cancelled = false;
        const probe = new Image();
        probe.onload = () => { if (!cancelled) setStatus('ok'); };
        probe.onerror = () => { if (!cancelled) setStatus('failed'); };
        probe.src = imageSrc;

        return () => {
            cancelled = true;
            probe.onload = null;
            probe.onerror = null;
        };
    }, [imageSrc]);

    if (status === 'ok') {
        return (
            <img
                src={imageSrc}
                alt={name || 'Supplier'}
                className="supplier-statements-profile-image"
            />
        );
    }

    return (
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
            {name ? name.charAt(0).toUpperCase() : <i className="bi bi-truck"></i>}
        </div>
    );
};

export const SupplierStatements: React.FC = () => {
    const navigate = useNavigate();
    const { formatCurrency, formatDate } = useAppSettings();
    const { id } = useParams<{ id: string }>();

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isLoadingSupplier, setIsLoadingSupplier] = useState<boolean>(true);
    const [paymentHistory, setPaymentHistory] = useState<GetPaymentResponse[]>([]);

    const [reminderDate, setReminderDate] = useState<string>('');
    const [supplierName, setSupplierName] = useState<string>('');
    const [supplierPhone, setSupplierPhone] = useState<string>('');
    const [supplierAddress, setSupplierAddress] = useState<string>('');
    const [supplierProfileImage, setSupplierProfileImage] = useState<string | null>(null);

    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [showReceivedPopup, setShowReceivedPopup] = useState<boolean>(false);

    const resolvedImage = useMemo(() => {
        return resolveImageSrc(supplierProfileImage);
    }, [supplierProfileImage]);

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

        setIsLoadingSupplier(true);
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
            const finalAddress = directSupplier?.address || customerSupplier?.address || '';

            const rawImage =
                directSupplier?.profileImage ||
                (directSupplier as any)?.profile_image ||
                customerSupplier?.profileImage ||
                (customerSupplier as any)?.profile_image ||
                null;

            setSupplierName(finalName);
            setSupplierPhone(finalPhone);
            setSupplierAddress(finalAddress);
            setSupplierProfileImage(rawImage);
        } catch (err) {
            console.error('Error loading supplier profile:', err);
        } finally {
            setIsLoadingSupplier(false);
        }
    }, [id]);

    useEffect(() => {
        loadSupplierData();
        fetchPayments();
    }, [loadSupplierData, fetchPayments]);

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

    const handleSetReminder = () => {
        if (!reminderDate) {
            toast.error('Please select a reminder date.');
            return;
        }
        toast.success(`Reminder date set for ${reminderDate}`);
    };

    const handleReport = () => {
        navigate(`/parties/suppliers/statements/report/${id}`, {
            state: {
                supplier: {
                    id: parseInt(id || '0', 10),
                    name: supplierName,
                    phone: supplierPhone,
                    address: supplierAddress
                },
                paymentHistory,
                totals
            }
        });
    };

    const handleTransactionClick = (transaction: GetPaymentResponse) => {
        const isReceived = transaction.paymentCategory === 'RECEIVED';
        const amountAbs = Math.abs(transaction.amount || 0);

        navigate(`/parties/supplier/statement/${transaction.id}`, {
            state: {
                transaction: {
                    customerName: supplierName || 'Supplier',
                    date: transaction.createdAt,
                    totalAmount: amountAbs,
                    phoneNumber: supplierPhone || '',
                    type: isReceived ? 'payment_in' : 'payment_out',
                    customerId: parseInt(id || '0', 10),
                    details: `${isReceived ? 'Payment Received' : 'Payment Given'} - ${formatDate(transaction.createdAt)}`,
                    remarks: transaction.remarks || '',
                    sms: `Dear ${supplierName || 'Supplier'}, your payment of ${formatCurrency(amountAbs)} has been ${isReceived ? 'received' : 'processed'}. Thank you.`
                }
            }
        });
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
                {/* 1. Sleek Profile Header Card */}
                <div className="statements-profile-card">
                    <div className="statements-profile-info">
                        <div
                            className="statements-avatar-wrapper"
                            onClick={handleProfileClick}
                            title="View supplier profile"
                        >
                            <SupplierAvatar name={supplierName} imageSrc={resolvedImage} />
                        </div>
                        <div className="statements-details">
                            <div className="statements-name-row">
                                <h2
                                    className="statements-customer-name"
                                    onClick={handleProfileClick}
                                    title="View supplier profile"
                                >
                                    {isLoadingSupplier ? 'Loading...' : supplierName || 'Supplier'}
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
                                {supplierAddress && (
                                    <>
                                        <span>•</span>
                                        <span>
                                            <i className="bi bi-geo-alt me-1"></i>
                                            {supplierAddress}
                                        </span>
                                    </>
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
                                {formatCurrency(totals.given || 0)}
                            </div>
                        </div>
                        <div className="statements-amount-box box-received">
                            <div className="statements-amount-label">
                                <i className="bi bi-arrow-down-circle me-2"></i>
                                You Received
                            </div>
                            <div className="statements-amount-val val-received">
                                {formatCurrency(totals.received || 0)}
                            </div>
                        </div>
                    </div>

                    <div className="statements-reminder-strip">
                        <div className="statements-reminder-label">
                            <i className="bi bi-calendar-event me-2"></i>
                            Set Date Reminder
                        </div>
                        <input
                            type="date"
                            value={reminderDate}
                            onChange={handleDateChange}
                            className="statements-date-input"
                        />
                    </div>
                </div>

                {/* 3. Quick Action Buttons */}
                <div className="statements-quick-actions">
                    <button className="btn-quick-action btn-qa-report" onClick={handleReport}>
                        <i className="bi bi-graph-up"></i>
                        Report
                    </button>
                    <button className="btn-quick-action btn-qa-reminder" onClick={handleSetReminder}>
                        <i className="bi bi-alarm"></i>
                        Reminder
                    </button>
                    <button
                        className="btn-quick-action btn-qa-sms"
                        onClick={() => toast.info('SMS notification feature coming soon!')}
                    >
                        <i className="bi bi-chat-dots"></i>
                        SMS
                    </button>
                </div>

                {/* 4. Recent Transactions List */}
                <div className="customer-statements-transactions-container">
                    <h3 className="customer-statements-transactions-title">
                        <i className="bi bi-clock-history"></i>
                        Recent Transactions
                    </h3>

                    {isLoading ? (
                        <div className="customer-statements-no-transactions">
                            <i className="bi bi-hourglass-split me-2"></i>
                            Loading transactions...
                        </div>
                    ) : paymentHistory.length === 0 ? (
                        <div className="customer-statements-no-transactions">
                            <i className="bi bi-inbox me-2"></i>
                            No transactions found
                        </div>
                    ) : (
                        <div>
                            {Object.entries(
                                paymentHistory.reduce((groups, transaction) => {
                                    const date = new Date(transaction.createdAt).toISOString().split('T')[0];
                                    const isReceived = transaction.paymentCategory === 'RECEIVED';
                                    if (!groups[date]) groups[date] = [];
                                    groups[date].push({
                                        ...transaction,
                                        isReceived,
                                        formattedTime: new Date(transaction.createdAt).toLocaleTimeString(),
                                        timestamp: new Date(transaction.createdAt).getTime()
                                    });
                                    return groups;
                                }, {} as Record<string, any[]>)
                            )
                                .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                                .map(([date, dateTransactions]) => (
                                    <div key={date} className="customer-statements-date-group">
                                        {dateTransactions
                                            .sort((a, b) => b.timestamp - a.timestamp)
                                            .map((transaction) => (
                                                <div
                                                    key={transaction.id}
                                                    className="customer-statements-transaction-card"
                                                    onClick={() => handleTransactionClick(transaction)}
                                                >
                                                    <div className="customer-statements-transaction-info">
                                                        <div className="customer-statements-transaction-row">
                                                            <div className="customer-statements-transaction-label">Payment Type:</div>
                                                            <div className="customer-statements-transaction-value">
                                                                {transaction.isReceived ? (
                                                                    <span className="customer-statements-payment-in">Payment In ({transaction.paymentType})</span>
                                                                ) : (
                                                                    <span className="customer-statements-payment-out">Payment Out ({transaction.paymentType})</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="customer-statements-transaction-row">
                                                            <div className="customer-statements-transaction-label">Date/Time:</div>
                                                            <div className="customer-statements-transaction-value">
                                                                <i className="bi bi-clock me-1"></i>
                                                                {formatDate(transaction.createdAt)} {transaction.formattedTime}
                                                            </div>
                                                        </div>
                                                        <div className="customer-statements-transaction-row">
                                                            <div className="customer-statements-transaction-label">Remarks:</div>
                                                            <div className="customer-statements-transaction-value">
                                                                <i className="bi bi-chat-text me-1"></i>
                                                                {transaction.remarks || '-'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="customer-statements-transaction-amounts">
                                                        <div className={`customer-statements-current-amount ${!transaction.isReceived ? 'customer-statements-current-amount-red' : ''}`}>
                                                            {formatCurrency(Math.abs(transaction.amount))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                {/* 5. Sleek Fixed Bottom Action Bar */}
                <div className="statements-bottom-bar">
                    <button
                        type="button"
                        className="btn-bottom-gave"
                        onClick={() => setShowPopup(true)}
                    >
                        <i className="bi bi-arrow-up-circle"></i>
                        You Gave
                    </button>

                    <button
                        type="button"
                        className="btn-bottom-received"
                        onClick={() => setShowReceivedPopup(true)}
                    >
                        <i className="bi bi-arrow-down-circle"></i>
                        You Received
                    </button>
                </div>

                {/* Modal: You Gave */}
                {showPopup && (
                    <div className="popup-overlay" onClick={() => setShowPopup(false)}>
                        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                            <div className="popup-title-container">
                                <h2 className="popup-title">
                                    <i className="bi bi-arrow-up-circle me-2"></i>
                                    You Gave
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
                                    <i className="bi bi-arrow-down-circle me-2"></i>
                                    You Received
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