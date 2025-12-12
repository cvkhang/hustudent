import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Target, X, Clock, FileText, Globe, Lock } from 'lucide-react';
import ProButton from '@/components/ui/ProButton';

const QuizModal = ({ isOpen, onClose, onSubmit, initialData = null, isPending, title = "Tạo Quiz mới" }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: 30, // Default 30 minutes
    visibility: 'private'
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          description: initialData.description || '',
          timeLimit: initialData.time_limit ? Math.round(initialData.time_limit / 60) : 30,
          visibility: initialData.visibility || 'private'
        });
      } else {
        setFormData({ title: '', description: '', timeLimit: 30, visibility: 'private' });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      timeLimit: parseInt(formData.timeLimit) * 60
    };
    onSubmit(submissionData);
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.4)_100%)] backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500">
                <Target size={20} className="stroke-[2.5]" />
              </span>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Tên quiz <span className="text-red-500">*</span></label>
            <input
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-700 transition-colors shadow-sm"
              placeholder="VD: Kiểm tra giữa kỳ môn Web"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Mô tả</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium text-slate-700 transition-colors resize-none h-24 shadow-sm"
              placeholder="Mô tả ngắn về quiz này..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1">
              Thời gian (phút)
            </label>
            <input
              type="number"
              min="1"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-700 transition-colors shadow-sm"
              value={formData.timeLimit}
              onChange={e => setFormData({ ...formData, timeLimit: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Quyền riêng tư</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {['public', 'private'].map(mode => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFormData({ ...formData, visibility: mode })}
                  className={`flex-1 py-2 rounded-lg font-bold text-sm capitalize transition-all flex items-center justify-center gap-2 ${formData.visibility === mode
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-600'
                    }`}
                >
                  {mode === 'public' ? <Globe size={14} /> : <Lock size={14} />}
                  {mode === 'public' ? 'Công khai' : 'Riêng tư'}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:items-center">
            {initialData?.id && (
              <ProButton
                type="button"
                variant="ghost"
                icon={FileText}
                className="justify-center sm:mr-auto bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 font-bold border-indigo-100/50 whitespace-nowrap !px-5"
                onClick={() => {
                  onClose();
                  navigate(`/quizzes/${initialData.id}/edit`);
                }}
              >
                Soạn câu hỏi
              </ProButton>
            )}
            <div className="flex gap-3 w-full sm:w-auto">
              <ProButton type="button" variant="ghost" onClick={onClose} className="flex-1 sm:flex-none bg-slate-100 hover:bg-slate-200 text-slate-500 whitespace-nowrap !px-5">Huỷ</ProButton>
              <ProButton
                type="submit"
                variant="primary"
                disabled={isPending}
                isLoading={isPending}
                className="flex-1 sm:flex-none shadow-lg shadow-indigo-200 bg-indigo-500 hover:bg-indigo-600 border-indigo-500 min-w-[120px] whitespace-nowrap !px-6"
              >
                {initialData ? 'Lưu thay đổi' : 'Tạo mới'}
              </ProButton>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
export default QuizModal;
