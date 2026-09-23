import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  Search,
  PlusCircle,
  Package,
  Layers,
  LogOut,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Inbox,
  ShieldCheck,
  Bell,
  FileCheck2,
  XCircle,
  PackageCheck,
} from 'lucide-react';
import { itemService } from '../services/itemService';
import { claimService } from '../services/claimService';
import { notificationService } from '../services/notificationService';
import { resolveImageUrl, formatDate } from '../components/ItemCard';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [myItems, setMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    setLoadingStats(true);
    Promise.all([
      itemService.getMyItems(),
      claimService.getMyClaims(),
      claimService.getReceivedClaims(),
      notificationService.getNotifications(),
    ])
      .then(([itemsData, myClaimsData, receivedClaimsData, notifsData]) => {
        setMyItems(itemsData || []);
        setMyClaims(myClaimsData || []);
        setReceivedClaims(receivedClaimsData || []);
        setNotifications(notifsData || []);
      })
      .catch((err) => {
        console.error('Failed to load dashboard statistics', err);
      })
      .finally(() => {
        setLoadingStats(false);
      });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Real statistics calculated from API responses
  const totalReports = myItems.length;
  const lostCount = myItems.filter((i) => i.type === 'LOST').length;
  const foundCount = myItems.filter((i) => i.type === 'FOUND').length;
  const activeCount = myItems.filter((i) => i.status === 'ACTIVE').length;

  const totalMyClaims = myClaims.length;
  const pendingClaimsCount = myClaims.filter((c) => c.status === 'PENDING').length;
  const approvedClaimsCount = myClaims.filter((c) => c.status === 'APPROVED').length;
  const claimsReceivedCount = receivedClaims.length;
  const pendingReceivedCount = receivedClaims.filter((c) => c.status === 'PENDING').length;

  const actionCards = [
    {
      title: 'Report Lost Item',
      description: 'Post details of an item you lost so finders on campus can reach you.',
      icon: Search,
      color: 'from-rose-500/20 to-amber-500/20 text-rose-300 border-rose-500/30',
      to: '/report/lost',
      actionText: 'Report Lost',
    },
    {
      title: 'Report Found Item',
      description: 'Found a misplaced possession? Upload details to notify the rightful owner.',
      icon: PlusCircle,
      color: 'from-teal-500/20 to-emerald-500/20 text-teal-300 border-teal-500/30',
      to: '/report/found',
      actionText: 'Report Found',
    },
    {
      title: 'Browse Campus Feed',
      description: 'Explore active lost and found items across departments, labs & libraries.',
      icon: Layers,
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30',
      to: '/browse',
      actionText: 'Browse Items',
    },
    {
      title: 'Claim & Recovery Hub',
      description: 'Review incoming claims for items you found or track claims you submitted.',
      icon: Inbox,
      color: 'from-indigo-500/20 to-purple-500/20 text-indigo-300 border-indigo-500/30',
      to: '/claims',
      badge: pendingReceivedCount > 0 ? `${pendingReceivedCount} Pending` : null,
      actionText: 'Manage Claims',
    },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl mb-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Member Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
              Welcome back, <span className="gradient-text">{user?.name || 'Student'}</span> 👋
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              Track your campus lost &amp; found activities, review claim ownership proofs, and coordinate safe returns.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/report/lost"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Report Lost</span>
            </Link>
            <Link
              to="/report/found"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Found</span>
            </Link>
            <Link
              to="/browse"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 shadow-glow transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Browse Items</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Your Activity - Real Statistics Cards Row */}
      <div className="mb-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Your Activity</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-rose-500/20 bg-rose-500/5">
            <div className="text-[10px] font-bold text-rose-300 uppercase tracking-wider mb-1">
              Lost Items
            </div>
            <div className="text-2xl font-extrabold text-rose-400">
              {loadingStats ? '...' : lostCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Reports you filed</div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5">
            <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
              Found Items
            </div>
            <div className="text-2xl font-extrabold text-emerald-400">
              {loadingStats ? '...' : foundCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Items you found</div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/5">
            <div className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider mb-1">
              Active Claims
            </div>
            <div className="text-2xl font-extrabold text-cyan-400">
              {loadingStats ? '...' : pendingReceivedCount + pendingClaimsCount}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Pending review</div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5">
            <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1">
              Notifications
            </div>
            <div className="text-2xl font-extrabold text-amber-400">
              {loadingStats ? '...' : notifications.filter((n) => !n.read).length}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Unread alerts</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Quick Actions & Profile/Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Action Navigation Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Quick Actions
            </h2>
            <span className="text-xs text-slate-400">Fast Navigation</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {actionCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <Link
                  key={idx}
                  to={card.to}
                  className="glass-card p-5 rounded-2xl border border-slate-800 hover:border-teal-500/50 flex flex-col justify-between transition-all duration-200 group relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${card.color} border`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {card.badge && (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                          {card.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-200 group-hover:text-teal-300 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-teal-400 group-hover:text-teal-300 flex items-center gap-1">
                      {card.actionText} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pending Received Claims Alert Banner */}
          {pendingReceivedCount > 0 && (
            <div className="glass-card p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Inbox className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    You have {pendingReceivedCount} pending claim{pendingReceivedCount > 1 ? 's' : ''} to review
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Students have submitted proof of ownership for items you found.
                  </div>
                </div>
              </div>
              <Link
                to="/claims"
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-cyan-400 shadow-sm flex-shrink-0"
              >
                Review
              </Link>
            </div>
          )}

          {/* Recent Notifications Preview */}
          {notifications.length > 0 && (
            <div className="glass-card p-5 rounded-2xl border border-slate-800 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Recent Notifications</h3>
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="text-[10px] font-bold bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded-full border border-teal-500/30">
                      {notifications.filter((n) => !n.read).length} new
                    </span>
                  )}
                </div>
                <Link
                  to="/notifications"
                  className="text-xs font-semibold text-teal-400 hover:text-teal-300 inline-flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="divide-y divide-slate-800/60">
                {notifications.slice(0, 3).map((notif) => (
                  <Link
                    key={notif.id}
                    to="/notifications"
                    className={`py-3 flex items-start justify-between gap-3 hover:bg-slate-900/40 -mx-2 px-2 rounded-xl transition-colors ${
                      !notif.read ? 'bg-slate-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2.5 truncate">
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
                      )}
                      <div className="truncate">
                        <p className={`text-xs font-semibold ${notif.read ? 'text-slate-300' : 'text-white'}`}>
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {formatDate(notif.createdAt)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Reported Items Preview */}
          {myItems.length > 0 && (
            <div className="glass-card p-5 rounded-2xl border border-slate-800 mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Your Recent Posts</h3>
                <Link
                  to="/my-items"
                  className="text-xs font-semibold text-teal-400 hover:text-teal-300 inline-flex items-center gap-1"
                >
                  View all ({myItems.length}) <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="divide-y divide-slate-800">
                {myItems.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    to={`/items/${item.id}`}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-900/40 -mx-2 px-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span
                        className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          item.type === 'LOST'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 flex-shrink-0">
                      {formatDate(item.itemDate || item.dateReported)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Card */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-2xl border border-slate-800 sticky top-24">
            <div className="flex items-center gap-3 mb-6 pb-5 border-b border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold text-lg shadow-glow">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">{user?.name || 'Student'}</h2>
                <span className="inline-block text-[11px] font-semibold text-teal-300 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-md mt-0.5">
                  {user?.role || 'ROLE_STUDENT'}
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-3 text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <Mail className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] uppercase font-semibold text-slate-500">Email Address</div>
                  <div className="truncate font-medium text-slate-200">{user?.email || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <Shield className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500">User ID</div>
                  <div className="font-medium text-slate-200">#{user?.id || '—'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <Clock className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-500">Session Status</div>
                  <div className="font-medium text-emerald-400">Authenticated (JWT Active)</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full mt-6 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
