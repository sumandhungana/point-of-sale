import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getPaymentHistory, PaymentHistory } from '../services/paymentService';
import { fetchSingleCustomerData } from '../services/customerService';
import { toast } from 'react-toastify';
import '../styles/CustomerStatements.css';
import { YouGave } from './YouGave';
import { YouReceived } from './YouReceived';
import { resolveImageSrc } from '../utils/imageResolver';

interface CustomerData {
    id: number;
    customer_id?: number;
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
    paymentHistory: PaymentHistory[];
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
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
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
            const actualId = stateCust.id ?? stateCust.customer_id ?? numericUrlId;
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
                        const actualId = data.id ?? data.customer_id ?? numericUrlId;
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

    const calculateTotals = (history: PaymentHistory[]) => {
        const result = history.reduce((acc, payment) => {
            const t = (payment.type || '').toLowerCase();
            if (t === 'given' || t === 'payment_out' || t === 'you_gave') {
                acc.given += payment.amount;
            } else if (t === 'received' || t === 'payment_in' || t === 'you_received') {
                acc.received += payment.amount;
            }
            return acc;
        }, { given: 0, received: 0 });

        return {
            given: Math.max(result.given - result.received, 0),
            received: Math.max(result.received - result.given, 0)
        };
    };

    const totals = calculateTotals(paymentHistory);

    useEffect(() => {
        const fetchPaymentHistory = async () => {
            const targetId = numericUrlId || customerData.id || customerData.customer_id;
            if (!targetId) return;

            try {
                const history = await getPaymentHistory(targetId);
                setPaymentHistory(Array.isArray(history) ? history : []);
            } catch (error) {
                console.error('Error fetching payment history:', error);
                toast.error('Failed to fetch payment history');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPaymentHistory();
    }, [numericUrlId, customerData.id, customerData.customer_id]);

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
        const targetId = (isValidUrlId ? id : null) || customerData.id || customerData.customer_id;

        if (!targetId || targetId === 'undefined' || targetId === 0) {
            toast.error('Customer ID not available');
            return;
        }

        navigate(`/parties/customers/profile/${targetId}`, {
            state: { customer: customerData }
        });
    };

    const handleTransactionClick = (transaction: any) => {
        const activeCustId = customerData.id || numericUrlId;
        navigate(`/parties/customers/statement/${transaction.id}`, {
            state: {
                transaction: {
                    customerName: customerData.name || 'Customer',
                    date: transaction.date,
                    totalAmount: Math.abs(transaction.amount),
                    phoneNumber: customerData.phone,
                    type: transaction.type,
                    customerId: activeCustId,
                    details: `${transaction.type === 'payment_in' ? 'Payment Received' : 'Payment Given'} - ${new Date(transaction.date).toLocaleDateString()}`,
                    remarks: transaction.remarks,
                    sms: `Dear ${customerData.name || 'Customer'}, your payment of रु${Math.abs(transaction.amount)} has been ${transaction.type === 'payment_in' ? 'received' : 'processed'}. Current balance: रु${transaction.currentBalance}. Thank you for your business.`
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
        const targetId = numericUrlId || customerData.id || customerData.customer_id;
        if (!targetId) return;

        if (!reminderDate) {
            toast.error("Please select a reminder date.");
            return;
        }
        try {
            const response = await fetch(`/api/v1/customer/${targetId}`, {
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
        const targetId = numericUrlId || customerData.id || customerData.customer_id;
        navigate(`/parties/customers/statements/report/${targetId}`, {
            state: {
                customer: customerData,
                paymentHistory,
                totals
            }
        });
    };

    const activeId = numericUrlId || customerData.id || customerData.customer_id;
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
                                    const date = new Date(transaction.date).toISOString().split('T')[0];
                                    const rawType = (transaction.type || '').toLowerCase();
                                    const type = rawType === 'given' || rawType === 'payment_out' || rawType === 'you_gave' ? 'payment_out' : 'payment_in';
                                    if (!groups[date]) groups[date] = [];
                                    groups[date].push({
                                        id: transaction.id,
                                        type,
                                        date: transaction.date,
                                        amount: transaction.amount,
                                        oldBalance: transaction.oldBalance,
                                        currentBalance: transaction.newBalance,
                                        remarks: transaction.remarks,
                                        time: new Date(transaction.createdAt).toLocaleTimeString(),
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
                                            .map(transaction => (
                                                <div
                                                    key={transaction.id}
                                                    className="customer-statements-transaction-card"
                                                    onClick={() => handleTransactionClick(transaction)}
                                                >
                                                    <div className="customer-statements-transaction-info">
                                                        <div className="customer-statements-transaction-row">
                                                            <div className="customer-statements-transaction-label">Payment Type:</div>
                                                            <div className="customer-statements-transaction-value">
                                                                {transaction.type === 'payment_in' ? (
                                                                    <span className="customer-statements-payment-in">Payment In</span>
                                                                ) : (
                                                                    <span className="customer-statements-payment-out">Payment Out</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="customer-statements-transaction-row">
                                                            <div className="customer-statements-transaction-label">Date/Time:</div>
                                                            <div className="customer-statements-transaction-value">
                                                                <i className="bi bi-clock me-1"></i>
                                                                {new Date(transaction.date).toLocaleDateString()} {transaction.time}
                                                            </div>
                                                        </div>
                                                        <div className="customer-statements-transaction-row">
                                                            <div className="customer-statements-transaction-label">Balance:</div>
                                                            <div className="customer-statements-transaction-value">
                                                                <i className="bi bi-wallet2 me-1"></i>
                                                                रु{Math.abs(transaction.amount).toLocaleString()}
                                                            </div>
                                                        </div>
                                                        <div className="customer-statements-transaction-row">
                                                            <div className="customer-statements-transaction-label">Remarks:</div>
                                                            <div className="customer-statements-transaction-value">
                                                                <i className="bi bi-chat-text me-1"></i>
                                                                {transaction.remarks}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="customer-statements-transaction-amounts">
                                                        <div className={`customer-statements-current-amount ${transaction.type === 'payment_out' ? 'customer-statements-current-amount-red' : ''}`}>
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
                                    <YouGave />
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
                                    <YouReceived />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};