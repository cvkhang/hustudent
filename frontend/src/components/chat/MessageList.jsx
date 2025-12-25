import React, { useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import MessageBubble from './MessageBubble';

const MessageList = ({ messages, currentUserId, isLoading, selectedChat }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <div className="text-center">
          <MessageCircle size={48} className="mx-auto mb-2 opacity-50" />
          <p>Bắt đầu cuộc trò chuyện!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
      {messages.map((message, index) => {
        const isOwn = message.sender_id === currentUserId;
        // Logic to show avatar only for first message of a group could go here
        // For now, simpler: show for all non-own messages
        const showAvatar = !isOwn;

        return (
          <MessageBubble
            key={message.id || index}
            message={message}
            isOwn={isOwn}
            showAvatar={showAvatar}
            otherUser={selectedChat.otherUser}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
