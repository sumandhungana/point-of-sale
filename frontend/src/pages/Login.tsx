import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '@/infrastructure/utils/ApiService';
import { RegistrationModal } from './RegistrationModal';
import logo from '../assets/logo.png';
import '../styles/Login.css';

type FieldType = {
  username: string;
  password: string;
  rememberMe: boolean;
};

type UserFormType = {
  userName: string;
  phoneNumber: string;
  gmail: string;
  password: string,
  confirmPassword: string,
  organizationName: string;
  organizationAddress: string;
  panVatNumber: string;
  branch: string;
  organizationType: string;
  notes: string;
};

interface RestResponse<T> {
  status?: string;
  data?: T;
  message?: string;
  error?: string;
}

interface UserRegistrationUcResponse {
  userId?: number;
  gmail?: string;
  userName?: string;
  organizationName?: string;
  message?: string;
  success?: boolean;
  errorMessage?: string;
}

export const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FieldType>({
    username: '',
    password: '',
    rememberMe: false,
  });

  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [userForm, setUserForm] = useState<UserFormType>({
    userName: '',
    phoneNumber: '',
    gmail: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    organizationAddress: '',
    panVatNumber: '',
    branch: '',
    organizationType: '',
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleUserInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({
      ...prev,
      [name]: value,
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

  const handleUserRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    setRegistrationError('');
    setRegistrationSuccess('');

    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

    if (!passwordRegex.test(userForm.password)) {
      setRegistrationError(
          'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character.'
      );
      return;
    }

    if (userForm.password !== userForm.confirmPassword) {
      setRegistrationError('Password and Confirm Password do not match.');
      return;
    }

    const payload = {
      userName: userForm.userName,
      phoneNumber: userForm.phoneNumber,
      gmail: userForm.gmail,
      password: userForm.password,
      organizationName: userForm.organizationName,
      branch: userForm.branch || undefined,
      panVatNumber: userForm.panVatNumber || undefined,
      organizationType: userForm.organizationType,
      organizationAddress: userForm.organizationAddress,
      notes: userForm.notes || undefined,
    };

    const res = await apiService.post<RestResponse<UserRegistrationUcResponse>>(
        'api/v1/user/register',
        payload
    );

    setIsRegistering(false);

    if (res.success && res.response) {
      const backendData = res.response;

      if (backendData.error || (backendData.data && backendData.data.errorMessage)) {
        setRegistrationError(
            backendData.error || backendData.data?.errorMessage || 'Registration failed'
        );
        return;
      }

      setRegistrationSuccess(
          backendData.data?.message || 'Registration submitted successfully!'
      );

      setUserForm({
        userName: '',
        phoneNumber: '',
        gmail: '',
        password: '',
        confirmPassword: '',
        organizationName: '',
        organizationAddress: '',
        panVatNumber: '',
        branch: '',
        organizationType: '',
        notes: '',
      });
    } else {
      setRegistrationError(res.error || 'Unable to register user. Please try again.');
    }
  };

  return (
      <div className="login-container">
        <div className="login-card login-centered">
          <img src={logo} alt="Logo" className="login-logo-image" />
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

            <button type="submit" disabled={isLoading} className="login-button">
              {isLoading ? (
                  <>
                    <div className="login-button-spinner"></div>
                    Logging in...
                  </>
              ) : (
                  <>Login</>
              )}
            </button>

            <button
                type="button"
                className="user-registration-button"
                onClick={() => {
                  setRegistrationError('');
                  setRegistrationSuccess('');
                  setShowRegistrationModal(true);
                }}
            >
              <i className="bi bi-person-plus me-2"></i>
              User Registration
            </button>
          </form>
        </div>

        <div className="login-footer">
          <p className="login-tagline">"Simple, Smart & Secure POS System!"</p>
          <p className="login-copyright">© 2024 POS System · All rights reserved.</p>
        </div>

        {/* User Registration Modal Component */}
        <RegistrationModal
            show={showRegistrationModal}
            onClose={() => setShowRegistrationModal(false)}
            userForm={userForm}
            onInputChange={handleUserInputChange}
            onSubmit={handleUserRegistration}
            isRegistering={isRegistering}
            registrationSuccess={registrationSuccess}
            registrationError={registrationError}
        />
      </div>
  );
};