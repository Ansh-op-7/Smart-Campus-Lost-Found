import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  PlusCircle,
  Package,
  Layers,
  LayoutDashboard,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  Shield,
  ShieldCheck,
  Bell,
  CheckCircle2,
  XCircle,
  PackageCheck,
  FileCheck2,
  ArrowRight,
  CheckCheck,
} from 'lucide-react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch unread count & recent notifications
  const fetchNotificationData = async () => {
    if (!isAuthenticated) return;
    try {
      const [countRes, listRes] = await Promise.all([
        notificationService.getUnreadCount(),
        notificationService.getNotifications(),
      ]);
      setUnreadCount(countRes?.count || 0);
      setRecentNotifications((listRes || []).slice(0, 5));
    } catch (err) {
      console.error('Error fetching notification data:', err);
    }
  };

  // Poll every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      setRecentNotifications([]);
      return;
    }

    fetchNotificationData();
    const interval = setInterval(fetchNotificationData, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close dropdown on route change
  useEffect(() => {
    setNotificationDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setNotificationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setNotificationDropdownOpen(false);
    navigate('/login');
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setRecentNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      try {
        await notificationService.markAsRead(notif.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setRecentNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
        );
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
    setNotificationDropdownOpen(false);
    navigate('/notifications');
  };

  const formatRelativeTime = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffSecs = Math.floor((now - date) / 1000);
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
        return <FileCheck2 className="w-4 h-4 text-amber-400" />;
      case 'CLAIM_APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'CLAIM_REJECTED':
        return <XCircle className="w-4 h-4 text-rose-400" />;
      case 'ITEM_RETURNED':
        return <PackageCheck className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-teal-400" />;
    }
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
      isActive
        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
        : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
    }`;

  const mobileNavLinkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30 font-semibold'
        : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
    }`;

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-glow group-hover:scale-105 transition-transform duration-200">
            <Search className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-extrabold tracking-tight text-white font-['Plus_Jakarta_Sans']">
              Find<span className="text-teal-400">It</span>
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
              Campus
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links (Authenticated) */}
        {isAuthenticated && (
          <nav className="hidden lg:flex items-center gap-1.5">
            <NavLink to="/dashboard" className={navLinkClass}>
              <LayoutDashboard className="w-3.5 h-3.5 text-teal-400" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink to="/browse" className={navLinkClass}>
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Browse</span>
            </NavLink>

            <NavLink to="/report/lost" className={navLinkClass}>
              <Search className="w-3.5 h-3.5 text-rose-400" />
              <span>Report Lost</span>
            </NavLink>

            <NavLink to="/report/found" className={navLinkClass}>
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Report Found</span>
            </NavLink>

            <NavLink to="/my-items" className={navLinkClass}>
              <Package className="w-3.5 h-3.5 text-indigo-400" />
              <span>My Items</span>
            </NavLink>

            <NavLink to="/claims" className={navLinkClass}>
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Claims</span>
            </NavLink>

            <NavLink to="/notifications" className={navLinkClass}>
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[9px] px-1.5 py-0.2 bg-teal-500 text-slate-950 font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </NavLink>

            {(user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN') && (
              <NavLink
                to="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Portal</span>
              </NavLink>
            )}
          </nav>
        )}

        {/* Right Actions: Notifications bell, User badge & Logout */}
        <div className="hidden sm:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-2.5">
              
              {/* Notification Bell Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
                  className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
                    notificationDropdownOpen
                      ? 'bg-teal-500/15 border-teal-500/30 text-teal-300'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-glow animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Menu */}
                {notificationDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-fade-in">
                    {/* Dropdown Header */}
                    <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded-full border border-teal-500/30">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-[11px] font-medium text-teal-400 hover:text-teal-300 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <CheckCheck className="w-3 h-3" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    {/* Dropdown List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
                      {recentNotifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400 space-y-1">
                          <Bell className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                          <p className="font-semibold text-slate-300">No notifications</p>
                          <p className="text-[11px]">You're all caught up!</p>
                        </div>
                      ) : (
                        recentNotifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-3.5 flex items-start gap-3 hover:bg-slate-900/60 transition-colors cursor-pointer ${
                              !notif.read ? 'bg-slate-900/30' : ''
                            }`}
                          >
                            <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                              {getNotificationIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p
                                  className={`text-xs font-bold truncate ${
                                    notif.read ? 'text-slate-300' : 'text-white'
                                  }`}
                                >
                                  {notif.title}
                                </p>
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  {formatRelativeTime(notif.createdAt)}
                                </span>
                              </div>
                              <p
                                className={`text-[11px] mt-0.5 line-clamp-2 ${
                                  notif.read ? 'text-slate-400' : 'text-slate-200'
                                }`}
                              >
                                {notif.message}
                              </p>
                            </div>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0 mt-1.5"></span>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Dropdown Footer */}
                    <div className="p-2.5 bg-slate-900/40 border-t border-slate-800/80 text-center">
                      <Link
                        to="/notifications"
                        onClick={() => setNotificationDropdownOpen(false)}
                        className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors py-1"
                      >
                        <span>View all notifications</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Badge */}
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold text-[11px]">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <span className="max-w-[110px] truncate text-slate-200 font-medium">{user?.name || 'Student'}</span>
                {user?.role && (
                  <span className="text-[9px] uppercase font-bold bg-teal-500/15 text-teal-300 px-1.5 py-0.5 rounded border border-teal-500/20">
                    {user.role.replace('ROLE_', '')}
                  </span>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all duration-150 cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition-all duration-150"
              >
                <LogIn className="w-3.5 h-3.5 text-teal-400" />
                <span>Log In</span>
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 shadow-glow transition-all duration-150"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-2 sm:hidden">
          {isAuthenticated && (
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl text-slate-300 bg-slate-900 border border-slate-800"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-400 text-slate-950 text-[9px] font-extrabold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-2 animate-fade-in">
          {isAuthenticated ? (
            <>
              <div className="px-2 py-2 mb-2 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-100">{user?.name}</div>
                  <div className="text-[11px] text-slate-400">{user?.email}</div>
                </div>
                <span className="text-[9px] uppercase font-bold bg-teal-500/15 text-teal-300 px-2 py-0.5 rounded border border-teal-500/20">
                  {user?.role?.replace('ROLE_', '')}
                </span>
              </div>

              <NavLink
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                <LayoutDashboard className="w-4 h-4 text-teal-400" />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/browse"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Browse Lost &amp; Found</span>
              </NavLink>

              <NavLink
                to="/report/lost"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                <Search className="w-4 h-4 text-rose-400" />
                <span>Report Lost Item</span>
              </NavLink>

              <NavLink
                to="/report/found"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Report Found Item</span>
              </NavLink>

              <NavLink
                to="/my-items"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                <Package className="w-4 h-4 text-indigo-400" />
                <span>My Reported Items</span>
              </NavLink>

              <NavLink
                to="/claims"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Claims Hub</span>
              </NavLink>

              <NavLink
                to="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className={mobileNavLinkClass}
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span className="flex-1">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500 text-slate-950">
                    {unreadCount}
                  </span>
                )}
              </NavLink>

              {(user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN') && (
                <NavLink
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30"
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Admin Portal</span>
                </NavLink>
              )}

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-slate-200 bg-slate-900 border border-slate-800"
              >
                <LogIn className="w-4 h-4 text-teal-400" />
                <span>Log In</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Free Account</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
