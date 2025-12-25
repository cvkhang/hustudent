
import React from 'react';
import { Info, MoreVertical, ShieldAlert } from 'lucide-react';
import ProButton from '../ui/ProButton';
import { useAuth } from '@/context/AuthContext';

const ChatHeader = ({ chat, onBlock, onUnblock, onInfo, isBlocked }) => {
  const { user } = useAuth();
  const otherUser = chat.otherUser || {};
  const isOnline = false; // TODO: Real online status from Socket

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="relative">
          {otherUser.avatar_url ? (
            <img src={otherUser.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold">
              {otherUser.full_name?.charAt(0) || '?'}
            </div>
          )}
          {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
        </div>

        <div>
          <h3 className="font-bold text-slate-800 leading-tight">{otherUser.full_name}</h3>
          {isOnline ? (
            <span className="text-xs text-green-500 font-medium">Đang hoạt động</span>
          ) : (
            <span className="text-xs text-slate-400">{otherUser.major || 'Sinh viên'}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Dropdown Menu Trigger could be here */}
        <div className="relative group">
          <ProButton variant="ghost" className="!p-2 text-slate-400 hover:text-slate-800 rounded-full">
            <MoreVertical size={20} />
          </ProButton>

          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-1 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all transform origin-top-right">
            <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-600 flex items-center gap-2">
              <Info size={16} /> Xem thông tin
            </button>
            {isBlocked ? (
              <button onClick={onUnblock} className="w-full text-left px-3 py-2 rounded-lg hover:bg-green-50 text-sm font-medium text-green-600 flex items-center gap-2">
                <ShieldAlert size={16} /> Bỏ chặn
              </button>
            ) : (
              <button onClick={onBlock} className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-sm font-medium text-red-600 flex items-center gap-2">
                <ShieldAlert size={16} /> Chặn người này
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
