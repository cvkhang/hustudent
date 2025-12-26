import React, { useEffect, useState } from 'react';
import { getUsers, updateUserRole } from '@/features/admin/api/admin';
import { motion, AnimatePresence } from 'framer-motion';

import ClayCard from '@/components/ui/ClayCard';
import { Input } from '@/components/ui/Input';
import ProButton from '@/components/ui/ProButton';
import { Search, ShieldAlert, ArrowLeft, ChevronLeft, ChevronRight, UserCog, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-wider">Current Role</th>
                    <th className="px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-wider">Joined Date</th>
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
                        <td colSpan="4" className="text-center py-24 text-slate-400 font-medium">
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
                      ><td colSpan="4" className="text-center py-12 text-red-500 font-medium">{error}</td></motion.tr>
                    ) : users.length === 0 ? (
                      <motion.tr
                        key="no-users"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      ><td colSpan="4" className="text-center py-24 text-slate-400 font-medium">No users found matching criteria</td></motion.tr>
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
                            {user.role === 'user' ? (
                              <button
                                onClick={() => handleRoleChange(user.id, 'admin')}
                                className="text-slate-400 hover:text-indigo-600 font-bold text-xs bg-slate-50 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-all inline-flex items-center gap-2 hover:shadow-md"
                              >
                                <UserCog size={16} />
                                PROMOTE
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRoleChange(user.id, 'user')}
                                className="text-slate-400 hover:text-rose-600 font-bold text-xs bg-slate-50 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all inline-flex items-center gap-2 hover:shadow-md"
                              >
                                <UserCog size={16} />
                                DEMOTE
                              </button>
                            )}
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
    </motion.div>
  );
};

export default AdminUsersPage;
