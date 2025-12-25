import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Users, Crown, LogOut, Calendar, MessageSquare, Loader2, BookOpen } from 'lucide-react';
import ProButton from '@/components/ui/ProButton';
import ClayCard from '@/components/ui/ClayCard';
import SessionList from '@/components/groups/SessionList';
import GroupChat from '@/components/groups/GroupChat'; // Added import
import groupService from '@/features/core/api/groupService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const GroupDetailPage = () => {
  // ... rest of the code until 'posts' tab

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('sessions'); // sessions | members | posts

  const { data: group, isLoading } = useQuery({
    queryKey: ['group', id],
    queryFn: () => groupService.getGroupDetails(id)
  });

  const { data: members = [] } = useQuery({
    queryKey: ['groupMembers', id],
    queryFn: () => groupService.getMembers(id),
    enabled: !!group
  });

  const joinMutation = useMutation({
    mutationFn: () => groupService.joinGroup(id),
    onSuccess: () => {
      addToast('Đã tham gia nhóm!', 'success');
      queryClient.invalidateQueries(['group', id]);
      queryClient.invalidateQueries(['groups']);
    },
    onError: () => {
      addToast('Có lỗi xảy ra', 'error');
    }
  });

  const leaveMutation = useMutation({
    mutationFn: () => groupService.leaveGroup(id),
    onSuccess: () => {
      addToast('Đã rời nhóm', 'success');
      navigate('/groups');
    },
    onError: (err) => {
      addToast(err.response?.data?.message || 'Không thể rời nhóm', 'error');
    }
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin w-10 h-10 text-primary-600 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Đang tải thông tin nhóm...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <BookOpen size={40} className="opacity-50" />
        </div>
        <h2 className="text-xl font-bold text-slate-700">Không tìm thấy nhóm</h2>
        <p className="max-w-xs text-center mt-2 text-slate-500">
          Nhóm này có thể không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <button
          onClick={() => navigate('/groups')}
          className="mt-6 px-6 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const isMember = group.isMember;
  const isOwner = group.owner_id === user.id;

  const tabs = [
    { id: 'sessions', label: 'Lịch học', icon: Calendar },
    { id: 'members', label: 'Thành viên', icon: Users, count: group.memberCount },
    { id: 'posts', label: 'Thảo luận', icon: MessageSquare }
  ];

  return (
    <div className="h-full flex flex-col bg-transparent relative">

      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">

        {/* Header & Back */}
        <div className="flex items-center gap-4 relative z-30">
          <button
            onClick={() => navigate('/groups')}
            className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-sm border border-slate-200 flex items-center justify-center text-slate-500 hover:text-primary-600 hover:border-primary-200 transition-all active:scale-95 shrink-0"
            title="Quay lại"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Chi tiết nhóm
            </h1>
            <p className="text-slate-500 text-sm font-medium hidden sm:block">
              Xem thông tin và hoạt động của nhóm
            </p>
          </div>
        </div>

        {/* Group Info Card - Utilizing ClayCard like FriendsPage items */}
        <div className="relative z-20 p-1 mb-6">
          <ClayCard className="!p-6 md:!p-8 hoverEffect={false}">
            <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
              {/* Avatar */}
              <div className="shrink-0 mx-auto md:mx-0">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] bg-gradient-to-br from-primary-400 to-secondary-500 p-0.5 shadow-lg relative group overflow-visible">
                  <div className="w-full h-full rounded-[1.9rem] bg-white overflow-hidden flex items-center justify-center relative z-10">
                    {group.avatar_url ? (
                      <img src={group.avatar_url} className="w-full h-full object-cover" alt={group.name} />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-4xl font-black text-white select-none">
                        {group.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  {/* Subject Badge Absolute - moved z-index up */}
                  {group.subject_tag && (
                    <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-white rounded-full text-xs font-bold text-primary-600 shadow-md border border-slate-100 z-20 flex items-center gap-1">
                      <BookOpen size={10} />
                      {group.subject_tag}
                    </div>
                  )}
                </div>
              </div>

              {/* Info Text */}
              <div className="flex-1 min-w-0 w-full text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                      <h1 className="text-3xl font-black text-slate-800 leading-tight">
                        {group.name}
                      </h1>
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-medium text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Users size={14} className="text-slate-400" />
                        {group.memberCount} thành viên
                      </span>
                    </div>

                    {/* Description */}
                    {group.description && (
                      <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto md:mx-0 mt-2">
                        {group.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-3 shrink-0 pt-2 md:pt-0">
                    {isMember ? (
                      <ProButton
                        variant="ghost"
                        className="bg-red-50 text-red-600 hover:bg-red-100 border border-transparent"
                        icon={LogOut}
                        onClick={() => {
                          if (confirm('Bạn có chắc muốn rời nhóm?')) leaveMutation.mutate();
                        }}
                      >
                        Rời nhóm
                      </ProButton>
                    ) : (
                      <ProButton
                        variant="primary"
                        className="shadow-lg shadow-primary-500/30"
                        onClick={() => joinMutation.mutate()}
                        isLoading={joinMutation.isLoading}
                        size="lg"
                      >
                        Tham gia nhóm
                      </ProButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ClayCard>
        </div>

        {/* Tabs - Gradient Style matching FriendsPage */}
        <div className="relative z-10">
          <div className="flex gap-2 overflow-x-auto p-4 -ml-4 scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all
                    ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg shadow-primary-600/30'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    }
                  `}
                >
                  <Icon size={18} />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-black
                      ${activeTab === tab.id ? 'bg-white/20' : 'bg-primary-100 text-primary-700'}
                    `}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[300px] relative z-0">
          {activeTab === 'sessions' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SessionList groupId={id} isMember={isMember} />
            </div>
          )}

          {activeTab === 'members' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map(member => (
                  <ClayCard
                    key={member.user_id}
                    className="flex items-center gap-4 !p-4 hover:shadow-clay-card-hover transition-all"
                  >
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-md">
                        <img
                          src={member.user.avatar_url || `https://ui-avatars.com/api/?name=${member.user.full_name}`}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      </div>
                      {member.role === 'owner' && (
                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-slate-100">
                          <Crown size={10} className="text-amber-500 fill-amber-500" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-800 truncate">{member.user.full_name}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${member.role === 'owner' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                          {member.role === 'owner' ? 'Admin' : 'Thành viên'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {member.user.major || 'Sinh viên HUST'}
                      </p>
                    </div>
                  </ClayCard>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {isMember ? (
                <GroupChat groupId={id} />
              ) : (
                <ClayCard className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare size={32} className="text-slate-300" />
                  </div>
                  <h3 className="font-bold text-slate-700">Chỉ thành viên mới xem được chat</h3>
                  <p className="text-slate-500 text-sm mt-1">Hãy tham gia nhóm để thảo luận cùng mọi người.</p>
                </ClayCard>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetailPage;
