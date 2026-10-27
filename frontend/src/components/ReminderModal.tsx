import React, { useState, useEffect } from 'react';
import '../styles/ReminderModal.css';

interface ReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDate?: string | null;
    partyName?: string;
    partyType: 'Customer' | 'Supplier';
    partyId?: string | number | null;
    initialRemarks?: string | null;
    onSave: (date: string, remarks?: string) => Promise<void> | void;
    onClear?: () => Promise<void> | void;
}

const formatLocalDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const ReminderModal: React.FC<ReminderModalProps> = ({
    isOpen,
    onClose,
    initialDate,
    partyName,
    partyType,
    partyId,
    initialRemarks,
    onSave,
    onClear,
}) => {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [remarks, setRemarks] = useState<string>('');
    const [activeRemarks, setActiveRemarks] = useState<string>('');
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isClearing, setIsClearing] = useState<boolean>(false);

    const todayStr = formatLocalDate(new Date());
    const storageKey = `reminder_remarks_${partyType.toLowerCase()}_${partyId || partyName || 'default'}`;

    useEffect(() => {
        if (isOpen) {
            if (initialDate) {
                // If ISO string like 2026-10-30T00:00:00, extract YYYY-MM-DD
                const cleanDate = initialDate.split('T')[0];
                setSelectedDate(cleanDate);
            } else {
                // Default to tomorrow for quick convenience
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setSelectedDate(formatLocalDate(tomorrow));
            }

            // Load remarks from localStorage or initialRemarks
            const savedRemarks = localStorage.getItem(storageKey) || initialRemarks || '';
            setRemarks(savedRemarks);
            setActiveRemarks(savedRemarks);
        }
    }, [isOpen, initialDate, initialRemarks, storageKey]);

    // Handle escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!selectedDate) return;
        setIsSaving(true);
        try {
            const cleanRemarks = remarks.trim();
            if (cleanRemarks) {
                localStorage.setItem(storageKey, cleanRemarks);
            } else {
                localStorage.removeItem(storageKey);
            }
            setActiveRemarks(cleanRemarks);
            await onSave(selectedDate, cleanRemarks);
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    const handleClear = async () => {
        if (!onClear) return;
        setIsClearing(true);
        try {
            localStorage.removeItem(storageKey);
            setRemarks('');
            setActiveRemarks('');
            await onClear();
            setSelectedDate('');
            onClose();
        } finally {
            setIsClearing(false);
        }
    };

    const cleanInitialDate = initialDate ? initialDate.split('T')[0] : null;

    return (
        <div className="reminder-modal-overlay" onClick={onClose}>
            <div
                className="reminder-modal-card"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="reminder-modal-title"
            >
                {/* Header */}
                <div className="reminder-modal-header">
                    <div className="reminder-modal-header-left">
                        <div className="reminder-modal-icon-badge">
                            <i className="bi bi-calendar-check"></i>
                        </div>
                        <div>
                            <h3 id="reminder-modal-title" className="reminder-modal-title">
                                Set Reminder Date
                            </h3>
                            <p className="reminder-modal-subtitle">
                                {partyType}: {partyName || `${partyType} #${partyType === 'Customer' ? 'Profile' : 'Account'}`}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="reminder-modal-close"
                        onClick={onClose}
                        aria-label="Close"
                        title="Close popup"
                    >
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                {/* Body */}
                <div className="reminder-modal-body">
                    {/* Active Reminder Banner */}
                    {cleanInitialDate && (
                        <div className="reminder-active-banner">
                            <div className="reminder-active-info">
                                <i className="bi bi-bell-fill"></i>
                                <div className="reminder-active-text-block">
                                    <span>
                                        Active: <strong>{cleanInitialDate}</strong>
                                    </span>
                                    {activeRemarks && (
                                        <div className="reminder-active-remarks" title={activeRemarks}>
                                            <i className="bi bi-chat-quote-fill me-1"></i>
                                            <span>{activeRemarks}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {onClear && (
                                <button
                                    type="button"
                                    className="reminder-clear-btn"
                                    onClick={handleClear}
                                    disabled={isClearing}
                                    title="Remove this reminder"
                                >
                                    <i className="bi bi-trash3"></i>
                                    {isClearing ? 'Clearing...' : 'Clear'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Date Picker Input */}
                    <div className="reminder-date-input-group">
                        <label htmlFor="reminder-popup-date-picker">
                            <i className="bi bi-calendar3 text-primary"></i>
                            Select Reminder Date
                        </label>
                        <div className="reminder-date-input-wrapper">
                            <input
                                id="reminder-popup-date-picker"
                                type="date"
                                className="reminder-calendar-input"
                                value={selectedDate}
                                min={todayStr}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <p className="reminder-hint">
                            <i className="bi bi-info-circle"></i>
                            Set a date to be notified for payment follow-up.
                        </p>
                    </div>

                    {/* Remarks Input Area (Replacing Quick Select) */}
                    <div className="reminder-remarks-group">
                        <div className="reminder-remarks-label-row">
                            <label htmlFor="reminder-remarks-input">
                                <i className="bi bi-chat-left-text text-primary"></i>
                                Remarks / Notes
                            </label>
                        </div>
                        <div className="reminder-remarks-wrapper">
                            <textarea
                                id="reminder-remarks-input"
                                className="reminder-remarks-textarea"
                                placeholder="Add follow-up remarks or notes (e.g. Promised to pay by cash, follow up in afternoon)..."
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                rows={3}
                                maxLength={250}
                            />
                            <div className="reminder-remarks-counter">
                                {remarks.length}/250
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="reminder-modal-footer">
                    <button
                        type="button"
                        className="btn-reminder-cancel"
                        onClick={onClose}
                        disabled={isSaving || isClearing}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="btn-reminder-save"
                        onClick={handleSave}
                        disabled={isSaving || isClearing || !selectedDate}
                    >
                        {isSaving ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check-lg"></i>
                                Set Reminder
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReminderModal;
