import React from 'react';
import { Check, CheckCheck, FileText, Download } from 'lucide-react';
import { formatMessageTime } from '@/utils/timeFormat';

const TimestampTooltip = ({ time, status, isOwn }) => (
  <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none z-10
    opacity-0 group-hover/bubble:opacity-100 transition-all duration-200 scale-95 group-hover/bubble:scale-100
    ${isOwn ? 'right-full mr-2' : 'left-full ml-2'}
  `}>
    <div className="flex items-center gap-1 px-2 py-1 bg-slate-800 text-white text-[10px] rounded-md shadow-lg whitespace-nowrap">
      <span>{time}</span>
      {isOwn && (
        status === 'seen'
          ? <CheckCheck size={10} className="text-primary-300" />
          : <Check size={10} className="text-slate-400" />
      )}
    </div>
  </div>
);

const MessageBubble = ({ message, isOwn, showAvatar, otherUser }) => {
  const { content, created_at, status, attachments } = message;
  const time = formatMessageTime(created_at);

  const hasAttachments = attachments && attachments.length > 0;
  const hasContent = !!content;

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 group`}>
      {/* Avatar for other user */}
      {!isOwn && (
        <div className="w-8 h-8 mr-2 shrink-0 self-end">
          {showAvatar ? (
            otherUser?.avatar_url ? (
              <img src={otherUser.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
                {otherUser?.full_name?.charAt(0) || '?'}
              </div>
            )
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>
      )}

      <div className={`relative flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
        {/* Attachments */}
        {hasAttachments && (
          <div className={`relative group/bubble flex flex-col gap-1 mb-1 ${isOwn ? 'items-end' : 'items-start'}`}>
            {attachments.map(att => (
              <div key={att.id} className="overflow-hidden rounded-xl">
                {att.type === 'image' ? (
                  <img src={att.file_url} alt="attachment" className="max-w-[200px] max-h-[300px] object-cover cursor-pointer hover:opacity-95" onClick={() => window.open(att.file_url, '_blank')} />
                ) : (
                  <div className={`flex items-center gap-2 p-3 rounded-xl border ${isOwn ? 'bg-primary-600 border-primary-400 text-white' : 'bg-white border-slate-200'}`}>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate max-w-[150px]">{att.file_name}</p>
                      <p className="text-xs opacity-70">{(att.file_size / 1024).toFixed(1)} KB</p>
                    </div>
                    <a href={att.file_url} target="_blank" rel="noreferrer" download className="p-2 hover:bg-black/10 rounded-full transition-colors">
                      <Download size={16} />
                    </a>
                  </div>
                )}
              </div>
            ))}
            {/* Show tooltip on attachments only if no text content */}
            {!hasContent && <TimestampTooltip time={time} status={status} isOwn={isOwn} />}
          </div>
        )}

        {/* Text Content with Tooltip */}
        {hasContent && (
          <div className="relative group/bubble">
            <div className={`relative px-4 py-2 rounded-2xl break-all whitespace-pre-wrap cursor-default ${isOwn
              ? 'bg-primary-500 text-white rounded-br-sm'
              : 'bg-white text-slate-800 rounded-bl-sm border border-slate-200 shadow-sm'
              }`}>
              <p className="text-sm leading-relaxed">{content}</p>
            </div>
            <TimestampTooltip time={time} status={status} isOwn={isOwn} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
