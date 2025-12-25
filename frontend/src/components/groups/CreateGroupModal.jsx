import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { X, Book, Users, Search, Loader2, Check, RotateCcw } from 'lucide-react';
import { createPortal } from 'react-dom';
import ProButton from '../ui/ProButton';
import groupService from '@/features/core/api/groupService';
import { useToast } from '@/context/ToastContext';
import api from '@/lib/api';

// API for searching subjects
const subjectAPI = {
  searchSubjects: async (query) => {
    const res = await api.get('/subjects', { params: { q: query } });
    return res.data.data || [];
  }
};

const CreateGroupModal = ({ onClose }) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const dropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject_tag: '',
    visibility: 'public'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  // Search subjects
  const { data: searchResults = [], isLoading: searching } = useQuery({
    queryKey: ['subject-search', searchQuery],
    queryFn: () => subjectAPI.searchSubjects(searchQuery),
    enabled: isFocused && (searchQuery.length > 0 || true),
    staleTime: 1000 * 60
  });

  const createMutation = useMutation({
    mutationFn: groupService.createGroup,
    onSuccess: () => {
      addToast('Tạo nhóm thành công!', 'success');
      queryClient.invalidateQueries(['groups']);
      onClose();
    },
    onError: (error) => {
      addToast(error.response?.data?.message || 'Có lỗi xảy ra', 'error');
    }
  });

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
    setFormData({ ...formData, subject_tag: subject.code });
    setIsFocused(false);
  };

  const handleSubjectClear = () => {
    setSelectedSubject(null);
    setFormData({ ...formData, subject_tag: '' });
    setSearchQuery('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.subject_tag) {
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

      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-visible flex flex-col animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Users className="text-indigo-600" />
              Tạo nhóm học tập mới
            </h2>
            <p className="text-sm text-slate-500 font-medium">Kết nối và học tập cùng bạn bè</p>
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

          {/* Tên nhóm */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Tên nhóm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Cấu trúc dữ liệu & Giải thuật"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all shadow-sm hover:shadow-md"
              autoFocus
              required
            />
          </div>

          {/* Môn học - Search & Select */}
          <div ref={dropdownRef}>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Môn học (Tag) <span className="text-red-500">*</span>
            </label>

            {!selectedSubject ? (
              <div className="relative z-20">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm tên môn hoặc mã môn..."
                  value={searchQuery}
                  onFocus={() => setIsFocused(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsFocused(true);
                  }}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all shadow-sm hover:shadow-md"
                />

                {/* Dropdown */}
                {isFocused && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 max-h-60 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100 no-scrollbar">
                    {searching ? (
                      <div className="p-4 text-center text-slate-400">
                        <Loader2 size={20} className="animate-spin mx-auto" />
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-slate-400 text-sm italic">
                        Không tìm thấy môn phù hợp
                      </div>
                    ) : (
                      searchResults.map(subject => (
                        <button
                          key={subject.code}
                          type="button"
                          onClick={() => handleSubjectSelect(subject)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors group flex items-start gap-3"
                        >
                          <Book size={16} className="mt-1 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                          <div>
                            <div className="font-bold text-slate-700 text-sm group-hover:text-indigo-700">
                              {subject.name}
                            </div>
                            <div className="text-xs text-slate-400 font-mono">
                              {subject.code} • {subject.credits} tín chỉ
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-indigo-200 p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-green-500" />
                  <div>
                    <span className="font-bold text-slate-800 text-sm">{selectedSubject.name}</span>
                    <span className="text-xs text-slate-400 ml-2 font-mono">{selectedSubject.code}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSubjectClear}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Chọn lại"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả mục tiêu của nhóm..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all resize-none shadow-sm hover:shadow-md"
            />
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
            disabled={!formData.name || !formData.subject_tag || createMutation.isLoading}
            isLoading={createMutation.isLoading}
            className="px-8 shadow-lg shadow-indigo-200"
          >
            Tạo nhóm
          </ProButton>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CreateGroupModal;
