import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { TransactionDetailModal, TransactionDetailData } from '../components/TransactionDetailModal';

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

    const [formData] = useState({
        type: transactionData?.type || 'payment_in',
        customerName: transactionData?.customerName || '',
        totalAmount: transactionData?.totalAmount?.toString() || '0',
        phoneNumber: transactionData?.phoneNumber || '',
        details: transactionData?.details || '',
        remarks: transactionData?.remarks || '',
        customerId: transactionData?.customerId || '',
        sms: transactionData?.sms || '',
        date: transactionData?.date || new Date().toISOString(),
    });

    const handleClose = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else if (formData.customerId) {
            navigate(`/parties/supplier/statements/${formData.customerId}`);
        } else {
            navigate('/parties/suppliers');
        }
    };

    const handleEdit = () => {
        const editData = {
            customerId: formData.customerId,
            customerName: formData.customerName,
            amount: parseFloat(formData.totalAmount),
            remarks: formData.remarks,
            date: formData.date,
            phoneNumber: formData.phoneNumber
        };

        if (formData.type === 'payment_in') {
            navigate(`/parties/supplier/statements/you-received/${id}`, {
                state: { initialData: editData }
            });
        } else {
            navigate(`/parties/supplier/statements/you-gave/${id}`, {
                state: { initialData: editData }
            });
        }
    };

    const txnDetail: TransactionDetailData = {
        id: id || '',
        partyId: formData.customerId,
        partyName: formData.customerName || 'Supplier',
        partyPhone: formData.phoneNumber,
        partyType: 'Supplier',
        amount: parseFloat(formData.totalAmount) || 0,
        paymentCategory: formData.type === 'payment_in' ? 'RECEIVED' : 'GIVEN',
        date: formData.date,
        details: formData.details,
        remarks: formData.remarks,
        sms: formData.sms,
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <Sidebar />

            <TransactionDetailModal
                isOpen={true}
                onClose={handleClose}
                transaction={txnDetail}
                onDeleteSuccess={handleClose}
                onEdit={handleEdit}
            />
        </div>
    );
};

export default SupplierStatement;