import React from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import '../styles/RoleAndPermission.css';

export const RoleAndPermission = () => {
  const navigate = useNavigate();

  return (
    <div className="role-permission-page-wrapper">
      <Sidebar />
      <div className="role-permission-container">
        <Navbar />
        <div className="role-permission-card">
          <div className="role-permission-form-card">
            <div className="role-permission-button-container">
              <button 
                className="role-permission-button"
                onClick={() => navigate('/role')}
              >
                <i className="bi bi-shield-check"></i>
                Role
              </button>
              <button 
                className="role-permission-button"
                onClick={() => navigate('/permission')}
              >
                <i className="bi bi-shield-lock"></i>
                Permission
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 