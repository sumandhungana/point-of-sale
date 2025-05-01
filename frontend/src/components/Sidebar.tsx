import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getKhataBooks, KhataBook } from '../services/khataBookService';
import logo from '../assets/logo.png';

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
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [khataBooks, setKhataBooks] = useState<KhataBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to find all parent paths for the current location
  const findParentPaths = (items: NavItem[], currentPath: string): string[] => {
    const parentPaths: string[] = [];
    
    const findParents = (items: NavItem[], path: string): boolean => {
      for (const item of items) {
        if (item.children) {
          if (item.children.some(child => 
            child.path === path || 
            (child.children && findParents([child], path))
          )) {
            parentPaths.push(item.path);
            return true;
          }
        }
      }
      return false;
    };

    findParents(items, currentPath);
    return parentPaths;
  };

  // Update expanded items when location changes
  useEffect(() => {
    const parentPaths = findParentPaths(navItems, location.pathname);
    setExpandedItems(prev => {
      const newExpanded = { ...prev };
      parentPaths.forEach(path => {
        newExpanded[path] = true;
      });
      return newExpanded;
    });
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchKhataBooks = async () => {
      if (isPopupOpen) {
        setLoading(true);
        setError(null);
        try {
          const data = await getKhataBooks();
          setKhataBooks(data);
        } catch (err) {
          setError('Failed to load KhataBooks');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchKhataBooks();
  }, [isPopupOpen]);

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
    logoContainer: {
      padding: '1rem',
      borderBottom: '1px solid #dee2e6',
      marginBottom: '1rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      maxWidth: '80%',
      height: 'auto',
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
      marginBottom: '1rem',
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
      overflow: 'hidden',
    },
    userImageImg: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
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
    loadingText: {
      textAlign: 'center' as const,
      padding: '1rem',
      color: '#6c757d',
    },
    errorText: {
      textAlign: 'center' as const,
      padding: '1rem',
      color: '#dc3545',
    },
  };

  const isActive = (path: string, item: NavItem) => {
    // Special handling for root paths
    if (path === '/') {
      return false;
    }

    // Check if the current path starts with the item's path
    const isPathActive = location.pathname.startsWith(path);
    
    // If this is a parent item, check if any of its children are active
    if (item.children) {
      const hasActiveChild = item.children.some(child => {
        // For nested children, check if the current path exactly matches or starts with the child path
        if (child.children) {
          return child.children.some(nestedChild => 
            location.pathname === nestedChild.path || 
            location.pathname.startsWith(nestedChild.path)
          );
        }
        return location.pathname === child.path || 
               location.pathname.startsWith(child.path);
      });
      return hasActiveChild;
    }
    
    return isPathActive;
  };

  const toggleItem = (path: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const renderNavItems = (items: NavItem[], level = 0) => {
    return items.map((item) => {
      const hasChildren = !!item.children?.length;
      const isExpanded = expandedItems[item.path];
      const active = isActive(item.path, item);

      return (
        <li key={item.path} style={level > 0 ? styles.nestedNavItem : styles.navItem}>
          <div
            onClick={() => hasChildren ? toggleItem(item.path) : navigate(item.path)}
            style={{
              ...styles.navLink,
              ...(active ? styles.activeNavLink : {}),
              cursor: 'pointer',
              paddingLeft: `${0.75 + (level * 0.5)}rem`,
            }}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            <span style={styles.navText}>{item.title}</span>
            {hasChildren && <span style={{ marginLeft: 'auto' }}>{isExpanded ? '▾' : '▸'}</span>}
          </div>

          {hasChildren && isExpanded && (
            <ul style={styles.nestedNavItems}>
              {renderNavItems(item.children!, level + 1)}
            </ul>
          )}
        </li>
      );
    });
  };

  const handleAddKhatabook = () => {
    setIsPopupOpen(false);
    navigate('/add-khatabook');
  };

  const handleKhataBookClick = async (khataBook: KhataBook) => {
    try {
      const response = await fetch(`/api/KhataBook/${khataBook.id}/switch-schema`);
      if (response.ok) {
        localStorage.setItem('companyName', khataBook.companyName);
        alert('Successfully switched to KhataBook: ' + khataBook.companyName);
        window.location.reload();
      } else {
        const errorData = await response.json();
        alert('Failed to switch KhataBook: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error switching KhataBook:', error);
      alert('Failed to switch KhataBook. Please try again.');
    }
    setIsPopupOpen(false);
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.logoContainer}>
        <img src={logo} alt="Logo" style={styles.logo} />
      </div>
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
              <h2 style={styles.popupTitle}>KhataBooks</h2>
              <button 
                style={styles.closeButton}
                onClick={() => setIsPopupOpen(false)}
              >
                ×
              </button>
            </div>
            <div style={styles.userCardsContainer}>
              {loading ? (
                <p style={styles.loadingText}>Loading KhataBooks...</p>
              ) : error ? (
                <p style={styles.errorText}>{error}</p>
              ) : khataBooks.length === 0 ? (
                <p style={styles.loadingText}>No KhataBooks found</p>
              ) : (
                khataBooks.map((khataBook) => (
                  <div 
                    key={khataBook.id} 
                    style={styles.userCard}
                    onClick={() => handleKhataBookClick(khataBook)}
                  >
                  <div style={styles.userImage}>
                      {khataBook.imagePath ? (
                        <img 
                          src={khataBook.imagePath} 
                          alt={khataBook.name} 
                          style={styles.userImageImg}
                        />
                      ) : (
                        '👤'
                      )}
                  </div>
                  <div style={styles.userDetails}>
                      <h3 style={styles.companyName}>{khataBook.companyName}</h3>
                      <p style={styles.userInfoText}>{khataBook.companyNumber}</p>
                      <p style={styles.userInfoText}>{khataBook.name}</p>
                    </div>
                  </div>
                ))
              )}
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
        <ul style={styles.navItems}>
          {renderNavItems(navItems)}
        </ul>
      </div>
    </div>
  );
}; 
