import React from 'react';
import ReactDOM from 'react-dom';

interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    // Renders modal directly into <body> instead of inside page container
    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content large"
                onClick={(e) => e.stopPropagation()} // Prevents backdrop click when clicking inside
            >
                {children}
            </div>
        </div>,
        document.body
    );
};

export default RoleModal;