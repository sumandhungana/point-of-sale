import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getPaymentHistory, PaymentHistory } from '../services/paymentService';
import { toast } from 'react-toastify';
import '../styles/CustomerStatements.css';


interface CustomerData {
    id: number;
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
}

export const CustomerStatements = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const [reminderDate, setReminderDate] = useState<string>('');
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [customerData, setCustomerData] = useState<CustomerData>({
        id: 0,
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
        paymentHistory: []
    });
    const [customerLoading, setCustomerLoading] = useState(true);

    // Debug: Log the received data
    console.log('CustomerStatements - Received customer data:', customerData);
    console.log('CustomerStatements - Location state:', location.state);
    console.log('CustomerStatements - Customer ID from params:', id);

    // Set customer data from location state when component mounts
    useEffect(() => {
        if (location.state?.customer) {
            setCustomerData(location.state.customer as CustomerData);
            setCustomerLoading(false);
            console.log('Customer data set from location state:', location.state.customer);
        } else if (id) {
            // If no location state, try to fetch customer data from API
            const fetchCustomerData = async () => {
                try {
                    const response = await fetch(`/api/Customer/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        }
                    });
                    if (response.ok) {
                        const customer = await response.json();
                        setCustomerData({
                            id: customer.id,
                            name: customer.name,
                            phone: customer.phone,
                            email: customer.email,
                            address: customer.address,
                            company: customer.company,
                            pan: customer.pan,
                            contactPerson: customer.contactPerson,
                            isSupplier: customer.isSupplier,
                            createdAt: customer.createdAt,
                            updatedAt: customer.updatedAt,
                            bankAccount: customer.bankAccount,
                            cashBalance: customer.cashBalance,
                            profileImage: customer.profileImage,
                            customerSmsSetting: customer.customerSmsSetting,
                            smsLanguage: customer.smsLanguage,
                            transactionHistoryCheck: customer.transactionHistoryCheck,
                            paymentHistory: []
                        });
                        setCustomerLoading(false);
                        console.log('Customer data fetched from API:', customer);
                    }
                } catch (error) {
                    console.error('Error fetching customer data:', error);
                    setCustomerLoading(false);
                }
            };
            fetchCustomerData();
        } else {
            setCustomerLoading(false);
        }
    }, [location.state, id]);

    // Calculate totals from payment history
    const calculateTotals = (history: PaymentHistory[]) => {
        return paymentHistory.reduce((acc, payment) => {
            if (payment.type === 'Given') {
                acc.given += Math.abs(payment.oldBalance - payment.newBalance);
            } else if (payment.type === 'Received') {
                acc.received += Math.abs(payment.oldBalance - payment.newBalance);
            }
            return acc;
        }, { given: 0, received: 0 });
    };
    const totals = calculateTotals(customerData.paymentHistory);

    useEffect(() => {
        const fetchPaymentHistory = async () => {
            try {
                if (!id) {
                    console.error('No customer ID provided');
                    navigate('/parties/customers');
                    return;
                }
                
                const history = await getPaymentHistory(parseInt(id));
                setPaymentHistory(history);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching payment history:', error);
                toast.error('Failed to fetch payment history');
                setIsLoading(false);
            }
        };

        fetchPaymentHistory();
    }, [id, navigate]);

    // Group transactions by type and date
    const groupedTransactions = paymentHistory.reduce((groups, transaction) => {
        const date = new Date(transaction.date).toISOString().split('T')[0];
        const type = transaction.type === 'Given' ? 'payment_out' : 'payment_in';
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push({
            id: transaction.id,
            date: date,
            type: type,
            amount: transaction.amount,
            oldBalance: transaction.oldBalance,
            currentBalance: transaction.newBalance,
            remarks: transaction.remarks,
            time: new Date(transaction.createdAt).toLocaleTimeString(),
            timestamp: new Date(transaction.createdAt).getTime()
        });
        return groups;
    }, {} as Record<string, any[]>);

    const handleCall = () => {
        if (!customerData.phone) {
            toast.error('No phone number available');
            return;
        }
        console.log(`Calling ${customerData.phone}`);
        window.open(`tel:${customerData.phone.replace(/\D/g, '')}`, '_blank');
    };

    const handleBack = () => {
        // Navigate back to the customers page
        navigate(-1);
    };

    const handleProfileClick = () => {
        if (!customerData.id) {
            toast.error('Customer data not available');
            return;
        }
        
        navigate(`/parties/customers/profile/${id}`, {
            state: {
                customer: {
                    id: customerData.id,
                    name: customerData.name || 'Customer',
                    phone: customerData.phone,
                    email: customerData.email,
                    address: customerData.address,
                    company: customerData.company,
                    pan: customerData.pan,
                    contactPerson: customerData.contactPerson,
                    isSupplier: customerData.isSupplier,
                    createdAt: customerData.createdAt,
                    updatedAt: customerData.updatedAt,
                    bankAccount: customerData.bankAccount,
                    cashBalance: customerData.cashBalance,
                    profileImage: customerData.profileImage,
                    customerSmsSetting: customerData.customerSmsSetting,
                    smsLanguage: customerData.smsLanguage,
                    transactionHistoryCheck: customerData.transactionHistoryCheck
                }
            }
        });
    };

    const handleTransactionClick = (transaction: any) => {
        navigate(`/parties/customers/statement/${transaction.id}`, {
            state: {
                transaction: {
                    customerName: customerData.name || 'Customer',
                    date: transaction.date,
                    totalAmount: Math.abs(transaction.amount),
                    phoneNumber: customerData.phone,
                    type: transaction.type,
                    customerId: customerData.id,
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

    const handleSetReminder = () => {
        // Handle setting the reminder with the selected date
        console.log(`Setting reminder for date: ${reminderDate}`);
    };

    const handleReport = () => {
        navigate(`/parties/customers/statements/report/${id}`, {
            state: {
                customer: customerData,
                paymentHistory: paymentHistory,
                totals: totals
            }
        });
    };

    const styles = {
        container: {
            minHeight: '100vh',
            background: '#f8f9fa',
        },
        profileContainer: {
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            marginBottom: '2rem',
        },
        profileHeader: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            marginBottom: '1rem',
            position: 'relative' as const,
        },
        buttonContainer: {
            position: 'absolute' as const,
            right: 0,
            display: 'flex',
            gap: '0.5rem',
        },
        backButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            position: 'absolute' as const,
            left: 0,
            '&:hover': {
                background: '#5a6268',
            },
        },
        profileImageContainer: {
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '3px solid #dc4c39',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#e9ecef',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            },
        },
        profileImage: {
            width: '100%',
            height: '100%',
            objectFit: 'cover' as const,
        },
        customerName: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#212529',
            marginBottom: '0.5rem',
            textAlign: 'center' as const,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
                color: '#dc4c39',
            },
        },
        callButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
                background: '#218838',
            },
        },
        depositButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            '&:hover': {
                background: '#5a32a3',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            },
        },
        amountCard: {
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '2rem',
        },
        amountRow: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
        },
        amountItem: {
            flex: 1,
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            margin: '0 0.5rem',
            textAlign: 'center' as const,
        },
        amountLabel: {
            fontSize: '1rem',
            color: '#6c757d',
            marginBottom: '0.5rem',
        },
        amountValue: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#28a745',
        },
        reminderRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1rem',
        },
        reminderLabel: {
            fontSize: '1rem',
            color: '#495057',
            fontWeight: '500',
        },
        dateInput: {
            padding: '0.5rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '0.875rem',
        },
        transactionsContainer: {
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            marginBottom: '2rem',
        },
        transactionsTitle: {
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#212529',
            marginBottom: '1.5rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #dee2e6',
        },
        actionButtonsContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
        },
        actionButton: {
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
        },
        giveButton: {
            background: '#dc3545',
            color: 'white',
            '&:hover': {
                background: '#c82333',
            },
        },
        receiveButton: {
            background: '#28a745',
            color: 'white',
            '&:hover': {
                background: '#218838',
            },
        },
        dateGroup: {
            marginBottom: '2rem',
        },
        dateLabel: {
            textAlign: 'center' as const,
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#495057',
            marginBottom: '1rem',
            padding: '0.5rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
        },
        transactionCard: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            marginBottom: '1rem',
            backgroundColor: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                transform: 'translateY(-2px)',
            },
        },
        transactionInfo: {
            flex: 1,
        },
        transactionRow: {
            display: 'flex',
            marginBottom: '0.5rem',
        },
        transactionLabel: {
            width: '120px',
            fontSize: '0.875rem',
            color: '#6c757d',
            fontWeight: '500',
        },
        transactionValue: {
            fontSize: '0.875rem',
            color: '#212529',
        },
        transactionAmounts: {
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'center',
            alignItems: 'center',
            padding: '0 1rem',
            borderLeft: '1px solid #dee2e6',
        },
        oldAmount: {
            fontSize: '0.875rem',
            color: '#6c757d',
            marginBottom: '0.5rem',
            padding: '0.25rem 0.5rem',
            border: '1px dashed #ced4da',
            borderRadius: '4px',
        },
        currentAmount: {
            fontSize: '1rem',
            fontWeight: 'bold',
            color: '#28a745',
            padding: '0.25rem 0.5rem',
            border: '1px solid #28a745',
            borderRadius: '4px',
        },
        currentAmountRed: {
            color: '#dc3545',
            border: '1px solid #dc3545',
        },
        currentAmountRedNoBorder: {
            color: '#dc3545',
        },
        paymentIn: {
            color: '#28a745',
        },
        paymentOut: {
            color: '#dc3545',
        },
        statementsContainer: {
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        statementsTitle: {
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#212529',
            marginBottom: '1.5rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #dee2e6',
        },
        noStatements: {
            textAlign: 'center' as const,
            padding: '2rem',
            color: '#6c757d',
            fontSize: '1rem',
        },
        actionButtonsRow: {
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '2rem',
        },
        reportButton: {
            background: '#17a2b8',
            color: 'white',
            '&:hover': {
                background: '#138496',
            },
        },
        reminderButton: {
            background: '#ffc107',
            color: '#212529',
            '&:hover': {
                background: '#e0a800',
            },
        },
        smsButton: {
            background: '#6f42c1',
            color: 'white',
            '&:hover': {
                background: '#5a32a3',
            },
        },
        transactionSection: {
            marginBottom: '2rem',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
        },
        sectionTitle: {
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: '#212529',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '2px solid #dee2e6',
        },
    };

    return (
        <div style={{minHeight: '100vh', background: '#f8f9fa'}}>
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
                                {customerData.profileImage ? (
                                    <img 
                                        src={customerData.profileImage} 
                                        alt={customerData.name || 'Customer'} 
                                        className="customer-statements-profile-image"
                                    />
                                ) : (
                                    <div style={{ fontSize: '2.5rem', color: 'white' }}>
                                        <i className="bi bi-person"></i>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="customer-statements-header-right">
                            <button 
                                className="btn-base btn-primary"
                                onClick={() => navigate(`/parties/customers/deposit/${id}`)}
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
                            <div className="customer-statements-amount-value">
                                रु{(totals.given - totals.received < 0 ? 0 : totals.given - totals.received).toLocaleString()}
                            </div>
                        </div>
                        <div className="customer-statements-amount-item">
                            <div className="customer-statements-amount-label">
                                <i className="bi bi-arrow-down-circle me-2"></i>
                                You Receive
                            </div>
                            <div className="customer-statements-amount-value">
                                रु{(totals.received - totals.given < 0 ? 0 : totals.received - totals.given).toLocaleString()}
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
                    <button className="btn-base btn-warning">
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
                            {Object.entries(groupedTransactions)
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
                                                        रु{transaction.oldBalance.toLocaleString()}
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

                <div className="customer-statements-bottom-row">
                    <button
                        className="btn-base btn-red"
                        onClick={() => navigate(`/parties/customers/statements/you-gave/${id}`)}
                        style={{backgroundColor: 'red', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px'}}
                    >
                        <i className="bi bi-arrow-up-circle"></i>
                        You Gave
                    </button>
                    <button
                        className="btn-base btn-green"
                        onClick={() => navigate(`/parties/customers/statements/you-received/${id}`)}
                        style={{backgroundColor: 'green', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px'}}
                    >
                        <i className="bi bi-arrow-down-circle"></i>
                        You Received
                    </button>
                </div>

             
            </main>
        </div>
    );
}; 