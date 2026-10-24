import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Package, Menu, X, ArrowRight, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleDashboardRedirect = () => {
    const role = (user?.role || '').toString().toLowerCase();
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'employee') navigate('/employee/dashboard');
    else navigate('/customer/dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#D71920] flex items-center justify-center text-white shadow-md group-hover:bg-[#A80F17] transition-colors">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-neutral-900 tracking-tight block leading-none">
                POST OFFICE
              </span>
              <span className="text-[10px] font-semibold text-[#D71920] uppercase tracking-wider">
                Automation System
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-600">
            <Link to="/" className="hover:text-[#D71920] transition-colors">
              Home
            </Link>
            <Link to="/track" className="hover:text-[#D71920] transition-colors">
              Track Parcel
            </Link>
            <Link to="/services" className="hover:text-[#D71920] transition-colors">
              Services
            </Link>
            <Link to="/how-it-works" className="hover:text-[#D71920] transition-colors">
              How It Works
            </Link>
          </nav>

          {/* Desktop Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button variant="secondary" size="sm" onClick={handleDashboardRedirect} icon={User}>
                  My Dashboard ({user?.role ? user.role.toUpperCase() : 'PORTAL'})
                </Button>
                <Button variant="outline" size="sm" onClick={logout} icon={LogOut}>
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-neutral-200 bg-white px-4 pt-2 pb-6 space-y-3 animate-fade-in">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-neutral-800 hover:text-[#D71920]"
          >
            Home
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-neutral-800 hover:text-[#D71920]"
          >
            Track Parcel
          </Link>
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-neutral-800 hover:text-[#D71920]"
          >
            Services
          </Link>
          <Link
            to="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-medium text-neutral-800 hover:text-[#D71920]"
          >
            How It Works
          </Link>
          <div className="pt-4 border-t border-neutral-100 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <>
                <Button variant="secondary" onClick={handleDashboardRedirect}>
                  My Dashboard
                </Button>
                <Button variant="outline" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">
                    Register Customer
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
