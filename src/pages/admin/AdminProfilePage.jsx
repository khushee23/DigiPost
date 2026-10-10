import React, { useState } from 'react';
import { Shield, User, Mail, Phone, Building2, Lock, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import { PageHeader } from '../../components/common/PageHeader';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { formatDate } from '../../utils/formatters';

export const AdminProfilePage = () => {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    station: user?.station || 'Headquarters - Central Command',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      const res = await authService.updateProfile({
        _id: user._id,
        name: profileData.name,
        phone: profileData.phone,
      });

      if (res.success) {
        updateUser(res.user);
        success('Administrator profile details updated successfully.');
      }
    } catch (err) {
      error(err.message || 'Failed to update administrator profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword.length < 6) {
      error('New password must be at least 6 characters.');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      error('New password and confirmation do not match.');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      success('Administrator credentials updated successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      error(err.message || 'Failed to update credentials.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Administrator Profile & Access"
        subtitle="Manage central administration credentials and system authorizations."
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Admin Profile' },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
            <div className="w-12 h-12 rounded-full bg-[#D71920] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">{user?.name}</h3>
              <p className="text-xs text-neutral-400">
                System Administrator • Root Postal Authority
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <Input
              label="Administrator Full Name"
              name="name"
              value={profileData.name}
              onChange={(e) => setProfileData((p) => ({ ...p, name: e.target.value }))}
              icon={User}
              required
            />

            <Input
              label="Administrative Email"
              name="email"
              type="email"
              value={profileData.email}
              disabled
              icon={Mail}
              helperText="Root security identifier."
            />

            <Input
              label="Direct Telephone"
              name="phone"
              value={profileData.phone}
              onChange={(e) => setProfileData((p) => ({ ...p, phone: e.target.value }))}
              icon={Phone}
              required
            />

            <Input
              label="Station / Division"
              name="station"
              value={profileData.station}
              disabled
              icon={Building2}
              helperText="Executive headquarters dispatch."
            />

            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUpdatingProfile}
              icon={Save}
            >
              Save Profile Updates
            </Button>
          </form>
        </div>

        <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
            <Lock className="w-4 h-4 text-[#D71920]" />
            <h3 className="text-sm font-bold text-neutral-900">Change Admin Password</h3>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData((p) => ({ ...p, currentPassword: e.target.value }))}
              required
            />

            <Input
              label="New Admin Password"
              type="password"
              placeholder="••••••••"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData((p) => ({ ...p, newPassword: e.target.value }))}
              helperText="Min. 6 alphanumeric characters"
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData((p) => ({ ...p, confirmPassword: e.target.value }))}
              required
            />

            <Button
              type="submit"
              variant="secondary"
              size="sm"
              className="w-full"
              isLoading={isUpdatingPassword}
            >
              Update Credentials
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
