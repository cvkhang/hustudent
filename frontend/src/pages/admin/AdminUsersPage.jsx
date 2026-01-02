import React, { useEffect, useState } from 'react';
import { getUsers, updateUserRole, getUserById, deleteUser, toggleBanUser } from '@/features/admin/api/admin';
import { motion, AnimatePresence } from 'framer-motion';

import ClayCard from '@/components/ui/ClayCard';
import { Input } from '@/components/ui/Input';
import ProButton from '@/components/ui/ProButton';
import { Search, ShieldAlert, ArrowLeft, ChevronLeft, ChevronRight, UserCog, ChevronDown, Eye, Trash2, Ban, CheckCircle, X, User, Mail, Calendar, GraduationCap, Building } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New states for modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, search, role: roleFilter };
      const response = await getUsers(params);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [search, roleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    // Optimistic update
    const previousUsers = [...users];
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));

    try {
      await updateUserRole(userId, newRole);
    } catch (err) {
      // Revert on error
      setUsers(previousUsers);
      alert('Failed to update role');
    }
  };

  const handleViewDetail = async (user) => {
    setLoadingAction(true);
    try {
      const response = await getUserById(user.id);
      setSelectedUser(response.data);
      setShowDetailModal(true);
    } catch (err) {
      alert('Failed to load user details');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    setLoadingAction(true);
    try {
      await deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      alert('User deleted successfully');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleBanClick = (user) => {
    setSelectedUser(user);
    setBanReason('');
    setShowBanModal(true);
  };

  const handleToggleBan = async () => {
    if (!selectedUser) return;

    setLoadingAction(true);
    try {
      const isBanning = !selectedUser.is_banned;
      await toggleBanUser(selectedUser.id, isBanning, banReason);

      // Update local state
      setUsers(users.map(u =>
        u.id === selectedUser.id
          ? { ...u, is_banned: isBanning, ban_reason: isBanning ? banReason : null }
          : u
      ));

      setShowBanModal(false);
      setSelectedUser(null);
      alert(isBanning ? 'User banned successfully' : 'User unbanned successfully');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update ban status');
    } finally {
      setLoadingAction(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchUsers(newPage);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-8 bg-transparent"
    >
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-4xl font-black text-slate-800 mb-2 tracking-tight"
            >
              User <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">Management</span>
            </motion.h1>
            <motion.p
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-slate-500 font-medium"
            >
              Manage user accounts and permissions
            </motion.p>
          </div>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            <Link to="/admin">
              <ProButton variant="secondary" icon={ArrowLeft} iconPosition="left">
                Dashboard
              </ProButton>
            </Link>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ClayCard className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full relative group">
                <Input
                  startIcon={Search}
                  placeholder="Type to search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-slate-50/50 border-slate-200 focus:bg-white transition-all"
                />
              </div>
              <div className="w-full md:w-48">
                <div className="relative">
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="flex h-12 w-full rounded-2xl border border-slate-200 bg-slate-50/50 outline-none px-4 py-3 text-slate-700 font-bold appearance-none focus:ring-2 focus:ring-primary-400/50 focus:bg-white transition-all cursor-pointer shadow-sm hover:border-primary-300"
                  >
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown size={16} strokeWidth={3} />
                  </div>
                </div>
              </div>
            </div>
          </ClayCard>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <ClayCard className="overflow-hidden rounded-4xl! border border-white/60">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-wider pl-8">User Profile</th>
                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-wider text-right pr-8">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence mode='wait'>
                    {loading ? (
                      <motion.tr
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td colSpan="5" className="text-center py-24 text-slate-400 font-medium">
                          <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                            <p>Loading users...</p>
                          </div>
                        </td>
                      </motion.tr>
                    ) : error ? (
                      <motion.tr
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      ><td colSpan="5" className="text-center py-12 text-red-500 font-medium">{error}</td></motion.tr>
                    ) : users.length === 0 ? (
                      <motion.tr
                        key="no-users"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      ><td colSpan="5" className="text-center py-24 text-slate-400 font-medium">No users found matching criteria</td></motion.tr>
                    ) : (
                      users.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group hover:bg-white/60 transition-colors"
                        >
                          <td className="px-6 py-4 align-middle pl-8">
                            <div className="flex items-center gap-4">
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="h-12 w-12 rounded-2xl ring-4 ring-white shadow-lg overflow-hidden bg-slate-100 flex-shrink-0"
                              >
                                {user.avatar_url ? (
                                  <img className="h-full w-full object-cover" src={user.avatar_url} alt="" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-indigo-400 to-purple-500 text-white font-bold text-lg">
                                    {user.full_name?.charAt(0)}
                                  </div>
                                )}
                              </motion.div>
                              <div>
                                <div className="text-sm font-bold text-slate-800 group-hover:text-primary-700 transition-colors">{user.full_name}</div>
                                <div className="text-xs font-medium text-slate-400 group-hover:text-slate-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 align-middle">
                            {user.is_banned ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-600 border border-red-100">
                                <Ban size={14} />
                                BANNED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                                <CheckCircle size={14} />
                                ACTIVE
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 align-middle">
                            <span className={`
                                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-sm
                                    ${user.role === 'admin'
                                ? 'bg-rose-50 text-rose-600 border-rose-100 ring-1 ring-rose-500/10'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-100 ring-1 ring-emerald-500/10'}
                                `}>
                              {user.role === 'admin' && <ShieldAlert size={14} />}
                              {user.role.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 align-middle text-sm font-medium text-slate-500">
                            {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="px-6 py-4 align-middle text-right pr-8">
                            <div className="flex items-center justify-end gap-2">
                              {/* View Detail Button */}
                              <button
                                onClick={() => handleViewDetail(user)}
                                className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </button>

                              {/* Ban/Unban Button */}
                              <button
                                onClick={() => handleBanClick(user)}
                                className={`p-2 rounded-xl transition-all ${user.is_banned
                                    ? 'text-green-500 hover:text-green-600 hover:bg-green-50'
                                    : 'text-orange-400 hover:text-orange-600 hover:bg-orange-50'
                                  }`}
                                title={user.is_banned ? 'Unban User' : 'Ban User'}
                              >
                                {user.is_banned ? <CheckCircle size={18} /> : <Ban size={18} />}
                              </button>

                              {/* Role Toggle Button */}
                              {user.role === 'user' ? (
                                <button
                                  onClick={() => handleRoleChange(user.id, 'admin')}
                                  className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                  title="Promote to Admin"
                                >
                                  <UserCog size={18} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleRoleChange(user.id, 'user')}
                                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                                  title="Demote to User"
                                >
                                  <UserCog size={18} />
                                </button>
                              )}

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                title="Delete User"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="border-t border-slate-100 px-8 py-5 flex items-center justify-between bg-slate-50/50 backdrop-blur-sm">
              <div className="text-sm text-slate-500 font-bold">
                Page <span className="text-slate-800">{pagination.page}</span> of {pagination.totalPages || 1}
              </div>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-primary-400 hover:text-primary-600 shadow-sm disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-colors"
                >
                  <ChevronLeft size={20} strokeWidth={2.5} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:border-primary-400 hover:text-primary-600 shadow-sm disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-colors"
                >
                  <ChevronRight size={20} strokeWidth={2.5} />
                </motion.button>
              </div>
            </div>
          </ClayCard>
        </motion.div>
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">User Details</h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* User Avatar & Name */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-100">
                    {selectedUser.avatar_url ? (
                      <img className="h-full w-full object-cover" src={selectedUser.avatar_url} alt="" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-indigo-400 to-purple-500 text-white font-bold text-2xl">
                        {selectedUser.full_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{selectedUser.full_name}</h3>
                    <p className="text-slate-500">{selectedUser.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${selectedUser.role === 'admin' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                        }`}>
                        {selectedUser.role.toUpperCase()}
                      </span>
                      {selectedUser.is_banned && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-600">
                          BANNED
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="space-y-4">
                  {selectedUser.university && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <Building size={18} className="text-slate-400" />
                      <span>{selectedUser.university}</span>
                    </div>
                  )}
                  {selectedUser.major && (
                    <div className="flex items-center gap-3 text-slate-600">
                      <GraduationCap size={18} className="text-slate-400" />
                      <span>{selectedUser.major}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-slate-600">
                    <Calendar size={18} className="text-slate-400" />
                    <span>Joined {new Date(selectedUser.created_at).toLocaleDateString()}</span>
                  </div>
                  {selectedUser.bio && (
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-600">{selectedUser.bio}</p>
                    </div>
                  )}
                  {selectedUser.is_banned && selectedUser.ban_reason && (
                    <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
                      <p className="text-sm font-bold text-red-600 mb-1">Ban Reason:</p>
                      <p className="text-sm text-red-600">{selectedUser.ban_reason}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ban/Unban Modal */}
      <AnimatePresence>
        {showBanModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBanModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">
                    {selectedUser.is_banned ? 'Unban User' : 'Ban User'}
                  </h2>
                  <button
                    onClick={() => setShowBanModal(false)}
                    className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <p className="text-slate-600 mb-4">
                  {selectedUser.is_banned
                    ? `Are you sure you want to unban ${selectedUser.full_name}?`
                    : `Are you sure you want to ban ${selectedUser.full_name}?`
                  }
                </p>

                {!selectedUser.is_banned && (
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Ban Reason (optional)
                    </label>
                    <textarea
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      placeholder="Enter the reason for banning..."
                      className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-400/50 outline-none resize-none"
                      rows={3}
                    />
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBanModal(false)}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleToggleBan}
                    disabled={loadingAction}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-white transition-colors disabled:opacity-50 ${selectedUser.is_banned
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-red-500 hover:bg-red-600'
                      }`}
                  >
                    {loadingAction ? 'Processing...' : (selectedUser.is_banned ? 'Unban' : 'Ban User')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminUsersPage;
