import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../styles/Login.css';

type FieldType = {
  username: string;
  password: string;
};

export const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FieldType>({
    username: '',
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
      await login(formData.username, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid username or password');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-left-panel">
          <div className="login-top-section"></div>
          <div className="login-bottom-section"></div>
          <div className="login-curve">
            <svg className="login-curve-svg" viewBox="0 0 320 20" preserveAspectRatio="none">
              <path d="M0,0 Q160,20 320,0" fill="rgba(102, 126, 234, 0.2)" />
            </svg>
          </div>
          <img 
            src={logo} 
            alt="Logo" 
            className="login-logo-image"
          />
          <div className="login-content">
            <p className="login-tagline">"Simple, Smart & Secure POS System!"</p>
            <p className="login-copyright">© 2024 POS System<br/>All rights reserved.</p>
            <div className="login-social-links">
            </div>
          </div>
        </div>
        
        <div className="login-right-panel">
          <h2 className="login-heading">
            <i className="bi bi-person-circle me-2"></i>
            Account Login
          </h2>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-input-group">
              <i className="bi bi-person login-input-icon"></i>
              <input
                type="text"
                name="username"
                placeholder="Enter your username"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="login-input"
              />
            </div>
            <div className="login-input-group">
              <i className="bi bi-lock login-input-icon"></i>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="login-input"
              />
            </div>
            {error && (
              <div className="login-error">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}
            <button 
              type="submit" 
              disabled={isLoading}
              className="login-button"
            >
              {isLoading ? (
                <>
                  <div className="login-button-spinner"></div>
                  Logging in...
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Login
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}; 