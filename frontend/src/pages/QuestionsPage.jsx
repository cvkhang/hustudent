import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import ProButton from '@/components/ui/ProButton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, ThumbsUp, ThumbsDown, MessageCircle, Plus,
  Search, Filter, ChevronDown, Clock, TrendingUp,
  X, Loader2, User, Award, Check, ChevronUp,
  Send, AlertCircle, Trash2, MoreHorizontal, Upload, CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import ImageModal from '@/components/ui/ImageModal';

// Custom hook for debounced value
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// --- API ---
const questionsAPI = {
  getQuestions: async (params = {}) => {
    const res = await api.get('/questions', { params });
    return res.data.data || res.data;
  },
  createQuestion: async (data) => {
    const res = await api.post('/questions', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data || res.data;
  },
  deleteQuestion: async (questionId) => {
    const res = await api.delete(`/questions/${questionId}`);
    return res.data;
  }
};

const subjectsAPI = {
  getSubjects: async () => {
    const res = await api.get('/subjects');
    return res.data.data || res.data;
  }
};

// --- Skeleton Components ---
const QuestionSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6 animate-pulse">
    <div className="flex gap-3 mb-4">
      <div className="w-10 h-10 bg-slate-200 rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-slate-200 rounded w-32 mb-2" />
        <div className="h-3 bg-slate-200 rounded w-24" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-6 bg-slate-200 rounded w-3/4" />
      <div className="h-4 bg-slate-200 rounded w-full" />
      <div className="h-4 bg-slate-200 rounded w-5/6" />
    </div>
  </div>
);

// Helper
const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${diffDays} ngày trước`;
};

// --- Components ---
const QuestionCard = ({ question, onDelete, currentUserId }) => {
  const author = question.author || question.user || {};
  const answerCount = question.answerCount || question.answers?.length || 0;
  const isOwner = currentUserId && author.id === currentUserId;
  const [showMenu, setShowMenu] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      <Link to={`/questions/${question.id}`} className="block p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-3 flex-1">
            <img
              src={author.avatar_url || `https://ui-avatars.com/api/?name=${author.full_name}&background=random`}
              alt=""
              className="w-10 h-10 rounded-full border border-slate-100 object-cover"
              loading="lazy"
            />
            <div className="flex-1">
              <p className="font-bold text-slate-800 text-sm">{author.full_name}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{formatTimeAgo(question.created_at)}</span>
                {question.best_answer_id && (
                  <>
                    <span>•</span>
                    <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check size={12} /> Đã giải quyết
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="relative" onClick={(e) => e.preventDefault()}>
            <button onClick={() => setShowMenu(!showMenu)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all">
              <MoreHorizontal size={20} />
            </button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-20 overflow-hidden"
                  >
                    {isOwner ? (
                      <button
                        onClick={(e) => { e.preventDefault(); onDelete(question.id); setShowMenu(false); }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 size={16} /> Xóa câu hỏi
                      </button>
                    ) : (
                      <button className="w-full text-left px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                        <AlertCircle size={16} /> Báo cáo
                      </button>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-800 mb-2">{question.title}</h3>
          <p className="text-slate-600 whitespace-pre-wrap text-sm line-clamp-3">{question.content}</p>
        </div>

        {/* Attachment */}
        {question.attachment_url && (() => {
          const isImage = question.attachment_name?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);

          if (isImage) {
            return (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImageModalOpen(true); }}
                  className="block mb-4 rounded-xl overflow-hidden border border-slate-200 hover:border-primary-400 transition-all hover:shadow-md cursor-zoom-in w-full"
                >
                  <img
                    src={question.attachment_url}
                    alt={question.attachment_name}
                    className="w-full max-h-64 object-cover"
                    loading="lazy"
                  />
                </button>
                <ImageModal
                  isOpen={imageModalOpen}
                  onClose={() => setImageModalOpen(false)}
                  imageUrl={question.attachment_url}
                  imageName={question.attachment_name}
                />
              </>
            );
          }

          return (
            <a
              href={question.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl mb-4 transition-colors text-sm font-medium"
            >
              <Upload size={16} />
              <span>{question.attachment_name || 'File đính kèm'}</span>
            </a>
          );
        })()}

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-xs font-bold"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
            <MessageCircle size={20} />
            {answerCount} câu trả lời
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

const CreateQuestionModal = ({ isOpen, onClose, onCreate }) => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
  });
  const [showSubjectSelect, setShowSubjectSelect] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState('');

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectsAPI.getSubjects,
    enabled: isOpen,
    staleTime: 5 * 60 * 1000 // Cache 5 phút
  });

  const filteredSubjects = useMemo(() =>
    subjects.filter(s => s.name.toLowerCase().includes(subjectSearch.toLowerCase())),
    [subjects, subjectSearch]
  );

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    const tagsArray = formData.tags
      ? formData.tags.split(',').map(t => t.trim()).filter(t => t)
      : [];

    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    data.append('tags', JSON.stringify(tagsArray));
    data.append('visibility', 'public');
    if (file) {
      data.append('file', file);
    }

    onCreate(data);

    // Reset form
    setFormData({ title: '', content: '', tags: '' });
    setFile(null);
  }, [formData, onCreate]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
          onClick={e => e.stopPropagation()}
        >

          {/* Header */}
          <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-800">Đặt câu hỏi mới</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[65vh]">
            {/* File Upload */}
            <motion.label
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`block border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${file ? 'border-green-400 bg-green-50' : 'border-slate-300 hover:border-primary-400 hover:bg-primary-50'}`}
            >
              <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setFile(e.target.files[0])} />
              {file ? (
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 size={24} />
                  </div>
                  <p className="font-bold text-slate-800 text-sm">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <button type="button" onClick={(e) => { e.preventDefault(); setFile(null); }} className="text-xs text-red-600 hover:underline mt-2">Xóa file</button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Upload size={24} />
                  </div>
                  <p className="font-bold text-slate-700 text-sm">Nhấn để đính kèm file (tùy chọn)</p>
                  <p className="text-xs text-slate-400">PDF, Images, Documents...</p>
                </div>
              )}
            </motion.label>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Tiêu đề câu hỏi <span className="text-red-500">*</span></label>
              <input
                required
                placeholder="VD: Làm thế nào để học Giải tích 1 hiệu quả?"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-bold text-slate-700 placeholder:font-normal transition-all"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Nội dung chi tiết <span className="text-red-500">*</span></label>
              <textarea
                required
                placeholder="Mô tả chi tiết câu hỏi của bạn..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium text-slate-700 transition-all resize-none h-32"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Tags (phân cách bằng dấu phẩy)</label>
              <input
                placeholder="VD: giải tích, toán, học tập"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium text-slate-700 placeholder:font-normal transition-all"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <ProButton type="button" variant="ghost" onClick={onClose}>Hủy bỏ</ProButton>
              <ProButton
                type="submit"
                variant="primary"
                disabled={!formData.title || !formData.content}
              >
                Đăng câu hỏi
              </ProButton>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default function QuestionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [showTagDropdown, setShowTagDropdown] = useState(false);

  // Debounce search để không query liên tục
  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['questions', viewMode, debouncedSearch, tagFilter],
    queryFn: () => {
      return questionsAPI.getQuestions({
        q: debouncedSearch || undefined,
        tag: tagFilter || undefined,
        author_id: viewMode === 'mine' ? user?.id : undefined,
        solved: viewMode === 'solved' ? true : undefined,
        sort: 'new'
      });
    },
    enabled: !!user,
    staleTime: 30000 // Cache 30s
  });

  const createQuestionMutation = useMutation({
    mutationFn: questionsAPI.createQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries(['questions']);
      toast.success('Đã đăng câu hỏi thành công!');
      setShowCreateModal(false);
    },
    onError: (error) => {
      console.error('❌ Create question error:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi đăng câu hỏi.');
    }
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: questionsAPI.deleteQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries(['questions']);
      toast.success('Đã xóa câu hỏi');
    },
    onError: () => toast.error('Lỗi khi xóa câu hỏi')
  });

  // Extract unique tags from questions
  const allTags = useMemo(() => {
    const tags = new Set();
    questions.forEach(q => {
      if (q.tags && Array.isArray(q.tags)) {
        q.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [questions]);

  // Filter tags by search query
  const filteredTags = useMemo(() => {
    if (!tagSearchQuery) return allTags;
    return allTags.filter(tag => tag.toLowerCase().includes(tagSearchQuery.toLowerCase()));
  }, [allTags, tagSearchQuery]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <HelpCircle className="text-blue-500" size={20} />
            Hỏi đáp
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Cộng đồng giúp đỡ nhau giải quyết thắc mắc học tập
          </p>
        </div>
        <ProButton variant="primary" onClick={() => setShowCreateModal(true)} className="hover:scale-105 active:scale-95 transition-transform">
          <Plus size={18} />
          <span>Đặt câu hỏi</span>
        </ProButton>
      </motion.div>

      {/* Tabs & Filter Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col gap-4"
      >

        {/* View Tabs */}
        <div className="flex gap-3">
          {[
            { id: 'all', label: 'Tất cả', icon: <HelpCircle size={18} /> },
            { id: 'solved', label: 'Đã giải quyết', icon: <Check size={18} /> },
            { id: 'mine', label: 'Của tôi', icon: <User size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id)}
              className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${viewMode === tab.id ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowTagDropdown(!showTagDropdown)}
              className="w-full md:w-64 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none hover:border-primary-500 transition-all shadow-sm flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <span>{tagFilter ? `#${tagFilter}` : 'Tất cả tags'}</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${showTagDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showTagDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowTagDropdown(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full mt-2 w-full md:w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-96 overflow-hidden"
                  >
                    <div className="p-3 border-b border-slate-100 sticky top-0 bg-white">
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                          autoFocus
                          type="text"
                          placeholder="Tìm tag..."
                          className="w-full px-3 py-2 pl-9 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary-500 transition-colors"
                          value={tagSearchQuery}
                          onChange={(e) => setTagSearchQuery(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    <div className="p-1 overflow-y-auto max-h-64">
                      <button
                        onClick={() => { setTagFilter(''); setTagSearchQuery(''); setShowTagDropdown(false); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${!tagFilter ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        Tất cả tags
                      </button>
                      {filteredTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => { setTagFilter(tag); setTagSearchQuery(''); setShowTagDropdown(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${tagFilter === tag ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'}`}
                        >
                          #{tag}
                        </button>
                      ))}
                      {filteredTags.length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-4">Không tìm thấy tag nào</p>
                      )}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Questions List */}
      <div>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <QuestionSkeleton key={i} />)}
          </div>
        ) : questions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 text-center py-16"
          >
            <HelpCircle size={64} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-bold text-slate-600 mb-2">Chưa có câu hỏi nào</h3>
            <p className="text-slate-400 mb-6">Hãy là người đầu tiên đặt câu hỏi!</p>
            <ProButton variant="primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} />
              <span>Đặt câu hỏi đầu tiên</span>
            </ProButton>
          </motion.div>
        ) : (
          <AnimatePresence>
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onDelete={deleteQuestionMutation.mutate}
                currentUserId={user?.id}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Create Question Modal */}
      <CreateQuestionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={createQuestionMutation.mutate}
      />
    </div>
  );
}
