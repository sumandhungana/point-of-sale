import React from 'react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Yes, Delete',
  cancelText = 'No, Keep it',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return 'bi-exclamation-triangle-fill';
      case 'warning':
        return 'bi-exclamation-circle-fill';
      case 'info':
        return 'bi-info-circle-fill';
      default:
        return 'bi-exclamation-triangle-fill';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'danger':
        return '#ff6b6b';
      case 'warning':
        return '#ffc107';
      case 'info':
        return '#17a2b8';
      default:
        return '#ff6b6b';
    }
  };

  return (
    <div className="confirm-modal-backdrop" role="dialog" aria-modal="true" aria-label="Confirm action">
      <div className="confirm-modal">
        <div className="confirm-modal-header">
          <i className={`bi ${getIcon()}`} style={{ color: getIconColor() }}></i>
          {title}
        </div>
        <div className="confirm-modal-body">
          {message}
        </div>
        <div className="confirm-modal-actions">
          <button className="confirm-btn cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button className={`confirm-btn ${type}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 