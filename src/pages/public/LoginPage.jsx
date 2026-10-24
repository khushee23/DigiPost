import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Package,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Truck,
  User,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

const ROLE_PRESETS = {
  customer: {
    role: 'customer',
    label: 'Customer',
    badge: 'Customer Portal',
    destination: '/customer/dashboard',
    defaultEmail: 'sarah.customer@gmail.com',
    defaultPassword: 'customer123',
    icon: User,
    colorClass: 'emerald',
    description: 'Book parcels, monitor live transit, raise complaints & review services',
  },
  employee: {
    role: 'employee',
    label: 'Postal Employee',
    badge: 'Courier / Field Staff',
    destination: '/employee/dashboard',
    defaultEmail: 'employee@postoffice.gov',
    defaultPassword: 'employee123',
    icon: Truck,
    colorClass: 'blue',
    description: 'Access assigned delivery routes, log doorstep checkpoints & update package status',
  },
  admin: {
    role: 'admin',
    label: 'Administrator',
    badge: 'Operations HQ Command',
    destination: '/admin/dashboard',
    defaultEmail: 'admin@postoffice.gov',
    defaultPassword: 'admin123',
    icon: Shield,
    colorClass: 'red',
    description: 'System oversight, manage customer & staff records, allocate delivery fleets & analytics',
  },
};

export const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState('employee');
  const [email, setEmail] = useState('employee@postoffice.gov');
  const [password, setPassword] = useState('employee123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login, user, isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

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

  // Check URL params for demo shortcuts
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const demo = params.get('demo');
    if (demo === 'admin') {
      selectRolePreset('admin');
    } else if (demo === 'employee' || demo === 'courier') {
      selectRolePreset('employee');
    } else if (demo === 'customer') {
      selectRolePreset('customer');
    }

    if (params.get('session_expired')) {
      setErrorMessage('Your session has expired. Please sign in again.');
    }
  }, [location.search]);

  const selectRolePreset = (roleKey) => {
    const preset = ROLE_PRESETS[roleKey] || ROLE_PRESETS.customer;
    setSelectedRole(roleKey);
    setEmail(preset.defaultEmail);
    setPassword(preset.defaultPassword);
    setErrorMessage('');
  };

  const performLogin = async (userEmail, userPassword, overrideRole) => {
    setErrorMessage('');
    const targetEmail = (userEmail || email || '').trim();
    const targetPassword = (userPassword || password || '').trim();

    if (!targetEmail || !targetPassword) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await login(targetEmail, targetPassword);
      const effectiveRole = (res.user?.role || overrideRole || selectedRole || 'customer')
        .toString()
        .toLowerCase();

      const destination =
        effectiveRole === 'admin'
          ? '/admin/dashboard'
          : effectiveRole === 'employee'
          ? '/employee/dashboard'
          : '/customer/dashboard';

      success(`Welcome back, ${res.user?.name || 'User'}! (${effectiveRole.toUpperCase()})`);

      // React Router SPA navigation to dashboard
      navigate(destination, { replace: true });

      // Fallback: If route has not transitioned, enforce hard navigation to destination
      setTimeout(() => {
        if (window.location.pathname === '/login' || window.location.pathname === '/login/') {
          window.location.href = destination;
        }
      }, 250);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to sign in. Please verify credentials.';
      setErrorMessage(msg);
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formEmail = form.elements?.email?.value;
    const formPassword = form.elements?.password?.value;
    await performLogin(formEmail || email, formPassword || password);
  };

  const currentPreset = ROLE_PRESETS[selectedRole] || ROLE_PRESETS.customer;
  const RoleIcon = currentPreset.icon;

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center py-10 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Icon */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-[#D71920] flex items-center justify-center text-white shadow-lg">
            <Package className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
          Postal Portal Sign In
        </h2>
        <p className="mt-1 text-center text-xs text-neutral-500">
          Post Office Automation & Fleet Logistics Portal
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg rounded-2xl border border-neutral-200">
          {/* STEP 1: PROMINENT ROLE SELECTION TABS */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                1. Select Your Role:
              </span>
              <span className="text-[11px] font-semibold text-[#D71920]">
                {currentPreset.label} Selected
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-100 rounded-xl border border-neutral-200/80">
              <button
                type="button"
                id="role-tab-customer"
                onClick={() => selectRolePreset('customer')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  selectedRole === 'customer'
                    ? 'bg-white text-emerald-700 shadow-sm border border-emerald-200 font-bold'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50'
                }`}
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>Customer</span>
              </button>

              <button
                type="button"
                id="role-tab-employee"
                onClick={() => selectRolePreset('employee')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  selectedRole === 'employee'
                    ? 'bg-white text-blue-700 shadow-sm border border-blue-200 font-bold'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50'
                }`}
              >
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Employee</span>
              </button>

              <button
                type="button"
                id="role-tab-admin"
                onClick={() => selectRolePreset('admin')}
                className={`py-2 px-2 rounded-lg text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                  selectedRole === 'admin'
                    ? 'bg-white text-red-700 shadow-sm border border-red-200 font-bold'
                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50'
                }`}
              >
                <Shield className="w-4 h-4 text-[#D71920]" />
                <span>Admin</span>
              </button>
            </div>

            {/* Active Role Destination Info Banner */}
            <div
              className={`mt-3 p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                selectedRole === 'admin'
                  ? 'bg-red-50/70 border-red-200 text-red-900'
                  : selectedRole === 'employee'
                  ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                  : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              }`}
            >
              <RoleIcon className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center justify-between font-bold text-[11px] uppercase tracking-wide">
                  <span>Role: {currentPreset.label}</span>
                  <span className="font-mono text-[10px] lowercase opacity-80">
                    &rarr; {currentPreset.destination}
                  </span>
                </div>
                <p className="text-[11px] opacity-90 leading-relaxed">
                  {currentPreset.description}
                </p>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium leading-relaxed">
              {errorMessage}
            </div>
          )}

          {/* STEP 2: CREDENTIALS FORM */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
              2. Enter Credentials:
            </div>

            <Input
              id="login-email-input"
              label="Email Address or Username"
              name="email"
              type="text"
              autoComplete="username"
              placeholder={`e.g. ${currentPreset.defaultEmail}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />

            <Input
              id="login-password-input"
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

            <div className="flex items-center justify-between pt-1">
              <label htmlFor="remember-credentials-checkbox" className="flex items-center text-xs text-neutral-600 cursor-pointer">
                <input
                  id="remember-credentials-checkbox"
                  name="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#D71920] border-neutral-300 focus:ring-[#D71920]"
                />
                <span className="ml-2">Remember credentials</span>
              </label>

              <button
                type="button"
                onClick={() => selectRolePreset(selectedRole)}
                className="text-xs text-[#D71920] hover:underline font-medium"
              >
                Reset demo credentials
              </button>
            </div>

            <Button
              id="login-submit-btn"
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
              icon={ArrowRight}
              iconPosition="right"
            >
              Sign In to {currentPreset.label} Dashboard
            </Button>
          </form>

          {/* STEP 3: 1-CLICK INSTANT DEMO LOGIN BUTTONS */}
          <div className="mt-6 pt-5 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                1-Click Instant Role Sign In:
              </span>
              <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-500" /> Directs automatically
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                id="demo-customer-btn"
                type="button"
                onClick={() => {
                  selectRolePreset('customer');
                  performLogin(ROLE_PRESETS.customer.defaultEmail, ROLE_PRESETS.customer.defaultPassword, 'customer');
                }}
                className="py-2.5 px-2 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 hover:border-emerald-300 text-emerald-800 text-[11px] font-semibold flex flex-col items-center gap-1 transition-all active:scale-95 shadow-2xs"
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>Customer</span>
                <span className="text-[9px] font-normal text-emerald-600 font-mono">/customer/*</span>
              </button>

              <button
                id="demo-employee-btn"
                type="button"
                onClick={() => {
                  selectRolePreset('employee');
                  performLogin(ROLE_PRESETS.employee.defaultEmail, ROLE_PRESETS.employee.defaultPassword, 'employee');
                }}
                className="py-2.5 px-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 hover:border-blue-300 text-blue-800 text-[11px] font-semibold flex flex-col items-center gap-1 transition-all active:scale-95 shadow-2xs"
              >
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Employee</span>
                <span className="text-[9px] font-normal text-blue-600 font-mono">/employee/*</span>
              </button>

              <button
                id="demo-admin-btn"
                type="button"
                onClick={() => {
                  selectRolePreset('admin');
                  performLogin(ROLE_PRESETS.admin.defaultEmail, ROLE_PRESETS.admin.defaultPassword, 'admin');
                }}
                className="py-2.5 px-2 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100/80 hover:border-red-300 text-[#D71920] text-[11px] font-semibold flex flex-col items-center gap-1 transition-all active:scale-95 shadow-2xs"
              >
                <Shield className="w-4 h-4 text-[#D71920]" />
                <span>Admin</span>
                <span className="text-[9px] font-normal text-[#D71920] font-mono">/admin/*</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-neutral-500 border-t border-neutral-100 pt-4">
            New to the postal service?{' '}
            <Link to="/register" className="font-semibold text-[#D71920] hover:underline">
              Create a new account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
