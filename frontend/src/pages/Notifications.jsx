import React, { useEffect, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  XCircle,
  PackageCheck,
  FileCheck2,
  Clock,
  CheckCheck,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Inbox,
  Filter,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { useToast } from '../context/ToastContext';

export default function Notifications() {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD'
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationService.getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError('Unable to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      toast.success('Notification marked as read.');
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read.');
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      toast.error('Failed to mark all as read.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_CLAIM':
        return <FileCheck2 className="w-5 h-5 text-amber-400" />;
      case 'CLAIM_APPROVED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'CLAIM_REJECTED':
        return <XCircle className="w-5 h-5 text-rose-400" />;
      case 'ITEM_RETURNED':
        return <PackageCheck className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-teal-400" />;
    }
  };

  const getNotificationBg = (type, isRead) => {
    if (isRead) return 'bg-slate-900/40 border-slate-800/60 hover:border-slate-700/80';
    switch (type) {
      case 'NEW_CLAIM':
        return 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50';
      case 'CLAIM_APPROVED':
        return 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50';
      case 'CLAIM_REJECTED':
        return 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50';
      case 'ITEM_RETURNED':
        return 'bg-purple-500/10 border-purple-500/30 hover:border-purple-500/50';
      default:
        return 'bg-teal-500/10 border-teal-500/30 hover:border-teal-500/50';
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.read;
    return true;
  });

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  Notifications
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Stay updated on your claims, lost items, and recoveries
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={fetchNotifications}
              disabled={loading}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Refresh notifications"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={actionLoading}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-teal-300 bg-teal-500/15 border border-teal-500/30 hover:bg-teal-500/25 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                filter === 'ALL'
                  ? 'bg-teal-500 text-slate-950 shadow-glow'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('UNREAD')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filter === 'UNREAD'
                  ? 'bg-teal-500 text-slate-950 shadow-glow'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    filter === 'UNREAD'
                      ? 'bg-slate-950 text-teal-400'
                      : 'bg-teal-500/20 text-teal-300'
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Updated live every 30s</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 animate-pulse flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-800 shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-800/70 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-800/50 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/30 border border-slate-800/60 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400">
              <Inbox className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-200">
                You're all caught up.
              </h3>
              <p className="text-xs text-slate-400 max-w-sm">
                No new notifications. When someone claims an item you found or responds to your claims, you'll see alerts here.
              </p>
            </div>
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 shadow-glow transition-all"
            >
              <span>Explore Lost &amp; Found</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                className={`group p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 cursor-pointer relative ${getNotificationBg(
                  notification.type,
                  notification.read
                )}`}
              >
                {/* Unread indicator dot */}
                {!notification.read && (
                  <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-teal-400 ring-4 ring-teal-400/20 animate-pulse"></span>
                )}

                {/* Icon */}
                <div className="w-10 h-10 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Body */}
                <div className="flex-1 pr-6 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`text-sm font-bold ${
                        notification.read ? 'text-slate-300' : 'text-white'
                      }`}
                    >
                      {notification.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium">
                      • {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>

                  <p
                    className={`text-xs sm:text-sm leading-relaxed ${
                      notification.read ? 'text-slate-400' : 'text-slate-200'
                    }`}
                  >
                    {notification.message}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Link
                      to="/claims"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
                    >
                      <span>View in Claims Hub</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    {!notification.read && (
                      <button
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className="text-[11px] text-slate-400 hover:text-slate-200 underline decoration-slate-600 transition-colors cursor-pointer"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
