import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getPaymentList, GetPaymentResponse } from '@/features/services/paymentService';
import { fetchSingleCustomerData } from '@/features/services/customerService';
import { toast } from 'react-toastify';
import '../../../styles/CustomerStatements.css';
import { YouGave } from '../components/YouGave';
import { YouReceived } from '../components/YouReceived';
import { resolveImageSrc } from '@/utils/ImageResolver';

interface CustomerData {
    id: number;
    customerId?: number;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    company: string | null;
    pan: string | null;
    contactPerson: string | null;
    isSupplier: boolean;
    createdAt: string;
    updatedAt: string;
    bankAccount: string | null;
    cashBalance: number;
    profileImage: string | null;
    customerSmsSetting: boolean;
    smsLanguage: boolean;
    transactionHistoryCheck: boolean;
    paymentHistory: GetPaymentResponse[];
    paymentDateReminder: string | null;
}

/**
 * Avatar that validates the resolved image before rendering it.
 * Shows a person icon if the image is missing or fails to load.
 */
const CustomerAvatar = ({ name, imageSrc }: { name?: string; imageSrc: string }) => {
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

    if (status !== 'ok') {
        return (
            <div
                style={{
                    fontSize: '2.5rem',
                    color: '#6c757d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                }}
            >
                <i className="bi bi-person"></i>
            </div>
        );
    }

    return (
        <img
            src={imageSrc}
            alt={name || 'Customer'}
            className="customer-statements-profile-image"
            style={{ objectFit: 'cover', display: 'block', width: '100%', height: '100%' }}
        />
    );
};

export const CustomerStatements = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();

    const isValidUrlId = Boolean(id && id !== 'undefined' && !isNaN(Number(id)));
    const numericUrlId = isValidUrlId ? parseInt(id!, 10) : 0;

    const [reminderDate, setReminderDate] = useState<string>('');
    const [paymentHistory, setPaymentHistory] = useState<GetPaymentResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [showReceivedPopup, setShowReceivedPopup] = useState(false);
    const [showBottomButtons, setShowBottomButtons] = useState(false);

    const [customerData, setCustomerData] = useState<CustomerData>({
        id: numericUrlId,
        name: '',
        phone: null,
        email: null,
        address: null,
        company: null,
        pan: null,
        contactPerson: null,
        isSupplier: false,
        createdAt: '',
        updatedAt: '',
        bankAccount: null,
        cashBalance: 0,
        profileImage: null,
        customerSmsSetting: false,
        smsLanguage: false,
        transactionHistoryCheck: false,
        paymentHistory: [],
        paymentDateReminder: null
    });
    const [customerLoading, setCustomerLoading] = useState(true);

    const activeId = numericUrlId || customerData.id || customerData.customerId || 0;
    console.log("adctive i" + activeId)
    useEffect(() => {
        const handleScroll = () => {
            const cards = document.querySelectorAll(".customer-statements-transaction-card");
            if (cards.length === 0) {
                setShowBottomButtons(true);
                return;
            }
            const fourthLastCard = cards[Math.max(0, cards.length - 4)];
            const rect = fourthLastCard.getBoundingClientRect();
            setShowBottomButtons(rect.top < window.innerHeight);
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (location.state?.customer) {
            const stateCust = location.state.customer;
            const actualId = stateCust.id ?? stateCust.customerId ?? numericUrlId;
            setCustomerData({
                ...stateCust,
                id: Number(actualId)
            });
            setCustomerLoading(false);
        } else if (isValidUrlId) {
            const loadCustomer = async () => {
                try {
                    const data: any = await fetchSingleCustomerData(id!);
                    if (data) {
                        const actualId = data.id ?? data.customerId ?? numericUrlId;
                        setCustomerData({
                            id: Number(actualId),
                            name: data.name || '',
                            phone: data.phone || null,
                            email: data.email || null,
                            address: data.address || null,
                            company: data.company || null,
                            pan: data.pan || null,
                            contactPerson: data.contactPerson || null,
                            isSupplier: Boolean(data.isSupplier),
                            createdAt: data.createdAt || '',
                            updatedAt: data.updatedAt || '',
                            bankAccount: data.bankAccount || null,
                            cashBalance: data.cashBalance || 0,
                            profileImage: data.profileImage || null,
                            customerSmsSetting: Boolean(data.customerSmsSetting),
                            smsLanguage: Boolean(data.smsLanguage),
                            transactionHistoryCheck: Boolean(data.transactionHistoryCheck),
                            paymentHistory: [],
                            paymentDateReminder: data.paymentDateReminder || null
                        });
                    }
                } catch (error) {
                    console.error('Error fetching customer data:', error);
                    toast.error('Failed to load customer details');
                } finally {
                    setCustomerLoading(false);
                }
            };
            loadCustomer();
        } else {
            setCustomerLoading(false);
        }
    }, [location.state, id, isValidUrlId, numericUrlId]);

    // Fetch payments using getPaymentList
    const fetchPayments = useCallback(async () => {
        if (!activeId) return;

        setIsLoading(true);
        try {
            const payments = await getPaymentList({
                paymentParty: 'CUSTOMER',
                partyId: activeId
            });
            setPaymentHistory(Array.isArray(payments) ? payments : []);
        } catch (error) {
            console.error('Error fetching payment list:', error);
            toast.error('Failed to fetch payment list');
        } finally {
            setIsLoading(false);
        }
    }, [activeId]);

    useEffect(() => {
        fetchPayments();
    }, [fetchPayments]);

    const calculateTotals = (history: GetPaymentResponse[]) => {
        const result = history.reduce((acc, payment) => {
            const category = (payment.paymentCategory || '').toUpperCase();
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
    };

    const totals = calculateTotals(paymentHistory);

    const handleCall = () => {
        if (!customerData.phone) {
            toast.error('No phone number available');
            return;
        }
        window.open(`tel:${customerData.phone.replace(/\D/g, '')}`, '_blank');
    };

    const handleBack = () => {
        navigate('/parties/customers');
    };

    const handleProfileClick = () => {
        const targetId = (isValidUrlId ? id : null) || customerData.id || customerData.customerId;

        if (!targetId || targetId === 'undefined' || targetId === 0) {
            toast.error('Customer ID not available');
            return;
        }

        navigate(`/parties/customers/profile/${targetId}`, {
            state: { customer: customerData }
        });
    };

    const handleTransactionClick = (transaction: GetPaymentResponse) => {
        const activeCustId = customerData.id || numericUrlId;
        navigate(`/parties/customers/statement/${transaction.id}`, {
            state: {
                transaction: {
                    customerName: customerData.name || 'Customer',
                    date: transaction.createdAt,
                    totalAmount: Math.abs(transaction.amount),
                    phoneNumber: customerData.phone,
                    type: transaction.paymentCategory === 'RECEIVED' ? 'payment_in' : 'payment_out',
                    customerId: activeCustId,
                    details: `${transaction.paymentCategory === 'RECEIVED' ? 'Payment Received' : 'Payment Given'} - ${new Date(transaction.createdAt).toLocaleDateString()}`,
                    remarks: transaction.remarks,
                    sms: `Dear ${customerData.name || 'Customer'}, your payment of रु${Math.abs(transaction.amount)} has been ${transaction.paymentCategory === 'RECEIVED' ? 'received' : 'processed'}. Thank you for your business.`
                }
            }
        });
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReminderDate(e.target.value);
    };

    useEffect(() => {
        if (customerData.paymentDateReminder) {
            setReminderDate(customerData.paymentDateReminder.split("T")[0]);
        } else {
            setReminderDate("");
        }
    }, [customerData.paymentDateReminder]);

    const handleSetReminder = async () => {
        if (!activeId) return;

        if (!reminderDate) {
            toast.error("Please select a reminder date.");
            return;
        }
        try {
            const response = await fetch(`/api/v1/customer/${activeId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    paymentDateReminder: reminderDate
                })
            });

            if (!response.ok) throw new Error("Failed to update reminder");

            toast.success("Reminder date updated successfully.");
            setCustomerData(prev => ({
                ...prev,
                paymentDateReminder: `${reminderDate}T00:00:00`
            }));
        } catch (error) {
            console.error(error);
            toast.error("Failed to update reminder.");
        }
    };

    const handleReport = () => {
        navigate(`/parties/customers/statements/report/${activeId}`, {
            state: {
                customer: customerData,
                paymentHistory,
                totals
            }
        });
    };

    const resolvedImage = resolveImageSrc(customerData.profileImage);

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <Sidebar />

            <main className="customer-statements-main-content">
                <div className="customer-statements-profile-container">
                    <div className="customer-statements-profile-header-grid">
                        <div className="customer-statements-header-left">
                            <button
                                className="customer-statements-back-button"
                                onClick={handleBack}
                                aria-label="Go back to customers"
                            >
                                <i className="bi bi-arrow-left"></i>
                                Back
                            </button>
                        </div>
                        <div className="customer-statements-header-center">
                            <div
                                className="customer-statements-profile-image-container"
                                onClick={handleProfileClick}
                                title="View customer profile"
                            >
                                <CustomerAvatar name={customerData.name} imageSrc={resolvedImage} />
                            </div>
                        </div>
                        <div className="customer-statements-header-right">
                            <button
                                className="btn-base btn-primary"
                                onClick={() => navigate(`/parties/customers/deposit/${activeId}`)}
                                aria-label="Make a deposit"
                                title="Make a deposit"
                            >
                                <i className="bi bi-cash-coin"></i>
                                Deposit
                            </button>
                            <button
                                className="btn-base btn-primary"
                                onClick={handleCall}
                                aria-label={`Call ${customerData.name || 'Customer'}`}
                                title={customerData.phone || 'No phone number available'}
                            >
                                <i className="bi bi-telephone"></i>
                                Call
                            </button>
                        </div>
                    </div>
                    <div
                        className="customer-statements-customer-name"
                        onClick={handleProfileClick}
                        title="View customer profile"
                    >
                        {customerLoading ? 'Loading...' : customerData.name || 'Customer'}
                    </div>
                </div>

                <div className="customer-statements-amount-card">
                    <div className="customer-statements-amount-row">
                        <div className="customer-statements-amount-item">
                            <div className="customer-statements-amount-label">
                                <i className="bi bi-arrow-up-circle me-2"></i>
                                You Gave
                            </div>
                            <div className="customer-statements-amount-value customer-statements-amount-red">
                                रु{totals.given.toLocaleString()}
                            </div>
                        </div>
                        <div className="customer-statements-amount-item">
                            <div className="customer-statements-amount-label">
                                <i className="bi bi-arrow-down-circle me-2"></i>
                                You Received
                            </div>
                            <div className="customer-statements-amount-value customer-statements-amount-green">
                                रु{totals.received.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div className="customer-statements-reminder-row">
                        <div className="customer-statements-reminder-label">
                            <i className="bi bi-calendar-event me-2"></i>
                            Set Date Reminder
                        </div>
                        <input
                            type="date"
                            value={reminderDate}
                            onChange={handleDateChange}
                            className="customer-statements-date-input"
                        />
                    </div>
                </div>

                <div className="customer-statements-action-buttons-container">
                    <button className="btn-base btn-info" onClick={handleReport}>
                        <i className="bi bi-graph-up"></i>
                        Report
                    </button>
                    <button className="btn-base btn-warning" onClick={handleSetReminder}>
                        <i className="bi bi-alarm"></i>
                        Reminder
                    </button>
                    <button className="btn-base btn-purple">
                        <i className="bi bi-chat-dots"></i>
                        SMS
                    </button>
                </div>

                <div className="customer-statements-transactions-container">
                    <h3 className="customer-statements-transactions-title">
                        <i className="bi bi-clock-history me-2"></i>
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
                                                                {new Date(transaction.createdAt).toLocaleDateString()} {transaction.formattedTime}
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
                                                        <div className={`customer-statements-current-amount ${!transaction.isReceived ? 'customer-statements-current-amount-red' : 'customer-statements-current-amount-green'}`}>
                                                            रु {Math.abs(transaction.amount).toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                <div className={`customer-statements-bottom-row ${showBottomButtons ? "show-buttons" : ""}`}>
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
                                    onClick={() => setShowPopup(false)}
                                    className="popup-close-button"
                                    aria-label="Close"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                                <div className="popup-title-container">
                                    <h2 style={{ color: "red", textAlign: "center", margin: "0", padding: "0" }}>
                                        You Gave
                                    </h2>
                                </div>
                                <div className="you-gave-popup-body">
                                    <YouGave
                                        customerId={activeId}
                                        onSuccess={() => {
                                            fetchPayments();
                                            setShowPopup(false);
                                        }}
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
                                    onClick={() => setShowReceivedPopup(false)}
                                    className="popup-close-button"
                                    aria-label="Close"
                                >
                                    <i className="bi bi-x-lg"></i>
                                </button>
                                <div className="popup-title-container">
                                    <h2 style={{ color: "green", textAlign: "center", margin: "0", padding: "0" }}>
                                        You Received
                                    </h2>
                                </div>
                                <div className="you-received-popup-body">
                                    <YouReceived
                                        customerId={activeId}
                                        onSuccess={() => {
                                            fetchPayments();
                                            setShowReceivedPopup(false);
                                        }}
                                        onClose={() => setShowReceivedPopup(false)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};
