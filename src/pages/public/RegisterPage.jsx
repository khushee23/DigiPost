import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  ArrowRight,
  Shield,
  Truck,
  Building2,
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
    station: '',
    role: 'customer',
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

  const handleRoleSelect = (selectedRole) => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
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
      const res = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.role === 'customer' ? formData.address : undefined,
        station: formData.role !== 'customer' ? formData.station || (formData.role === 'admin' ? 'Headquarters Command' : 'Central Sorting Hub 01') : undefined,
        role: formData.role,
        adminCode: formData.role === 'admin' ? 'admin123' : undefined,
        password: formData.password,
      });

      const registeredRole = (res.user?.role || formData.role || 'customer').toString().toLowerCase();
      const destination =
        registeredRole === 'admin'
          ? '/admin/dashboard'
          : registeredRole === 'employee'
          ? '/employee/dashboard'
          : '/customer/dashboard';

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
          Create Portal Account
        </h2>
        <p className="mt-1 text-center text-xs text-neutral-500">
          Sign up with your role: Customer, Postal Employee, or Administrator
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg rounded-2xl border border-neutral-200">
          {/* ROLE SELECTOR */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
              Choose Account Role:
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-100 rounded-xl border border-neutral-200">
              <button
                type="button"
                onClick={() => handleRoleSelect('customer')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  formData.role === 'customer'
                    ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200 font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>Customer</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('employee')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  formData.role === 'employee'
                    ? 'bg-white text-blue-700 shadow-sm border border-blue-200 font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Employee</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  formData.role === 'admin'
                    ? 'bg-white text-red-700 shadow-sm border border-red-200 font-bold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Shield className="w-4 h-4 text-[#D71920]" />
                <span>Admin</span>
              </button>
            </div>

            <div className="mt-2.5 text-[11px] text-neutral-500 px-1">
              {formData.role === 'customer' && (
                <span className="text-emerald-700 font-medium">
                  &bull; Registered as Customer &rarr; Directs to <strong>Customer Dashboard</strong>
                </span>
              )}
              {formData.role === 'employee' && (
                <span className="text-blue-700 font-medium">
                  &bull; Registered as Field Courier &rarr; Directs to <strong>Employee Delivery Desk</strong>
                </span>
              )}
              {formData.role === 'admin' && (
                <span className="text-red-700 font-medium">
                  &bull; Registered as Operations Admin &rarr; Directs to <strong>Admin Command Center</strong>
                </span>
              )}
            </div>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium leading-relaxed">
              {errorMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              name="name"
              placeholder={formData.role === 'employee' ? 'e.g. John Carrier' : formData.role === 'admin' ? 'e.g. Victoria Stirling' : 'e.g. Sarah Jenkins'}
              value={formData.name}
              onChange={handleChange}
              icon={User}
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder={formData.role === 'employee' ? 'courier@postoffice.gov' : formData.role === 'admin' ? 'admin.ops@postoffice.gov' : 'customer@example.com'}
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

            {formData.role === 'customer' ? (
              <Input
                label="Default Street Address"
                name="address"
                placeholder="742 Evergreen Terrace, Springfield, IL"
                value={formData.address}
                onChange={handleChange}
                icon={MapPin}
                required
              />
            ) : (
              <Input
                label={formData.role === 'admin' ? 'Administrative Branch / Headquarters' : 'Assigned Sorting Hub / Station'}
                name="station"
                placeholder={formData.role === 'admin' ? 'Headquarters Command - Central Office' : 'Central Sorting Hub 01'}
                value={formData.station}
                onChange={handleChange}
                icon={Building2}
              />
            )}

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
              <label htmlFor="agree-terms-checkbox" className="flex items-start text-xs text-neutral-600 cursor-pointer">
                <input
                  id="agree-terms-checkbox"
                  name="agreeTerms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-[#D71920] border-neutral-300 focus:ring-[#D71920]"
                />
                <span className="ml-2.5 leading-normal">
                  I agree to the Post Office Terms of Service and role security guidelines.
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
              Register as {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
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
