import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Printer,
  Download,
} from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';
import { adminService } from '../../services/adminService';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { StatCard } from '../../components/common/StatCard';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { formatCurrency } from '../../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const ReportsAnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statsRes, empRes] = await Promise.all([
        analyticsService.getAdminStats(),
        adminService.getEmployees(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (empRes.success) setEmployees(empRes.employees);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-neutral-200 rounded animate-pulse" />
        <SkeletonLoader type="stats" />
        <SkeletonLoader type="cards" count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-16 print:p-0">
      <PageHeader
        title="Postal Reports & Operations Analytics"
        subtitle="Live parcel volumes, delivery outcomes, and estimated postage charges."
        actions={
          <Button variant="outline" size="sm" icon={Printer} onClick={handlePrint}>
            Print Executive Summary
          </Button>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Reports & Analytics' },
        ]}
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Consignments Handled"
          value={stats?.totalParcels ?? 0}
          subtitle="All postal classes"
          icon={Package}
          colorScheme="default"
        />
        <StatCard
          title="Delivery Success Rate"
          value={`${stats?.deliverySuccessRate ?? 0}%`}
          subtitle="Delivered ÷ completed attempts"
          icon={CheckCircle2}
          colorScheme="green"
        />
        <StatCard
          title="Estimated Postage Charges"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          subtitle="Sum of charges on all parcels"
          icon={DollarSign}
          colorScheme="red"
        />
        <StatCard
          title="Active Field Couriers"
          value={stats?.totalEmployees ?? 0}
          subtitle="Regional stations"
          icon={TrendingUp}
          colorScheme="blue"
        />
      </div>

      {/* Monthly Consignment & Revenue Growth Area Chart */}
      <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-neutral-900">
              6-Month Postal Volume & Revenue Trajectory
            </h3>
            <p className="text-xs text-neutral-400">Total consignments booked alongside revenue</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-lg">
            Last 6 Months
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats?.monthlyVolume || []}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D71920" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#D71920" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorParcels" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1C1C1C" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1C1C1C" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip
                formatter={(value, name) => [
                  String(name).toLowerCase().includes('postage') ? formatCurrency(value) : value,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: '#1C1C1C',
                  borderColor: '#333',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Estimated Postage (₹)"
                stroke="#D71920"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
              <Area
                type="monotone"
                dataKey="parcels"
                name="Parcel Count"
                stroke="#1C1C1C"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorParcels)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid: Weekly Performance & Status Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs">
          <h3 className="text-sm font-bold text-neutral-900 mb-1">
            Weekly Booking Inflow vs Delivery Outflow
          </h3>
          <p className="text-xs text-neutral-400 mb-6">Daily distribution throughput metrics</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.weeklyVolume || []}>
                <XAxis dataKey="day" stroke="#888" fontSize={11} />
                <YAxis stroke="#888" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                    backgroundColor: '#1C1C1C',
                    borderColor: '#333',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="bookings" name="Bookings" fill="#1C1C1C" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delivered" name="Delivered" fill="#16803C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Courier Fleet Load Distribution Table */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900 mb-1">Courier Route Load Table</h3>
            <p className="text-xs text-neutral-400 mb-4">Field courier delivery capacities</p>

            <div className="divide-y divide-neutral-100">
              {employees.map((emp) => (
                <div key={emp._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-neutral-900 block">{emp.name}</span>
                    <span className="text-[11px] text-neutral-400">{emp.station}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-700 block">{emp.activeDeliveries || 0} active</span>
                    <span className="text-[11px] text-neutral-400">{emp.completedDeliveries || 0} completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 text-xs text-neutral-400">
            * Metric data derived from live postal manifest records
          </div>
        </div>
      </div>
    </div>
  );
};
