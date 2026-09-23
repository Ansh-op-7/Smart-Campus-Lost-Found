import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowUpDown,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Modal state for role change
  const [selectedUser, setSelectedUser] = useState(null);
  const [targetRole, setTargetRole] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getUsers(query);
      setUsers(data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError('Unable to load users. Please verify admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(search);
  }, [search]);

  const handleRoleChangeClick = (user, newRole) => {
    setSelectedUser(user);
    setTargetRole(newRole);
    setModalOpen(true);
  };

  const handleConfirmRoleChange = async () => {
    if (!selectedUser || !targetRole) return;

    try {
      setActionLoading(true);
      setError(null);
      await adminService.updateUserRole(selectedUser.id, targetRole);
      setSuccessMessage(`Successfully updated ${selectedUser.name}'s role to ${targetRole}.`);
      setTimeout(() => setSuccessMessage(null), 4000);
      setModalOpen(false);
      setSelectedUser(null);
      fetchUsers(search);
    } catch (err) {
      console.error('Failed to update user role:', err);
      const msg = err.response?.data?.message || 'Failed to update user role.';
      setError(msg);
      setModalOpen(false);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-400 mb-1">
            <Users className="w-4 h-4" />
            <span>User Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans']">
            Registered Users ({users.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search campus accounts, view activity metrics, and manage administrative privileges.
          </p>
        </div>

        <button
          onClick={() => fetchUsers(search)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all cursor-pointer disabled:opacity-50 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Notifications / Alerts */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p>{successMessage}</p>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/50 transition-all"
        />
      </div>

      {/* Users Table */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4 sm:px-6">User</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Joined</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-400 mb-2" />
                    <span>Loading users...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-300">No users found</p>
                    <p className="text-[11px]">Try adjusting your search criteria.</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  const isAdmin = u.role === 'ADMIN';

                  return (
                    <tr key={u.id} className="hover:bg-slate-900/60 transition-colors">
                      {/* Name & ID */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500/20 to-cyan-500/20 text-teal-300 flex items-center justify-center font-bold text-xs border border-teal-500/30 shrink-0">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500">ID #{u.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email & Phone */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span className="truncate max-w-[180px]">{u.email}</span>
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                              <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span>{u.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                            isAdmin
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          <span>{u.role}</span>
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-4 text-slate-400">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Role Action Button */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        {isAdmin ? (
                          <button
                            onClick={() => handleRoleChangeClick(u, 'STUDENT')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Demote to Student</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRoleChangeClick(u, 'ADMIN')}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Make Admin</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={modalOpen}
        title={targetRole === 'ADMIN' ? 'Grant Administrator Privileges' : 'Demote Administrator'}
        message={
          targetRole === 'ADMIN'
            ? `Are you sure you want to promote ${selectedUser?.name} to ADMIN? They will have full access to platform moderation and user controls.`
            : `Are you sure you want to demote ${selectedUser?.name} to STUDENT? They will lose access to the Admin Dashboard.`
        }
        confirmText={targetRole === 'ADMIN' ? 'Promote to Admin' : 'Demote to Student'}
        confirmVariant={targetRole === 'ADMIN' ? 'warning' : 'danger'}
        loading={actionLoading}
        onConfirm={handleConfirmRoleChange}
        onCancel={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
}
