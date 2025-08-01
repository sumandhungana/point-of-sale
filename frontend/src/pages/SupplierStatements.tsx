import React, { useState, useRef, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { getPaymentHistory, PaymentHistory } from '../services/paymentService';
import { toast } from 'react-toastify';
import './SupplierStatements.css';

export const SupplierStatements = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [reminderDate, setReminderDate] = useState<string>('');
    const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
    const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const datePickerRef = useRef<HTMLDivElement>(null);
    
    // Demo supplier data - in a real app, this would come from an API
    const supplierData = {
        name: 'John Doe',
        phoneNumber: '+1 (555) 123-4567',
        profileImage: null,
        receivedAmount: 15000,
        contactPerson: 'Jane Smith'
    };

    useEffect(() => {
        const fetchPaymentHistory = async () => {
            try {
                if (!id) return;
                const history = await getPaymentHistory(parseInt(id));
                setPaymentHistory(history);
                setIsLoading(false);
            } catch (error) {
                toast.error('Failed to fetch payment history');
                setIsLoading(false);
            }
        };

        fetchPaymentHistory();
    }, [id]);

    // Group transactions by type and date
    const groupedTransactions = paymentHistory.reduce((groups, transaction) => {
        const date = new Date(transaction.date).toISOString().split('T')[0];
        const type = transaction.type === 'Given' ? 'payment_out' : 'payment_in';
        
        if (!groups[type]) {
            groups[type] = {};
        }
        if (!groups[type][date]) {
            groups[type][date] = [];
        }
        groups[type][date].push({
            id: transaction.id,
            date: date,
            type: type,
            amount: transaction.amount,
            oldBalance: transaction.oldBalance,
            currentBalance: transaction.newBalance,
            remarks: transaction.remarks,
            time: new Date(transaction.date).toLocaleTimeString()
        });
        return groups;
    }, {} as Record<string, Record<string, any[]>>);

    const handleCall = () => {
        console.log(`Calling ${supplierData.phoneNumber}`);
        window.open(`tel:${supplierData.phoneNumber.replace(/\D/g, '')}`, '_blank');
    };

    const handleBack = () => {
        navigate('/parties/suppliers');
    };

    const handleProfileClick = () => {
        navigate(`/parties/suppliers/profile/${id}`);
    };

    const handleTransactionClick = (transactionId: number) => {
        navigate(`/parties/suppliers/statement/${transactionId}`);
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReminderDate(e.target.value);
        setShowDatePicker(false);
    };

    const handleSetReminder = () => {
        console.log(`Setting reminder for date: ${reminderDate}`);
    };

    const openDatePicker = () => {
        setShowDatePicker(true);
    };

    const closeDatePicker = () => {
        setShowDatePicker(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
                setShowDatePicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleReport = () => {
        navigate(`/parties/suppliers/statements/report/${id}`);
    };

    const styles = {
        container: {
            marginLeft: '250px',
            minHeight: '100vh',
            background: '#f8f9fa',
        },
        mainContent: {
            padding: '2rem',
            marginTop: '64px',
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
        supplierName: {
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
            position: 'absolute' as const,
            right: 0,
            '&:hover': {
                background: '#218838',
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
        },
        reminderLabel: {
            fontSize: '1rem',
            color: '#495057',
            fontWeight: '500',
        },
        datePickerButton: {
            padding: '0.5rem 1rem',
            background: '#dc4c39',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            '&:hover': {
                background: '#c82333',
            },
        },
        datePickerInput: {
            display: 'none',
        },
        datePickerOverlay: {
            position: 'fixed' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
        },
        datePickerPopup: {
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            width: '300px',
            maxWidth: '90%',
        },
        datePickerHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
        },
        datePickerTitle: {
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#212529',
        },
        datePickerCloseButton: {
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: '#6c757d',
            '&:hover': {
                color: '#212529',
            },
        },
        datePickerInputVisible: {
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '1rem',
            marginBottom: '1.5rem',
        },
        datePickerActions: {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
        },
        datePickerActionButton: {
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
        },
        datePickerCancelButton: {
            background: '#6c757d',
            color: 'white',
            '&:hover': {
                background: '#5a6268',
            },
        },
        datePickerConfirmButton: {
            background: '#dc4c39',
            color: 'white',
            '&:hover': {
                background: '#c82333',
            },
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
         
            <main style={styles.mainContent} className="supplier-statements-main-content">
                <div style={styles.profileContainer}>
                    <div style={styles.profileHeader}>
                        <button 
                            style={styles.backButton} 
                            onClick={handleBack}
                            aria-label="Go back to suppliers"
                        >
                            ← Back
                        </button>
                        <div 
                            style={styles.profileImageContainer}
                            onClick={handleProfileClick}
                            title="View supplier profile"
                        >
                            {supplierData.profileImage ? (
                                <img 
                                    src={supplierData.profileImage} 
                                    alt={supplierData.name} 
                                    style={styles.profileImage} 
                                />
                            ) : (
                                <div style={{ fontSize: '2rem', color: '#adb5bd' }}>👤</div>
                            )}
                        </div>
                        <button 
                            style={styles.callButton} 
                            onClick={handleCall}
                            aria-label={`Call ${supplierData.name}`}
                            title={supplierData.phoneNumber}
                        >
                            📞 Call
                        </button>
                    </div>
                    <div 
                        style={styles.supplierName}
                        onClick={handleProfileClick}
                        title="View supplier profile"
                    >
                        {supplierData.name}
                    </div>
                    <div style={{ color: '#6c757d', marginBottom: '0.5rem' }}>
                        Contact: {supplierData.contactPerson}
                    </div>
                </div>

                <div style={styles.amountCard}>
                    <div style={styles.amountRow}>
                        <div style={styles.amountItem}>
                            <div style={styles.amountLabel}>You Received Amount</div>
                            <div style={styles.amountValue}>रु{supplierData.receivedAmount.toLocaleString()}</div>
                        </div>
                        <div style={styles.amountItem}>
                            <div style={styles.amountLabel}>The Amount</div>
                            <div style={styles.amountValue}>रु{supplierData.receivedAmount.toLocaleString()}</div>
                        </div>
                    </div>
                    <div style={styles.reminderRow}>
                        <div style={styles.reminderLabel}>Set Date Reminder</div>
                        <div>
                            <input 
                                type="date" 
                                id="reminderDate" 
                                value={reminderDate} 
                                onChange={handleDateChange}
                                style={styles.datePickerInput}
                            />
                            <button 
                                style={styles.datePickerButton}
                                onClick={openDatePicker}
                            >
                                📅 {reminderDate ? new Date(reminderDate).toLocaleDateString() : 'Select Date'}
                            </button>
                        </div>
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
                        <>
                            {/* Payment In Section */}
                            <div style={styles.transactionSection}>
                                <h4 style={styles.sectionTitle}>Payment In</h4>
                                {Object.entries(groupedTransactions['payment_in'] || {}).map(([date, dateTransactions]) => (
                                    <div key={date} style={styles.dateGroup}>
                                        <div style={styles.dateLabel}>
                                            {new Date(date).toLocaleDateString('en-US', { 
                                                weekday: 'long', 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </div>
                                        {dateTransactions.map(transaction => (
                                            <div 
                                                key={transaction.id} 
                                                style={styles.transactionCard}
                                                onClick={() => handleTransactionClick(transaction.id)}
                                            >
                                                <div style={styles.transactionInfo}>
                                                    <div style={styles.transactionRow}>
                                                        <div style={styles.transactionLabel}>Payment Type:</div>
                                                        <div style={{
                                                            ...styles.transactionValue,
                                                            ...styles.paymentIn
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
                                                    <div style={styles.oldAmount}>
                                                        रु{transaction.oldBalance.toLocaleString()}
                                                    </div>
                                                    <div style={styles.currentAmount}>
                                                        रु{transaction.currentBalance.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            {/* Payment Out Section */}
                            <div style={styles.transactionSection}>
                                <h4 style={styles.sectionTitle}>Payment Out</h4>
                                {Object.entries(groupedTransactions['payment_out'] || {}).map(([date, dateTransactions]) => (
                                    <div key={date} style={styles.dateGroup}>
                                        <div style={styles.dateLabel}>
                                            {new Date(date).toLocaleDateString('en-US', { 
                                                weekday: 'long', 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </div>
                                        {dateTransactions.map(transaction => (
                                            <div 
                                                key={transaction.id} 
                                                style={styles.transactionCard}
                                                onClick={() => handleTransactionClick(transaction.id)}
                                            >
                                                <div style={styles.transactionInfo}>
                                                    <div style={styles.transactionRow}>
                                                        <div style={styles.transactionLabel}>Payment Type:</div>
                                                        <div style={{
                                                            ...styles.transactionValue,
                                                            ...styles.paymentOut
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
                                                    <div style={styles.oldAmount}>
                                                        रु{transaction.oldBalance.toLocaleString()}
                                                    </div>
                                                    <div style={styles.currentAmount}>
                                                        रु{transaction.currentBalance.toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))} 
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div style={styles.actionButtonsContainer} className="supplier-statements-action-buttons">
                    <button 
                        style={{...styles.actionButton, ...styles.giveButton}} 
                        className="supplier-statements-action-button supplier-statements-give-button"
                        onClick={() => navigate(`/parties/customers/statements/you-gave/${id}`)}
                    >
                        💸 You Gave
                    </button>
                    <button 
                        style={{...styles.actionButton, ...styles.receiveButton}} 
                        className="supplier-statements-action-button supplier-statements-receive-button"
                        onClick={() => navigate(`/parties/customers/statements/you-received/${id}`)}
                    >
                        💰 You Received
                    </button>
                </div>
            </main>

            {showDatePicker && (
                <div style={styles.datePickerOverlay}>
                    <div style={styles.datePickerPopup} ref={datePickerRef}>
                        <div style={styles.datePickerHeader}>
                            <div style={styles.datePickerTitle}>Select Date</div>
                            <button 
                                style={styles.datePickerCloseButton}
                                onClick={closeDatePicker}
                            >
                                ×
                            </button>
                        </div>
                        <input 
                            type="date" 
                            value={reminderDate} 
                            onChange={handleDateChange}
                            style={styles.datePickerInputVisible}
                        />
                        <div style={styles.datePickerActions}>
                            <button 
                                style={{...styles.datePickerActionButton, ...styles.datePickerCancelButton}}
                                onClick={closeDatePicker}
                            >
                                Cancel
                            </button>
                            <button 
                                style={{...styles.datePickerActionButton, ...styles.datePickerConfirmButton}}
                                onClick={() => {
                                    handleSetReminder();
                                    closeDatePicker();
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 