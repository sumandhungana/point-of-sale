import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppSettings } from '@/context/AppSettingsContext';
import { usePermission } from '@/core/rbac/usePermission';
import {
    getDeposits,
    addDeposit,
    updateDeposit,
    deleteDeposit,
    DepositItem,
    AddDepositPayload,
    UpdateDepositPayload,
} from '@/features/services/depositService';
import ConfirmationModal from './ConfirmationModal';
import { toast } from 'react-toastify';
import '../styles/DepositModal.css';

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    partyId: number;
    partyName: string;
    partyType: 'CUSTOMER' | 'SUPPLIER';
    onSuccess?: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
    isOpen,
    onClose,
    partyId,
    partyName,
    partyType,
    onSuccess,
}) => {
    const { settings, formatCurrency, formatDate } = useAppSettings();
    const currencySymbol = settings.currency || 'Rs. ';

    const { hasPermission } = usePermission();
    const canAdd = hasPermission('deposit:add');
    const canGet = hasPermission('deposit:get');
    const canEdit = hasPermission('deposit:update');
    const canDelete = hasPermission('deposit:delete');

    // Deposit records list state
    const [deposits, setDeposits] = useState<DepositItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Active tab: 'list' or 'form'
    const [activeTab, setActiveTab] = useState<'list' | 'form'>('list');

    // Form fields
    const [amount, setAmount] = useState<string>('');
    const [remarks, setRemarks] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Editing mode state
    const [editingDeposit, setEditingDeposit] = useState<DepositItem | null>(null);

    // Deletion confirmation state
    const [depositToDelete, setDepositToDelete] = useState<DepositItem | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // Fetch deposits from backend (GET /api/v1/deposit/all/{id})
    const fetchDepositsList = useCallback(async () => {
        if (!partyId || partyId <= 0) return;
        setIsLoading(true);
        try {
            const list = await getDeposits(partyId);
            setDeposits(list);
            return list;
        } catch (error) {
            console.error('Error fetching deposits:', error);
            toast.error('Failed to load deposits');
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [partyId]);

    // On modal open, initialize state and load deposits
    useEffect(() => {
        if (isOpen) {
            setAmount('');
            setRemarks('');
            setEditingDeposit(null);
            setDepositToDelete(null);
            setIsSubmitting(false);

            if (canGet) {
                fetchDepositsList().then((list) => {
                    // If no deposits yet, default tab to 'form' so user can add one right away
                    if (!list || list.length === 0) {
                        setActiveTab('form');
                    } else {
                        setActiveTab('list');
                    }
                });
            } else {
                setActiveTab('form');
            }
        }
    }, [isOpen, partyId, canGet, fetchDepositsList]);

    // Handle ESC key press
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !isSubmitting && !isDeleting && !depositToDelete) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, isSubmitting, isDeleting, depositToDelete, onClose]);

    // Total deposit sum
    const totalDepositAmount = useMemo(() => {
        return deposits.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    }, [deposits]);

    if (!isOpen) return null;

    // Quick chip amount helper
    const handleAddAmount = (addVal: number) => {
        const currentVal = parseFloat(amount) || 0;
        setAmount((currentVal + addVal).toFixed(2));
    };

    // Switch to Edit Mode
    const handleStartEdit = (deposit: DepositItem) => {
        setEditingDeposit(deposit);
        setAmount(deposit.amount != null ? String(deposit.amount) : '');
        setRemarks(deposit.remarks || '');
        setActiveTab('form');
    };

    // Cancel Edit Mode
    const handleCancelEdit = () => {
        setEditingDeposit(null);
        setAmount('');
        setRemarks('');
        setActiveTab('list');
    };

    // Form Submit: Add or Update
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!partyId || partyId <= 0) {
            toast.error(`Invalid ${partyType.toLowerCase()} ID`);
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            toast.error('Please enter a valid deposit amount greater than 0');
            return;
        }

        setIsSubmitting(true);

        try {
            if (editingDeposit) {
                // UPDATE Deposit: PUT /api/v1/deposit
                const payload: UpdateDepositPayload = {
                    id: editingDeposit.id,
                    amount: numAmount,
                    remarks: remarks.trim() || undefined,
                };
                const res = await updateDeposit(payload);
                toast.success(res.message || 'Deposit updated successfully!');
            } else {
                // ADD Deposit: POST /api/v1/deposit/add
                const payload: AddDepositPayload = {
                    paymentParty: partyType,
                    partyId: partyId,
                    amount: numAmount,
                    remarks: remarks.trim() || undefined,
                };
                const res = await addDeposit(payload);
                toast.success(res.message || `Deposit of ${currencySymbol}${numAmount.toFixed(2)} added successfully!`);
            }

            // Reset form fields
            setAmount('');
            setRemarks('');
            setEditingDeposit(null);

            // Refresh list
            await fetchDepositsList();
            setActiveTab('list');

            // Trigger parent statement refresh
            if (onSuccess) {
                try {
                    onSuccess();
                } catch (err) {
                    console.error('Error in onSuccess callback:', err);
                }
            }
        } catch (error: any) {
            console.error('Deposit submit error:', error);
            toast.error(error?.message || 'Failed to process deposit');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Confirm Delete: DELETE /api/v1/deposit/{id}
    const handleConfirmDelete = async () => {
        if (!depositToDelete) return;
        setIsDeleting(true);

        try {
            const res = await deleteDeposit(depositToDelete.id);
            toast.success(res.message || 'Deposit deleted successfully!');
            setDepositToDelete(null);

            // Refresh list
            await fetchDepositsList();

            // Trigger parent statement refresh
            if (onSuccess) {
                try {
                    onSuccess();
                } catch (err) {
                    console.error('Error in onSuccess callback:', err);
                }
            }
        } catch (error: any) {
            console.error('Deposit delete error:', error);
            toast.error(error?.message || 'Failed to delete deposit');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div
                className="deposit-modal-overlay"
                onClick={(e) => {
                    if (e.target === e.currentTarget && !isSubmitting && !isDeleting && !depositToDelete) {
                        onClose();
                    }
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="deposit-modal-title"
            >
                <div className="deposit-modal-card" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="deposit-modal-header">
                        <div className="deposit-modal-header-left">
                            <div className="deposit-modal-icon-badge">
                                <i className="bi bi-cash-coin"></i>
                            </div>
                            <div>
                                <h2 id="deposit-modal-title" className="deposit-modal-title">
                                    {partyType === 'CUSTOMER' ? 'Customer Deposit' : 'Supplier Deposit'}
                                </h2>
                                <p className="deposit-modal-subtitle">
                                    {partyType === 'CUSTOMER' ? 'Customer' : 'Supplier'}: <strong>{partyName || 'Party'}</strong>
                                </p>
                            </div>
                        </div>

                        <div className="deposit-modal-header-right">
                            {deposits.length > 0 && (
                                <div className="deposit-header-total-badge" title="Total active deposits for this party">
                                    <span className="deposit-header-total-label">Total Deposit</span>
                                    <span className="deposit-header-total-val">{formatCurrency(totalDepositAmount)}</span>
                                </div>
                            )}
                            <button
                                type="button"
                                className="deposit-modal-close"
                                onClick={onClose}
                                disabled={isSubmitting || isDeleting}
                                aria-label="Close deposit popup"
                                title="Close (Esc)"
                            >
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="deposit-tabs-bar">
                        <button
                            type="button"
                            className={`deposit-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
                            onClick={() => {
                                if (editingDeposit) {
                                    handleCancelEdit();
                                } else {
                                    setActiveTab('list');
                                }
                            }}
                        >
                            <i className="bi bi-clock-history me-1"></i>
                            All Deposits
                            <span className="deposit-tab-count">{deposits.length}</span>
                        </button>

                        <button
                            type="button"
                            className={`deposit-tab-btn ${activeTab === 'form' ? 'active' : ''}`}
                            onClick={() => setActiveTab('form')}
                            disabled={!canAdd && !editingDeposit}
                        >
                            {editingDeposit ? (
                                <>
                                    <i className="bi bi-pencil-square me-1 text-warning"></i>
                                    Edit Deposit #{editingDeposit.id}
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-plus-circle me-1"></i>
                                    New Deposit
                                </>
                            )}
                        </button>
                    </div>

                    {/* Tab 1: List View */}
                    {activeTab === 'list' && (
                        <div className="deposit-modal-body deposit-list-view">
                            {/* Summary banner */}
                            <div className="deposit-summary-banner">
                                <div className="deposit-summary-item">
                                    <span className="deposit-summary-title">Total Deposited</span>
                                    <span className="deposit-summary-amount">{formatCurrency(totalDepositAmount)}</span>
                                </div>
                                <div className="deposit-summary-item">
                                    <span className="deposit-summary-title">Total Records</span>
                                    <span className="deposit-summary-count">{deposits.length}</span>
                                </div>
                                {canAdd && (
                                    <button
                                        type="button"
                                        className="deposit-btn-add-shortcut"
                                        onClick={() => {
                                            setEditingDeposit(null);
                                            setAmount('');
                                            setRemarks('');
                                            setActiveTab('form');
                                        }}
                                    >
                                        <i className="bi bi-plus-lg me-1"></i>
                                        Add Deposit
                                    </button>
                                )}
                            </div>

                            {/* Deposits List */}
                            {isLoading ? (
                                <div className="deposit-loading-state">
                                    <div className="spinner-border text-primary spinner-border-sm me-2" role="status"></div>
                                    <span>Loading deposits...</span>
                                </div>
                            ) : deposits.length === 0 ? (
                                <div className="deposit-empty-state">
                                    <div className="deposit-empty-icon">
                                        <i className="bi bi-inbox"></i>
                                    </div>
                                    <h4 className="deposit-empty-title">No Deposits Found</h4>
                                    <p className="deposit-empty-desc">
                                        No deposit records have been added for {partyName || 'this party'} yet.
                                    </p>
                                    {canAdd && (
                                        <button
                                            type="button"
                                            className="deposit-btn-save"
                                            onClick={() => {
                                                setEditingDeposit(null);
                                                setAmount('');
                                                setRemarks('');
                                                setActiveTab('form');
                                            }}
                                        >
                                            <i className="bi bi-plus-circle me-1"></i>
                                            Make First Deposit
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="deposit-records-table-wrapper">
                                    <table className="deposit-records-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Date & Time</th>
                                                <th>Amount</th>
                                                <th>Remarks</th>
                                                <th>Added By</th>
                                                {(canEdit || canDelete) && <th className="text-end">Actions</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {deposits.map((dep, idx) => (
                                                <tr key={dep.id} className="deposit-table-row">
                                                    <td className="deposit-cell-index">{idx + 1}</td>
                                                    <td className="deposit-cell-date">
                                                        <div className="deposit-date-val">
                                                            {dep.createdAt ? formatDate(dep.createdAt) : '—'}
                                                        </div>
                                                        {dep.createdAt && (
                                                            <div className="deposit-time-val">
                                                                {new Date(dep.createdAt).toLocaleTimeString([], {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="deposit-cell-amount">
                                                        <span className="deposit-amount-badge">
                                                            {formatCurrency(dep.amount)}
                                                        </span>
                                                    </td>
                                                    <td className="deposit-cell-remarks">
                                                        <span className="deposit-remarks-text" title={dep.remarks || 'No remarks'}>
                                                            {dep.remarks || <span className="text-muted italic">—</span>}
                                                        </span>
                                                    </td>
                                                    <td className="deposit-cell-user">
                                                        <span className="deposit-user-tag" title={dep.createdBy || ''}>
                                                            {dep.createdBy ? dep.createdBy.split('@')[0] : '—'}
                                                        </span>
                                                    </td>
                                                    {(canEdit || canDelete) && (
                                                        <td className="deposit-cell-actions text-end">
                                                            <div className="deposit-row-actions">
                                                                {canEdit && (
                                                                    <button
                                                                        type="button"
                                                                        className="deposit-btn-action deposit-btn-edit"
                                                                        onClick={() => handleStartEdit(dep)}
                                                                        title="Edit this deposit"
                                                                        aria-label={`Edit deposit of ${dep.amount}`}
                                                                    >
                                                                        <i className="bi bi-pencil-fill"></i>
                                                                    </button>
                                                                )}
                                                                {canDelete && (
                                                                    <button
                                                                        type="button"
                                                                        className="deposit-btn-action deposit-btn-delete"
                                                                        onClick={() => setDepositToDelete(dep)}
                                                                        title="Delete this deposit"
                                                                        aria-label={`Delete deposit of ${dep.amount}`}
                                                                    >
                                                                        <i className="bi bi-trash-fill"></i>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab 2: Add / Edit Form */}
                    {activeTab === 'form' && (
                        <form onSubmit={handleSubmit} className="deposit-modal-form">
                            <div className="deposit-modal-body">
                                {/* Editing Alert Notice */}
                                {editingDeposit && (
                                    <div className="deposit-editing-banner">
                                        <div className="deposit-editing-info">
                                            <i className="bi bi-pencil-square me-2 text-warning"></i>
                                            <span>
                                                Editing Deposit <strong>#{editingDeposit.id}</strong>
                                                {editingDeposit.createdAt && (
                                                    <span className="ms-1 text-muted">
                                                        ({formatDate(editingDeposit.createdAt)})
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            className="deposit-btn-cancel-edit"
                                            onClick={handleCancelEdit}
                                        >
                                            <i className="bi bi-x-circle me-1"></i>
                                            Cancel Edit
                                        </button>
                                    </div>
                                )}

                                {/* Amount Field */}
                                <div className="deposit-form-group">
                                    <label className="deposit-form-label" htmlFor="deposit-amount-input">
                                        <i className="bi bi-currency-exchange me-1 text-primary"></i>
                                        Amount ({currencySymbol}) <span className="text-danger">*</span>
                                    </label>
                                    <div className="deposit-input-wrapper">
                                        <span className="deposit-currency-prefix">{currencySymbol}</span>
                                        <input
                                            id="deposit-amount-input"
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            className="deposit-form-control deposit-amount-input"
                                            placeholder="0.00"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            required
                                            autoFocus
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    {/* Quick Amount Suggestion Chips */}
                                    <div className="deposit-quick-chips">
                                        <span className="deposit-chips-label">Quick Add:</span>
                                        {[500, 1000, 2000, 5000, 10000].map((chipVal) => (
                                            <button
                                                key={chipVal}
                                                type="button"
                                                className="deposit-chip-btn"
                                                onClick={() => handleAddAmount(chipVal)}
                                                disabled={isSubmitting}
                                            >
                                                +{currencySymbol}{chipVal.toLocaleString()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Remarks Field */}
                                <div className="deposit-form-group">
                                    <label className="deposit-form-label" htmlFor="deposit-remarks-input">
                                        <i className="bi bi-chat-left-text me-1 text-secondary"></i>
                                        Remarks / Notes
                                    </label>
                                    <textarea
                                        id="deposit-remarks-input"
                                        className="deposit-form-control deposit-remarks-textarea"
                                        rows={3}
                                        placeholder="e.g., Security deposit, advance payment, contract guarantee..."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        disabled={isSubmitting}
                                        maxLength={500}
                                    />
                                    <div className="deposit-field-hint d-flex justify-content-between">
                                        <span>Optional note or description for this deposit record.</span>
                                        <span>{remarks.length} / 500</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="deposit-modal-footer">
                                <button
                                    type="button"
                                    className="deposit-btn-cancel"
                                    onClick={() => {
                                        if (editingDeposit) {
                                            handleCancelEdit();
                                        } else if (deposits.length > 0) {
                                            setActiveTab('list');
                                        } else {
                                            onClose();
                                        }
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="deposit-btn-save"
                                    disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                                            Saving...
                                        </>
                                    ) : editingDeposit ? (
                                        <>
                                            <i className="bi bi-check2-circle me-1"></i>
                                            Update Deposit
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-cash-coin me-1"></i>
                                            Save Deposit
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Confirmation Modal for Delete Action */}
            {depositToDelete && (
                <ConfirmationModal
                    isOpen={Boolean(depositToDelete)}
                    onClose={() => setDepositToDelete(null)}
                    onConfirm={handleConfirmDelete}
                    title="Delete Deposit Record"
                    message={`Are you sure you want to delete this deposit record of ${formatCurrency(depositToDelete.amount)} (${partyName})? This action cannot be undone.`}
                    confirmText="Yes, Delete Deposit"
                    cancelText="No, Keep It"
                    type="danger"
                />
            )}
        </>
    );
};
