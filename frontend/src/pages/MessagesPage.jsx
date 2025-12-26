import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import api from '@/lib/api';
import ClayCard from '@/components/ui/ClayCard';
import { Search, MessageCircle, UserPlus, ShieldAlert } from 'lucide-react';
import ProButton from '@/components/ui/ProButton';

// ... imports ...




// Components
import ChatSidebarItem from '@/components/chat/ChatSidebarItem';
import ChatHeader from '@/components/chat/ChatHeader';
import MessageList from '@/components/chat/MessageList';
import ChatInput from '@/components/chat/ChatInput';

// API
const chatAPI = {
  getChats: async () => {
    const res = await api.get('/chats');
    return res.data.data;
  },
  createChat: async (userId) => {
    const res = await api.post('/chats', { otherUserId: userId });
    return res.data.data;
  },
  getMessages: async (chatId) => {
    const res = await api.get(`/chats/${chatId}/messages`);
    return res.data.data;
  },
  sendMessage: async ({ chatId, content, files }) => {
    const formData = new FormData();
    if (content) formData.append('content', content);
    if (files) {
      files.forEach(file => formData.append('files', file));
    }

    const res = await api.post(`/chats/${chatId}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data;
  },
  blockUser: async (userId) => {
    await api.post(`/users/${userId}/block`);
  },
  sendFriendRequest: async (userId) => {
    await api.post('/friends/requests', { toUserId: userId });
  },
  acceptFriendRequest: async (requestId) => {
    await api.post(`/friends/requests/${requestId}/accept`);
  },
  cancelFriendRequest: async (requestId) => {
    await api.delete(`/friends/requests/${requestId}`);
  },
  markAsRead: async (chatId) => {
    await api.post(`/chats/${chatId}/read`);
  }
};

import { useLocation, useNavigate } from 'react-router-dom';

export default function MessagesPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedChat, setSelectedChat] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typingUsers, setTypingUsers] = useState({});

  // Queries
  const { data: chats = [], isLoading: loadingChats } = useQuery({
    queryKey: ['chats'],
    queryFn: chatAPI.getChats,
    enabled: !!user
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', selectedChat?.id],
    queryFn: () => chatAPI.getMessages(selectedChat.id),
    enabled: !!selectedChat?.id,
    staleTime: 0
  });

  // Mutations
  const createChatMutation = useMutation({
    mutationFn: chatAPI.createChat,
    onSuccess: (newChat) => {
      // Ensure we have otherUser info (from nav state or response)
      // The backend response for createChat might allow us to construct the frontend chat object
      // But typically we need to ensure the list ('chats') is updated

      queryClient.invalidateQueries(['chats']); // Refresh list to get full data

      // If we have user info from navigation, use it to set selectedChat immediately
      if (location.state?.selectedUser) {
        const chatWithUser = {
          ...newChat,
          otherUser: location.state.selectedUser
        };
        setSelectedChat(chatWithUser);
      }
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: chatAPI.sendMessage,
    onSuccess: (newMessage) => {
      queryClient.setQueryData(['messages', selectedChat?.id], (old) => {
        return old ? [...old, newMessage] : [newMessage];
      });
      queryClient.invalidateQueries(['chats']);
    },
    onError: (err) => {
      alert('Gửi tin nhắn thất bại: ' + (err.response?.data?.message || err.message));
    }
  });

  const blockMutation = useMutation({
    mutationFn: chatAPI.blockUser,
    onSuccess: () => {
      alert('Đã chặn người dùng này.');
      // setSelectedChat(null); // Keep chat open to show unblock option? Or refresh to update state
      queryClient.invalidateQueries(['chats']);

      if (selectedChat) {
        setSelectedChat(prev => ({
          ...prev,
          isBlockedByMe: true
        }));
      }
    }
  });

  const unblockMutation = useMutation({
    mutationFn: async (userId) => {
      await api.delete(`/users/${userId}/block`);
    },
    onSuccess: () => {
      alert('Đã bỏ chặn.');
      queryClient.invalidateQueries(['chats']);

      // Update local state to reflect change immediately
      if (selectedChat) {
        setSelectedChat(prev => ({
          ...prev,
          isBlockedByMe: false
        }));
      }
    }
  });

  const markAsReadMutation = useMutation({
    mutationFn: chatAPI.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['chats']); // Update unread count in sidebar
    }
  });


  const sendFriendRequestMutation = useMutation({
    mutationFn: chatAPI.sendFriendRequest,
    onSuccess: () => {
      alert('Đã gửi lời mời kết bạn.');
      queryClient.invalidateQueries(['chats']);
      if (selectedChat) {
        setSelectedChat(prev => ({ ...prev, friendshipStatus: 'pending_sent' }));
      }
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Lỗi gửi lời mời');
    }
  });

  // Handle Navigation from Friends Page
  useEffect(() => {
    if (location.state?.selectedUser && !selectedChat) {
      const targetUser = location.state.selectedUser;

      // Check if chat already exists in loaded list
      const existingChat = chats.find(c => c.otherUser?.id === targetUser.id);

      if (existingChat) {
        setSelectedChat(existingChat);
      } else {
        // Create/Get chat from server
        createChatMutation.mutate(targetUser.id);
      }

      // Clear state so it doesn't persist on refresh/navigation
      window.history.replaceState({}, document.title);
    }
  }, [location.state, chats]);

  // Mark as read when chat opens or new messages arrive
  useEffect(() => {
    if (selectedChat && messages.length > 0) {
      // Check if there are unread messages from other user
      const hasUnread = messages.some(m => m.sender_id !== user.id && m.status !== 'seen');
      if (hasUnread) {
        markAsReadMutation.mutate(selectedChat.id);
      }
    }
  }, [selectedChat, messages, user.id]);

  // Socket Logic
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage) => {
      if (selectedChat && newMessage.chat_id === selectedChat.id) {
        queryClient.setQueryData(['messages', selectedChat.id], (old) => {
          if (old && old.some(m => m.id === newMessage.id)) return old;
          return old ? [...old, newMessage] : [newMessage];
        });

        // Mark this new message as read immediately if we are in the chat
        // (and arguably focused, but let's assume if selectedChat is set we are reading)
        markAsReadMutation.mutate(selectedChat.id);

      }
      queryClient.invalidateQueries(['chats']);
    };

    const handleChatRead = ({ chatId, readerId }) => {
      if (selectedChat && selectedChat.id == chatId) {
        // Update all my sent messages to 'seen'
        queryClient.setQueryData(['messages', selectedChat.id], (old) => {
          if (!old) return old;
          return old.map(m => {
            if (m.sender_id === user.id && m.status !== 'seen') {
              return { ...m, status: 'seen' };
            }
            return m;
          });
        });
      }
    }

    const handleTyping = ({ chatId, typerId }) => {
      if (typerId !== user.id) {
        setTypingUsers(prev => ({ ...prev, [chatId]: true }));
      }
    };

    const handleStopTyping = ({ chatId, typerId }) => {
      if (typerId !== user.id) {
        setTypingUsers(prev => ({ ...prev, [chatId]: false }));
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('chat_read', handleChatRead);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('chat_read', handleChatRead);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
    };
  }, [socket, selectedChat, queryClient, user.id]);

  // Handlers
  const handleSendMessage = (content, files) => {
    if (!selectedChat) return;
    sendMessageMutation.mutate({
      chatId: selectedChat.id,
      content,
      files
    });
  };

  const handleTyping = (isTyping) => {
    if (!socket || !selectedChat) return;
    socket.emit(isTyping ? 'typing' : 'stop_typing', {
      chatId: selectedChat.id,
      recipientId: selectedChat.otherUser?.id
    });
  };

  const handleBlockUser = () => {
    if (!selectedChat || !confirm(`Bạn có chắc muốn chặn ${selectedChat.otherUser?.full_name}?`)) return;
    blockMutation.mutate(selectedChat.otherUser?.id);
  };

  const handleUnblockUser = () => {
    if (!selectedChat || !confirm(`Bỏ chặn ${selectedChat.otherUser?.full_name}?`)) return;
    unblockMutation.mutate(selectedChat.otherUser?.id);
  };

  const filteredChats = chats
    .filter(chat => {
      const otherUser = chat.otherUser || {};
      return otherUser.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));

  return (
    <div className="flex h-full gap-6">
      <ClayCard className="w-80 flex flex-col !p-0 overflow-hidden shadow-lg border-slate-200">
        <div className="p-4 border-b border-slate-200 bg-white z-10">
          <h2 className="text-xl font-black text-slate-800 mb-3">Tin nhắn</h2>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loadingChats ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <p>Chưa có cuộc trò chuyện</p>
            </div>
          ) : (
            filteredChats.map(chat => (
              <ChatSidebarItem
                key={chat.id}
                chat={chat}
                currentUserId={user.id}
                isActive={selectedChat?.id === chat.id}
                onClick={() => setSelectedChat(chat)}
              />
            ))
          )}
        </div>
      </ClayCard>

      <ClayCard className="flex-1 flex flex-col !p-0 overflow-hidden shadow-lg border-slate-200 relative">
        {selectedChat ? (
          <>
            <ChatHeader
              chat={selectedChat}
              onBlock={handleBlockUser}
              onUnblock={handleUnblockUser}
              isBlocked={selectedChat.isBlockedByMe}
            />

            <MessageList
              messages={messages}
              currentUserId={user.id}
              isLoading={loadingMessages}
              selectedChat={selectedChat}
            />

            {typingUsers[selectedChat.id] && (
              <div className="px-4 py-1 text-xs text-slate-400 italic bg-white">
                {selectedChat.otherUser?.full_name} đang soạn...
              </div>
            )}

            {/* Friendship Actions or Chat Input */}
            {selectedChat.friendshipStatus === 'friends' ? (
              <ChatInput
                onSendMessage={handleSendMessage}
                onTyping={handleTyping}
                isLoading={sendMessageMutation.isLoading}
              />
            ) : (
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-center">
                {selectedChat.friendshipStatus === 'blocked' ? (
                  <p className="text-red-500 font-bold flex items-center gap-2">
                    <ShieldAlert size={20} />
                    {selectedChat.isBlockedByMe ? 'Bạn đã chặn người này.' : 'Bạn không thể nhắn tin cho người này.'}
                  </p>
                ) : selectedChat.friendshipStatus === 'pending_sent' ? (
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-slate-500 font-medium">Đã gửi lời mời kết bạn.</p>
                    <ProButton
                      onClick={() => cancelRequestMutation.mutate(selectedChat.otherUser?.id)} // Wait, need request ID? 
                      // Actually cancel API needs request ID. But here we might only have user ID. 
                      // We might need to fetch pending request ID or change API to allow canceling by User ID.
                      // The friendService backend `cancelFriendRequest` takes `requestId`.
                      // Let's check if we can adjust backend or if `friendRequest` object is needed.
                      // Current `chatService` returns `friendshipStatus` but not request ID.
                      // Simplest fix: Change backend `cancelFriendRequest` to find request by User ID if possible, OR return request ID in `getChats`.
                      // Let's simplify: Display "Đã gửi lời mời" (Request Sent) and maybe just disabled button or link to Friends page? 
                      // Or better, return request ID in `getChats`.
                      // For now, simple text "Đã gửi lời mời ... "
                      variant="outline" disabled>
                      Đã gửi lời mời
                    </ProButton>
                  </div>
                ) : selectedChat.friendshipStatus === 'pending_received' ? (
                  <div className="flex items-center gap-3">
                    <p className="text-slate-500 font-bold">Người này muốn kết bạn với bạn.</p>
                    <ProButton onClick={() => {
                      navigate('/friends');
                    }} variant="primary">
                      Chấp nhận (Vào trang Bạn bè)
                    </ProButton>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-slate-500 font-bold">Kết bạn để bắt đầu trò chuyện.</p>
                    <ProButton
                      onClick={() => sendFriendRequestMutation.mutate(selectedChat.otherUser?.id)}
                      variant="primary"
                      icon={UserPlus}
                    >
                      Kết bạn
                    </ProButton>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400 bg-slate-50/50">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto mb-4 opacity-30 text-primary-300" />
              <h3 className="text-xl font-bold mb-2 text-slate-700">Chọn cuộc trò chuyện</h3>
              <p>Chọn một cuộc trò chuyện từ danh sách để bắt đầu</p>
            </div>
          </div>
        )}
      </ClayCard>
    </div>
  );
}
