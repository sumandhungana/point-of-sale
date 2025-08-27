import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const checkForUpdates = () => {
    // Implement update check logic here
    alert('Checking for updates...');
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      right: 0,
      left: 0,
      height: '54px',
      backgroundColor: 'var(--top-menu-bg-color, white)',
      color: 'var(--top-menu-font-color, #212529)',
      borderBottom: '3px solid #dc3545',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1rem',
      zIndex: 1000,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => navigate('/') }>
        <img src={logo} alt="Khatabook" style={{ height: '185px', width: 'auto', marginLeft: '54px',marginBottom: '6px' }} />
        {/* <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#2c3e50', letterSpacing: '0.5px' }}>KHATABOOK</span> */}
      </div>
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
        }} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
          <div style={{
            width: '35px',
            height: '35px',
            borderRadius: '50%',
            background: '#f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            color: '#666',
            marginBottom: '2px',
          }}>
            👤
          </div>
          <span style={{
            fontSize: '0.75rem',
            color: '#666',
            fontWeight: 500,
          }}>
            {user?.username || 'User'}
          </span>
        </div>
        
        {isDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            minWidth: '200px',
            marginTop: '0.5rem',
          }}>
            <div style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #dee2e6',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }} onClick={checkForUpdates}>
              <span>🔄</span> Check for Updates
            </div>
            <div style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #dee2e6',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }} onClick={toggleFullScreen}>
              <span>⤢</span> Toggle Fullscreen
            </div>
            <div style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #dee2e6',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
            }}>
              <span>ℹ️</span> Version 1.0.0
            </div>
            <div style={{
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              color: '#dc3545',
            }} onClick={logout}>
              <span>🚪</span> Logout
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 