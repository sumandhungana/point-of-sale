import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import Navbar from '../components/Navbar';

export const Permission = () => {
  const [selectedRole, setSelectedRole] = useState('');

  const styles = {
    container: {
      width: '100%',
      padding: '2rem',
    },
    selectContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '2rem',
    },
    select: {
      padding: '0.75rem',
      width: '300px',
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      fontSize: '1rem',
    },
    sectionHeader: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#495057',
      marginBottom: '1.5rem',
      borderBottom: '1px solid #dee2e6',
      paddingBottom: '0.5rem',
    },
    cardGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1.5rem',
    },
    card: {
      background: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    cardHeader: {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      color: '#495057',
      marginBottom: '1rem',
      borderBottom: '1px solid #dee2e6',
      paddingBottom: '0.5rem',
    },
    checkboxGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.9rem',
      color: '#495057',
    },
  };

  const permissionCards = [
    {
      title: 'Organization',
      permissions: [
        'view organization info', 'update organization info', 'view search',
        'view an branch', 'create branch', 'update branch', 'delete branch'
      ]
    },
    {
      title: 'Reseller',
      permissions: [
        'view reseller', 'add reseller', 'edit reseller', 'update reseller', 'delete reseller'
      ]
    },
    {
      title: 'User',
      permissions: [
        'view user', 'add user', 'edit user', 'update user', 'reset user password'
      ]
    },
    {
      title: 'Report',
      permissions: ['view report', 'view all report']
    },
    {
      title: 'Staff',
      permissions: [
        'view entry', 'add entry', 'edit entry', 'delete entry', 'Update entry'
      ]
    },
    {
      title: 'Notification',
      permissions: ['view notification', 'delete notification']
    },
    {
      title: 'Customer',
      permissions: [
        'view Customer', 'create Customer', 'edit Customer', 'update Customer', 'delete Customer'
      ]
    },
    {
      title: 'Suppliers',
      permissions: [
        'view Supplier', 'create Supplier', 'edit Supplier', 'update Supplier', 'delete Supplier'
      ]
    },
    {
      title: 'Bill',
      permissions: [
        'view bill', 'add bill', 'edit bill', 'update bill', 'delete bill'
      ]
    },
    {
      title: 'Inventory',
      permissions: [
        'view inventory', 'add inventory', 'edit inventory', 'update inventory', 'delete inventory'
      ]
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ 
        flex: 1, 
        marginLeft: '50px',
        paddingTop: '60px',
        minHeight: '100vh',
        background: '#f8f9fa',
      }}>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.selectContainer}>
            <select 
              style={styles.select}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              <option value="">Select Role</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          <h2 style={styles.sectionHeader}>Permission Role</h2>

          <div style={styles.cardGrid}>
            {permissionCards.map((card, index) => (
              <div key={index} style={styles.card}>
                <h3 style={styles.cardHeader}>{card.title}</h3>
                <div style={styles.checkboxGroup}>
                  {card.permissions.map((permission, pIndex) => (
                    <label key={pIndex} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name={`${card.title.toLowerCase()}-${permission}`}
                      />
                      {permission}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 