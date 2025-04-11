import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

type FieldType = {
  email: string;
  password: string;
};

export const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FieldType>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Styles
  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1.5rem',
    background: '#f8f9fa',
  };

  const cardStyle = {
    display: 'flex',
    background: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    width: '100%',
    maxWidth: '1200px',
    height: '500px',
    margin: '0 auto',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
  };

  const leftPanelStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(178, 66, 66, 0.1)',
    padding: '1.5rem',
    borderRadius: '29px 0 0 29px',
    width: '500px',
    position: 'relative' as const,
    overflow: 'hidden',
    height: '100%',
  };

  const topSectionStyle = {
    width: '100%',
    height: '50%',
    background: 'rgba(178, 66, 66, 0.2)',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    zIndex: 0,
  };

  const bottomSectionStyle = {
    width: '100%',
    height: '50%',
    background: 'rgba(178, 66, 66, 0.05)',
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    zIndex: 0,
  };

  const curveStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: 0,
    width: '100%',
    height: '20px',
    background: 'transparent',
    zIndex: 1,
  };

  const curveSvgStyle = {
    width: '100%',
    height: '100%',
  };

  const contentStyle = {
    position: 'relative' as const,
    zIndex: 2,
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '100%',
    paddingTop: '0',
  };

  const logoImageStyle = {
    width: '250px',
    height: 'auto',
    marginBottom: '6rem',
    marginTop: '6rem',
  };

  const logoStyle = {
    color: '#0d6efd',
    fontSize: '2rem',
    fontWeight: 'bold', 
    marginBottom: '4rem',
  };

  const taglineStyle = {
    color: '#6c757d',
    fontStyle: 'italic',
    fontSize: '0.875rem',
    marginBottom: '4rem',
  };

  const copyrightStyle = {
    color: '#6c757d',
    fontSize: '0.75rem',
    marginBottom: '3rem',
  };

  const socialLinksStyle = {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '4rem',
  };

  const rightPanelStyle = {
    flex: 1,
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
  };

  const headingStyle = {
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    border: 'none',
    borderBottom: '1px solid #dee2e6',
    outline: 'none',
  };

  const errorStyle = {
    color: '#dc3545',
    marginBottom: '1rem',
    textAlign: 'center' as const,
  };

  const buttonStyle = {
    width: '100%',
    padding: '0.75rem',
    background: '#dc4c39',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontWeight: 'bold',
    cursor: 'pointer',
    opacity: isLoading ? 0.7 : 1,
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={leftPanelStyle}>
          <div style={topSectionStyle}></div>
          <div style={bottomSectionStyle}></div>
          <div style={curveStyle}>
            <svg style={curveSvgStyle} viewBox="0 0 320 20" preserveAspectRatio="none">
              <path d="M0,0 Q160,20 320,0" fill="rgba(178, 66, 66, 0.2)" />
            </svg>
          </div>
          <img 
            src={logo} 
            alt="Logo" 
            style={logoImageStyle}
          />
          <div style={contentStyle}>
            <p style={taglineStyle}>"Simple, Smart & Secure POS System!"</p>
            <p style={copyrightStyle}>© 2024 POS System<br/>All rights reserved.</p>
            <div style={socialLinksStyle}>
            </div>
          </div>
        </div>
        
        <div style={rightPanelStyle}>
          <h2 style={headingStyle}>Account Login</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleInputChange}
              style={inputStyle}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleInputChange}
              style={inputStyle}
            />
            {error && (
              <div style={errorStyle}>
                {error}
              </div>
            )}
            <button 
              type="submit" 
              disabled={isLoading}
              style={buttonStyle}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}; 