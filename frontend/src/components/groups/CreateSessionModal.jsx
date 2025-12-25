import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Calendar, MapPin, AlignLeft } from 'lucide-react';
import { createPortal } from 'react-dom';
import ProButton from '../ui/ProButton';
import groupService from '@/features/core/api/groupService';
import { useToast } from '@/context/ToastContext';

const CreateSessionModal = ({ groupId, onClose }) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    start_time: '',
    end_time: '',
    location_type: 'online',
    location_text: '',
    agenda: ''
  });

  const createMutation = useMutation({
    mutationFn: (data) => groupService.createSession(groupId, data),
    onSuccess: () => {
      addToast('Tạo buổi học thành công!', 'success');
      queryClient.invalidateQueries(['groupSessions', groupId]);
      onClose();
    },
    onError: (err) => {
      addToast(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.start_time || !formData.end_time) {
      addToast('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }
    createMutation.mutate(formData);
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.4)_100%)] backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Calendar className="text-indigo-600" />
              Tạo buổi học nhóm
            </h2>
            <p className="text-sm text-slate-500 font-medium">Lên lịch học tập cùng nhau</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 bg-white no-scrollbar">

          {/* Chủ đề */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Chủ đề buổi học <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Ôn tập chương 3"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all shadow-sm hover:shadow-md"
              autoFocus
              required
            />
          </div>

          {/* Thời gian */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.start_time}
                onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all shadow-sm hover:shadow-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.end_time}
                onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all shadow-sm hover:shadow-md"
                required
              />
            </div>
          </div>

          {/* Địa điểm */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Địa điểm</label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, location_type: 'online' })}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${formData.location_type === 'online'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
              >
                Online
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, location_type: 'offline' })}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${formData.location_type === 'offline'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-1 ring-indigo-200'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
              >
                Offline (Trực tiếp)
              </button>
            </div>
            <div className="relative">
              <MapPin size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={formData.location_text}
                onChange={e => setFormData({ ...formData, location_text: e.target.value })}
                placeholder={formData.location_type === 'online' ? "Link Google Meet / Zoom..." : "Phòng học, Thư viện..."}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all shadow-sm hover:shadow-md"
              />
            </div>
          </div>

          {/* Nội dung chi tiết */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nội dung chi tiết</label>
            <div className="relative">
              <AlignLeft size={18} className="absolute left-3.5 top-3 text-slate-400" />
              <textarea
                value={formData.agenda}
                onChange={e => setFormData({ ...formData, agenda: e.target.value })}
                placeholder="Nội dung thảo luận..."
                rows={3}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all resize-none shadow-sm hover:shadow-md"
              />
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <ProButton
            variant="ghost"
            onClick={onClose}
            type="button"
            className="px-6 bg-white border border-slate-200"
          >
            Hủy
          </ProButton>
          <ProButton
            variant="primary"
            onClick={handleSubmit}
            disabled={!formData.title || !formData.start_time || !formData.end_time || createMutation.isLoading}
            isLoading={createMutation.isLoading}
            className="px-8 shadow-lg shadow-indigo-200"
          >
            Tạo buổi học
          </ProButton>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateSessionModal;
