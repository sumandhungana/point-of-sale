import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { useNavigate, useParams } from 'react-router-dom';
import '../styles/EditCustomerStatement.css';

export const EditCustomerStatement = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [formData, setFormData] = useState({
        amount: '',
        details: '',
        billNumber: '',
        date: '',
        file: null as File | null,
    });
    const [customerName, setCustomerName] = useState('John Doe'); // This would come from API
    const [transactionType, setTransactionType] = useState('give'); // 'give' or 'receive'
    const [totalAmount, setTotalAmount] = useState(15000); // This would come from API

    useEffect(() => {
        // Fetch customer data based on ID
        // This is a placeholder - replace with actual API call
        console.log(`Fetching customer data for ID: ${id}`);
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({
                ...prev,
                file: e.target.files![0]
            }));
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission here
        console.log(formData);
        // After successful submission, navigate back to customer statements page
        navigate(`/parties/customers/statements/${id}`);
    };

    const handleCancel = () => {
        navigate(`/parties/customers/statements/${id}`);
    };

    return (
        <div className="edit-statement-container">
            <Sidebar />
           
            <main className="edit-statement-main-content">
                <div className="edit-statement-form-container">
                    <h2 className="edit-statement-form-title">
                        <i className="bi bi-pencil-square"></i>
                        Edit Customer Statement
                    </h2>

                    <div className="edit-statement-summary-box">
                        <p className="edit-statement-summary-text">
                            <i className="bi bi-currency-rupee"></i>
                            You {transactionType === 'give' ? 'give' : 'receive'} 
                            <span className="edit-statement-highlighted-amount"> Rs. {totalAmount.toLocaleString()} </span> 
                            from {customerName}
                        </p>
                    </div>

                    <form onSubmit={handleSave}>
                        <div className="edit-statement-form-row">
                            <div className="edit-statement-form-group">
                                <label className="edit-statement-label">
                                    <i className="bi bi-currency-rupee me-1"></i>
                                    Give/Receive Amount (Rs.)
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    className="edit-statement-input"
                                    required
                                />
                            </div>
                            <div className="edit-statement-form-group">
                                <label className="edit-statement-label">
                                    <i className="bi bi-arrow-left-right me-1"></i>
                                    Transaction Type
                                </label>
                                <select
                                    name="transactionType"
                                    value={transactionType}
                                    onChange={(e) => setTransactionType(e.target.value)}
                                    className="edit-statement-select"
                                >
                                    <option value="give">Give</option>
                                    <option value="receive">Receive</option>
                                </select>
                            </div>
                        </div>

                        <div className="edit-statement-form-row">
                            <div className="edit-statement-form-group">
                                <label className="edit-statement-label">
                                    <i className="bi bi-chat-text me-1"></i>
                                    Enter Details Remarks
                                </label>
                                <input
                                    type="text"
                                    name="details"
                                    value={formData.details}
                                    onChange={handleChange}
                                    className="edit-statement-input"
                                    required
                                />
                            </div>
                        </div>

                        <div className="edit-statement-form-row">
                            <div className="edit-statement-form-group">
                                <label className="edit-statement-label">
                                    <i className="bi bi-receipt me-1"></i>
                                    Add Bill Number
                                </label>
                                <input
                                    type="text"
                                    name="billNumber"
                                    value={formData.billNumber}
                                    onChange={handleChange}
                                    className="edit-statement-input"
                                />
                            </div>
                        </div>

                        <div className="edit-statement-form-row">
                            <div className="edit-statement-form-group">
                                <label className="edit-statement-label">
                                    <i className="bi bi-calendar-event me-1"></i>
                                    Date
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    className="edit-statement-input"
                                    required
                                />
                            </div>
                            <div className="edit-statement-form-group">
                                <label className="edit-statement-label">
                                    <i className="bi bi-paperclip me-1"></i>
                                    Attach File
                                </label>
                                <input
                                    type="file"
                                    name="file"
                                    onChange={handleFileChange}
                                    className="edit-statement-file-input"
                                />
                            </div>
                        </div>

                        <div className="edit-statement-button-container">
                            <button 
                                type="button" 
                                className="edit-statement-button edit-statement-cancel-button"
                                onClick={handleCancel}
                            >
                                <i className="bi bi-x-circle"></i>
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="edit-statement-button edit-statement-save-button"
                            >
                                <i className="bi bi-check-circle"></i>
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}; 