import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams } from 'react-router-dom';
import { getPaymentHistory, PaymentHistory } from '../services/paymentService';
import { fetchCustomerData } from '../services/customerService';
import { toast } from 'react-toastify';

import { YouGave } from './YouGave';
import { YouReceived } from './YouReceived';

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



    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [showReceivedPopup, setShowReceivedPopup] = useState<boolean>(false);

    

    const loadSupplierData = async () => {
        if (!id) return;

        try {
            setIsLoading(true);

            const [history, supplier] = await Promise.all([
                getPaymentHistory(parseInt(id)),
                fetchCustomerData(id)
            ]);

            setPaymentHistory(history || []);

            setSupplierName(supplier?.name || '');
            setSupplierPhone(
                supplier?.phoneNumber ||
                supplier?.phone ||
                ''
            );

            setSupplierContactPerson(
                supplier?.ContactPerson || ''
            );

            setSupplierProfileImage(
                supplier?.profileImage || null
            );

        } catch (err) {
            console.error('Error loading supplier:', err);
            toast.error('Failed to load supplier statements');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSupplierData();
    }, [id]);

   

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

        const given = paymentHistory
            .filter(p => {
                const t = (p.type || '').toLowerCase();

                return (
                    t === 'given' ||
                    t === 'payment_out' ||
                    t === 'you_gave'
                );
            })
            .reduce(
                (s, p) => s + p.amount,
                0
            );

        const received = paymentHistory
            .filter(p => {
                const t = (p.type || '').toLowerCase();

                return (
                    t === 'received' ||
                    t === 'payment_in' ||
                    t === 'you_received'
                );
            })
            .reduce(
                (s, p) => s + p.amount,
                0
            );

        const combinedReceived = Math.max(
            received - given,
            0
        );

        const combinedGiven = Math.max(
            given - received,
            0
        );

        return {
            given: combinedGiven,
            received: combinedReceived
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

        window.open(
            `tel:${supplierPhone.replace(/\D/g, '')}`,
            '_blank'
        );
    };

    const handleProfileClick = () => {

        if (!id) return;

        navigate(
            `/parties/supplier/profile/${id}`
        );
    };

    const handleDateChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setReminderDate(e.target.value);
    };



    const handleGaveSuccess = async () => {

        // Close popup
        setShowPopup(false);

        // Reload transactions
        await loadSupplierData();
    };

    const handleReceivedSuccess = async () => {

        // Close popup
        setShowReceivedPopup(false);

        // Reload transactions
        await loadSupplierData();
    };


    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#f8f9fa'
            }}
        >

            <Sidebar />

            <main className="supplier-statements-main-content">

                <div className="supplier-statements-profile-container">

                    <div className="supplier-statements-profile-header-grid">

                        {/* BACK BUTTON */}

                        <div className="supplier-statements-header-left">

                            <button
                                className="supplier-statements-back-button"
                                onClick={handleBack}
                            >
                                <i className="bi bi-arrow-left"></i>
                                Back
                            </button>

                        </div>

                        {/* PROFILE IMAGE */}

                        <div
                            className="supplier-statements-header-center"
                            onClick={handleProfileClick}
                            title="Open profile"
                            style={{ cursor: 'pointer' }}
                        >

                            {supplierProfileImage ? (

                                <img
                                    src={supplierProfileImage}
                                    alt={supplierName}
                                    className="supplier-statements-profile-image"
                                    onError={() =>
                                        setSupplierProfileImage(null)
                                    }
                                />

                            ) : (

                                <div className="supplier-statements-profile-image-placeholder">

                                    <i className="bi bi-person"></i>

                                </div>

                            )}

                        </div>

                        {/* CALL BUTTON */}

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

                    {/* SUPPLIER NAME */}

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

                        {/* YOU GAVE */}

                        <div className="supplier-statements-amount-item">

                            <div className="supplier-statements-amount-label">

                                <i className="bi bi-arrow-up-circle me-2"></i>

                                You Gave

                            </div>

                            <div className="supplier-statements-amount-value supplier-statements-amount-red">

                                रु{totals.given.toLocaleString()}

                            </div>

                        </div>

                        {/* YOU RECEIVED */}

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

                                // @ts-ignore
                                if (
                                    el &&
                                    typeof el.showPicker === 'function'
                                ) {
                                    el.showPicker();
                                } else {
                                    el?.click();
                                }

                            }}
                            aria-label="Select reminder date"
                            title={
                                reminderDate
                                    ? new Date(
                                        reminderDate
                                    ).toLocaleDateString()
                                    : 'Select Date'
                            }
                        >

                            <i className="bi bi-calendar2-plus"></i>

                            {reminderDate
                                ? new Date(
                                    reminderDate
                                ).toLocaleDateString()
                                : 'Select Date'}

                        </button>

                    </div>

                </div>

            

                <div className="supplier-statements-actions-row">

                    {/* REPORT */}

                    <div className="supplier-statements-action-slot-left">

                        <button
                            className="btn-base btn-info"
                            onClick={() =>
                                navigate(
                                    `/parties/suppliers/statements/report/${id}`
                                )
                            }
                        >
                            <i className="bi bi-bar-chart"></i>
                            Report
                        </button>

                    </div>

                    {/* REMINDER */}

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

                    {/* SMS */}

                    <div className="supplier-statements-action-slot-right">

                        <button className="btn-base btn-purple">

                            <i className="bi bi-chat-dots"></i>

                            SMS

                        </button>

                    </div>

                </div>

                {/* ==============================
                    TRANSACTIONS
                ============================== */}

                <div className="supplier-statements-transactions-container">

                    <div className="supplier-statements-transactions-title">

                        <i className="bi bi-clock-history"></i>

                        Recent Transactions

                    </div>

                    {isLoading ? (

                        <div className="supplier-statements-no-transactions">
                            Loading transactions...
                        </div>

                    ) : paymentHistory.length === 0 ? (

                        <div className="supplier-statements-no-transactions">
                            No transactions found
                        </div>

                    ) : (

                        paymentHistory
                            .slice()
                            .sort((a, b) => {

                                const ta = new Date(
                                    a.createdAt || a.date
                                ).getTime();

                                const tb = new Date(
                                    b.createdAt || b.date
                                ).getTime();

                                return tb - ta;

                            })
                            .map((t) => {

                                const type =
                                    (t.type || '').toLowerCase();

                                const isReceived =
                                    type === 'received' ||
                                    type === 'payment_in' ||
                                    type === 'you_received';

                                const amountAbs =
                                    Math.abs(t.amount);

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

                                                            customerName:
                                                                supplierName ||
                                                                'Supplier',

                                                            date:
                                                                new Date(
                                                                    t.date
                                                                )
                                                                    .toISOString()
                                                                    .split('T')[0],

                                                            totalAmount:
                                                                amountAbs,

                                                            phoneNumber:
                                                                supplierPhone ||
                                                                '',

                                                            type:
                                                                isReceived
                                                                    ? 'payment_in'
                                                                    : 'payment_out',

                                                            customerId:
                                                                parseInt(
                                                                    id || '0'
                                                                ),

                                                            details:
                                                                `${isReceived
                                                                    ? 'Payment Received'
                                                                    : 'Payment Given'
                                                                } - ${new Date(
                                                                    t.date
                                                                ).toLocaleDateString()}`,

                                                            remarks:
                                                                t.remarks || '',

                                                            sms:
                                                                `Dear ${supplierName || 'Supplier'
                                                                }, your payment of रु${amountAbs} has been ${isReceived
                                                                    ? 'received'
                                                                    : 'processed'
                                                                }. Current balance: रु${t.newBalance
                                                                }. Thank you.`

                                                        }
                                                    }
                                                }
                                            );

                                        }}
                                        role="button"
                                        tabIndex={0}
                                    >

                                        <div className="supplier-statements-transaction-info">

                                            {/* PAYMENT TYPE */}

                                            <div className="supplier-statements-transaction-row">

                                                <div className="supplier-statements-transaction-label">
                                                    Payment Type:
                                                </div>

                                                <div className="supplier-statements-transaction-value">

                                                    {isReceived ? (

                                                        <span className="supplier-statements-payment-in">
                                                            Payment In
                                                        </span>

                                                    ) : (

                                                        <span className="supplier-statements-payment-out">
                                                            Payment Out
                                                        </span>

                                                    )}

                                                </div>

                                            </div>

                                            {/* DATE */}

                                            <div className="supplier-statements-transaction-row">

                                                <div className="supplier-statements-transaction-label">
                                                    Date/Time:
                                                </div>

                                                <div className="supplier-statements-transaction-value">

                                                    {new Date(
                                                        t.date
                                                    ).toLocaleDateString()}{' '}

                                                    {new Date(
                                                        t.date
                                                    ).toLocaleTimeString()}

                                                </div>

                                            </div>



                                            <div className="supplier-statements-transaction-row">

                                                <div className="supplier-statements-transaction-label">
                                                    Balance:
                                                </div>

                                                <div className="supplier-statements-transaction-value">

                                                    रु
                                                    {amountAbs.toLocaleString()}

                                                </div>

                                            </div>

                                            {/* REMARKS */}

                                            <div className="supplier-statements-transaction-row">

                                                <div className="supplier-statements-transaction-label">
                                                    Remarks:
                                                </div>

                                                <div className="supplier-statements-transaction-value">

                                                    {t.remarks}

                                                </div>

                                            </div>

                                        </div>

                                        {/* AMOUNT */}

                                        <div className="supplier-statements-transaction-amounts">

                                            <div
                                                className={
                                                    isReceived
                                                        ? 'supplier-statements-current-amount'
                                                        : 'supplier-statements-current-amount-red'
                                                }
                                            >

                                                रु
                                                {amountAbs.toLocaleString()}

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

                                {/* CLOSE BUTTON */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPopup(false)
                                    }
                                    className="popup-close-button"
                                    aria-label="Close"
                                >

                                    <i className="bi bi-x-lg"></i>

                                </button>


                                {/* TITLE */}

                                <div className="popup-title-container">

                                    <h2
                                        style={{
                                            color: 'red',
                                            textAlign: 'center',
                                            margin: '0',
                                            padding: '0'
                                        }}
                                    >
                                        You Gave
                                    </h2>

                                </div>


                                {/* FORM */}

                                <div className="you-gave-popup-body">

                                    <YouGave
                                        onSuccess={handleGaveSuccess}
                                    />

                                </div>

                            </div>

                        </div>

                    )}

                    <button
                        className="btn-base btn-green"
                        onClick={() =>
                            setShowReceivedPopup(true)
                        }
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
                                    onClick={() =>
                                        setShowReceivedPopup(false)
                                    }
                                    className="popup-close-button"
                                    aria-label="Close"
                                >

                                    <i className="bi bi-x-lg"></i>

                                </button>


                                <div className="popup-title-container">

                                    <h2
                                        style={{
                                            color: 'green',
                                            textAlign: 'center',
                                            margin: '0',
                                            padding: '0'
                                        }}
                                    >
                                        You Received
                                    </h2>

                                </div>


                                {/* FORM */}

                                <div className="you-received-popup-body">

                                    <YouReceived
                                        onSuccess={
                                            handleReceivedSuccess
                                        }
                                    />

                                </div>

                            </div>

                        </div>

                    )}

                </div>

                {showDatePicker && (

                    <div
                        className="supplier-statements-date-overlay"
                        ref={datePickerRef}
                    >
                    </div>

                )}

            </main>

        </div>
    );
};

export default SupplierStatements;