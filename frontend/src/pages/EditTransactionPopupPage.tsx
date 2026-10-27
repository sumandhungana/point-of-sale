import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { useAppSettings } from '@/context/AppSettingsContext';
import { updatePayment } from '@/features/services/paymentService';
import { toast } from 'react-toastify';
import '@/styles/EditTransactionPopupPage.css';

interface EditTransactionPopupPageProps {
    category?: 'GIVEN' | 'RECEIVED';
    partyType?: 'Customer' | 'Supplier';
}

export const EditTransactionPopupPage: React.FC<EditTransactionPopupPageProps> = ({
    category: propCategory,
    partyType: propPartyType,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams<{ id: string }>();
    const { settings } = useAppSettings();
    const currencySymbol = settings.currency || 'Rs. ';

    // Determine category: GIVEN vs RECEIVED
    const isUrlReceived = location.pathname.toLowerCase().includes('you-received');
    const effectiveCategory: 'GIVEN' | 'RECEIVED' =
        propCategory || (isUrlReceived ? 'RECEIVED' : 'GIVEN');

    // Determine party type: Customer vs Supplier
    const isUrlSupplier = location.pathname.toLowerCase().includes('supplier');
    const effectivePartyType: 'Customer' | 'Supplier' =
        propPartyType || (isUrlSupplier ? 'Supplier' : 'Customer');

    // Extract any preloaded data passed via router state
    const initialData = location.state?.initialData;

    // Numerical entity ID (party ID or fallback)
    const resolvedPartyId =
        initialData?.customerId ||
        initialData?.supplierId ||
        (id ? parseInt(id, 10) : 0);
    const activePartyId = isNaN(resolvedPartyId) ? 0 : resolvedPartyId;

    // Form states
    const [amount, setAmount] = useState<string>(
        initialData?.amount ? String(initialData.amount) : ''
    );
    const [paymentType, setPaymentType] = useState<'CASH' | 'CARD' | 'QR'>(
        initialData?.paymentType || 'CASH'
    );
    const [date, setDate] = useState<string>(() => {
        if (initialData?.date) {
            return initialData.date.split('T')[0];
        }
        return new Date().toISOString().split('T')[0];
    });
    const [remarks, setRemarks] = useState<string>(initialData?.remarks || '');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [partyName, setPartyName] = useState<string>(
        initialData?.customerName || initialData?.supplierName || ''
    );
    const [partyPhone, setPartyPhone] = useState<string>(
        initialData?.phoneNumber || ''
    );
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // If initialData wasn't passed (e.g. direct URL visit), fetch customer/supplier name if available
    useEffect(() => {
        if (!initialData && activePartyId > 0) {
            const fetchPartyInfo = async () => {
                try {
                    const token = localStorage.getItem('authToken');
                    const endpoint =
                        effectivePartyType === 'Customer'
                            ? `/api/v1/customer/${activePartyId}`
                            : `/api/v1/supplier/${activePartyId}`;

                    const res = await fetch(endpoint, {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                    });
                    if (res.ok) {
                        const data = await res.json();
                        const party = data?.response || data;
                        if (party?.name) setPartyName(party.name);
                        if (party?.phone || party?.phoneNumber) {
                            setPartyPhone(party.phone || party.phoneNumber);
                        }
                    }
                } catch {
                    // Silently ignore if direct fetch is unavailable
                }
            };
            fetchPartyInfo();
        }
    }, [initialData, activePartyId, effectivePartyType]);

    // Handle closing the popup - navigate back to the previous route
    const handleClose = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else if (effectivePartyType === 'Supplier') {
            const suppId =
                initialData?.supplierId ||
                (effectivePartyType === 'Supplier' && initialData?.customerId
                    ? initialData.customerId
                    : activePartyId || id);
            navigate(
                suppId ? `/parties/supplier/statements/${suppId}` : '/parties/supplier'
            );
        } else {
            const custId =
                initialData?.customerId || activePartyId || id;
            navigate(
                custId
                    ? `/parties/customers/statements/${custId}`
                    : '/parties/customers'
            );
        }
    };

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isSubmitting) {
                handleClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSubmitting]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        } else {
            setSelectedFile(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!amount || Number(amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }

        const paymentId = initialData?.paymentId || (id ? parseInt(id, 10) : 0);
        if (!paymentId || isNaN(paymentId) || paymentId <= 0) {
            toast.error('Payment ID not found');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await updatePayment({
                paymentId: Number(paymentId),
                amount: Number(amount),
                paymentType: paymentType,
                paymentCategory: effectiveCategory,
                billPath: selectedFile ? selectedFile.name : (initialData?.billPath || null),
                remarks: remarks?.trim() || null,
            });

            toast.success(
                res?.message ||
                (effectiveCategory === 'GIVEN'
                    ? 'Payment given updated successfully!'
                    : 'Payment received updated successfully!')
            );
            handleClose();
        } catch (error: any) {
            console.error('Payment submit error:', error);
            toast.error(error?.message || error.response?.data?.message || 'Failed to update transaction');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isGiven = effectiveCategory === 'GIVEN';

    return (
        <div className="edit-txn-page-wrapper">
            <Sidebar />

            {/* Modal Overlay Backdrop */}
            <div className="edit-txn-overlay" onClick={handleClose}>
                <div
                    className="edit-txn-modal"
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="edit-txn-modal-title"
                >
                    {/* Top Accent Color Line */}
                    <div className={`edit-txn-accent-bar ${isGiven ? 'given' : 'received'}`} />

                    {/* Modal Header */}
                    <div className="edit-txn-header">
                        <div className="edit-txn-header-left">
                            <div className={`edit-txn-icon-badge ${isGiven ? 'given' : 'received'}`}>
                                <i
                                    className={
                                        isGiven
                                            ? 'bi bi-arrow-up-circle-fill'
                                            : 'bi bi-arrow-down-circle-fill'
                                    }
                                />
                            </div>
                            <div>
                                <div className="edit-txn-title-row">
                                    <h3 id="edit-txn-modal-title" className="edit-txn-title">
                                        {isGiven ? 'You Gave' : 'You Received'}
                                    </h3>
                                    <span className={`edit-txn-badge ${isGiven ? 'given' : 'received'}`}>
                                        {isGiven ? 'Payment Out' : 'Payment In'}
                                    </span>
                                </div>
                                <p className="edit-txn-subtitle">
                                    Ref #{id || activePartyId || '0'}
                                    {partyName
                                        ? ` • ${partyName}`
                                        : ` • ${effectivePartyType}`}
                                </p>
                            </div>
                        </div>

                        {/* Cross button on top right */}
                        <button
                            type="button"
                            className="edit-txn-close-btn"
                            onClick={handleClose}
                            aria-label="Close"
                            title="Close"
                        >
                            <i className="bi bi-x-lg" />
                        </button>
                    </div>

                    {/* Modal Form */}
                    <form onSubmit={handleSubmit} className="edit-txn-form">
                        <div className="edit-txn-body">
                            {/* Party Card if available */}
                            {(partyName || partyPhone) && (
                                <div className="edit-txn-party-card">
                                    <div className="party-avatar">
                                        <i className="bi bi-person-fill" />
                                    </div>
                                    <div className="party-details">
                                        <span className="party-name">
                                            {partyName || effectivePartyType}
                                        </span>
                                        {partyPhone && (
                                            <span className="party-phone">
                                                <i className="bi bi-telephone me-1" />
                                                {partyPhone}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Amount Input */}
                            <div className="form-group">
                                <label className="form-label">
                                    <i
                                        className={`bi ${
                                            isGiven
                                                ? 'bi-cash-stack text-danger'
                                                : 'bi-cash text-success'
                                        } me-1`}
                                    />
                                    Amount ({currencySymbol}){' '}
                                    <span className="text-danger ms-1">*</span>
                                </label>
                                <div className="amount-input-wrapper">
                                    <span className="currency-prefix">{currencySymbol}</span>
                                    <input
                                        type="number"
                                        step="any"
                                        className={`form-control amount-input ${
                                            isGiven ? 'given' : 'received'
                                        }`}
                                        placeholder="0"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Date and Payment Mode in 2 columns */}
                            <div className="form-row-2col">
                                <div className="form-group">
                                    <label className="form-label">
                                        <i className="bi bi-calendar-event me-1" />
                                        Date <span className="text-danger ms-1">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">
                                        <i className="bi bi-wallet2 me-1" />
                                        Payment Mode
                                    </label>
                                    <select
                                        className="form-select"
                                        value={paymentType}
                                        onChange={(e) =>
                                            setPaymentType(
                                                e.target.value as 'CASH' | 'CARD' | 'QR'
                                            )
                                        }
                                    >
                                        <option value="CASH">Cash</option>
                                        <option value="QR">QR Code / Online</option>
                                        <option value="CARD">Card</option>
                                    </select>
                                </div>
                            </div>

                            {/* Attach Bill / Receipt (Optional) */}
                            <div className="form-group">
                                <label className="form-label">
                                    <i className="bi bi-paperclip me-1" />
                                    Attach Bill / Receipt{' '}
                                    <span className="text-muted fw-normal ms-1">
                                        (Optional)
                                    </span>
                                </label>
                                <div className="file-upload-box">
                                    <input
                                        type="file"
                                        id="edit-txn-file-input"
                                        className="d-none"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                    />
                                    <label
                                        htmlFor="edit-txn-file-input"
                                        className="file-upload-label"
                                    >
                                        <i className="bi bi-cloud-arrow-up me-2" />
                                        {selectedFile
                                            ? 'Change File'
                                            : 'Browse File / Receipt'}
                                    </label>
                                    {selectedFile && (
                                        <div className="selected-file-badge">
                                            <i className="bi bi-file-earmark-check text-success me-1" />
                                            <span>{selectedFile.name}</span>
                                            <button
                                                type="button"
                                                className="btn-remove-file"
                                                onClick={() => setSelectedFile(null)}
                                                title="Remove file"
                                                aria-label="Remove attached file"
                                            >
                                                <i className="bi bi-x" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Remarks / Details */}
                            <div className="form-group">
                                <label className="form-label">
                                    <i className="bi bi-chat-left-text me-1" />
                                    Remarks / Note{' '}
                                    <span className="text-muted fw-normal ms-1">
                                        (Optional)
                                    </span>
                                </label>
                                <textarea
                                    className="form-control"
                                    rows={2}
                                    placeholder="Add notes, invoice number, or description..."
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="edit-txn-footer">
                            <button
                                type="button"
                                className="btn-cancel"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`btn-save ${isGiven ? 'given' : 'received'}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                            aria-hidden="true"
                                        />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check2-circle me-1" />
                                        {isGiven
                                            ? 'Confirm You Gave'
                                            : 'Confirm You Received'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditTransactionPopupPage;
