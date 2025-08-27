import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../styles/Login.css';

type FieldType = {
  username: string;
  password: string;
  rememberMe: boolean;
};

export const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FieldType>({
    username: '',
    password: '',
    rememberMe: false
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
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
      <div className="login-card login-centered">
        <img 
          src={logo} 
          alt="Logo" 
          className="login-logo-image"
        />
        <h2 className="login-title">Admin Login</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input-group">
            <i className="bi bi-person login-input-icon"></i>
            <input
              type="text"
              name="username"
              placeholder="UserName"
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
              placeholder="Password"
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
          <label className="login-remember">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleCheckboxChange}
            />
            <span>Remember me</span>
          </label>
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
              <>Login</>
            )}
          </button>
        </form>
      </div>
      <div className="login-footer">
        <p className="login-tagline">"Simple, Smart & Secure POS System!"</p>
        <p className="login-copyright">© 2024 POS System · All rights reserved.</p>
      </div>
    </div>
  );
}; 