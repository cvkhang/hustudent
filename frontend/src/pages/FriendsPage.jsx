import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useSocket } from '@/context/SocketContext';
import { useToast } from '@/context/ToastContext';
import ClayCard from '@/components/ui/ClayCard';
import ProButton from '@/components/ui/ProButton';
import {
  Users,
  UserPlus,
  UserMinus,
  Ban,
  Check,
  X,
  MessageCircle,
  Search,
  Shield,
  Loader2,
  UserX
} from 'lucide-react';

// API Calls using axios instance with cookie authentication
const friendsAPI = {
  getFriends: async () => {
    const res = await api.get('/friends');
    // Backend returns { data: users, meta }
    return res.data.data || res.data;
  },

  getFriendRequests: async () => {
    // Backend requires separate calls for incoming and outgoing
    const [incoming, outgoing] = await Promise.all([
      api.get('/friends/requests?type=incoming').then(res => res.data.data),
      api.get('/friends/requests?type=outgoing').then(res => res.data.data)
    ]);
    return { incoming, outgoing };
  },

  sendRequest: async (userId) => {
    const res = await api.post('/friends/requests', { toUserId: userId });
    return res.data;
  },

  acceptRequest: async (requestId) => {
    const res = await api.post(`/friends/requests/${requestId}/accept`);
    return res.data;
  },

  rejectRequest: async (requestId) => {
    const res = await api.post(`/friends/requests/${requestId}/reject`);
    return res.data;
  },

  cancelRequest: async (requestId) => {
    const res = await api.delete(`/friends/requests/${requestId}`);
    return res.data;
  },

  unfriend: async (userId) => {
    const res = await api.delete(`/friends/${userId}`);
    return res.data;
  },

  blockUser: async (userId) => {
    const res = await api.post(`/friends/${userId}/block`);
    return res.data;
  },

  unblockUser: async (userId) => {
    const res = await api.post(`/friends/${userId}/unblock`);
    return res.data;
  },

  searchUsers: async (query) => {
    const res = await api.get('/users', { params: { q: query } });
    return res.data.data;
  },

  getBlockedUsers: async () => {
    const res = await api.get('/friends/blocked');
    return res.data.data || [];
  },

  getSuggestions: async () => {
    const res = await api.get('/friends/suggestions');
    return res.data.data || [];
  }
};

// Friend Card Component
const FriendCard = ({ friend, onUnfriend, onBlock, onMessage }) => (
  <ClayCard className="flex items-center gap-4 !p-4 hover:shadow-clay-card-hover transition-all group cursor-pointer">
    <div className="relative">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 overflow-hidden border-2 border-white shadow-md">
        {friend.avatar_url ? (
          <img src={friend.avatar_url} alt={friend.full_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-black text-lg">
            {friend.full_name?.charAt(0)?.toUpperCase()}
          </div>
        )}
      </div>
      {friend.is_online && (
        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
      )}
    </div>

    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-slate-800 truncate group-hover:text-primary-600 transition-colors">
        {friend.full_name}
      </h4>
      <p className="text-sm text-slate-500 truncate">
        {friend.major || 'Chưa cập nhật ngành'}
      </p>
      {friend.mutual_friends > 0 && (
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          {friend.mutual_friends} bạn chung
        </p>
      )}
    </div>

    <div className="flex gap-2">
      <button
        onClick={() => onMessage(friend)}
        className="p-2.5 bg-primary-50 text-primary-600 rounded-xl hover:bg-primary-100 transition-colors"
        title="Nhắn tin"
      >
        <MessageCircle size={18} />
      </button>
      <button
        onClick={() => onUnfriend(friend)}
        className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
        title="Hủy kết bạn"
      >
        <UserMinus size={18} />
      </button>
      <button
        onClick={() => onBlock(friend)}
        className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
        title="Chặn"
      >
        <Ban size={18} />
      </button>
    </div>
  </ClayCard>
);

// Request Card Component
const RequestCard = ({ request, type, onAccept, onReject, onCancel }) => {
  const user = type === 'incoming' ? request.fromUser : request.toUser;

  return (
    <ClayCard className="flex items-center gap-4 !p-4 hover:shadow-clay-card-hover transition-all">
      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden border-2 border-white shadow-md">
        {user?.avatar_url ? (
          <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white font-black text-lg">
            {user?.full_name?.charAt(0)?.toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-slate-800 truncate">{user?.full_name}</h4>
        <p className="text-sm text-slate-500 truncate">{user?.major || 'Chưa cập nhật ngành'}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {new Date(request.created_at).toLocaleDateString('vi-VN')}
        </p>
      </div>

      <div className="flex gap-2">
        {type === 'incoming' ? (
          <>
            <button
              onClick={() => onAccept(request.id)}
              className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
              title="Chấp nhận"
            >
              <Check size={18} />
            </button>
            <button
              onClick={() => onReject(request.id)}
              className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
              title="Từ chối"
            >
              <X size={18} />
            </button>
          </>
        ) : (
          <button
            onClick={() => onCancel(request.id)}
            className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
            title="Hủy lời mời"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </ClayCard>
  );
};

// Blocked User Card
const BlockedCard = ({ user, onUnblock }) => (
  <ClayCard className="flex items-center gap-4 !p-4 hover:shadow-clay-card-hover transition-all">
    <div className="w-14 h-14 rounded-full bg-slate-300 overflow-hidden border-2 border-white shadow-md opacity-60">
      {user.avatar_url ? (
        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover grayscale" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-600 font-black text-lg">
          {user.full_name?.charAt(0)?.toUpperCase()}
        </div>
      )}
    </div>

    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-slate-600 truncate">{user.full_name}</h4>
      <p className="text-sm text-slate-400 truncate">{user.major || 'Chưa cập nhật ngành'}</p>
    </div>

    <button
      onClick={() => onUnblock(user.id)}
      className="p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors"
      title="Bỏ chặn"
    >
      <Shield size={18} />
    </button>
  </ClayCard>
);

// Empty State Component
const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
      <Icon size={32} className="text-slate-400" />
    </div>
    <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 max-w-sm">{description}</p>
  </div>
);

// User Discovery Card
const UserDiscoveryCard = ({ user, onAddFriend, isRequested }) => (
  <ClayCard className="flex items-center gap-4 !p-4 hover:shadow-clay-card-hover transition-all">
    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-500 overflow-hidden border-2 border-white shadow-md">
      {user.avatar_url ? (
        <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-white font-black text-lg">
          {user.full_name?.charAt(0)?.toUpperCase()}
        </div>
      )}
    </div>

    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-slate-800 truncate">{user.full_name}</h4>
      <p className="text-sm text-slate-500 truncate">{user.major || 'Sinh viên'}</p>
      {user.university && <p className="text-xs text-slate-400 truncate">{user.university}</p>}
    </div>

    <button
      onClick={() => onAddFriend(user.id)}
      disabled={isRequested}
      className={`
        p-2.5 rounded-xl transition-colors font-bold flex items-center gap-2
        ${isRequested
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
          : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
        }
      `}
    >
      {isRequested ? <Check size={18} /> : <UserPlus size={18} />}
      {isRequested ? 'Đã gửi' : 'Kết bạn'}
    </button>
  </ClayCard>
);

export default function FriendsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('friends');

  // State for search
  const [inputValue, setInputValue] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(inputValue);
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue]);


  // Socket: Real-time updates
  React.useEffect(() => {
    if (!socket) return;

    const handleNewRequest = () => {
      queryClient.invalidateQueries(['friend-requests']);
    };

    const handleRequestAccepted = () => {
      queryClient.invalidateQueries(['friends']);
      queryClient.invalidateQueries(['friend-requests']);
    };

    socket.on('new_friend_request', handleNewRequest);
    socket.on('friend_request_accepted', handleRequestAccepted);

    return () => {
      socket.off('new_friend_request', handleNewRequest);
      socket.off('friend_request_accepted', handleRequestAccepted);
    };
  }, [socket, queryClient]);



  // Queries
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ['friends'],
    queryFn: friendsAPI.getFriends,
    enabled: !!user
  });

  const { data: requests = { incoming: [], outgoing: [] }, isLoading: loadingRequests } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: friendsAPI.getFriendRequests,
    enabled: !!user
  });

  const { data: blockedUsers = [], isLoading: loadingBlocked } = useQuery({
    queryKey: ['blocked-users'],
    queryFn: friendsAPI.getBlockedUsers,
    enabled: !!user && activeTab === 'blocked'
  });

  const { data: suggestions = [], isLoading: loadingSuggestions } = useQuery({
    queryKey: ['friend-suggestions'],
    queryFn: friendsAPI.getSuggestions,
    enabled: !!user && activeTab === 'found' && debouncedSearchQuery.length === 0,
    staleTime: 1000 * 60 * 5 // 5 mins
  });

  // Mutations
  const acceptMutation = useMutation({
    mutationFn: friendsAPI.acceptRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(['friends']);
      queryClient.invalidateQueries(['friend-requests']);
      addToast('Đã chấp nhận kết bạn', 'success');
    },
    onError: () => addToast('Có lỗi xảy ra', 'error')
  });

  const rejectMutation = useMutation({
    mutationFn: friendsAPI.rejectRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(['friend-requests']);
      addToast('Đã từ chối lời mời', 'info');
    }
  });

  const cancelMutation = useMutation({
    mutationFn: friendsAPI.cancelRequest,
    onSuccess: () => queryClient.invalidateQueries(['friend-requests'])
  });

  const unfriendMutation = useMutation({
    mutationFn: friendsAPI.unfriend,
    onSuccess: () => queryClient.invalidateQueries(['friends'])
  });

  const blockMutation = useMutation({
    mutationFn: friendsAPI.blockUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['friends']);
      queryClient.invalidateQueries(['friend-requests']);
      queryClient.invalidateQueries(['blocked-users']);
    }
  });

  const unblockMutation = useMutation({
    mutationFn: friendsAPI.unblockUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['friends']);
      queryClient.invalidateQueries(['blocked-users']);
      addToast('Đã bỏ chặn người dùng', 'success');
    }
  });

  const sendRequestMutation = useMutation({
    mutationFn: friendsAPI.sendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries(['friend-requests']);
      addToast('Đã gửi lời mời kết bạn', 'success');
    },
    onError: (err) => {
      const msg = err.response?.data?.error?.message || 'Không thể gửi lời mời';
      addToast(msg, 'error');
    }
  });

  // Search Query for global users
  const { data: searchResults = [], isLoading: loadingSearch } = useQuery({
    queryKey: ['users', debouncedSearchQuery],
    queryFn: () => friendsAPI.searchUsers(debouncedSearchQuery),
    enabled: activeTab === 'found' && debouncedSearchQuery.length > 0,
    staleTime: 0, // Always fetch fresh data for search
    retry: false
  });

  const navigate = useNavigate();

  // Handlers
  const handleMessage = (friend) => {
    navigate('/messages', { state: { selectedUser: friend } });
  };

  // Filter by search (use immediate input value for local filter)
  // Filter by search (use immediate input value for local filter)
  const filteredFriends = friends.filter(f =>
    f.full_name && f.full_name.toLowerCase().includes((inputValue || '').toLowerCase())
  );

  const tabs = [
    { id: 'found', label: 'Khám phá', count: 0, icon: Search },
    { id: 'friends', label: 'Bạn bè', count: friends.length, icon: Users },
    { id: 'incoming', label: 'Lời mời kết bạn', count: requests.incoming?.length || 0, icon: UserPlus },
    { id: 'outgoing', label: 'Đã gửi lời mời', count: requests.outgoing?.length || 0, icon: UserMinus },
    { id: 'blocked', label: 'Đã chặn', count: blockedUsers.length, icon: Ban }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Users className="text-green-500" size={20} />
            Bạn bè
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Quản lý kết nối và mở rộng mạng lưới học tập
          </p>
        </div>
        <ProButton variant="primary" icon={Search} onClick={() => setActiveTab('found')}>
          Tìm bạn bè
        </ProButton>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }
              `}
            >
              <Icon size={18} />
              {tab.label}
              {tab.count > 0 && (
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

      {/* Search Bar */}
      {(activeTab === 'friends' || activeTab === 'found') && (
        <ClayCard className="flex items-center gap-3 !p-4">
          <Search className="text-slate-400" size={20} />
          <input
            type="text"
            placeholder={activeTab === 'found' ? "Nhập tên, email hoặc ngành học..." : "Tìm kiếm trong danh sách bạn bè..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-transparent outline-none font-bold text-slate-800 placeholder:text-slate-400"
            autoFocus={activeTab === 'found'}
          />
        </ClayCard>
      )}

      {/* Content */}
      <div className="space-y-4">
        {/* Find/Discover Tab */}
        {activeTab === 'found' && (
          <>
            {loadingSearch ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-primary-600" size={40} />
              </div>
            ) : debouncedSearchQuery.length === 0 ? (
              // Suggestions View
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-2xl border border-indigo-100">
                  <h3 className="text-lg font-black text-indigo-900 mb-1 flex items-center gap-2">
                    <Users size={20} className="text-indigo-600" />
                    Gợi ý kết bạn
                  </h3>
                  <p className="text-indigo-700 text-sm">
                    Những người có thể bạn quen dựa trên ngành học.
                  </p>
                </div>

                {loadingSuggestions ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="animate-spin text-indigo-400" size={30} />
                  </div>
                ) : suggestions.length === 0 ? (
                  <EmptyState
                    icon={Search}
                    title="Chưa có gợi ý"
                    description="Hãy cập nhật hồ sơ để chúng tôi tìm bạn bè phù hợp hơn."
                  />
                ) : (
                  suggestions.map(u => {
                    const isRequested = requests.outgoing?.some(req => req.toUser?.id === u.id);
                    return (
                      <UserDiscoveryCard
                        key={u.id}
                        user={u}
                        isRequested={isRequested}
                        onAddFriend={() => sendRequestMutation.mutate(u.id)}
                      />
                    );
                  })
                )}
              </div>
            ) : searchResults.length === 0 ? (
              <EmptyState
                icon={UserX}
                title="Không tìm thấy"
                description={`Không tìm thấy kết quả nào cho "${debouncedSearchQuery}"`}
              />
            ) : (
              searchResults
                .filter(u => u.id !== user?.id && !friends.find(f => f.id === u.id)) // Exclude self and existing friends
                .map((u) => {
                  const isRequested = requests.outgoing?.some(req => req.toUser?.id === u.id);
                  return (
                    <UserDiscoveryCard
                      key={u.id}
                      user={u}
                      isRequested={isRequested}
                      onAddFriend={() => sendRequestMutation.mutate(u.id)}
                    />
                  );
                })
            )}
          </>
        )}

        {/* Friends Tab */}
        {activeTab === 'friends' && (
          <>
            {loadingFriends ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-primary-600" size={40} />
              </div>
            ) : filteredFriends.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Chưa có bạn bè"
                description="Hãy bắt đầu kết nối với những người cùng chí hướng học tập!"
              />
            ) : (
              filteredFriends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onMessage={handleMessage}
                  onUnfriend={() => unfriendMutation.mutate(friend.id)}
                  onBlock={() => blockMutation.mutate(friend.id)}
                />
              ))
            )}

            {/* Suggestion if search yields no friends */}
            {activeTab === 'friends' && inputValue.length > 0 && filteredFriends.length === 0 && (
              <div className="text-center mt-4">
                <p className="text-slate-500 mb-2">Không tìm thấy bạn bè nào tên "{inputValue}".</p>
                <button
                  onClick={() => setActiveTab('found')}
                  className="text-primary-600 font-bold hover:underline"
                >
                  Tìm trong cộng đồng HUSTUDENT?
                </button>
              </div>
            )}
          </>
        )}

        {/* Incoming Requests Tab */}
        {activeTab === 'incoming' && (
          <>
            {loadingRequests ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-primary-600" size={40} />
              </div>
            ) : requests.incoming?.length === 0 ? (
              <EmptyState
                icon={UserPlus}
                title="Không có lời mời kết bạn"
                description="Bạn chưa nhận được lời mời kết bạn nào."
              />
            ) : (
              requests.incoming?.map((req) => (
                <RequestCard
                  key={req.id}
                  request={req}
                  type="incoming"
                  onAccept={() => acceptMutation.mutate(req.id)}
                  onReject={() => rejectMutation.mutate(req.id)}
                />
              ))
            )}
          </>
        )}

        {/* Outgoing Requests Tab */}
        {activeTab === 'outgoing' && (
          <>
            {loadingRequests ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-primary-600" size={40} />
              </div>
            ) : requests.outgoing?.length === 0 ? (
              <EmptyState
                icon={UserMinus}
                title="Chưa gửi lời mời"
                description="Bạn chưa gửi lời mời kết bạn nào."
              />
            ) : (
              requests.outgoing?.map((req) => (
                <RequestCard
                  key={req.id}
                  request={req}
                  type="outgoing"
                  onCancel={() => cancelMutation.mutate(req.id)}
                />
              ))
            )}
          </>
        )}

        {/* Blocked Tab */}
        {activeTab === 'blocked' && (
          <>
            {loadingBlocked ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="animate-spin text-primary-600" size={40} />
              </div>
            ) : blockedUsers.length === 0 ? (
              <EmptyState
                icon={UserX}
                title="Không có người dùng bị chặn"
                description="Danh sách người dùng bị chặn sẽ hiển thị ở đây."
              />
            ) : (
              blockedUsers.map((user) => (
                <BlockedCard
                  key={user.id}
                  user={user}
                  onUnblock={() => unblockMutation.mutate(user.id)}
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
