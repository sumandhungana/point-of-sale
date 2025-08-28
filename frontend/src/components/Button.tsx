import React from 'react';
import '../styles/Button.css';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  onClick,
  type = 'button',
  className = '',
  fullWidth = false
}) => {
  const baseClass = 'standard-button';
  const variantClass = `standard-button-${variant}`;
  const sizeClass = `standard-button-${size}`;
  const widthClass = fullWidth ? 'standard-button-full-width' : '';
  const loadingClass = loading ? 'standard-button-loading' : '';

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${loadingClass} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
    >
      {loading && (
        <div className="standard-button-spinner"></div>
      )}
      {icon && !loading && (
        <i className={`bi ${icon}`}></i>
      )}
      {children}
    </button>
  );
}; 