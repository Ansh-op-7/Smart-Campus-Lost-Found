import React, { useState, useEffect } from 'react';
import {
  Users,
  Package,
  Search,
  PlusCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  PackageCheck,
  AlertCircle,
  RefreshCw,
  Tag,
  ArrowRight,
  Shield,
  Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import AdminStatCard from '../../components/admin/AdminStatCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      setError('Unable to load platform statistics. Please verify admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalItems = stats?.totalItems || 0;
  const lostPercent = totalItems > 0 ? Math.round((stats.lostItems / totalItems) * 100) : 0;
  const foundPercent = totalItems > 0 ? Math.round((stats.foundItems / totalItems) * 100) : 0;

  const activePercent = totalItems > 0 ? Math.round((stats.activeItems / totalItems) * 100) : 0;
  const claimedPercent = totalItems > 0 ? Math.round((stats.claimedItems / totalItems) * 100) : 0;
  const returnedPercent = totalItems > 0 ? Math.round((stats.returnedItems / totalItems) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold w-fit mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            Campus Lost &amp; Found Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time campus-wide metrics, moderation, and recovery tracking.
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all cursor-pointer disabled:opacity-50 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <AdminStatCard
          title="Total Users"
          value={stats?.totalUsers}
          subtitle="Registered campus members"
          icon={Users}
          colorScheme="teal"
        />
        <AdminStatCard
          title="Total Items"
          value={stats?.totalItems}
          subtitle="All reported items"
          icon={Package}
          colorScheme="cyan"
        />
        <AdminStatCard
          title="Pending Claims"
          value={stats?.pendingClaims}
          subtitle="Awaiting reporter review"
          icon={Clock}
          colorScheme="amber"
        />
        <AdminStatCard
          title="Returned Items"
          value={stats?.returnedItems}
          subtitle="Successfully reunited"
          icon={PackageCheck}
          colorScheme="emerald"
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <AdminStatCard
          title="Lost Items"
          value={stats?.lostItems}
          subtitle="Reported missing by students"
          icon={Search}
          colorScheme="rose"
        />
        <AdminStatCard
          title="Found Items"
          value={stats?.foundItems}
          subtitle="Reported located on campus"
          icon={PlusCircle}
          colorScheme="teal"
        />
        <AdminStatCard
          title="Active Items"
          value={stats?.activeItems}
          subtitle="Currently open on feed"
          icon={Activity}
          colorScheme="cyan"
        />
        <AdminStatCard
          title="Claimed Items"
          value={stats?.claimedItems}
          subtitle="Approved claim in handover"
          icon={ShieldCheck}
          colorScheme="purple"
        />
      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Item Type Breakdown */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Item Type Distribution</h3>
              <p className="text-xs text-slate-400">Ratio of reported lost vs. found items</p>
            </div>
            <span className="text-xs font-semibold text-slate-400">{totalItems} Total</span>
          </div>

          {/* Progress bar */}
          <div className="h-4 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              style={{ width: `${lostPercent}%` }}
              className="bg-gradient-to-r from-rose-500 to-rose-400 transition-all duration-500"
              title={`Lost: ${lostPercent}%`}
            />
            <div
              style={{ width: `${foundPercent}%` }}
              className="bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-500"
              title={`Found: ${foundPercent}%`}
            />
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                <span className="text-xs font-semibold text-rose-300">Lost Items</span>
              </div>
              <span className="text-xs font-bold text-white">{stats?.lostItems || 0} ({lostPercent}%)</span>
            </div>

            <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                <span className="text-xs font-semibold text-teal-300">Found Items</span>
              </div>
              <span className="text-xs font-bold text-white">{stats?.foundItems || 0} ({foundPercent}%)</span>
            </div>
          </div>
        </div>

        {/* Item Lifecycle Breakdown */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Item Resolution Status</h3>
              <p className="text-xs text-slate-400">Lifecycle from Active to Claimed &amp; Returned</p>
            </div>
            <span className="text-xs font-semibold text-emerald-400">
              {stats?.returnedItems || 0} Recovered
            </span>
          </div>

          {/* Multi-segment Progress bar */}
          <div className="h-4 rounded-full bg-slate-800 overflow-hidden flex">
            <div
              style={{ width: `${activePercent}%` }}
              className="bg-cyan-400 transition-all duration-500"
              title={`Active: ${activePercent}%`}
            />
            <div
              style={{ width: `${claimedPercent}%` }}
              className="bg-purple-400 transition-all duration-500"
              title={`Claimed: ${claimedPercent}%`}
            />
            <div
              style={{ width: `${returnedPercent}%` }}
              className="bg-emerald-400 transition-all duration-500"
              title={`Returned: ${returnedPercent}%`}
            />
          </div>

          {/* 3-column Legend */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2 text-center">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
              <div className="text-[11px] font-semibold text-cyan-300">Active</div>
              <div className="text-xs font-bold text-white mt-0.5">{stats?.activeItems || 0} ({activePercent}%)</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
              <div className="text-[11px] font-semibold text-purple-300">Claimed</div>
              <div className="text-xs font-bold text-white mt-0.5">{stats?.claimedItems || 0} ({claimedPercent}%)</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="text-[11px] font-semibold text-emerald-300">Returned</div>
              <div className="text-xs font-bold text-white mt-0.5">{stats?.returnedItems || 0} ({returnedPercent}%)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Modules */}
      <div>
        <h2 className="text-base font-bold text-white mb-4">Management Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 hover:bg-slate-900 transition-all group space-y-3"
          >
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400 w-fit group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                User Management
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                View all registered accounts, search profiles, and adjust roles.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-teal-400 pt-2">
              <span>Manage Users</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/items"
            className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all group space-y-3"
          >
            <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 w-fit group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                All Items
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Filter by category or status, edit item descriptions, or delete posts.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 pt-2">
              <span>Review Items</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/claims"
            className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition-all group space-y-3"
          >
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 w-fit group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                Claim Verification
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Oversee proof messages, resolve disputed claims, or mark handovers.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-400 pt-2">
              <span>Review Claims</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/categories"
            className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-900 transition-all group space-y-3"
          >
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 w-fit group-hover:scale-110 transition-transform">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                Categories
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Add new campus item categories, modify tags, or prune unused types.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-purple-400 pt-2">
              <span>Edit Categories</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
