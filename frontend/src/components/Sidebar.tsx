import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getKhataBooks, switchKhataBook, getSelectedKhataBook, KhataBook } from '../services/khataBookService';
import dashboardIcon from '../assets/dashboard.png';
import '../styles/Sidebar.css';

interface NavItem {
  title: string;
  path: string;
  icon: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', path: '/dashboard', icon: '📊' },
  {
    title: 'Parties',
    path: '/parties',
    icon: '👥',
    children: [
      { title: 'Customer', path: '/parties/customers', icon: '👤' },
      { title: 'Suppliers', path: '/parties/suppliers', icon: '🏢' },
      { title: 'Cash In Hand', path: '/parties/cash-bank/cash', icon: '💵' },
      { title: 'Bank Deposit', path: '/parties/cash-bank/bank', icon: '🏦' },
    ],
  },
  {
    title: 'MANAGE INVENTORY',
    path: '/inventory',
    icon: '📦',
    children: [
      { title: 'PRODUCTS', path: '/inventory/items', icon: '📦' },
      { title: 'SERVICES', path: '/service', icon: '🔧' },
      { title: 'Sales', path: '/bills/sales', icon: '💰' },
      { title: 'Purchase', path: '/bills/purchase', icon: '🛒' },
      { title: 'Expenses', path: '/bills/expenses', icon: '💸' },
      { title: 'Income', path: '/bills/income', icon: '💸' },
      { title: 'Cashbook', path: '/bills/cashbook', icon: '📒' },
    ],
  },
  {
    title: 'OTHERS',
    path: '/others',
    icon: '📦',
    children: [
      { title: 'Staff MGMT', path: '/staff', icon: '👨‍💼' },
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
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    '/parties': true // Always keep Parties menu expanded
  });
  const [khataBooks, setKhataBooks] = useState<KhataBook[]>([]);
  const [currentKhataBook, setCurrentKhataBook] = useState<KhataBook | null>(null);
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
      // Always keep Parties menu expanded
      newExpanded['/parties'] = true;
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
          console.log('Fetched KhataBooks:', data);
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

  // Fetch current selected KhataBook on component mount
  useEffect(() => {
    const fetchCurrentKhataBook = async () => {
      try {
        const selectedKhataBook = await getSelectedKhataBook();
        console.log('Current selected KhataBook:', selectedKhataBook);
        setCurrentKhataBook(selectedKhataBook);
      } catch (err) {
        console.error('Failed to fetch current KhataBook:', err);
        // If no KhataBook is selected, we should show a message or handle it gracefully
        setCurrentKhataBook(null);
      }
    };

    fetchCurrentKhataBook();
  }, []);

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
    // Prevent Parties menu from being collapsed
    if (path === '/parties') {
      return;
    }
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
        <li key={item.path} className={`${level > 0 ? 'nested-nav-item' : 'nav-item'} mb-2`}>
          <div
            onClick={() => hasChildren ? toggleItem(item.path) : navigate(item.path)}
            className={`${level > 0 ? 'nested-nav-link' : 'nav-link'} ${active ? 'active' : ''} d-flex align-items-center py-2 px-3 rounded`}
            style={{ paddingLeft: `${0.75 + (level * 0.5)}rem` }}
          >
            <span className={`${level > 0 ? 'nested-nav-icon' : 'nav-icon'} me-2`}>
              {item.title === 'Dashboard' ? (
                <img src={dashboardIcon} alt="Dashboard" style={{ width: '28px', height: '28px' }} />
              ) : (
                item.icon
              )}
            </span>
            <span className={`${level > 0 ? 'nested-nav-text' : 'nav-text'} flex-grow-1`}>{item.title}</span>
            {hasChildren && item.path !== '/parties' && <span className="expand-icon ms-auto">{isExpanded ? '▾' : '▸'}</span>}
          </div>

          {hasChildren && isExpanded && (
            <ul className="nested-nav-items list-unstyled ms-3 mt-2">
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
      console.log('Switching to KhataBook:', khataBook);
      await switchKhataBook(khataBook.id);
      setCurrentKhataBook(khataBook);
      localStorage.setItem('companyName', khataBook.companyName);
      localStorage.setItem('selectedKhataBookId', khataBook.id.toString());
      
      // Refresh the page to load new KhataBook data
      window.location.reload();
    } catch (error) {
      console.error('Error switching KhataBook:', error);
      alert('Failed to switch KhataBook. Please try again.');
    }
    setIsPopupOpen(false);
  };

  return (
    <div className="sidebar">
      {/* Logo moved to Navbar */}
      
      <div 
        className="user-section"
        onClick={() => setIsPopupOpen(true)}
      >
        <div className="user-profile">
          <div className="avatar">
            {'👤'}
          </div>
          <div className="user-info">
            <h3 className="user-name">{user?.username || 'User'}</h3>
            <p className="user-role">
              {currentKhataBook?.companyName || 'No KhataBook Selected'}
            </p>
          </div>
        </div>
      </div>

      {isPopupOpen && (
        <div className="popup-container">
          <div className="popup-content" ref={popupRef}>
            <div className="popup-header">
              <h2 className="popup-title">
                <i className="bi bi-building"></i>
                KhataBooks
              </h2>
              <button 
                className="close-button"
                onClick={() => setIsPopupOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="user-cards-container">
              {loading ? (
                <p className="loading-text">Loading KhataBooks...</p>
              ) : error ? (
                <p className="error-text">{error}</p>
              ) : khataBooks.length === 0 ? (
                <p className="loading-text">No KhataBooks found</p>
              ) : (
                khataBooks.map((khataBook) => (
                  <div 
                    key={khataBook.id} 
                    className="user-card"
                    onClick={() => handleKhataBookClick(khataBook)}
                  >
                    <div className="user-image">
                      {khataBook.imagePath ? (
                        <img 
                          src={khataBook.imagePath} 
                          alt={khataBook.name} 
                          className="user-image-img"
                        />
                      ) : (
                        '👤'
                      )}
                    </div>
                    <div className="user-details">
                      <h3 className="company-name">{khataBook.companyName}</h3>
                      <p className="user-info-text">{khataBook.companyNumber}</p>
                      <p className="user-info-text">{khataBook.name}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button 
              className="add-button"
              onClick={handleAddKhatabook}
            >
              Add New Khatabook
            </button>
          </div>
        </div>
      )}

      <div className="nav-section">
        <ul className="nav-items list-unstyled">
          {renderNavItems(navItems)}
        </ul>
      </div>
    </div>
  );
}; 
