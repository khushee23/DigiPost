import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Mail, Lock, User, Phone, MapPin, ArrowRight, CheckSquare } from 'lucide-react';
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
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('You must agree to the Terms of Postal Service.');
      return;
    }

    try {
      setIsLoading(true);
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        password: formData.password,
      });

      success('Registration successful! Welcome to the Postal Portal.');
      navigate('/customer/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed.';
      setErrorMessage(msg);
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-neutral-50">
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
          Book parcels, monitor dispatches, and manage deliveries
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg rounded-2xl border border-neutral-200">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium leading-relaxed">
              {errorMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              name="name"
              placeholder="e.g. Sarah Jenkins"
              value={formData.name}
              onChange={handleChange}
              icon={User}
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="sarah@example.com"
              value={formData.email}
              onChange={handleChange}
              icon={Mail}
              required
            />

            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="+1 (555) 012-3456"
              value={formData.phone}
              onChange={handleChange}
              icon={Phone}
              required
            />

            <Input
              label="Default Street Address"
              name="address"
              placeholder="742 Evergreen Terrace, Springfield, IL"
              value={formData.address}
              onChange={handleChange}
              icon={MapPin}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                icon={Lock}
                required
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                icon={Lock}
                required
              />
            </div>

            <div className="pt-2">
              <label className="flex items-start text-xs text-neutral-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-[#D71920] border-neutral-300 focus:ring-[#D71920]"
                />
                <span className="ml-2.5 leading-normal">
                  I agree to the Post Office Terms of Service and Privacy Policy for parcel handling.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Register Customer Account
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
