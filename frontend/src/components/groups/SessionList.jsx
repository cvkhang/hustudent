import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Plus } from 'lucide-react';
import ProButton from '../ui/ProButton';
import SessionItem from './SessionItem';
import CreateSessionModal from './CreateSessionModal';
import groupService from '@/features/core/api/groupService';

const SessionList = ({ groupId, isMember }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['groupSessions', groupId],
    queryFn: () => groupService.getSessions(groupId)
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Calendar size={20} className="text-primary-500" />
          Lịch học nhóm
        </h3>
        {isMember && (
          <ProButton size="sm" icon={Plus} onClick={() => setShowCreateModal(true)}>
            Thêm buổi học
          </ProButton>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-20">
          <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
          <Calendar size={32} className="mx-auto text-slate-300 mb-2" />
          <p className="text-slate-500 text-sm font-medium">Chưa có buổi học nào.</p>
          {isMember && (
            <button onClick={() => setShowCreateModal(true)} className="text-primary-600 font-bold text-sm mt-1 hover:underline">
              Tạo buổi học ngay
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => (
            <SessionItem key={session.id} session={session} />
          ))}
        </div>
      )}

      {showCreateModal && <CreateSessionModal groupId={groupId} onClose={() => setShowCreateModal(false)} />}
    </div>
  );
};

export default SessionList;
