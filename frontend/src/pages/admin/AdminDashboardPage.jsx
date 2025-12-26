import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '@/features/admin/api/admin';
import { Link } from 'react-router-dom';
import ClayCard from '@/components/ui/ClayCard';
import ProButton from '@/components/ui/ProButton';
import { Users } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDashboardStats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (!stats) return <div className="text-center p-8 text-red-500">Failed to load statistics</div>;

  const { counts, recentUsers } = stats;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="min-h-screen p-8 bg-transparent"
    >
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">
              Admin <span className="text-transparent bg-clip-text bg-linear-to-r from-primary-600 to-purple-600">Dashboard</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">Overview of system performance and activities</p>
          </div>
          <div className="flex gap-4">
            <Link to="/admin/users">
              <ProButton icon={Users} variant="primary" className="shadow-lg shadow-primary-500/20">Manage Users</ProButton>
            </Link>
            <Link to="/">
              <ProButton variant="secondary">Back to Home</ProButton>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Users}
            label="Total Users"
            value={counts.users}
            color="blue"
            delay={0}
          />
          <StatCard
            icon={Users}
            label="Active Groups"
            value={counts.groups}
            color="green"
            delay={0.1}
          />
          <StatCard
            icon={Users}
            label="Total Sessions"
            value={counts.sessions}
            color="purple"
            delay={0.2}
          />
          <StatCard
            icon={Users}
            label="Quizzes Created"
            value={counts.quizzes}
            color="orange"
            delay={0.3}
          />
        </div>

        {/* Recent Users Section */}
        <motion.div variants={item}>
          <ClayCard className="p-8 !rounded-[2.5rem]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <div className="h-8 w-1.5 rounded-full bg-linear-to-b from-primary-500 to-purple-600" />
                Recently Joined Users
              </h2>
              <Link to="/admin/users" className="text-primary-600 font-bold hover:underline">View All</Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">User</th>
                    <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Role</th>
                    <th className="py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-wider">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="hover:bg-slate-50/80 transition-all cursor-default group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-4">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="h-10 w-10 rounded-2xl bg-linear-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20"
                          >
                            {user.full_name?.charAt(0)}
                          </motion.div>
                          <div>
                            <p className="font-bold text-slate-700 group-hover:text-primary-600 transition-colors">{user.full_name}</p>
                            <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`
                            px-3 py-1 rounded-xl text-xs font-bold border
                            ${user.role === 'admin'
                            ? 'bg-red-50 text-red-600 border-red-100'
                            : 'bg-green-50 text-green-600 border-green-100'}
                        `}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-medium text-slate-500">
                          {new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ClayCard>
        </motion.div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, delay }) => {
  const colors = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    green: { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' },
  };
  const theme = colors[color] || colors.blue;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
    >
      <ClayCard className="p-6 !rounded-[2.5rem] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-default relative overflow-hidden group">
        {/* Background Decoration */}
        <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full ${theme.bg} opacity-50 blur-2xl group-hover:opacity-100 transition-opacity`} />

        <div className="relative flex items-center gap-5">
          <div className={`p-4 rounded-2xl ${theme.bg} ${theme.text} shadow-sm border ${theme.border}`}>
            <Icon size={32} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-4xl font-black text-slate-800 tracking-tight">{value}</p>
          </div>
        </div>
      </ClayCard>
    </motion.div>
  );
};

export default AdminDashboardPage;
