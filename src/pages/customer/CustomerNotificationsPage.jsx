import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check, ExternalLink, Inbox, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/common/Button';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { timeAgo, formatDateTime } from '../../utils/formatters';

export const CustomerNotificationsPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    if (!user?._id) return;
    try {
      setIsLoading(true);
      const res = await notificationService.getNotifications(user._id);
      if (res.success) {
        setNotifications(res.notifications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user?._id]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAll = async () => {
    if (!user?._id) return;
    try {
      await notificationService.markAllAsRead(user._id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      <PageHeader
        title="Notifications & Alerts"
        subtitle="Stay updated on milestone delivery changes and ticket responses."
        actions={
          <Button variant="outline" size="sm" icon={CheckCheck} onClick={handleMarkAll}>
            Mark All as Read
          </Button>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/customer/dashboard' },
          { label: 'Notifications' },
        ]}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'ALL'
              ? 'bg-[#1C1C1C] text-white'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            filter === 'UNREAD'
              ? 'bg-[#1C1C1C] text-white'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          Unread ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      {isLoading ? (
        <SkeletonLoader type="table" count={4} />
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-neutral-200 shadow-2xs">
          <Inbox className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-900 mb-1">No Notifications</h3>
          <p className="text-xs text-neutral-500">
            {filter === 'UNREAD' ? 'You have caught up with all alerts!' : 'No notification history yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xs divide-y divide-neutral-100 overflow-hidden">
          {filtered.map((n) => (
            <div
              key={n._id}
              className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                !n.isRead ? 'bg-red-50/20' : 'hover:bg-neutral-50/60'
              }`}
            >
              <div className="flex items-start gap-3 flex-1">
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                    !n.isRead ? 'bg-[#D71920]' : 'bg-transparent'
                  }`}
                />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-neutral-900">{n.title}</h4>
                  <p className="text-xs text-neutral-600 mt-1 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-neutral-400">
                    <span>{timeAgo(n.createdAt)} • {formatDateTime(n.createdAt)}</span>
                    {n.link && (
                      <Link
                        to={n.link}
                        className="text-[#D71920] font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        Open Item <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
              {!n.isRead && (
                <button
                  onClick={() => handleMarkAsRead(n._id)}
                  title="Mark as read"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
