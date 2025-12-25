import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import {
  Users,
  Search,
  Filter,
  Plus,
  Loader2,
  Lock,
  Globe
} from 'lucide-react';
import ClayCard from '@/components/ui/ClayCard';
import ProButton from '@/components/ui/ProButton';

// API
const groupsAPI = {
  getGroups: async (params = {}) => {
    const res = await api.get('/groups', { params });
    return res.data.data || res.data;
  },
  joinGroup: async (groupId) => {
    const res = await api.post(`/groups/${groupId}/join`);
    return res.data;
  },
  leaveGroup: async (groupId) => {
    const res = await api.delete(`/groups/${groupId}/leave`);
    return res.data;
  }
};

export default function GroupList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  // Query
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups', searchQuery],
    queryFn: () => groupsAPI.getGroups({ search: searchQuery || undefined }),
    enabled: !!user
  });

  // Mutations
  const joinMutation = useMutation({
    mutationFn: groupsAPI.joinGroup,
    onSuccess: () => queryClient.invalidateQueries(['groups'])
  });

  const leaveMutation = useMutation({
    mutationFn: groupsAPI.leaveGroup,
    onSuccess: () => queryClient.invalidateQueries(['groups'])
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <span className="p-2 bg-blue-100 text-blue-600 rounded-2xl"><Users size={32} /></span>
            Cộng đồng
          </h1>
          <p className="text-slate-500 font-bold mt-2 ml-1">
            Tìm nhóm học tập phù hợp và kết nối với hàng ngàn sinh viên HUST.
          </p>
        </div>
        <ProButton variant="primary" icon={Plus} className="shadow-glow-primary">
          Tạo nhóm mới
        </ProButton>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nhóm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border-none shadow-sm font-bold text-slate-600 focus:ring-2 focus:ring-primary-200 focus:outline-none"
          />
        </div>
        <button className="px-6 py-3 bg-white rounded-2xl font-bold text-slate-600 shadow-sm flex items-center gap-2 hover:bg-slate-50">
          <Filter size={18} /> Bộ lọc
        </button>
      </div>

      {/* Group Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : groups.length === 0 ? (
        <ClayCard className="text-center py-12">
          <Users size={48} className="mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-600 mb-2">Chưa có nhóm nào</h3>
          <p className="text-slate-400 mb-4">Hãy tạo nhóm đầu tiên!</p>
          <ProButton variant="primary" icon={Plus}>
            Tạo nhóm mới
          </ProButton>
        </ClayCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {groups.map(group => (
            <ClayCard key={group.id} className="group hover:scale-[1.01] cursor-pointer transition-transform relative overflow-hidden flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden shrink-0 relative bg-gradient-to-br from-primary-400 to-secondary-500">
                {group.image_url ? (
                  <img src={group.image_url} alt={group.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <Users size={40} />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex gap-2 mb-2">
                    {group.visibility === 'private' ? (
                      <span className="text-[10px] uppercase font-black tracking-wide bg-slate-100 text-slate-500 px-2 py-1 rounded-md flex items-center gap-1">
                        <Lock size={10} /> Riêng tư
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-black tracking-wide bg-green-50 text-green-600 px-2 py-1 rounded-md flex items-center gap-1">
                        <Globe size={10} /> Công khai
                      </span>
                    )}
                    {group.subject && (
                      <span className="text-[10px] uppercase font-black tracking-wide bg-primary-50 text-primary-600 px-2 py-1 rounded-md">
                        {group.subject}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 truncate group-hover:text-primary-600 transition-colors">{group.name}</h3>
                  <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">
                    {group.description || 'Không có mô tả'}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1"><Users size={14} /> {group.member_count || 0}</span>
                  </div>

                  {group.is_member ? (
                    <button
                      onClick={() => leaveMutation.mutate(group.id)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                      Rời nhóm
                    </button>
                  ) : (
                    <button
                      onClick={() => joinMutation.mutate(group.id)}
                      className="px-4 py-2 bg-primary-100/50 text-primary-600 rounded-xl font-bold text-sm hover:bg-primary-500 hover:text-white transition-all"
                    >
                      Tham gia
                    </button>
                  )}
                </div>
              </div>
            </ClayCard>
          ))}
        </div>
      )}
    </div>
  );
}
