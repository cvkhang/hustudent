import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import { X, User, Loader2 } from 'lucide-react';
import groupService from '@/features/core/api/groupService';

const SessionAttendeesModal = ({ sessionId, onClose }) => {
  const { data: attendees = [], isLoading } = useQuery({
    queryKey: ['sessionAttendees', sessionId],
    queryFn: () => groupService.getSessionAttendees(sessionId)
  });

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.4)_100%)] backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md max-h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <User className="text-indigo-600" />
              Người tham gia
            </h2>
            <p className="text-sm text-slate-500 font-medium">Danh sách thành viên đăng ký</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] bg-white custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <Loader2 className="animate-spin text-indigo-500" size={32} />
              <p className="text-slate-500 text-sm font-bold">Đang tải danh sách...</p>
            </div>
          ) : attendees.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <User size={32} className="opacity-50" />
              </div>
              <p className="font-bold text-slate-500">Chưa có ai đăng ký</p>
              <p className="text-xs text-slate-400 mt-1">Hãy là người đầu tiên tham gia!</p>
            </div>
          ) : (
            attendees.map((item) => (
              <div key={item.user.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 p-0.5 shrink-0 shadow-md shadow-indigo-200">
                  <div className="w-full h-full rounded-[0.9rem] bg-white overflow-hidden flex items-center justify-center">
                    {item.user.avatar_url ? (
                      <img src={item.user.avatar_url} alt={item.user.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-black text-indigo-600">
                        {item.user.full_name?.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-800 truncate text-base">{item.user.full_name}</h4>
                  <p className="text-xs text-slate-500 truncate font-medium">{item.user.major || 'Sinh viên'}</p>
                </div>

                {/* Status Badge */}
                <div className={`
                    px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm
                    ${item.status === 'going' ? 'bg-green-100 text-green-700 ring-1 ring-green-200' :
                    item.status === 'maybe' ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200' : 'bg-red-100 text-red-700 ring-1 ring-red-200'}
                `}>
                  {item.status === 'going' ? 'Tham gia' : item.status === 'maybe' ? 'Có thể' : 'Từ chối'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SessionAttendeesModal;
