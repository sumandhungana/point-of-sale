import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/core/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import {
  fetchAllAppNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  AppNotification,
} from '@/services/notificationService';
import '../styles/NotificationDropdown.css';

const resolveImageUrl = (path?: string | null): string => {
  if (!path) return '';
  if (/^(https?:|blob:|data:)/i.test(path)) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `http://localhost:5000${cleanPath}`;
};

const formatRelativeTime = (timestamp: string): string => {
  if (!timestamp) return '';
  const now = new Date();
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return timestamp;

  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  // Notification States
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notifFilter, setNotifFilter] = useState<'ALL' | 'LOW_STOCK' | 'LOAN_EMI' | 'NEW_ORGANIZATION'>('ALL');
  const [isRefreshingNotifs, setIsRefreshingNotifs] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Load live notifications
  const loadNotifications = useCallback(async () => {
    setIsRefreshingNotifs(true);
    try {
      const data = await fetchAllAppNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications in Navbar:', err);
    } finally {
      setIsRefreshingNotifs(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    // Poll every 60 seconds
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Click outside listener for both dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(target)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      const imagePath = user.imagePath || user.profileImage || null;
      if (imagePath) {
        setProfileImageUrl(resolveImageUrl(imagePath));
        setImageError(false);
      } else {
        setProfileImageUrl(null);
      }
    } else {
      setProfileImageUrl(null);
    }
  }, [user]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const checkForUpdates = () => {
    alert('Checking for updates...');
  };

  const getUserDisplayName = () => {
    return user?.name || user?.username || 'User';
  };

  // Notification Actions
  const unreadCount = notifications.filter((n) => !n.read).length;

  const stockCount = notifications.filter((n) => n.type === 'LOW_STOCK').length;
  const loanCount = notifications.filter((n) => n.type === 'LOAN_EMI').length;
  const orgCount = notifications.filter((n) => n.type === 'NEW_ORGANIZATION').length;

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'ALL') return true;
    return n.type === notifFilter;
  });

  const handleNotificationClick = (notif: AppNotification) => {
    markNotificationAsRead(notif.id);
    setNotifications((prev) =>
      prev.map((item) => (item.id === notif.id ? { ...item, read: true } : item))
    );
    setIsNotifOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead(notifications);
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  };

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'LOW_STOCK':
        return <i className="bi bi-box-seam-fill" />;
      case 'LOAN_EMI':
        return <i className="bi bi-clock-history" />;
      case 'NEW_ORGANIZATION':
        return <i className="bi bi-building-check" />;
      default:
        return <i className="bi bi-bell-fill" />;
    }
  };

  const getNotifClass = (type: AppNotification['type']) => {
    switch (type) {
      case 'LOW_STOCK':
        return 'stock';
      case 'LOAN_EMI':
        return 'loan';
      case 'NEW_ORGANIZATION':
        return 'org';
      default:
        return '';
    }
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: 0,
        height: '64px',
        background: `
          linear-gradient(
            90deg,
            #010A2E 0%,
            #06164A 40%,
            #102F78 70%,
            #8F1118 100%
          )
        `,
        borderBottom: '3px solid #DE1110', // Crimson Red Accent
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* Brand Logo & Mobile Hamburger Trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          type="button"
          className="navbar-hamburger-btn"
          onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(new CustomEvent('toggle-sidebar'));
          }}
          aria-label="Toggle navigation menu"
          title="Open Menu"
        >
          ☰
        </button>
        <div
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <img
            src={logo}
            alt="Khatabook"
            className="navbar-logo-img"
            style={{
              height: '185px',
              width: 'auto',
              marginLeft: '54px',
              marginBottom: '6px',
              filter: 'brightness(0) invert(1)', // Clean white logo match
            }}
          />
        </div>
      </div>

      {/* Right Side Actions: Notification Bell + User Profile */}
      <div className="navbar-right-actions">
        {/* Notification Bell Trigger */}
        <div style={{ position: 'relative' }} ref={notifDropdownRef}>
          <button
            type="button"
            className={`notification-bell-btn ${isNotifOpen ? 'active' : ''}`}
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsDropdownOpen(false);
            }}
            aria-label="Check Notifications"
            title="Notifications (Low Stock, Loans, New Organizations)"
          >
            <i className="bi bi-bell-fill" />
            {unreadCount > 0 && (
              <span className="notification-badge-counter">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {isNotifOpen && (
            <div className="notification-dropdown-panel">
              {/* Header */}
              <div className="notif-header">
                <div className="notif-title-wrap">
                  <h4>Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="notif-unread-pill">{unreadCount} new</span>
                  )}
                </div>

                <div className="notif-header-actions">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="notif-action-btn"
                      onClick={handleMarkAllRead}
                      title="Mark all notifications as read"
                    >
                      <i className="bi bi-check2-all" /> Read all
                    </button>
                  )}
                  <button
                    type="button"
                    className="notif-action-btn refresh-btn"
                    onClick={loadNotifications}
                    title="Refresh notifications"
                    disabled={isRefreshingNotifs}
                  >
                    <i className={`bi bi-arrow-clockwise ${isRefreshingNotifs ? 'spinning' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div className="notif-tabs">
                <button
                  type="button"
                  className={`notif-tab ${notifFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setNotifFilter('ALL')}
                >
                  All <span className="tab-badge">{notifications.length}</span>
                </button>
                <button
                  type="button"
                  className={`notif-tab ${notifFilter === 'LOW_STOCK' ? 'active' : ''}`}
                  onClick={() => setNotifFilter('LOW_STOCK')}
                >
                  Stock <span className="tab-badge">{stockCount}</span>
                </button>
                <button
                  type="button"
                  className={`notif-tab ${notifFilter === 'LOAN_EMI' ? 'active' : ''}`}
                  onClick={() => setNotifFilter('LOAN_EMI')}
                >
                  Loan EMIs <span className="tab-badge">{loanCount}</span>
                </button>
                <button
                  type="button"
                  className={`notif-tab ${notifFilter === 'NEW_ORGANIZATION' ? 'active' : ''}`}
                  onClick={() => setNotifFilter('NEW_ORGANIZATION')}
                >
                  New Orgs <span className="tab-badge">{orgCount}</span>
                </button>
              </div>

              {/* Notification List */}
              <div className="notif-body-list">
                {filteredNotifications.length === 0 ? (
                  <div className="notif-empty-state">
                    <div className="notif-empty-icon">
                      <i className="bi bi-bell-slash" />
                    </div>
                    <p>No notifications in this category</p>
                  </div>
                ) : (
                  filteredNotifications.map((notif) => {
                    const typeClass = getNotifClass(notif.type);
                    return (
                      <div
                        key={notif.id}
                        className={`notif-item ${!notif.read ? `unread ${typeClass}` : ''}`}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <div className={`notif-icon-box ${typeClass}`}>
                          {getNotifIcon(notif.type)}
                        </div>

                        <div className="notif-content-wrap">
                          <div className="notif-item-top">
                            <span className="notif-item-title">{notif.title}</span>
                            {!notif.read && <span className="notif-unread-dot" />}
                          </div>

                          <p className="notif-item-msg">{notif.message}</p>

                          <div className="notif-item-footer">
                            <span>{formatRelativeTime(notif.timestamp)}</span>
                            {notif.countLabel && (
                              <span className={`notif-pill ${typeClass}`}>
                                {notif.countLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Panel Footer */}
              <div className="notif-footer">
                <button
                  type="button"
                  className="notif-footer-link"
                  onClick={() => {
                    setIsNotifOpen(false);
                    if (notifFilter === 'LOW_STOCK') navigate('/items');
                    else if (notifFilter === 'LOAN_EMI') navigate('/loans');
                    else if (notifFilter === 'NEW_ORGANIZATION') navigate('/organization');
                    else navigate('/dashboard');
                  }}
                >
                  <i className="bi bi-arrow-right-circle" /> Go to Module
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown Trigger */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '8px',
              transition: 'background-color 0.2s ease',
            }}
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              setIsNotifOpen(false);
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #255DCE, #DE1110)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                border: '2px solid #255DCE',
                boxShadow: '0 0 8px rgba(37, 93, 206, 0.4)',
              }}
            >
              {profileImageUrl && !imageError ? (
                <img
                  src={profileImageUrl}
                  alt={getUserDisplayName()}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={() => setImageError(true)}
                />
              ) : (
                <span style={{ fontSize: '1.1rem', color: '#ffffff' }}>👤</span>
              )}
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#ffffff',
                fontWeight: 600,
                marginTop: '2px',
              }}
            >
              {getUserDisplayName()}
            </span>
          </div>

          {/* User Dropdown Menu */}
          {isDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                backgroundColor: '#021861',
                border: '1px solid rgba(37, 93, 206, 0.4)',
                borderRadius: '12px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
                minWidth: '220px',
                overflow: 'hidden',
                color: '#ffffff',
                zIndex: 1050,
              }}
            >
              {/* User Info Header */}
              <div
                style={{
                  padding: '0.875rem 1rem',
                  borderBottom: '1px solid rgba(37, 93, 206, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  backgroundColor: 'rgba(37, 93, 206, 0.15)',
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>👤</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#ffffff' }}>
                    {getUserDisplayName()}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {user?.email || ''}
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div
                className="navbar-dropdown-item"
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid rgba(37, 93, 206, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  transition: 'background-color 0.2s ease',
                }}
                onClick={checkForUpdates}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(37, 93, 206, 0.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span>🔄</span> Check for Updates
              </div>

              <div
                className="navbar-dropdown-item"
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid rgba(37, 93, 206, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.9)',
                  transition: 'background-color 0.2s ease',
                }}
                onClick={toggleFullScreen}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(37, 93, 206, 0.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span>⤢</span> Toggle Fullscreen
              </div>

              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid rgba(37, 93, 206, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.875rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                <span>ℹ️</span> Version 1.0.0
              </div>

              {/* Logout Action */}
              <div
                style={{
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#f2f3f4',
                  fontWeight: 600,
                  transition: 'background-color 0.2s ease',
                }}
                onClick={logout}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#021861')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <span>🚪</span> Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;