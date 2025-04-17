import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  title: string;
  path: string;
  icon: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'PARTIES',
    path: '/parties',
    icon: '👥',
    children: [
      { title: 'Customer', path: '/parties/customers', icon: '👤' },
      { title: 'Suppliers', path: '/parties/suppliers', icon: '🏢' },
      { title: 'Branch', path: '/parties/branch', icon: '🏪' },
      {
        title: 'Deposit Amount',
        path: '/parties/deposit-amount',
        icon: '💰',
        children: [
          { title: 'Customer Deposit', path: '/parties/deposit-amount/customer', icon: '💳' },
          { title: 'Suppliers Deposit', path: '/parties/deposit-amount/suppliers', icon: '💳' },
        ],
      },
      {
        title: 'Cash & Bank',
        path: '/parties/cash-bank',
        icon: '💵',
        children: [
          { title: 'Cash In Hand', path: '/parties/cash-bank/cash', icon: '💵' },
          { title: 'Bank Deposit', path: '/parties/cash-bank/bank', icon: '🏦' },
        ],
      },
    ],
  },
  {
    title: 'MANAGE INVENTORY',
    path: '/inventory',
    icon: '📦',
    children: [
      {
        title: 'Items',
        path: '/',
        icon: '📦',
        children: [
          { title: 'PRODUCTS', path: '/inventory/items', icon: '📦' },
          { title: 'SERVICES', path: '/service', icon: '🔧' },
        ],
      },
      {
        title: 'Bills',
        path: '/',
        icon: '📄',
        children: [
          { title: 'Sales', path: '/bills/sales', icon: '💰' },
          { title: 'Purchase', path: '/bills/purchase', icon: '🛒' },
          { title: 'Expenses', path: '/bills/expenses', icon: '💸' },
          { title: 'Income', path: '/bills/income', icon: '💸' },
          { title: 'Cashbook', path: '/bills/cashbook', icon: '📒' },
        ],
      },
    ],
  },
  {
    title: 'OTHERS',
    path: '/others',
    icon: '📦',
    children: [
      { title: 'Staff MGMT', path: '/staff', icon: '👨‍💼' },
      // { title: 'Rental Items', path: '/others/rental', icon: '📦' },
      { title: 'Rental Items', path: '/rental-items', icon: '📦' },
      { title: 'Note', path: '/others/note', icon: '📝' },
    ],
  },
  {
    title: 'REPORTS',
    path: '/reports',
    icon: '📊',
    children: [
      { title: 'Sales Report', path: '/reports/sales', icon: '💰' },
      { title: 'Purchase Report', path: '/reports/purchase', icon: '🛒' },
      { title: 'Total Sale Report', path: '/reports/total-sale', icon: '📈' },
    ],
  },
  {
    title: 'SYSTEM',
    path: '/system',
    icon: '⚙️',
    children: [
      { title: 'Multi User Login', path: '/system/multi-user', icon: '👥' },
      { title: 'Reminder', path: '/system/reminder', icon: '⏰' },
      { title: 'Import Data', path: '/system/import', icon: '📥' },
      { title: 'Notis', path: '/system/notis', icon: '🔔' },
    ],
  },
  {
    title: 'SETTINGS',
    path: '/settings',
    icon: '⚙️',
    children: [
      { title: 'API', path: '/settings/api', icon: '💬' },
      { title: 'Organization', path: '/user', icon: '🌐' },
      { title: 'Backup', path: '/settings/backup', icon: '💾' },
      { title: 'Recycle Bin', path: '/settings/recycle-bin', icon: '🗑️' },
      { title: 'Role & Permission', path: '/role-and-permission', icon: '🔒' },
      { title: 'App Setting', path: '/app-settings', icon: '⚙️' },
      { title: 'Bills & Print Selling', path: '/bills-and-print-selling', icon: '📄' },
      { title: 'Delete Khata', path: '/settings/delete-khata', icon: '❌' },
      { title: 'Business Setting', path: '/settings/business', icon: '🏢' },
      { title: 'Dashboard Setting', path: '/settings/dashboard', icon: '📊' },
    ],
  },
  {
    title: 'ABOUTS',
    path: '/abouts',
    icon: 'ℹ️',
    children: [
      { title: 'Name Of App', path: '/abouts/app-name', icon: '📱' },
      { title: 'Backup Info', path: '/abouts/backup-info', icon: '💾' },
      { title: 'Privacy Policy', path: '/abouts/privacy', icon: '🔒' },
      { title: 'Terms & Conditions', path: '/abouts/terms', icon: '📜' },
      { title: 'Version', path: '/abouts/version', icon: '🔄' },
    ],
  },
];

interface UserCard {
  id: string;
  name: string;
  company: string;
  phone: string;
  role: string;
  image: string;
}

const userCards: UserCard[] = [
  {
    id: '1',
    name: 'John Doe',
    company: 'ABC Corporation',
    phone: '+1 234 567 8901',
    role: 'Admin',
    image: '👤',
  },
  {
    id: '2',
    name: 'Jane Smith',
    company: 'XYZ Enterprises',
    phone: '+1 234 567 8902',
    role: 'Manager',
    image: '👤',
  },
  {
    id: '3',
    name: 'Robert Johnson',
    company: '123 Industries',
    phone: '+1 234 567 8903',
    role: 'Staff',
    image: '👤',
  },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const styles = {
    sidebar: {
      zIndex: 1001,
      width: '280px',
      height: '100vh',
      background: 'white',
      borderRight: '1px solid #dee2e6',
      position: 'fixed' as const,
      left: 0,
      top: 0,
      overflowY: 'auto' as const,
      padding: '1rem 0',
    },
    userSection: {
      padding: '1rem',
      borderBottom: '1px solid #dee2e6',
      marginBottom: '1rem',
      cursor: 'pointer',
    },
    userProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: '#e9ecef',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      color: '#6c757d',
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      margin: 0,
      fontSize: '1rem',
      fontWeight: 'bold',
      color: '#212529',
    },
    userRole: {
      margin: 0,
      fontSize: '0.875rem',
      color: '#6c757d',
    },
    popupContainer: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    popupContent: {
      background: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      width: '80%',
      maxWidth: '600px',
      maxHeight: '80vh',
      overflowY: 'auto' as const,
    },
    popupHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    popupTitle: {
      margin: 0,
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#212529',
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      color: '#6c757d',
    },
    userCardsContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1rem',
    },
    userCard: {
      background: 'white',
      border: '1px solid #dee2e6',
      borderRadius: '8px',
      padding: '1rem',
      display: 'flex',
      gap: '1rem',
    },
    userImage: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      background: '#e9ecef',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.5rem',
      color: '#6c757d',
    },
    userDetails: {
      flex: 1,
    },
    companyName: {
      margin: 0,
      fontSize: '1rem',
      fontWeight: 'bold',
      color: '#212529',
    },
    userInfoText: {
      margin: '0.25rem 0',
      fontSize: '0.875rem',
      color: '#6c757d',
    },
    addButton: {
      width: '100%',
      padding: '0.75rem',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: 'bold',
      marginTop: '1rem',
    },
    navSection: {
      padding: '0 1rem',
    },
    navGroup: {
      marginBottom: '1.5rem',
    },
    navGroupTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 0',
      color: '#6c757d',
      fontSize: '0.875rem',
      fontWeight: 'bold',
    },
    navItems: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
    },
    navItem: {
      marginBottom: '0.25rem',
    },
    navLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 0.75rem',
      color: '#212529',
      textDecoration: 'none',
      borderRadius: '4px',
      fontSize: '0.875rem',
      transition: 'background-color 0.2s',
      '&:hover': {
        background: '#f8f9fa',
      },
    },
    activeNavLink: {
      background: '#e9ecef',
      color: '#dc4c39',
    },
    nestedNavItems: {
      listStyle: 'none',
      padding: '0 0 0 1.5rem',
      margin: '0.25rem 0',
    },
    nestedNavItem: {
      marginBottom: '0.25rem',
    },
    navIcon: {
      marginRight: '0.5rem',
    },
    navText: {
      margin: 0,
    },
    link: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 0.75rem',
      color: '#212529',
      textDecoration: 'none',
      borderRadius: '4px',
      fontSize: '0.875rem',
      transition: 'background-color 0.2s',
      '&:hover': {
        background: '#f8f9fa',
      },
    },
    icon: {
      marginRight: '0.5rem',
    },
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const renderNavItems = (items: NavItem[], level = 0) => {
    return items.map((item) => (
      <li key={item.path} style={level > 0 ? styles.nestedNavItem : styles.navItem}>
        <Link
          to={item.path}
          style={{
            ...styles.navLink,
            ...(isActive(item.path) ? styles.activeNavLink : {}),
            paddingLeft: `${0.75 + (level * 0.5)}rem`,
          }}
        >
          <span style={styles.navIcon}>{item.icon}</span>
          <span style={styles.navText}>{item.title}</span>
        </Link>
        {item.children && (
          <ul style={styles.nestedNavItems}>
            {renderNavItems(item.children, level + 1)}
          </ul>
        )}
      </li>
    ));
  };

  const handleAddKhatabook = () => {
    setIsPopupOpen(false);
    navigate('/add-khatabook');
  };

  return (
    <div style={styles.sidebar}>
      <div 
        style={styles.userSection}
        onClick={() => setIsPopupOpen(true)}
      >
        <div style={styles.userProfile}>
          <div style={styles.avatar}>
            {user?.image || '👤'}
          </div>
          <div style={styles.userInfo}>
            <h3 style={styles.userName}>{user?.name || 'User'}</h3>
            <p style={styles.userRole}>{user?.role || 'Role'}</p>
          </div>
        </div>
      </div>

      {isPopupOpen && (
        <div style={styles.popupContainer}>
          <div style={styles.popupContent} ref={popupRef}>
            <div style={styles.popupHeader}>
              <h2 style={styles.popupTitle}>User Accounts</h2>
              <button 
                style={styles.closeButton}
                onClick={() => setIsPopupOpen(false)}
              >
                ×
              </button>
            </div>
            <div style={styles.userCardsContainer}>
              {userCards.map((card) => (
                <div key={card.id} style={styles.userCard}>
                  <div style={styles.userImage}>
                    {card.image}
                  </div>
                  <div style={styles.userDetails}>
                    <h3 style={styles.companyName}>{card.company}</h3>
                    <p style={styles.userInfoText}>{card.phone}</p>
                    <p style={styles.userInfoText}>{card.role}</p>
                  </div>
                </div>
              ))}
            </div>
            <button 
              style={styles.addButton}
              onClick={handleAddKhatabook}
            >
              Add New Khatabook
            </button>
          </div>
        </div>
      )}

      <div style={styles.navSection}>
        {navItems.map((group) => (
          <div key={group.path} style={styles.navGroup}>
            <div style={styles.navGroupTitle}>
              <span>{group.icon}</span>
              {group.title}
            </div>
            <ul style={styles.navItems}>
              {renderNavItems(group.children || [])}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}; 