import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import api from '@/lib/api';
import ClayCard from '@/components/ui/ClayCard';
import ProButton from '@/components/ui/ProButton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Heart, Bookmark, Share2, MoreHorizontal,
  Upload, Search, File, Filter, ChevronDown, Eye, Download,
  FileType, X, Loader2, CheckCircle2, TrendingUp, MessageCircle,
  Paperclip, Send, HelpCircle, AlertCircle, Trash2, User
} from 'lucide-react';
import { toast } from 'sonner';

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
const postsAPI = {
  getPosts: async (params = {}) => {
    const res = await api.get('/posts', { params });
    return res.data.data || res.data;
  },
  getBookmarks: async (params = {}) => {
    const res = await api.get('/posts/bookmarks', { params });
    const posts = res.data.data || res.data;
    // Posts already include likeCount, commentCount from backend
    return Array.isArray(posts) ? posts.map(p => ({ ...p, isBookmarked: true })) : [];
  },
  createPost: async (data) => {
    const res = await api.post('/posts', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data || res.data;
  },
  deletePost: async (postId) => {
    const res = await api.delete(`/posts/${postId}`);
    return res.data;
  },
  likePost: async (postId) => {
    const res = await api.post(`/posts/${postId}/like`);
    return res.data;
  },
  unlikePost: async (postId) => {
    const res = await api.delete(`/posts/${postId}/like`);
    return res.data;
  },
  bookmarkPost: async (postId) => {
    const res = await api.post(`/posts/${postId}/bookmark`);
    return res.data;
  },
  unbookmarkPost: async (postId) => {
    const res = await api.delete(`/posts/${postId}/bookmark`);
    return res.data;
  },
  getComments: async (postId) => {
    const res = await api.get(`/posts/${postId}/comments`);
    return res.data.data || res.data;
  },
  addComment: async ({ postId, data }) => {
    const res = await api.post(`/posts/${postId}/comments`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data.data || res.data;
  }
};

const subjectsAPI = {
  getSubjects: async () => {
    const res = await api.get('/subjects');
    return res.data.data || res.data;
  }
};

// --- Skeleton Components ---
const PostSkeleton = React.memo(() => (
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
    <div className="h-20 bg-slate-200 rounded-xl" />
  </div>
));

// --- Components ---
const CommentSection = React.memo(({ postId, show }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => postsAPI.getComments(postId),
    enabled: show,
    staleTime: 30000 // Cache 30s
  });

  const addCommentMutation = useMutation({
    mutationFn: postsAPI.addComment,
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', postId]);
      queryClient.invalidateQueries(['posts']);
      setContent('');
      setFile(null);
      toast.success('Đã gửi bình luận');
    },
    onError: () => toast.error('Lỗi khi gửi bình luận')
  });

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (!content.trim() && !file) return;

    const formData = new FormData();
    formData.append('content', content);
    if (file) formData.append('file', file);

    addCommentMutation.mutate({ postId, data: formData });
  }, [content, file, postId, addCommentMutation]);

  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-4 pt-4 border-t border-slate-100"
    >
      <div className="space-y-4 mb-4">
        {isLoading ? (
          <div className="flex justify-center p-2"><Loader2 className="animate-spin text-slate-400" size={16} /></div>
        ) : comments.length === 0 ? (
          <p className="text-center text-sm text-slate-400 py-2">Chưa có bình luận nào.</p>
        ) : (
          <AnimatePresence>
            {comments.map(comment => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-3"
              >
                <img
                  src={comment.author?.avatar_url || `https://ui-avatars.com/api/?name=${comment.author?.full_name}&background=random`}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover"
                  loading="lazy"
                />
                <div className="flex-1">
                  <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none">
                    <p className="text-xs font-bold text-slate-700">{comment.author?.full_name}</p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">{comment.content}</p>
                    {comment.attachment_url && (
                      <a href={comment.attachment_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 mt-2 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-600 hover:underline transition-colors">
                        <File size={14} />
                        {comment.attachment_name || 'Tài liệu đính kèm'}
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 ml-1">
                    <span className="text-[10px] font-bold text-slate-400">{new Date(comment.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2 relative">
        <div className="flex-1 bg-slate-100 rounded-xl p-2 flex flex-col">
          {file && (
            <div className="flex items-center justify-between bg-white p-2 mb-2 rounded-lg border border-slate-200 text-xs">
              <div className="flex items-center gap-2 truncate">
                <File size={14} className="text-blue-500" />
                <span className="truncate max-w-[150px]">{file.name}</span>
              </div>
              <button type="button" onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500 transition-colors"><X size={14} /></button>
            </div>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết bình luận..."
            className="w-full bg-transparent border-none focus:ring-0 text-sm p-0 resize-none max-h-20"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
        </div>
        <div className="flex gap-1 pb-1">
          <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setFile(e.target.files[0])} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded-full transition-all ${file ? 'bg-blue-100 text-blue-600' : 'hover:bg-slate-100 text-slate-400'}`}
          >
            <Paperclip size={20} />
          </button>
          <button
            type="submit"
            disabled={(!content.trim() && !file) || addCommentMutation.isPending}
            className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
          >
            {addCommentMutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      </form>
    </motion.div>
  );
});

const DocumentCard = React.memo(({ post, onLike, onBookmark, onDelete, currentUserId }) => {
  const queryClient = useQueryClient();
  const author = post.author || post.user || {};
  const [isLiked, setIsLiked] = useState(post.is_liked || post.isLiked);
  const [isBookmarked, setIsBookmarked] = useState(post.is_bookmarked || post.isBookmarked);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const isRequest = post.type === 'request';
  const isOwner = currentUserId && author.id === currentUserId;
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleLike = useCallback(() => {
    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike(post.id, isLiked);
  }, [post.id, isLiked, onLike]);

  const handleBookmark = useCallback(() => {
    // Optimistic update
    setIsBookmarked(!isBookmarked);
    onBookmark(post.id, isBookmarked);
  }, [post.id, isBookmarked, onBookmark]);

  const getFileIcon = () => {
    if (post.attachment_name?.endsWith('.pdf')) return <FileText className="text-red-500" size={32} />;
    if (post.attachment_name?.endsWith('.doc') || post.attachment_name?.endsWith('.docx')) return <FileText className="text-blue-500" size={32} />;
    if (post.image_url) return <FileText className="text-purple-500" size={32} />;
    return <File className="text-slate-400" size={32} />;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 mb-6 overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-3">
            <img
              src={author.avatar_url || `https://ui-avatars.com/api/?name=${author.full_name}&background=random`}
              alt=""
              className="w-10 h-10 rounded-full border border-slate-100 object-cover"
              loading="lazy"
            />
            <div>
              <p className="font-bold text-slate-800 text-sm">{author.full_name}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                {post.subject_tag && (
                  <>
                    <span>•</span>
                    <span className="font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{post.subject_tag}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="flex items-center gap-2">
              {isRequest && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center gap-1"
                >
                  <HelpCircle size={12} /> Xin tài liệu
                </motion.span>
              )}
              <button onClick={() => setShowMenu(!showMenu)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-all">
                <MoreHorizontal size={20} />
              </button>
            </div>

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
                        onClick={() => { onDelete(post.id); setShowMenu(false); }}
                        className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <Trash2 size={16} /> Xóa bài viết
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
          <h3 className="text-xl font-bold text-slate-800 mb-2">{post.title || (post.content?.substring(0, 50) || 'Bài viết')}</h3>
          {post.content && <p className="text-slate-600 whitespace-pre-wrap text-sm mb-4">{post.content}</p>}

          {!isRequest && (post.attachment_url || post.image_url) && (
            <a
              href={post.attachment_url || post.image_url}
              target="_blank"
              rel="noreferrer"
              className="block group cursor-pointer"
            >
              <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-all duration-300">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {post.image_url ? <img src={post.image_url} alt="" className="w-full h-full object-cover rounded-lg" loading="lazy" /> : getFileIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-700 truncate group-hover:text-blue-700 transition-colors">{post.attachment_name || 'Tài liệu đính kèm'}</p>
                  <p className="text-xs text-slate-400">Nhấn để xem chi tiết</p>
                </div>
                <div className="bg-white p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-blue-600">
                  <Download size={20} />
                </div>
              </div>
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 text-sm font-bold transition-all hover:scale-105 active:scale-95 ${isLiked ? 'text-red-500' : 'text-slate-500 hover:text-slate-800'}`}
            >
              <Heart size={20} className={isLiked ? 'fill-current' : ''} />
              {likeCount}
            </button>
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-all hover:scale-105 active:scale-95"
            >
              <MessageCircle size={20} />
              {post.commentCount || 0}
            </button>
          </div>
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-full hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 ${isBookmarked ? 'text-yellow-500' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Bookmark size={20} className={isBookmarked ? 'fill-current' : ''} />
          </button>
        </div>

        <CommentSection postId={post.id} show={showComments} />
      </div>
    </motion.div>
  );
});

const UploadModal = React.memo(({ isOpen, onClose, onCreate }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('share');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subjectTag: '',
  });
  const [file, setFile] = useState(null);
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
    if (!formData.title || !formData.subjectTag) return;
    if (activeTab === 'share' && !file) return;

    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content || (activeTab === 'share' ? 'Chia sẻ tài liệu' : 'Mình đang cần tìm tài liệu này'));
    data.append('subject_tag', formData.subjectTag);
    data.append('type', activeTab);

    if (file) {
      data.append('file', file);
      console.log('📎 Uploading file:', file.name, file.type, `${(file.size / 1024).toFixed(2)} KB`);
    }

    console.log('📤 Submitting post:', {
      title: formData.title,
      subject_tag: formData.subjectTag,
      type: activeTab,
      has_file: !!file
    });

    onCreate(data);

    // Reset form
    setFormData({ title: '', content: '', subjectTag: '' });
    setFile(null);
    setActiveTab('share');
  }, [formData, file, activeTab, onCreate]);

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

          {/* Header with Tabs */}
          <div className="bg-slate-50 border-b border-slate-100">
            <div className="p-4 flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-800">Tạo bài viết mới</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} /></button>
            </div>
            <div className="flex px-6 gap-6">
              <button
                onClick={() => setActiveTab('share')}
                className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'share' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <Upload size={16} /> Chia sẻ tài liệu
              </button>
              <button
                onClick={() => setActiveTab('request')}
                className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${activeTab === 'request' ? 'border-orange-500 text-orange-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <HelpCircle size={16} /> Xin tài liệu
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[65vh]">
            {activeTab === 'share' && (
              <motion.label
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`block border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${file ? 'border-green-400 bg-green-50' : 'border-slate-300 hover:border-primary-400 hover:bg-primary-50'}`}
              >
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                {file ? (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 size={24} />
                    </div>
                    <p className="font-bold text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    <p className="text-xs text-green-600 font-bold mt-2">Đã chọn file thành công</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Upload size={24} />
                    </div>
                    <p className="font-bold text-slate-700">Nhấn để chọn tài liệu</p>
                    <p className="text-xs text-slate-400">PDF, Word, Excel, PowerPoint...</p>
                  </div>
                )}
              </motion.label>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Tiêu đề <span className="text-red-500">*</span></label>
                <input
                  required
                  placeholder={activeTab === 'share' ? "VD: Slide Bài giảng Giải tích 1 chương 3" : "VD: Cần xin đề thi cuối kỳ môn Kiến trúc máy tính"}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-bold text-slate-700 placeholder:font-normal transition-all"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Môn học <span className="text-red-500">*</span></label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowSubjectSelect(!showSubjectSelect)}
                      className="w-full px-4 py-3 text-left rounded-xl border border-slate-200 bg-white font-medium text-slate-700 flex items-center justify-between hover:border-primary-500 transition-all focus:ring-2 focus:ring-primary-500/20"
                    >
                      <span className={!formData.subjectTag ? 'text-slate-400 font-normal' : ''}>
                        {formData.subjectTag || 'Chọn môn học...'}
                      </span>
                      <ChevronDown size={16} className={`text-slate-400 transition-transform ${showSubjectSelect ? 'rotate-180' : ''}`} />
                    </button>

                    {showSubjectSelect && (
                      <div>
                        <div className="fixed inset-0 z-10" onClick={() => setShowSubjectSelect(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute top-full mt-2 left-0 w-full bg-white border border-slate-200 rounded-xl shadow-xl z-20 max-h-48 overflow-hidden flex flex-col"
                        >
                          <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
                            <input
                              autoFocus
                              type="text"
                              placeholder="Tìm kiếm môn học..."
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary-500 transition-colors"
                              value={subjectSearch}
                              onChange={(e) => setSubjectSearch(e.target.value)}
                            />
                          </div>
                          <div className="overflow-y-auto p-1">
                            {filteredSubjects.map(s => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, subjectTag: s.name });
                                  setShowSubjectSelect(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${formData.subjectTag === s.name ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'}`}
                              >
                                {s.name}
                              </button>
                            ))}
                            {filteredSubjects.length === 0 && (
                              <p className="text-xs text-slate-400 text-center py-4">Không tìm thấy môn học nào</p>
                            )}
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Mô tả thêm</label>
                <textarea
                  placeholder="Mô tả chi tiết về tài liệu hoặc yêu cầu của bạn..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-medium text-slate-700 transition-all resize-none h-24"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <ProButton type="button" variant="ghost" onClick={onClose}>Hủy bỏ</ProButton>
              <ProButton
                type="submit"
                variant={activeTab === 'share' ? 'primary' : 'accent'}
                disabled={(!file && activeTab === 'share') || !formData.title || !formData.subjectTag}
              >
                {activeTab === 'share' ? 'Chia sẻ ngay' : 'Đăng yêu cầu'}
              </ProButton>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
});

export default function PostsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [viewMode, setViewMode] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('');

  // Debounce search để không query liên tục
  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data: subjects = [] } = useQuery({
    queryKey: ['subjects'],
    queryFn: subjectsAPI.getSubjects,
    staleTime: 10 * 60 * 1000 // Cache 10 phút
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts', viewMode, debouncedSearch, subjectFilter],
    queryFn: () => {
      if (viewMode === 'saved') {
        return postsAPI.getBookmarks({ page: 1, limit: 50 });
      }
      return postsAPI.getPosts({
        q: debouncedSearch || undefined,
        subject: subjectFilter || undefined,
        author_id: viewMode === 'mine' ? user?.id : undefined,
        sort: 'recent'
      });
    },
    enabled: !!user,
    staleTime: 30000 // Cache 30s
  });

  const createPostMutation = useMutation({
    mutationFn: postsAPI.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      toast.success('Đã đăng bài thành công!');
      setShowUpload(false);
    },
    onError: (error) => {
      console.error('❌ Create post error:', error);
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Lỗi khi đăng bài.');
    }
  });

  const deletePostMutation = useMutation({
    mutationFn: postsAPI.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries(['posts']);
      toast.success('Đã xóa bài viết');
    },
    onError: () => toast.error('Lỗi khi xóa bài viết')
  });

  const handleLike = useCallback((postId, isLiked) => {
    const mutation = isLiked ? postsAPI.unlikePost : postsAPI.likePost;
    mutation(postId).then(() => {
      // Only invalidate specific view instead of all posts
      queryClient.invalidateQueries(['posts', viewMode, debouncedSearch, subjectFilter]);
    });
  }, [queryClient, viewMode, debouncedSearch, subjectFilter]);

  const handleBookmark = useCallback((postId, isBookmarked) => {
    const mutation = isBookmarked ? postsAPI.unbookmarkPost : postsAPI.bookmarkPost;
    mutation(postId).then(() => {
      // Invalidate both current view and bookmarks view
      queryClient.invalidateQueries(['posts', viewMode, debouncedSearch, subjectFilter]);
      queryClient.invalidateQueries(['posts', 'saved']);
    });
  }, [queryClient, viewMode, debouncedSearch, subjectFilter]);

  const selectedSubject = useMemo(() =>
    subjects.find(s => s.name === subjectFilter),
    [subjects, subjectFilter]
  );

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
            <FileText className="text-purple-500" size={20} />
            Thư viện tài liệu
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Tìm kiếm, chia sẻ và yêu cầu tài liệu học tập
          </p>
        </div>
        <ProButton variant="primary" onClick={() => setShowUpload(true)} className="hover:scale-105 active:scale-95 transition-transform">
          <Upload size={18} />
          <span>Đăng tài liệu / Yêu cầu</span>
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
            { id: 'all', label: 'Tất cả', icon: <FileText size={18} /> },
            { id: 'mine', label: 'Của tôi', icon: <User size={18} /> },
            { id: 'saved', label: 'Đã lưu', icon: <Bookmark size={18} /> }
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
              placeholder="Tìm kiếm tài liệu, bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all shadow-sm"
            />
          </div>

          <div className="relative">
            <button
              onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
              className="w-full md:w-64 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none hover:border-primary-500 transition-all shadow-sm flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <Filter size={16} />
                <span>{selectedSubject ? selectedSubject.name : 'Tất cả môn học'}</span>
              </div>
              <ChevronDown size={16} className={`transition-transform ${showSubjectDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showSubjectDropdown && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSubjectDropdown(false)} />
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
                          type="text"
                          placeholder="Tìm môn học..."
                          value={subjectSearchQuery}
                          onChange={(e) => setSubjectSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 transition-all"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="p-2 max-h-80 overflow-auto">
                      <button
                        onClick={() => {
                          setSubjectFilter('');
                          setShowSubjectDropdown(false);
                        }}
                        className={`w-full px-3 py-2 rounded-lg text-left text-sm font-medium transition-all ${!subjectFilter ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'}`}
                      >
                        Tất cả môn học
                      </button>
                      <div className="h-px bg-slate-100 my-2" />
                      {subjects
                        .filter(subject => subject.name.toLowerCase().includes(subjectSearchQuery.toLowerCase()))
                        .map(subject => (
                          <button
                            key={subject.id}
                            onClick={() => {
                              setSubjectFilter(subject.name);
                              setShowSubjectDropdown(false);
                            }}
                            className={`w-full px-3 py-2 rounded-lg text-left text-sm font-medium transition-all ${subjectFilter === subject.name ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'}`}
                          >
                            {subject.name}
                          </button>
                        ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => <PostSkeleton key={i} />)}
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <ClayCard className="text-center py-20 border-2 border-dashed border-slate-200 bg-transparent">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                  <FileText size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-700 mb-2">Chưa có bài viết nào</h3>
                <p className="text-slate-400 mb-6">
                  {viewMode === 'mine' ? 'Bạn chưa đăng bài viết nào.' : viewMode === 'saved' ? 'Bạn chưa lưu tài liệu nào.' : 'Hãy là người đầu tiên chia sẻ tài liệu!'}
                </p>
                {viewMode === 'all' && (
                  <ProButton variant="primary" onClick={() => setShowUpload(true)} className="mx-auto hover:scale-105 active:scale-95 transition-transform">
                    <Upload size={18} />
                    <span>Đăng ngay</span>
                  </ProButton>
                )}
              </ClayCard>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {posts.map(post => (
                <DocumentCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onBookmark={handleBookmark}
                  onDelete={(id) => deletePostMutation.mutate(id)}
                  currentUserId={user?.id}
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <ClayCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={18} className="text-primary-600" />
              <h3 className="font-black text-slate-800">Bài viết gần đây</h3>
            </div>
            <div className="space-y-3">
              {posts.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Chưa có bài viết nào</p>
              ) : (
                posts.slice(0, 5).map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group cursor-pointer p-3 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm">
                        {post.type === 'request' ? <HelpCircle size={18} /> : <FileText size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-slate-700 group-hover:text-primary-600 transition-colors truncate">{post.title || 'Bài viết'}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {post.subject_tag && (
                            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full truncate max-w-[120px]">
                              {post.subject_tag}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            {new Date(post.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Heart size={12} className={post.isLiked ? 'fill-red-500 text-red-500' : ''} />
                            {post.likeCount || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle size={12} />
                            {post.commentCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </ClayCard>

          <ClayCard className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white !border-none p-6">
            <h4 className="font-bold text-lg mb-2">Đóng góp & Yêu cầu</h4>
            <p className="text-indigo-100 text-sm mb-4">Chia sẻ tài liệu hoặc đăng yêu cầu tìm kiếm tài liệu từ cộng đồng.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUpload(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors"
            >
              <Upload size={18} />
              Tạo bài viết
            </motion.button>
          </ClayCard>
        </motion.div>
      </div>

      <UploadModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onCreate={(data) => createPostMutation.mutate(data)}
      />
    </div>
  );
}
