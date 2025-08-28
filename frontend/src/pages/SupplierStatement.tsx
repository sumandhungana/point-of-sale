import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import StatementPDFTemplate from '../components/StatementPDFTemplate';
import ConfirmationModal from '../components/ConfirmationModal';
import { deletePaymentGiven, deletePaymentReceived } from '../services/paymentService';
import { toast } from 'react-toastify';
import '../styles/SupplierStatement.css';

interface TransactionData {
    customerId: number;
    customerName: string;
    totalAmount: number;
    type: string;
    phoneNumber: string;
    details: string;
    remarks: string;
    sms: string;
    date: string;
}

export const SupplierStatement = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const location = useLocation();
    const transactionData = location.state?.transaction as TransactionData;

    const [formData, setFormData] = useState({
        type: transactionData?.type || '',
        customerName: transactionData?.customerName || '',
        totalAmount: transactionData?.totalAmount?.toString() || '',
        phoneNumber: transactionData?.phoneNumber || '',
        details: transactionData?.details || '',
        remarks: transactionData?.remarks || '',
        customerId: transactionData?.customerId || '',
        sms: transactionData?.sms || '',
        date: transactionData?.date || '',
    });

    const handleEdit = () => {
        const editData = {
            customerId: formData.customerId,
            customerName: formData.customerName,
            amount: parseFloat(formData.totalAmount),
            remarks: formData.remarks,
            date: formData.date,
            phoneNumber: formData.phoneNumber
        };

        if (transactionData.type === 'payment_in') {
            navigate(`/parties/supplier/statements/you-received/${id}`, {
                state: { initialData: editData }
            });
        } else {
            navigate(`/parties/supplier/statements/you-gave/${id}`, {
                state: { initialData: editData }
            });
        }
    };

    const [showConfirm, setShowConfirm] = useState(false);

    const performDelete = async () => {
        try {
            if (transactionData.type === 'payment_in') {
                await deletePaymentReceived(parseInt(id || '0'));
            } else {
                await deletePaymentGiven(parseInt(id || '0'));
            }
            toast.success('Payment deleted successfully');
            navigate(-1);
        } catch (error) {
            console.error('Error deleting payment:', error);
            toast.error('Failed to delete payment');
        }
    };

    const handleDelete = () => {
        setShowConfirm(true);
    };

    const handlePrintPDF = async () => {
        try {
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
        }
    };

    const handleDownloadPDF = async () => {
        try {
            const blob = await pdf(<StatementPDFTemplate formData={formData} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `supplier_statement_${formData.customerName}_${formData.date}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const handleShare = () => {
        // Handle share functionality
        console.log('Share clicked');
    };

    return (
        <div className="supplier-statement-container">
            <Sidebar />
            <button 
                className="supplier-statement-back-button" 
                onClick={() => navigate(-1)}
            >
                <i className="bi bi-arrow-left"></i>
                Back
            </button>
            <main className="supplier-statement-main-content">
                <div className="supplier-statement-form-container">
                    <h2 className="supplier-statement-form-title">
                        <i className="bi bi-file-text"></i>
                        Supplier Statement Details
                    </h2>
                    
                    <div className="supplier-statement-form-row">
                        <div className="supplier-statement-form-group">
                            <label className="supplier-statement-label">
                                <i className="bi bi-person me-1"></i>
                                Supplier Name
                            </label>
                            <input
                                type="text"
                                name="customerName"
                                disabled
                                value={formData.customerName}
                                className="supplier-statement-input"
                            />
                        </div>
                        <div className="supplier-statement-form-group">
                            <label className="supplier-statement-label">
                                <i className="bi bi-currency-rupee me-1"></i>
                                Rs Total
                            </label>
                            <input
                                type="number"
                                name="totalAmount"
                                disabled
                                value={formData.totalAmount}
                                className="supplier-statement-input"
                            />
                        </div>
                    </div>

                    <div className="supplier-statement-form-row">
                        <div className="supplier-statement-form-group">
                            <label className="supplier-statement-label">
                                <i className="bi bi-telephone me-1"></i>
                                Phone Number
                            </label>
                            <input
                                disabled
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                className="supplier-statement-input"
                            />
                        </div>
                    </div>

                    <div className="supplier-statement-form-row">
                        <div className="supplier-statement-form-group">
                            <label className="supplier-statement-label">
                                <i className="bi bi-info-circle me-1"></i>
                                Details
                            </label>
                            <input
                                type="text"
                                disabled
                                name="details"
                                value={formData.details}
                                className="supplier-statement-input"
                            />
                        </div>
                    </div>

                    <div className="supplier-statement-form-row">
                        <div className="supplier-statement-form-group">
                            <label className="supplier-statement-label">
                                <i className="bi bi-calendar-event me-1"></i>
                                Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                disabled
                                value={formData.date}
                                className="supplier-statement-input"
                            />
                        </div>
                    </div>

                    <div className="supplier-statement-form-row">
                        <div className="supplier-statement-form-group">
                            <label className="supplier-statement-label">
                                <i className="bi bi-chat-text me-1"></i>
                                Remarks
                            </label>
                            <input
                                type="text"
                                name="remarks"
                                disabled
                                value={formData.remarks}
                                className="supplier-statement-input"
                            />
                        </div>
                    </div>

                    <div className="supplier-statement-form-row">
                        <div className="supplier-statement-form-group">
                            <label className="supplier-statement-label">
                                <i className="bi bi-envelope me-1"></i>
                                SMS
                            </label>
                            <textarea
                                disabled
                                name="sms"
                                value={formData.sms}
                                className="supplier-statement-textarea"
                            />
                        </div>
                    </div>

                    <div className="supplier-statement-button-container">
                        <button 
                            className="supplier-statement-button supplier-statement-delete-button"
                            onClick={handleDelete}
                        >
                            <i className="bi bi-trash"></i>
                            Delete
                        </button>
                        <button 
                            className="supplier-statement-button supplier-statement-edit-button"
                            onClick={handleEdit}
                        >
                            <i className="bi bi-pencil"></i>
                            Edit
                        </button>
                        <button 
                            className="supplier-statement-button supplier-statement-print-button"
                            onClick={handlePrintPDF}
                        >
                            <i className="bi bi-printer"></i>
                            Print PDF
                        </button>
                        <button 
                            className="supplier-statement-button supplier-statement-download-button"
                            onClick={handleDownloadPDF}
                        >
                            <i className="bi bi-download"></i>
                            Download PDF
                        </button>
                        <button 
                            className="supplier-statement-button supplier-statement-share-button"
                            onClick={handleShare}
                        >
                            <i className="bi bi-share"></i>
                            Share
                        </button>
                    </div>
                </div>
            </main>
            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={async () => { await performDelete(); setShowConfirm(false); }}
                title="Confirm Deletion"
                message="Are you sure you want to delete this payment? This action cannot be undone."
                confirmText="Yes, Delete"
                cancelText="No, Keep it"
                type="danger"
            />
        </div>
    );
}; 