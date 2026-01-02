import React, { useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import MessageBubble from './MessageBubble';
import { formatDateDivider, isDifferentDay, isTimestampGap } from '@/utils/timeFormat';

const DateDivider = ({ date }) => (
  <div className="flex items-center justify-center my-4">
    <div className="px-3 py-1 bg-slate-200/80 text-slate-500 text-xs font-medium rounded-full">
      {formatDateDivider(date)}
    </div>
  </div>
);

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
        const prevMessage = messages[index - 1];

        // Show date divider if different day from previous message
        const showDateDivider = isDifferentDay(prevMessage?.created_at, message.created_at);

        // Show timestamp if gap > 5 minutes or different sender
        const showTimestamp = isTimestampGap(prevMessage?.created_at, message.created_at, 5)
          || prevMessage?.sender_id !== message.sender_id;

        // Show avatar only for first message in a consecutive group from same sender
        const showAvatar = !isOwn && (
          !messages[index + 1] ||
          messages[index + 1]?.sender_id !== message.sender_id ||
          isTimestampGap(message.created_at, messages[index + 1]?.created_at, 5)
        );

        return (
          <React.Fragment key={message.id || index}>
            {showDateDivider && <DateDivider date={message.created_at} />}
            <MessageBubble
              message={message}
              isOwn={isOwn}
              showAvatar={showAvatar}
              showTimestamp={showTimestamp}
              otherUser={selectedChat?.otherUser}
            />
          </React.Fragment>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
