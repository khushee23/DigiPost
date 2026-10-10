import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Package, Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Truck, User, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Check URL params for demo shortcuts
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const demo = params.get('demo');
    if (demo === 'admin') {
      setEmail('admin@postoffice.gov');
      setPassword('admin123');
    } else if (demo === 'employee' || demo === 'courier') {
      setEmail('employee@postoffice.gov');
      setPassword('employee123');
    } else if (demo === 'customer') {
      setEmail('sarah.customer@gmail.com');
      setPassword('customer123');
    }

    if (params.get('session_expired')) {
      setErrorMessage('Your session has expired. Please sign in again.');
    }
  }, [location.search]);

  const performLogin = async (userEmail, userPassword) => {
    setErrorMessage('');
    if (!userEmail || !userPassword) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await login(userEmail, userPassword);
      success(`Welcome back, ${res.user.name}!`);

      // Determine redirect path
      const role = res.user.role;
      const destination =
        role === 'admin'
          ? '/admin/dashboard'
          : role === 'employee'
          ? '/employee/dashboard'
          : '/customer/dashboard';

      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to sign in. Please check credentials.';
      setErrorMessage(msg);
      error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const quickDemoLogin = async (role) => {
    let demoEmail = 'employee@postoffice.gov';
    let demoPass = 'employee123';

    if (role === 'admin') {
      demoEmail = 'admin@postoffice.gov';
      demoPass = 'admin123';
    } else if (role === 'customer') {
      demoEmail = 'sarah.customer@gmail.com';
      demoPass = 'customer123';
    }

    setEmail(demoEmail);
    setPassword(demoPass);
    await performLogin(demoEmail, demoPass);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-neutral-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Icon */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-[#D71920] flex items-center justify-center text-white shadow-lg">
            <Package className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
          Sign In to Your Account
        </h2>
        <p className="mt-1 text-center text-xs text-neutral-500">
          Post Office Automation & Logistics Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-lg rounded-2xl border border-neutral-200">
          {/* Quick Demo Credentials Guide */}
          <div className="mb-5 p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-neutral-800 text-[11px] uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-[#D71920]" />
              <span>Available Demo Credentials:</span>
            </div>
            <div className="grid grid-cols-1 gap-1 text-[11px] pt-1">
              <div className="flex items-center justify-between">
                <span><strong>Employee:</strong> <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded">employee@postoffice.gov</code></span>
                <span className="text-neutral-400 font-mono">employee123</span>
              </div>
              <div className="flex items-center justify-between">
                <span><strong>Admin:</strong> <code className="text-red-700 bg-red-50 px-1 py-0.5 rounded">admin@postoffice.gov</code></span>
                <span className="text-neutral-400 font-mono">admin123</span>
              </div>
              <div className="flex items-center justify-between">
                <span><strong>Customer:</strong> <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">sarah.customer@gmail.com</code></span>
                <span className="text-neutral-400 font-mono">customer123</span>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium leading-relaxed">
              {errorMessage}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email Address or Username"
              name="email"
              type="text"
              placeholder="e.g. employee@postoffice.gov or admin@postoffice.gov"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />

            <Input
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
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
              <label className="flex items-center text-xs text-neutral-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#D71920] border-neutral-300 focus:ring-[#D71920]"
                />
                <span className="ml-2">Remember me</span>
              </label>

              <span className="text-xs text-neutral-400 cursor-not-allowed" title="Contact administrative desk">
                Forgot password?
              </span>
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
              Sign In
            </Button>
          </form>

          {/* Quick Demo Instant-Sign-In Buttons */}
          <div className="mt-6 pt-6 border-t border-neutral-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 text-center mb-3">
              Instant 1-Click Demo Login
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => quickDemoLogin('employee')}
                className="py-2 px-2 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 hover:border-blue-300 text-blue-800 text-[11px] font-semibold flex flex-col items-center gap-1 transition-all active:scale-95 shadow-2xs"
              >
                <Truck className="w-4 h-4 text-blue-600" />
                <span>Employee</span>
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin('admin')}
                className="py-2 px-2 rounded-xl border border-red-200 bg-red-50/60 hover:bg-red-100/70 hover:border-red-300 text-[#D71920] text-[11px] font-semibold flex flex-col items-center gap-1 transition-all active:scale-95 shadow-2xs"
              >
                <Shield className="w-4 h-4 text-[#D71920]" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => quickDemoLogin('customer')}
                className="py-2 px-2 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 hover:border-emerald-300 text-emerald-800 text-[11px] font-semibold flex flex-col items-center gap-1 transition-all active:scale-95 shadow-2xs"
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span>Customer</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-neutral-500">
            Don't have a customer account?{' '}
            <Link to="/register" className="font-semibold text-[#D71920] hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
