import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Users, LayoutGrid } from 'lucide-react';
import ClayCard from '@/components/ui/ClayCard';
import ProButton from '@/components/ui/ProButton';
import GroupCard from '@/components/groups/GroupCard';
import CreateGroupModal from '@/components/groups/CreateGroupModal';
import groupService from '@/features/core/api/groupService';

const GroupListPage = () => {
  const [activeTab, setActiveTab] = useState('explore'); // explore | my_groups
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups', activeTab, search],
    queryFn: () => groupService.getGroups({ type: activeTab, search }),
    keepPreviousData: true
  });

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Users className="text-primary-500" />
            Nhóm học tập
          </h1>
          <p className="text-slate-500 text-sm font-medium">Kết nối và học tập cùng bạn bè</p>
        </div>
        <ProButton
          icon={Plus}
          variant="primary"
          onClick={() => setShowCreateModal(true)}
        >
          Tạo nhóm mới
        </ProButton>
      </div>

      {/* Tabs & Search */}
      <ClayCard className="!p-2 shrink-0">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex p-1 bg-slate-100 rounded-xl relative self-start">
            <button
              onClick={() => setActiveTab('explore')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all z-10 ${activeTab === 'explore' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Khám phá
            </button>
            <button
              onClick={() => setActiveTab('my_groups')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all z-10 ${activeTab === 'my_groups' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Nhóm của tôi
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm nhóm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
            />
          </div>
        </div>
      </ClayCard>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-slate-400">
            <LayoutGrid size={48} className="mb-4 opacity-50" />
            <p className="font-medium">Chưa tìm thấy nhóm nào</p>
            {activeTab === 'my_groups' && (
              <ProButton variant="ghost" className="mt-2" onClick={() => setActiveTab('explore')}>
                Khám phá các nhóm công khai
              </ProButton>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {groups.map(group => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>

      {showCreateModal && <CreateGroupModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
};

export default GroupListPage;
