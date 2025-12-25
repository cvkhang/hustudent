import React from 'react';

const ChatSidebarItem = ({ chat, isActive, onClick, currentUserId }) => {
  const otherUser = chat.otherUser || {};
  const lastMessage = chat.lastMessage;

  const isUnread = chat.unreadCount > 0;
  const isLastMessageOwn = lastMessage?.sender_id === currentUserId;

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all mb-1 ${isActive
        ? 'bg-primary-50 border border-primary-200 shadow-sm'
        : 'hover:bg-slate-50 border border-transparent'
        }`}
    >
      <div className="relative flex-shrink-0">
        {otherUser.avatar_url ? (
          <img src={otherUser.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
            {otherUser.full_name?.charAt(0) || '?'}
          </div>
        )}
        {/* Online Indicator could go here */}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className={`text-sm truncate pr-2 ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
            {otherUser.full_name || 'Unknown'}
          </h4>
          <span className={`text-[10px] whitespace-nowrap ${isUnread ? 'text-primary-600 font-bold' : 'text-slate-400'}`}>
            {lastMessage?.created_at ? new Date(lastMessage.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className={`text-xs truncate max-w-[180px] ${isUnread ? 'font-semibold text-slate-800' : 'text-slate-500'}`}>
            {isLastMessageOwn && <span className="mr-1">Bạn:</span>}
            {lastMessage
              ? (lastMessage.content
                ? lastMessage.content
                : (lastMessage.attachments?.length > 0
                  ? (lastMessage.attachments[0].type === 'image' ? '[Hình ảnh]' : '[Tệp đính kèm]')
                  : 'Tin nhắn trống'))
              : 'Chưa có tin nhắn'
            }
          </p>

          {isUnread && (
            <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold shadow-sm shadow-red-200">
              {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebarItem;
