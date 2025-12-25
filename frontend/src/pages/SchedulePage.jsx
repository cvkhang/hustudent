import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Loader2 } from 'lucide-react';
import groupService from '@/features/core/api/groupService';
import SessionItem from '@/components/groups/SessionItem';
import ClayCard from '@/components/ui/ClayCard';
import ProButton from '@/components/ui/ProButton';
import { useAuth } from '@/context/AuthContext';

const SchedulePage = () => {
  const { user } = useAuth();

  // Fetch schedule
  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['mySchedule'],
    queryFn: groupService.getMySchedule,
    enabled: !!user
  });

  // Group sessions by date for a better view? Or just a list?
  // Let's do a simple list first, sorted by date.
  const upcomingSessions = sessions.filter(s => new Date(s.end_time) >= new Date()).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
  const pastSessions = sessions.filter(s => new Date(s.end_time) < new Date()).sort((a, b) => new Date(b.start_time) - new Date(a.start_time));

  const [showPast, setShowPast] = useState(false);

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Calendar className="text-primary-500" size={20} />
            Lịch học của tôi
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Theo dõi các buổi học và hoạt động sắp tới
          </p>
        </div>
      </div>

      {/* Stats Cards maybe? */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0"> ... </div> */}

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-8 pb-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary-500 mb-4" size={40} />
            <p className="text-slate-400 font-medium">Đang tải lịch học...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Calendar size={48} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có lịch học nào</h3>
            <p className="text-slate-500 max-w-sm mb-6">
              Bạn chưa tham gia nhóm học tập nào hoặc chưa đăng ký buổi học nào.
            </p>
          </div>
        ) : (
          <>
            {/* Upcoming Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-1 bg-primary-500 rounded-full"></div>
                <h2 className="text-xl font-black text-slate-800">Sắp tới ({upcomingSessions.length})</h2>
              </div>

              {upcomingSessions.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {upcomingSessions.map(session => (
                    <SessionItem key={session.id} session={session} />
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 italic ml-4">Không có buổi học nào sắp tới.</p>
              )}
            </div>

            {/* Past Toggle */}
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowPast(!showPast)}
                className="flex items-center gap-2 text-slate-500 hover:text-primary-600 font-bold transition-colors"
              >
                {showPast ? <ChevronLeft size={20} /> : <Clock size={20} />}
                {showPast ? 'Ẩn lịch sử' : 'Xem lịch sử các buổi đã qua'}
              </button>
            </div>

            {/* Past Section */}
            {showPast && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
                <h2 className="text-xl font-black text-slate-800 ml-4">Đã kết thúc</h2>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 opacity-75">
                  {pastSessions.map(session => (
                    <SessionItem key={session.id} session={session} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
