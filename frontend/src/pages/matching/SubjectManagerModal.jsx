import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  X,
  Search,
  Plus,
  Trash2,
  BookOpen,
  HelpCircle,
  HandHelping,
  Loader2,
  GraduationCap,
  Check,
  Calendar,
  Pencil,
  Save,
  RotateCcw
} from 'lucide-react';
import ProButton from '@/components/ui/ProButton';

// API
const subjectAPI = {
  searchSubjects: async (query) => {
    const res = await api.get('/subjects', { params: { q: query } });
    return res.data.data || [];
  },
  getMySubjects: async () => {
    const res = await api.get('/me/subjects');
    return res.data.data || [];
  },
  addSubject: async (data) => {
    const res = await api.post('/me/subjects', data);
    return res.data.data;
  },
  updateSubject: async ({ code, ...data }) => {
    const payload = { ...data };
    // Map camelCase to snake_case for backend update
    if (typeof data.needsHelp !== 'undefined') { payload.needs_help = data.needsHelp; delete payload.needsHelp; }
    if (typeof data.canHelp !== 'undefined') { payload.can_help = data.canHelp; delete payload.canHelp; }

    const res = await api.patch(`/me/subjects/${code}`, payload);
    return res.data.data;
  },
  removeSubject: async (code) => {
    const res = await api.delete(`/me/subjects/${code}`);
    return res.data;
  }
};

const LEVELS = [
  { value: 'beginner', label: 'Cơ bản', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'intermediate', label: 'Khá', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'advanced', label: 'Giỏi', color: 'bg-purple-100 text-purple-700 border-purple-200' }
];

const getCurrentSemester = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (month >= 8 || month <= 1) return `${year}1`;
  if (month >= 2 && month <= 6) return `${year}2`;
  return `${year}3`;
};

// Configuration Form
const ConfigForm = ({ initialData = {}, onSubmit, onCancel, submitLabel = "Xác nhận", isEditMode = false }) => {
  const [level, setLevel] = useState(initialData.level || 'beginner');
  const [needsHelp, setNeedsHelp] = useState(initialData.needs_help || false);
  const [canHelp, setCanHelp] = useState(initialData.can_help || false);
  const [semester, setSemester] = useState(initialData.semester || getCurrentSemester());

  const handleSubmit = () => {
    onSubmit({
      level,
      needsHelp,
      canHelp,
      semester
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-4 animate-in fade-in zoom-in-95 duration-200 shadow-sm">
      <div className="grid grid-cols-2 gap-4">
        {/* Level */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Trình độ</label>
          <div className="flex flex-col gap-1">
            {LEVELS.map(l => (
              <button
                key={l.value}
                onClick={() => setLevel(l.value)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all text-left ${level === l.value
                  ? l.color + ' ring-1 ring-inset ring-current'
                  : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
                  }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">Tùy chọn</label>
          <div className="space-y-2">
            <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${needsHelp ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200'}`}>
              <input type="checkbox" checked={needsHelp} onChange={(e) => setNeedsHelp(e.target.checked)} className="rounded text-orange-500 focus:ring-orange-500 border-slate-300" />
              <span className={`text-xs font-bold ${needsHelp ? 'text-orange-700' : 'text-slate-500'}`}>Cần giúp đỡ</span>
            </label>

            <label className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${canHelp ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200'}`}>
              <input type="checkbox" checked={canHelp} onChange={(e) => setCanHelp(e.target.checked)} className="rounded text-blue-500 focus:ring-blue-500 border-slate-300" />
              <span className={`text-xs font-bold ${canHelp ? 'text-blue-700' : 'text-slate-500'}`}>Có thể giúp</span>
            </label>
          </div>

          <div className="mt-3">
            <label className="text-[10px] font-bold text-slate-400 block mb-1">Kỳ học</label>
            <div className="relative">
              <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full pl-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <ProButton variant="ghost" onClick={onCancel} className="flex-1 bg-white border border-slate-200">
            Hủy
          </ProButton>
        )}
        <ProButton
          variant="primary"
          icon={isEditMode ? Save : Plus}
          onClick={handleSubmit}
          className="flex-1 justify-center shadow-lg shadow-indigo-200"
        >
          {submitLabel}
        </ProButton>
      </div>
    </div>
  );
};

// Item Component with Edit Mode
const SubjectItem = ({ userSubject, onRemove, onUpdate, isRemoving }) => {
  const { subject, level, needs_help, can_help, semester } = userSubject;
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = (data) => {
    onUpdate({ code: subject.code, ...data });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2 px-1">
          <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
            {subject?.code?.slice(0, 2)}
          </div>
          <span className="font-bold text-slate-800 text-sm">{subject?.name}</span>
          <span className="text-xs text-slate-400">({subject?.code})</span>
        </div>
        <ConfigForm
          initialData={userSubject}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          submitLabel="Lưu thay đổi"
          isEditMode={true}
        />
      </div>
    );
  }

  return (
    <div
      className="group flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all"
    >
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-indigo-200 shadow-lg">
        {subject?.code?.slice(0, 3) || 'SUB'}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-slate-800 text-sm truncate">{subject?.name || 'Unknown'}</h4>
        <p className="text-xs font-mono text-slate-400 mb-2">{subject?.code} • {semester}</p>

        <div className="flex flex-wrap gap-2">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${LEVELS.find(l => l.value === level)?.color || 'bg-slate-100 text-slate-600'}`}>
            {LEVELS.find(l => l.value === level)?.label || level}
          </span>

          {needs_help && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-100 flex items-center gap-1">
              <HelpCircle size={10} /> Cần giúp
            </span>
          )}

          {can_help && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
              <HandHelping size={10} /> Support
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditing(true)}
          disabled={isRemoving}
          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
          title="Chỉnh sửa"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={() => onRemove(subject?.code)}
          disabled={isRemoving}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          title="Xóa"
        >
          {isRemoving ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
        </button>
      </div>
    </div>
  );
};

// Form Component for Adding New Subject
const AddSubjectForm = ({ onAdd, existingCodes }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const { data: searchResults = [], isLoading: searching } = useQuery({
    queryKey: ['subject-search', searchQuery],
    queryFn: () => subjectAPI.searchSubjects(searchQuery),
    enabled: isFocused && (searchQuery.length > 0 || true),
    staleTime: 1000 * 60
  });

  const filteredResults = searchResults.filter(s => !existingCodes.includes(s.code));

  const handleAddSubmit = (configData) => {
    if (!selectedSubject) return;
    onAdd({
      subjectCode: selectedSubject.code,
      ...configData
    });
    // Reset
    setSelectedSubject(null);
    setSearchQuery('');
    setIsFocused(false);
  };

  return (
    <div className="space-y-4 mb-6" ref={dropdownRef}>
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Plus size={18} />
        </div>
        <h3 className="font-bold text-slate-700">Thêm môn học mới</h3>
      </div>

      {/* Search Input */}
      {/* Hand-rolled animation using class names logic to replace AnimatePresence */}
      {!selectedSubject ? (
        <div className="relative z-20 animate-in fade-in slide-in-from-left-2 duration-300">
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
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium transition-all shadow-sm hover:shadow-md"
          />

          {/* Dropdown */}
          {isFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-100 max-h-60 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100 no-scrollbar">
              {searching ? (
                <div className="p-4 text-center text-slate-400"><Loader2 size={20} className="animate-spin mx-auto" /></div>
              ) : filteredResults.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-sm italic">Không tìm thấy môn phù hợp</div>
              ) : (
                filteredResults.map(subject => (
                  <button
                    key={subject.code}
                    onClick={() => {
                      setSelectedSubject(subject);
                      setIsFocused(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors group flex items-start gap-3"
                  >
                    <BookOpen size={16} className="mt-1 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    <div>
                      <div className="font-bold text-slate-700 text-sm group-hover:text-indigo-700">{subject.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{subject.code} • {subject.credits} tín chỉ</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-right-2 duration-300">
          <div className="bg-white rounded-xl border border-indigo-200 p-3 mb-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-green-500" />
              <span className="font-bold text-slate-800 text-sm">{selectedSubject.name}</span>
            </div>
            <button
              onClick={() => setSelectedSubject(null)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Chọn lại"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          <ConfigForm onSubmit={handleAddSubmit} submitLabel="Xác nhận thêm" />
        </div>
      )}
    </div>
  );
};

import { createPortal } from 'react-dom';

export default function SubjectManagerModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [removingCode, setRemovingCode] = useState(null);

  const { data: mySubjects = [], isLoading } = useQuery({
    queryKey: ['my-subjects'],
    queryFn: subjectAPI.getMySubjects,
    enabled: isOpen
  });

  const addMutation = useMutation({
    mutationFn: subjectAPI.addSubject,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-subjects']);
      queryClient.invalidateQueries(['matching-suggestions']);
    }
  });

  const updateMutation = useMutation({
    mutationFn: subjectAPI.updateSubject,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-subjects']);
      queryClient.invalidateQueries(['matching-suggestions']);
    }
  });

  const removeMutation = useMutation({
    mutationFn: subjectAPI.removeSubject,
    onSuccess: () => {
      queryClient.invalidateQueries(['my-subjects']);
      queryClient.invalidateQueries(['matching-suggestions']);
      setRemovingCode(null);
    }
  });

  if (!isOpen) return null;
  const existingCodes = mySubjects.map(s => s.subject_code);

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.4)_100%)] backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-xl max-h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <GraduationCap className="text-indigo-600" />
              Môn học của tôi
            </h2>
            <p className="text-sm text-slate-500 font-medium">Quản lý hồ sơ học tập để tìm bạn phù hợp</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white no-scrollbar">
          <AddSubjectForm onAdd={addMutation.mutate} existingCodes={existingCodes} />

          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider flex items-center gap-2 px-1">
              Danh sách đã thêm ({mySubjects.length})
            </h3>

            {isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
            ) : mySubjects.length === 0 ? (
              <div className="text-center py-12 px-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <BookOpen size={48} className="mx-auto mb-3 text-slate-300" />
                <p className="font-bold text-slate-600">Chưa có môn học nào</p>
                <p className="text-sm text-slate-400 mt-1">Hồ sơ trống sẽ khó tìm được bạn học phù hợp.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {mySubjects.map(us => (
                  <SubjectItem
                    key={us.subject_code}
                    userSubject={us}
                    onRemove={(code) => {
                      setRemovingCode(code);
                      removeMutation.mutate(code);
                    }}
                    onUpdate={updateMutation.mutate}
                    isRemoving={removingCode === us.subject_code}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <ProButton variant="primary" onClick={onClose} className="px-8 shadow-lg shadow-indigo-200">
            Hoàn tất
          </ProButton>
        </div>
      </div>
    </div>,
    document.body
  );
}
