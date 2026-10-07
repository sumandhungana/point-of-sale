// import React, { useState, useRef, useEffect } from 'react';
// import { useAuth } from '@/core/auth/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import logo from '../assets/logo.png';
//
// // Helper function to resolve image URL
// const resolveImageUrl = (path?: string | null): string => {
//   if (!path) {
//     return '';
//   }
//
//   // If it's already a full URL, blob, or data URL, return as is
//   if (/^(https?:|blob:|data:)/i.test(path)) {
//     return path;
//   }
//
//   // Ensure path starts with a slash
//   const cleanPath = path.startsWith('/') ? path : `/${path}`;
//
//   // Use the backend URL
//   const API_BASE_URL = 'http://localhost:5000';
//   return `${API_BASE_URL}${cleanPath}`;
// };
//
// const Navbar: React.FC = () => {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [imageError, setImageError] = useState(false);
//   const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const { logout, user } = useAuth();
//   const navigate = useNavigate();
//
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsDropdownOpen(false);
//       }
//     };
//
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);
//
//   // Fetch user profile when component mounts
//   useEffect(() => {
//     // if (user) {
//     //   fetchUserProfile();
//     // }
//   }, []);
//
//   // Update profile image URL when user changes
//   useEffect(() => {
//     console.log('👤 User in Navbar:', user);
//
//     if (user) {
//       // Try to get image from multiple possible fields
//       const imagePath = user.imagePath || user.profileImage || null;
//
//       if (imagePath) {
//         const url = resolveImageUrl(imagePath);
//         setProfileImageUrl(url);
//         setImageError(false);
//         console.log('🖼️ Profile image URL set to:', url);
//       } else {
//         console.log('ℹ️ No profile image found for user');
//         setProfileImageUrl(null);
//       }
//     } else {
//       setProfileImageUrl(null);
//     }
//   }, [user]);
//
//   const toggleFullScreen = () => {
//     if (!document.fullscreenElement) {
//       document.documentElement.requestFullscreen();
//     } else {
//       document.exitFullscreen();
//     }
//   };
//
//   const checkForUpdates = () => {
//     alert('Checking for updates...');
//   };
//
//   const getUserDisplayName = () => {
//     return user?.name || user?.username || 'User';
//   };
//
//   return (
//     <nav style={{
//       position: 'fixed',
//       top: 0,
//       right: 0,
//       left: 0,
//       height: '64px',
//       backgroundColor: '#021861',
//       color: 'var(--top-menu-font-color, #212529)',
//       borderBottom: '3px solid #dc3545',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'space-between',
//       padding: '0 1rem',
//       zIndex: 1000,
//     }}>
//       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }} onClick={() => navigate('/') }>
//         <img src={logo} alt="Khatabook" style={{ height: '185px', width: 'auto', marginLeft: '54px', marginBottom: '6px' }} />
//       </div>
//
//       <div style={{ position: 'relative' }} ref={dropdownRef}>
//         <div style={{
//           display: 'flex',
//           flexDirection: 'column',
//           alignItems: 'center',
//           cursor: 'pointer',
//         }} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
//           <div style={{
//             width: '35px',
//             height: '35px',
//             borderRadius: '50%',
//             background: '#f0f0f0',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             fontSize: '1.2rem',
//             color: '#666',
//             marginBottom: '2px',
//             overflow: 'hidden',
//             position: 'relative',
//             border: '2px solid #ffffff',
//           }}>
//             {profileImageUrl && !imageError ? (
//               <img
//                 src={profileImageUrl}
//                 alt={getUserDisplayName()}
//                 style={{
//                   width: '100%',
//                   height: '100%',
//                   objectFit: 'cover',
//                 }}
//                 onError={() => {
//                   console.error('❌ Failed to load profile image:', profileImageUrl);
//                   setImageError(true);
//                 }}
//                 onLoad={() => {
//                   console.log('✅ Profile image loaded successfully');
//                 }}
//               />
//             ) : (
//               <span style={{ fontSize: '1.2rem', color: '#666' }}>👤</span>
//             )}
//           </div>
//           <span style={{
//             fontSize: '0.75rem',
//             color: '#f9f5f5',
//             fontWeight: 500,
//           }}>
//             {getUserDisplayName()}
//           </span>
//         </div>
//
//         {isDropdownOpen && (
//           <div style={{
//             position: 'absolute',
//             top: '100%',
//             right: 0,
//             backgroundColor: 'white',
//             border: '1px solid #dee2e6',
//             borderRadius: '4px',
//             boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
//             minWidth: '200px',
//             marginTop: '0.5rem',
//           }}>
//             <div style={{
//               padding: '0.75rem 1rem',
//               borderBottom: '1px solid #dee2e6',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '0.5rem',
//             }}>
//               <span>👤</span>
//               <div>
//                 <div style={{ fontWeight: 600 }}>{getUserDisplayName()}</div>
//                 <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{user?.email || ''}</div>
//               </div>
//             </div>
//             <div style={{
//               padding: '0.75rem 1rem',
//               borderBottom: '1px solid #dee2e6',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '0.5rem',
//               cursor: 'pointer',
//             }} onClick={checkForUpdates}>
//               <span>🔄</span> Check for Updates
//             </div>
//             <div style={{
//               padding: '0.75rem 1rem',
//               borderBottom: '1px solid #dee2e6',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '0.5rem',
//               cursor: 'pointer',
//             }} onClick={toggleFullScreen}>
//               <span>⤢</span> Toggle Fullscreen
//             </div>
//             <div style={{
//               padding: '0.75rem 1rem',
//               borderBottom: '1px solid #dee2e6',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '0.5rem',
//             }}>
//               <span>ℹ️</span> Version 1.0.0
//             </div>
//             <div style={{
//               padding: '0.75rem 1rem',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '0.5rem',
//               cursor: 'pointer',
//               color: '#dc3545',
//             }} onClick={logout}>
//               <span>🚪</span> Logout
//             </div>
//           </div>
//         )}
//       </div>
//     </nav>
//   );
// };
//
// export default Navbar;

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/core/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const resolveImageUrl = (path?: string | null): string => {
  if (!path) return '';
  if (/^(https?:|blob:|data:)/i.test(path)) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `http://localhost:5000${cleanPath}`;
};

const Navbar: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
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
        {/* Brand Logo Container */}
        <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
            onClick={() => navigate('/')}
        >
          <img
              src={logo}
              alt="Khatabook"
              style={{
                height: '185px',
                width: 'auto',
                marginLeft: '54px',
                marginBottom: '6px',
                filter: 'brightness(0) invert(1)', // Clean white logo match
              }}
          />
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
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
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

          {/* Dropdown Menu */}
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
      </nav>
  );
};

export default Navbar;