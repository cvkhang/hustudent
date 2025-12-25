import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Image as ImageIcon, Loader2, User as UserIcon } from 'lucide-react';
import groupService from '@/features/core/api/groupService';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useSocket } from '@/context/SocketContext'; // Ensure this context exists and exports useSocket
import ClayCard from '@/components/ui/ClayCard';

const GroupChat = ({ groupId }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // 1. Fetch Group Chat ID
  const { data: chatData, isLoading: isLoadingChat } = useQuery({
    queryKey: ['groupChat', groupId],
    queryFn: () => groupService.getGroupChat(groupId),
    refetchOnWindowFocus: false,
  });

  const chatId = chatData?.id;

  // 2. Fetch Messages
  const { data: messages = [], isLoading: isLoadingMessages, refetch: refetchMessages } = useQuery({
    queryKey: ['chatMessages', chatId],
    queryFn: () => groupService.getChatMessages(chatId, { limit: 50 }),
    enabled: !!chatId,
    refetchInterval: false, // rely on socket
  });

  // 3. Socket Listeners
  useEffect(() => {
    if (!socket || !chatId) return;

    // Join room? usually handled by server based on user ID or implementing join_room event.
    // Assuming server emits 'receive_message' to socket.userId if they are in the group?
    // OR we need to join a room.
    // "chat-${chat.id}" room mentioned in backend service.
    // Frontend needs to emit 'join_chat' if backend requires it, or backend handles it via 'connection'.
    // Existing socket logic might be auto-joining user room.
    // Backend `ChatService.emitMessage`: `io.to(chat-${chat.id}).emit(...)`
    // So frontend MUST join `chat-${chatId}`.

    socket.emit('join_chat', chatId);

    const handleReceiveMessage = (newMessage) => {
      // Check if message belongs to this chat
      if (newMessage.chat_id === chatId) {
        queryClient.setQueryData(['chatMessages', chatId], (oldData) => {
          if (!oldData) return [newMessage];
          // Check duplicate
          if (oldData.some(m => m.id === newMessage.id)) return oldData;
          return [...oldData, newMessage];
        });
        scrollToBottom();
      }
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.emit('leave_chat', chatId);
    };
  }, [socket, chatId, queryClient]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isSending || !chatId) return;

    try {
      setIsSending(true);
      const formData = new FormData();
      formData.append('content', inputText);

      await groupService.sendChatMessage(chatId, formData);
      setInputText('');
    } catch (error) {
      console.error(error);
      addToast('Không thể gửi tin nhắn', 'error');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoadingChat) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary-500" /></div>;
  }

  if (!chatId) {
    return <div className="text-center p-10 text-slate-500">Không thể kết nối chat</div>;
  }

  return (
    <div className="flex flex-col h-[600px] bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingMessages ? (
          <div className="flex justify-center pt-10"><Loader2 className="animate-spin text-slate-400" /></div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className="shrink-0">
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                      <img
                        src={msg.sender?.avatar_url || `https://ui-avatars.com/api/?name=${msg.sender?.full_name}`}
                        alt="avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {!isMe && <span className="text-xs text-slate-500 ml-1 mb-1">{msg.sender?.full_name}</span>}
                  <div className={`
                    p-3 rounded-2xl text-sm break-words shadow-sm
                    ${isMe
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-tr-none'
                      : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                    }
                  `}>
                    {msg.content}
                    {msg.attachments?.map(att => (
                      <div key={att.id} className="mt-2">
                        {att.type === 'image' ? (
                          <img src={att.file_url} className="rounded-lg max-h-40" alt="attachment" />
                        ) : (
                          <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="text-xs underline text-white/90">
                            {att.file_name}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {new Date(msg.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 z-10">
        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-slate-700 focus:ring-2 focus:ring-indigo-200 focus:bg-white transition-all outline-none"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-200"
          >
            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GroupChat;
