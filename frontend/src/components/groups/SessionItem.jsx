import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, CheckCircle, XCircle, HelpCircle, Clock, MoreVertical, Edit, Trash2 } from 'lucide-react';
import ProButton from '../ui/ProButton';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import groupService from '@/features/core/api/groupService';
import SessionAttendeesModal from './SessionAttendeesModal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import CreateSessionModal from './CreateSessionModal'; // We can potentially reuse this

const SessionItem = ({ session }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const menuRef = useRef(null);

  const startTime = new Date(session.start_time);
  const endTime = new Date(session.end_time);
  const isPast = new Date() > endTime;
  const isCreator = user?.id === session.created_by; // Simplistic check

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const rsvpMutation = useMutation({
    mutationFn: (status) => groupService.rsvpSession(session.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['groupSessions', session.group_id]);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => groupService.deleteSession(session.id),
    onSuccess: () => {
      addToast('Đã xóa buổi học', 'success');
      queryClient.invalidateQueries(['groupSessions', session.group_id]);
    },
    onError: (err) => {
      addToast(err.response?.data?.message || 'Không thể xóa buổi học', 'error');
    }
  });

  const getDay = (date) => date.getDate();
  const getMonth = (date) => date.toLocaleString('vi-VN', { month: 'short' });
  const getTime = (date) => date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <div className={`
        relative group p-5 rounded-2xl border transition-all duration-300
      ${isPast
          ? 'bg-slate-50 border-slate-100 opacity-60 hover:opacity-100'
          : 'bg-white border-slate-100 shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-100'}
    `}>
        {/* Actions Menu (Only for creator) */}
        {!isPast && isCreator && (
          <div className="absolute top-4 right-4 z-20" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    // TODO: Implement edit
                    addToast('Tính năng sửa đang cập nhật', 'info');
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Edit size={16} /> Sửa
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    if (window.confirm('Bạn có chắc muốn xóa buổi học này?')) {
                      deleteMutation.mutate();
                    }
                  }}
                  className="w-full text-left px-3 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 size={16} /> Xóa
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-5">
          {/* Date Box */}
          <div className={`
          shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] flex flex-col items-center justify-center transition-all duration-500 ease-out
          ${isPast
              ? 'bg-slate-100 text-slate-400 opacity-60 grayscale'
              : 'bg-white text-indigo-600 shadow-[0_8px_30px_rgb(99,102,241,0.2)] ring-1 ring-indigo-50 hover:shadow-[0_20px_40px_rgb(99,102,241,0.25)] hover:bg-gradient-to-br hover:from-white hover:to-indigo-50/30 group-hover:scale-105 group-hover:-rotate-2'}
        `}>
            <span className={`text-[10px] sm:text-xs font-extrabold uppercase tracking-widest ${isPast ? 'text-slate-400' : 'text-indigo-400'}`}>
              {getMonth(startTime)}
            </span>
            <span className={`text-3xl sm:text-4xl font-black leading-none tracking-tight ${isPast ? 'text-slate-500' : 'text-indigo-600 drop-shadow-sm'}`}>
              {getDay(startTime)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-bold text-lg leading-tight mb-3 ${isPast ? 'text-slate-500' : 'text-slate-800'}`}>
                {session.title}
              </h3>
              {isPast && <span className="shrink-0 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded tracking-wide">Đã kết thúc</span>}
            </div>

            <div className="flex flex-col gap-2.5 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-slate-400" />
                <span className="font-medium text-slate-600">{getTime(startTime)} - {getTime(endTime)}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                <span className="font-medium text-slate-600">
                  {session.location_type === 'online' ? 'Học Online' : session.location_text || 'Offline'}
                </span>
              </div>
            </div>

            {session.agenda && (
              <div className={`mt-4 p-3 rounded-xl text-sm italic border ${isPast ? 'bg-slate-100/50 border-transparent text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                "{session.agenda}"
              </div>
            )}

            <div className="mt-5 flex items-center justify-between">
              <div className="flex -space-x-2 overflow-hidden">
                {/* Placeholder for faces if available later */}
              </div>
              <button
                onClick={() => setShowAttendeesModal(true)}
                className="text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {session.goingCount} người tham gia
              </button>
            </div>
          </div>

          {/* RSVP Actions - Right side or Bottom for mobile */}
          {!isPast && (
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l border-slate-100 sm:pl-5 mt-2 sm:mt-0 min-w-[5rem]">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide hidden sm:block">Điểm danh</p>
              <div className="flex sm:flex-col gap-2 w-full sm:w-auto justify-center">
                <button
                  onClick={() => rsvpMutation.mutate('going')}
                  className={`flex-1 sm:flex-none p-2 rounded-xl transition-all flex items-center justify-center gap-2 ${session.myRsvp === 'going' ? 'bg-green-100 text-green-700 ring-1 ring-green-300 shadow-sm' : 'bg-slate-50 text-slate-400 hover:bg-green-50 hover:text-green-600'}`}
                  title="Tham gia"
                >
                  <CheckCircle size={18} />
                  <span className="sm:hidden text-xs font-bold">Đi</span>
                </button>
                <button
                  onClick={() => rsvpMutation.mutate('maybe')}
                  className={`flex-1 sm:flex-none p-2 rounded-xl transition-all flex items-center justify-center gap-2 ${session.myRsvp === 'maybe' ? 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300 shadow-sm' : 'bg-slate-50 text-slate-400 hover:bg-yellow-50 hover:text-yellow-600'}`}
                  title="Có thể"
                >
                  <HelpCircle size={18} />
                  <span className="sm:hidden text-xs font-bold">Có thể</span>
                </button>
                <button
                  onClick={() => rsvpMutation.mutate('not_going')}
                  className={`flex-1 sm:flex-none p-2 rounded-xl transition-all flex items-center justify-center gap-2 ${session.myRsvp === 'not_going' ? 'bg-red-100 text-red-700 ring-1 ring-red-300 shadow-sm' : 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600'}`}
                  title="Vắng"
                >
                  <XCircle size={18} />
                  <span className="sm:hidden text-xs font-bold">Bận</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAttendeesModal && (
        <SessionAttendeesModal
          sessionId={session.id}
          onClose={() => setShowAttendeesModal(false)}
        />
      )}
    </>
  );
};

export default SessionItem;
