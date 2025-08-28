import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BackButton.css';

interface BackButtonProps {
  to?: string;
  label?: string;
  className?: string;
  onClick?: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ 
  to, 
  label = 'Back', 
  className = '',
  onClick 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      className={`back-button ${className}`}
      onClick={handleClick}
      aria-label={`Go back to ${label.toLowerCase()}`}
      type="button"
    >
      <i className="bi bi-arrow-left"></i>
      {label}
    </button>
  );
}; 