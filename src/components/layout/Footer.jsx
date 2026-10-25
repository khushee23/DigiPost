import React from 'react';
import { Package, Mail, Phone, MapPin, Shield, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer = () => {
  return (
    <footer className="bg-[#111111] text-neutral-300 pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#D71920] flex items-center justify-center text-white">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold text-white tracking-tight block leading-none">
                  POST OFFICE
                </span>
                <span className="text-[10px] font-semibold text-[#D71920] uppercase tracking-wider">
                  Automation System
                </span>
              </div>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">
              Streamlining postal operations, courier dispatch, and customer parcel tracking with enterprise-grade reliability and security.
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Certified Postal Operations System</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-l-2 border-[#D71920] pl-2.5">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-white transition-colors">
                  Public Parcel Tracking
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-white transition-colors">
                  Postal Services
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Staff & Customer Portal
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Create Customer Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-l-2 border-[#D71920] pl-2.5">
              Postal Services
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>Express Priority Mail</li>
              <li>Standard Ground Logistics</li>
              <li>Registered & Secure Documents</li>
              <li>Bulk Parcel Freight</li>
              <li>Central Hub Tracking</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-l-2 border-[#D71920] pl-2.5">
              Support & Hours
            </h4>
            <ul className="space-y-3 text-xs text-neutral-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D71920] shrink-0 mt-0.5" />
                <span>Central Postal Hub, 100 Dispatch Way, Suite 400</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D71920] shrink-0" />
                <span>+1 (800) 555-POST (Toll Free)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D71920] shrink-0" />
                <span>support@postoffice.gov</span>
              </li>
              <li className="flex items-center gap-2.5 text-neutral-500 pt-1">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Mon - Sat: 8:00 AM - 6:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {CURRENT_YEAR} Post Office Automation System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Third-Year Software Engineering Project</span>
            <span>React + Express + Supabase</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
