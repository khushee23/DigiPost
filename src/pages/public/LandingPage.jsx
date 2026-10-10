import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Search,
  ArrowRight,
  Truck,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  Boxes,
  Users,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
  const [quickTrackingId, setQuickTrackingId] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (quickTrackingId.trim()) {
      navigate(`/track?id=${encodeURIComponent(quickTrackingId.trim())}`);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/register';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'employee') return '/employee/dashboard';
    return '/customer/dashboard';
  };

  return (
    <div className="bg-white">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-50 via-white to-neutral-50 pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100 text-[#D71920] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#D71920] animate-pulse" />
                Next-Generation Postal Logistics Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#111111] tracking-tight leading-[1.1]">
                Smarter Postal Services. <br />
                <span className="text-[#D71920]">Every Step</span> of the Way.
              </h1>

              <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Seamless parcel booking, real-time tracking, courier dispatch coordination, and automated complaint resolution. Built for customers, couriers, and administrators.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link to={isAuthenticated ? getDashboardLink() : '/register'} className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto" icon={ArrowRight} iconPosition="right">
                    {isAuthenticated ? 'Go to My Dashboard' : 'Book a Parcel Now'}
                  </Button>
                </Link>
                <Link to="/track" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto" icon={Search}>
                    Track Your Parcel
                  </Button>
                </Link>
              </div>

              {/* Quick Tracking Search Box */}
              <div className="pt-6 max-w-xl mx-auto lg:mx-0">
                <form
                  onSubmit={handleTrackSubmit}
                  className="p-2 sm:p-2.5 bg-white rounded-2xl shadow-lg border border-neutral-200 flex flex-col sm:flex-row gap-2"
                >
                  <div className="relative flex-1">
                    <Search className="w-5 h-5 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={quickTrackingId}
                      onChange={(e) => setQuickTrackingId(e.target.value)}
                      placeholder="Enter Tracking ID (e.g. PO-84920184)..."
                      className="w-full pl-11 pr-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none rounded-xl"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="md">
                    Track Package
                  </Button>
                </form>
                <p className="text-xs text-neutral-400 mt-2 text-center lg:text-left">
                  Try sample tracking IDs: <code className="text-[#D71920] font-mono font-medium">PO-84920184</code> or <code className="text-[#D71920] font-mono font-medium">PO-98231019</code>
                </p>
              </div>
            </div>

            {/* Right Column: Postal Illustration Graphic */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Background decorative blob */}
                <div className="absolute -inset-4 bg-gradient-to-r from-red-100 to-amber-100 rounded-3xl filter blur-xl opacity-60 -z-10" />

                <div className="bg-[#1C1C1C] text-white p-7 rounded-2xl shadow-2xl border border-neutral-800 space-y-6">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#D71920] flex items-center justify-center text-white font-bold">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Live Route Dispatch</h4>
                        <p className="text-xs text-neutral-400">Scranton Regional Line</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full">
                      On Schedule
                    </span>
                  </div>

                  {/* Visual Route Steps */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-200">Manifest Accepted</p>
                        <p className="text-[11px] text-neutral-400">Central Sorting Hub 01</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[#D71920] text-white flex items-center justify-center text-xs shrink-0 mt-0.5 animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-100">Out for Delivery</p>
                        <p className="text-[11px] text-neutral-400">Courier assigned: John Carrier</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 opacity-50">
                      <div className="w-5 h-5 rounded-full bg-neutral-700 text-neutral-400 flex items-center justify-center text-xs shrink-0 mt-0.5">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-neutral-400">Recipient Signature</p>
                        <p className="text-[11px] text-neutral-500">Destination address</p>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Footer */}
                  <div className="pt-4 border-t border-neutral-800 grid grid-cols-2 gap-3 text-center">
                    <div className="bg-[#262626] p-2.5 rounded-lg">
                      <span className="text-[11px] text-neutral-400 block">Est. Arrival</span>
                      <span className="text-sm font-bold text-white">Today 5:00 PM</span>
                    </div>
                    <div className="bg-[#262626] p-2.5 rounded-lg">
                      <span className="text-[11px] text-neutral-400 block">Tracking Number</span>
                      <span className="text-xs font-mono font-bold text-[#D71920]">PO-84920184</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SERVICES SECTION */}
      <section id="services" className="py-20 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-[#D71920] uppercase tracking-wider mb-2">
              Core Capabilities
            </h2>
            <h3 className="text-3xl font-bold text-neutral-900 tracking-tight">
              Enterprise Postal Solutions for Every Requirement
            </h3>
            <p className="text-sm text-neutral-600 mt-3 leading-relaxed">
              Designed from the ground up for modern mail operations with complete transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#D71920] flex items-center justify-center mb-5 group-hover:bg-[#D71920] group-hover:text-white transition-colors">
                <Send className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-neutral-900 mb-2">Parcel Booking</h4>
              <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                Rapid digital bookings with automatic weight-based rate computation and instant tracking ID generation.
              </p>
              <Link to="/register" className="text-xs font-semibold text-[#D71920] hover:underline inline-flex items-center gap-1">
                Book Parcel <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-neutral-900 mb-2">Real-Time Tracking</h4>
              <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                Full chronological milestone inspection from origin acceptance to final doorstep delivery.
              </p>
              <Link to="/track" className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1">
                Track Online <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Truck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-neutral-900 mb-2">Courier Operations</h4>
              <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                Dedicated employee portal for status transitions, failed attempt recording, and route verification.
              </p>
              <Link to="/login" className="text-xs font-semibold text-emerald-600 hover:underline inline-flex items-center gap-1">
                Courier Portal <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center mb-5 group-hover:bg-neutral-800 group-hover:text-white transition-colors">
                <Headphones className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-neutral-900 mb-2">Customer Support</h4>
              <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                Integrated complaint filing and resolution tracking with direct administrative oversight.
              </p>
              <Link to="/login" className="text-xs font-semibold text-neutral-800 hover:underline inline-flex items-center gap-1">
                File Complaint <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-[#D71920] uppercase tracking-wider mb-2">
              Four Simple Steps
            </h2>
            <h3 className="text-3xl font-bold text-neutral-900 tracking-tight">
              How The Postal Network Operates
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="text-center p-4">
              <div className="w-16 h-16 rounded-2xl bg-[#1C1C1C] text-white flex items-center justify-center text-xl font-extrabold mx-auto mb-5 border-4 border-red-50">
                1
              </div>
              <h4 className="text-base font-bold text-neutral-900 mb-2">Book Online</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Provide sender and recipient details, choose parcel class, and generate your instant manifest.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center p-4">
              <div className="w-16 h-16 rounded-2xl bg-[#1C1C1C] text-white flex items-center justify-center text-xl font-extrabold mx-auto mb-5 border-4 border-red-50">
                2
              </div>
              <h4 className="text-base font-bold text-neutral-900 mb-2">Admin Dispatch</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Administrators allocate packages to verified postal delivery personnel at regional sorting depots.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center p-4">
              <div className="w-16 h-16 rounded-2xl bg-[#1C1C1C] text-white flex items-center justify-center text-xl font-extrabold mx-auto mb-5 border-4 border-red-50">
                3
              </div>
              <h4 className="text-base font-bold text-neutral-900 mb-2">Live Tracking</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Customers and staff inspect transit milestones as couriers update status across sorting checkpoints.
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center p-4">
              <div className="w-16 h-16 rounded-2xl bg-[#D71920] text-white flex items-center justify-center text-xl font-extrabold mx-auto mb-5 border-4 border-red-100">
                4
              </div>
              <h4 className="text-base font-bold text-neutral-900 mb-2">Final Delivery</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Successful doorstep handoff, recipient confirmation, and optional review submission.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DEMO CREDENTIALS QUICK-START SECTION */}
      <section className="py-14 bg-[#111111] text-white border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <span className="text-xs font-bold text-[#D71920] uppercase tracking-wider">
                Third-Year SE Group Project Evaluation
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">
                Explore the Three Role Experiences
              </h3>
              <p className="text-xs text-neutral-400 mt-2 max-w-xl leading-relaxed">
                The platform includes ready-to-test accounts for Customer, Courier Employee, and Administrator roles with real interactive mock persistence.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/login?demo=admin">
                <Button variant="outline" size="sm" className="bg-neutral-900 text-neutral-200 border-neutral-700 hover:text-white">
                  Demo Admin
                </Button>
              </Link>
              <Link to="/login?demo=employee">
                <Button variant="outline" size="sm" className="bg-neutral-900 text-neutral-200 border-neutral-700 hover:text-white">
                  Demo Employee
                </Button>
              </Link>
              <Link to="/login?demo=customer">
                <Button variant="primary" size="sm">
                  Demo Customer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
