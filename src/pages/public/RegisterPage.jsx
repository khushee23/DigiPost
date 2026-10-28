import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register, user, isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // If already authenticated with valid user, redirect directly to role dashboard
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('poas_auth_token');
      const storedUser = localStorage.getItem('poas_auth_user');
      const activeUser = user || (storedUser ? JSON.parse(storedUser) : null);

      if ((isAuthenticated && activeUser) || (storedToken && activeUser)) {
        const role = (activeUser.role || '').toString().toLowerCase();
        const destination =
          role === 'admin'
            ? '/admin/dashboard'
            : role === 'employee'
            ? '/employee/dashboard'
            : '/customer/dashboard';
        navigate(destination, { replace: true });
      }
    } catch {}
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleFillSample = () => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    setFormData({
      name: 'Aarav Patel',
      email: `customer${randomSuffix}@postoffice.gov`,
      phone: '+91 98765 43210',
      address: '100 Marine Drive, Nariman Point, Mumbai 400021',
      password: 'customer123',
      confirmPassword: 'customer123',
    });
    setAgreeTerms(true);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim()) {
      setErrorMessage('Full name is required.');
      return;
    }

    if (!formData.email.trim()) {
      setErrorMessage('Email address is required.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please agree to the Post Office Terms of Service.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        password: formData.password,
      });

      const registeredRole = (res.user?.role || 'customer').toString().toLowerCase();
      const destination = '/customer/dashboard';

      success(`Account created successfully as ${registeredRole.toUpperCase()}! Welcome to the Postal Portal.`);
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed.';
      setErrorMessage(msg);
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center py-10 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-[#D71920] flex items-center justify-center text-white shadow-lg">
            <Package className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
          Create Customer Account
        </h2>
        <p className="mt-1 text-center text-xs text-neutral-500">
          Create an account to book and track consignments online.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg rounded-2xl border border-neutral-200">
          <div className="mb-5 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-xs leading-relaxed text-blue-900">
            <span>Customer registration portal. Courier & Admin accounts are managed via HQ.</span>
            <button
              type="button"
              onClick={handleFillSample}
              className="ml-2 inline-flex items-center gap-1 font-semibold text-[#D71920] hover:underline shrink-0"
              title="Auto-fill sample valid customer registration"
            >
              <Sparkles className="w-3.5 h-3.5" /> Demo Fill
            </button>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium leading-relaxed">
              {errorMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              id="register-name-input"
              label="Full Name"
              name="name"
              placeholder="e.g. Asha Sharma"
              value={formData.name}
              onChange={handleChange}
              icon={User}
              required
            />

            <Input
              id="register-email-input"
              label="Email Address"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
            />

            <Input
              id="register-phone-input"
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              icon={Phone}
              required
            />

            <Input
              id="register-address-input"
              label="Default Street Address"
              name="address"
              placeholder="Fort Area, Mumbai, Maharashtra 400001"
              value={formData.address}
              onChange={handleChange}
              icon={MapPin}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                id="register-password-input"
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                icon={Lock}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-neutral-400 hover:text-neutral-600 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <Input
                id="register-confirm-password-input"
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                icon={Lock}
                required
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-neutral-400 hover:text-neutral-600 focus:outline-none"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <div className="pt-2">
              <label htmlFor="agree-terms-checkbox" className="flex items-start text-xs text-neutral-600 cursor-pointer select-none">
                <input
                  id="agree-terms-checkbox"
                  name="agreeTerms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => {
                    setAgreeTerms(e.target.checked);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="w-4 h-4 mt-0.5 rounded text-[#D71920] border-neutral-300 focus:ring-[#D71920]"
                />
                <span className="ml-2.5 leading-normal">
                  I agree to the Post Office Terms of Service and data protection policies.
                </span>
              </label>
            </div>

            <Button
              id="register-submit-btn"
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Create Customer Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-neutral-500 border-t border-neutral-100 pt-4">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-[#D71920] hover:underline">
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
