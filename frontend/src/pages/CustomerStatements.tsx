import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { getPaymentHistory, PaymentHistory } from '../services/paymentService';
import { toast } from 'react-toastify';
import './CustomerStatements.css';

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
        
        mainContent: {
            padding: '2rem',
            maxWidth: 'calc(100% - 500px)',
            marginRight: '500px',
            width: '100%',
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
        <div style={styles.container}>
            <Sidebar />
         
            <main style={styles.mainContent} className="customer-statements-main-content">
                <div style={styles.profileContainer}>
                    <div style={styles.profileHeader}>
                        <button 
                            style={styles.backButton} 
                            onClick={handleBack}
                            aria-label="Go back to customers"
                        >
                            ← Back
                        </button>
                        <div 
                            style={styles.profileImageContainer}
                            onClick={handleProfileClick}
                            title="View customer profile"
                        >
                            {customerData.profileImage ? (
                                <img 
                                    src={customerData.profileImage} 
                                    alt={customerData.name || 'Customer'} 
                                    style={styles.profileImage} 
                                />
                            ) : (
                                <div style={{ fontSize: '2rem', color: '#adb5bd' }}>👤</div>
                            )}
                        </div>
                        <div style={styles.buttonContainer}>
                            <button 
                                style={styles.depositButton}
                                onClick={() => navigate(`/parties/customers/deposit/${id}`)}
                                aria-label="Make a deposit"
                                title="Make a deposit"
                            >
                                💰 Deposit
                            </button>
                            <button 
                                style={styles.callButton} 
                                onClick={handleCall}
                                aria-label={`Call ${customerData.name || 'Customer'}`}
                                title={customerData.phone || 'No phone number available'}
                            >
                                📞 Call
                            </button>
                        </div>
                    </div>
                    <div 
                        style={styles.customerName}
                        onClick={handleProfileClick}
                        title="View customer profile"
                    >
                        {customerLoading ? 'Loading...' : customerData.name || 'Customer'}
                    </div>
                </div>

                <div style={styles.amountCard}>
                    <div style={styles.amountRow}>
                        <div style={styles.amountItem}>
                            <div style={styles.amountLabel}>You Received Amount</div>
                            <div style={{
                                ...styles.amountValue,
                                color: (totals.received - totals.given < 0 ? 0 : totals.received - totals.given) === 0 ? '#212529' : 
                                      (totals.received - totals.given < 0 ? 0 : totals.received - totals.given) > 0 ? '#28a745' : '#dc3545'
                            }}>
                                रु{totals.received - totals.given < 0 ? 0 : totals.received - totals.given}
                            </div>
                        </div>
                        <div style={styles.amountItem}>
                            <div style={styles.amountLabel}>You Gave Amount</div>
                            <div style={{
                                ...styles.amountValue,
                                color: (totals.given - totals.received < 0 ? 0 : totals.given - totals.received) === 0 ? '#212529' : 
                                      (totals.given - totals.received < 0 ? 0 : totals.given - totals.received) > 0 ? '#28a745' : '#dc3545'
                            }}>
                                रु{totals.given - totals.received < 0 ? 0 : totals.given - totals.received}
                            </div>
                        </div>
                    </div>
                    <div style={styles.reminderRow}>
                        <div style={styles.reminderLabel}>Set Date Reminder</div>
                        <input 
                            type="date" 
                            value={reminderDate} 
                            onChange={handleDateChange}
                            style={styles.dateInput}
                        />
                    </div>
                </div>

                <div style={styles.actionButtonsRow}>
                    <button style={{...styles.actionButton, ...styles.reportButton}} onClick={handleReport}>
                        📊 Report
                    </button>
                    <button style={{...styles.actionButton, ...styles.reminderButton}}>
                        ⏰ Reminder
                    </button>
                    <button style={{...styles.actionButton, ...styles.smsButton}}>
                        💬 SMS
                    </button>
                </div>

                <div style={styles.transactionsContainer}>
                    <h3 style={styles.transactionsTitle}>Recent Transactions</h3>
                    
                    {isLoading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            Loading transactions...
                        </div>
                    ) : paymentHistory.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            No transactions found
                        </div>
                    ) : (
                        <div style={styles.transactionSection}>
                            {Object.entries(groupedTransactions)
                                .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
                                .map(([date, dateTransactions]) => (
                                <div key={date} style={styles.dateGroup}>
                                    <div style={styles.dateLabel}>
                                        {new Date(date).toLocaleDateString('en-US', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </div>
                                    {dateTransactions
                                        .sort((a, b) => b.timestamp - a.timestamp)
                                        .map(transaction => (
                                        <div 
                                            key={transaction.id} 
                                            style={styles.transactionCard}
                                            onClick={() => handleTransactionClick(transaction)}
                                        >
                                            <div style={styles.transactionInfo}>
                                                <div style={styles.transactionRow}>
                                                    <div style={styles.transactionLabel}>Payment Type:</div>
                                                    <div style={{
                                                        ...styles.transactionValue,
                                                        ...(transaction.type === 'payment_in' ? styles.paymentIn : styles.paymentOut)
                                                    }}>
                                                        {transaction.type === 'payment_in' ? 'Payment In' : 'Payment Out'}
                                                    </div>
                                                </div>
                                                <div style={styles.transactionRow}>
                                                    <div style={styles.transactionLabel}>Date/Time:</div>
                                                    <div style={styles.transactionValue}>
                                                        {new Date(transaction.date).toLocaleDateString()} {transaction.time}
                                                    </div>
                                                </div>
                                                <div style={styles.transactionRow}>
                                                    <div style={styles.transactionLabel}>Balance:</div>
                                                    <div style={styles.transactionValue}>
                                                        रु{transaction.oldBalance.toLocaleString()}
                                                    </div>
                                                </div>
                                                <div style={styles.transactionRow}>
                                                    <div style={styles.transactionLabel}>Remarks:</div>
                                                    <div style={styles.transactionValue}>
                                                        {transaction.remarks}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={styles.transactionAmounts}>
                                                <div style={{
                                                    ...styles.currentAmount,
                                                    ...(transaction.type === 'payment_out' ? styles.currentAmountRed : {})
                                                }}>
                                                    रू {Math.abs(transaction.amount)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={styles.actionButtonsContainer} className="customer-statements-action-buttons">
                        <button 
                            style={{...styles.actionButton, ...styles.giveButton}} 
                            className="customer-statements-action-button customer-statements-give-button"
                            onClick={() => navigate(`/parties/customers/statements/you-gave/${id}`)}
                        >
                            💸 You Gave
                        </button>
                        <button 
                            style={{...styles.actionButton, ...styles.receiveButton}} 
                            className="customer-statements-action-button customer-statements-receive-button"
                            onClick={() => navigate(`/parties/customers/statements/you-received/${id}`)}
                        >
                            💰 You Received
                        </button>
                </div>

             
            </main>
        </div>
    );
}; 