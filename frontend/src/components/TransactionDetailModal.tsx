import React, { useState, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import StatementPDFTemplate from './StatementPDFTemplate';
import ConfirmationModal from './ConfirmationModal';
import { deletePaymentGiven, deletePaymentReceived } from '../services/paymentService';
import { toast } from 'react-toastify';
import { useAppSettings } from '@/context/AppSettingsContext';
import '../styles/TransactionDetailModal.css';

export interface TransactionDetailData {
    id: number | string;
    partyId?: number | string;
    partyName: string;
    partyPhone?: string | null;
    partyType: 'Customer' | 'Supplier';
    amount: number;
    paymentCategory: 'GIVEN' | 'RECEIVED' | string;
    date: string;
    details?: string;
    remarks?: string;
    sms?: string;
}

interface TransactionDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: TransactionDetailData | null;
    onDeleteSuccess?: () => void;
    onEdit?: (transaction: TransactionDetailData) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
    isOpen,
    onClose,
    transaction,
    onDeleteSuccess,
    onEdit,
}) => {
    const { formatCurrency, formatDate } = useAppSettings();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !showDeleteConfirm) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, showDeleteConfirm]);

    if (!isOpen || !transaction) return null;

    const isReceived = transaction.paymentCategory === 'RECEIVED';
    const amountAbs = Math.abs(transaction.amount || 0);

    const handlePrintPDF = async () => {
        setIsPrinting(true);
        try {
            const formData = {
                customerName: transaction.partyName || (transaction.partyType === 'Supplier' ? 'Supplier' : 'Customer'),
                totalAmount: amountAbs.toString(),
                date: transaction.date ? transaction.date.split('T')[0] : '',
                type: isReceived ? 'payment_in' : 'payment_out',
                phoneNumber: transaction.partyPhone || '',
                details: transaction.details || `${isReceived ? 'Payment Received' : 'Payment Given'} - ${formatDate(transaction.date)}`,
                remarks: transaction.remarks || '',
                sms: transaction.sms || '',
            };

            const blob = await pdf(<StatementPDFTemplate formData={formData} />).toBlob();
            const url = URL.createObjectURL(blob);
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);
            iframe.onload = () => {
                iframe.contentWindow?.print();
                setTimeout(() => {
                    document.body.removeChild(iframe);
                    URL.revokeObjectURL(url);
                }, 1000);
            };
        } catch (error) {
            console.error('Error printing PDF:', error);
            toast.error('Failed to generate PDF for printing');
        } finally {
            setIsPrinting(false);
        }
    };

    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            const cleanDate = transaction.date ? transaction.date.split('T')[0] : 'date';
            const formData = {
                customerName: transaction.partyName || (transaction.partyType === 'Supplier' ? 'Supplier' : 'Customer'),
                totalAmount: amountAbs.toString(),
                date: cleanDate,
                type: isReceived ? 'payment_in' : 'payment_out',
                phoneNumber: transaction.partyPhone || '',
                details: transaction.details || `${isReceived ? 'Payment Received' : 'Payment Given'} - ${formatDate(transaction.date)}`,
                remarks: transaction.remarks || '',
                sms: transaction.sms || '',
            };

            const blob = await pdf(<StatementPDFTemplate formData={formData} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `statement_${transaction.partyName || transaction.partyType}_${cleanDate}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast.error('Failed to download PDF');
        } finally {
            setIsDownloading(false);
        }
    };

    const performDelete = async () => {
        setIsDeleting(true);
        try {
            if (isReceived) {
                await deletePaymentReceived(Number(transaction.id));
            } else {
                await deletePaymentGiven(Number(transaction.id));
            }
            toast.success('Transaction deleted successfully');
            setShowDeleteConfirm(false);
            onClose();
            if (onDeleteSuccess) {
                onDeleteSuccess();
            }
        } catch (error: any) {
            console.error('Error deleting transaction:', error);
            toast.error(typeof error === 'string' ? error : 'Failed to delete transaction');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="transaction-detail-overlay" onClick={onClose}>
            <div
                className="transaction-detail-card"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="transaction-detail-title"
            >
                {/* Header */}
                <div className="transaction-detail-header">
                    <div className="transaction-detail-header-left">
                        <div className={`transaction-detail-icon-badge ${isReceived ? 'type-received' : 'type-given'}`}>
                            <i className={isReceived ? 'bi bi-arrow-down-circle' : 'bi bi-arrow-up-circle'}></i>
                        </div>
                        <div>
                            <h3 id="transaction-detail-title" className="transaction-detail-title">
                                Transaction Details
                            </h3>
                            <p className="transaction-detail-subtitle">
                                #{transaction.id} • {transaction.partyName || `${transaction.partyType}`}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="transaction-detail-close-btn"
                        onClick={onClose}
                        aria-label="Close"
                        title="Close popup"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="transaction-detail-body">
                    {/* Hero Amount Banner */}
                    <div className={`transaction-amount-card ${isReceived ? 'type-received' : 'type-given'}`}>
                        <div className={`transaction-category-badge ${isReceived ? 'type-received' : 'type-given'}`}>
                            <i className={isReceived ? 'bi bi-arrow-down-circle-fill' : 'bi bi-arrow-up-circle-fill'}></i>
                            {isReceived ? 'Payment Received' : 'Payment Given'}
                        </div>
                        <div className={`transaction-amount-display ${isReceived ? 'type-received' : 'type-given'}`}>
                            {formatCurrency(amountAbs)}
                        </div>
                        <div className="transaction-date-badge">
                            <i className="bi bi-calendar3"></i>
                            {formatDate(transaction.date)}
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="transaction-info-grid">
                        <div className="transaction-info-row">
                            <span className="transaction-info-label">
                                <i className={transaction.partyType === 'Supplier' ? 'bi bi-truck' : 'bi bi-person'}></i>
                                {transaction.partyType}
                            </span>
                            <span className="transaction-info-value">
                                {transaction.partyName || 'N/A'}
                            </span>
                        </div>

                        {transaction.partyPhone && (
                            <div className="transaction-info-row">
                                <span className="transaction-info-label">
                                    <i className="bi bi-telephone"></i>
                                    Phone Number
                                </span>
                                <span className="transaction-info-value">
                                    <a href={`tel:${transaction.partyPhone.replace(/\D/g, '')}`}>
                                        {transaction.partyPhone}
                                    </a>
                                </span>
                            </div>
                        )}

                        <div className="transaction-info-row">
                            <span className="transaction-info-label">
                                <i className="bi bi-hash"></i>
                                Transaction ID
                            </span>
                            <span className="transaction-info-value">
                                #{transaction.id}
                            </span>
                        </div>

                        {transaction.details && (
                            <div className="transaction-info-row">
                                <span className="transaction-info-label">
                                    <i className="bi bi-info-circle"></i>
                                    Details
                                </span>
                                <span className="transaction-info-value">
                                    {transaction.details}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Remarks Box */}
                    {transaction.remarks && (
                        <div className="transaction-remarks-box">
                            <span className="transaction-remarks-label">
                                <i className="bi bi-chat-left-text"></i>
                                Remarks / Note
                            </span>
                            <p className="transaction-remarks-text">
                                {transaction.remarks}
                            </p>
                        </div>
                    )}

                    {/* SMS Preview Box */}
                    {transaction.sms && (
                        <div className="transaction-sms-box">
                            <span className="transaction-sms-label">
                                <i className="bi bi-chat-dots"></i>
                                SMS Notification
                            </span>
                            <p className="transaction-sms-text">
                                "{transaction.sms}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="transaction-detail-footer">
                    <div className="transaction-footer-left">
                        <button
                            type="button"
                            className="btn-txn-action btn-txn-delete"
                            onClick={() => setShowDeleteConfirm(true)}
                            title="Delete this transaction"
                        >
                            <i className="bi bi-trash"></i>
                            Delete
                        </button>
                        {onEdit && (
                            <button
                                type="button"
                                className="btn-txn-action btn-txn-edit"
                                onClick={() => {
                                    onEdit(transaction);
                                    onClose();
                                }}
                                title="Edit transaction"
                            >
                                <i className="bi bi-pencil"></i>
                                Edit
                            </button>
                        )}
                    </div>

                    <div className="transaction-footer-right">
                        <button
                            type="button"
                            className="btn-txn-action btn-txn-pdf"
                            onClick={handlePrintPDF}
                            disabled={isPrinting}
                            title="Print receipt"
                        >
                            <i className="bi bi-printer"></i>
                            {isPrinting ? 'Preparing...' : 'Print'}
                        </button>
                        <button
                            type="button"
                            className="btn-txn-action btn-txn-download"
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                            title="Download PDF statement"
                        >
                            <i className="bi bi-download"></i>
                            {isDownloading ? 'Downloading...' : 'PDF'}
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={performDelete}
                title="Confirm Transaction Deletion"
                message="Are you sure you want to delete this payment record? This will permanently update the customer statement balance."
                confirmText={isDeleting ? 'Deleting...' : 'Yes, Delete'}
                cancelText="No, Keep it"
                type="danger"
            />
        </div>
    );
};

export default TransactionDetailModal;
