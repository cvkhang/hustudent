import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import ProButton from '@/components/ui/ProButton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle,
  Check, Clock, Award, Send, Loader2, User,
  MoreHorizontal, Trash2, AlertCircle, ChevronUp, ChevronDown, Upload
} from 'lucide-react';
import { toast } from 'sonner';
import ImageModal from '@/components/ui/ImageModal';

// API
const questionAPI = {
  getQuestion: async (questionId) => {
    const res = await api.get(`/questions/${questionId}`);
    return res.data.data || res.data;
  },
  createAnswer: async ({ questionId, content }) => {
    const res = await api.post(`/questions/${questionId}/answers`, { content });
    return res.data.data || res.data;
  },
  deleteAnswer: async (answerId) => {
    const res = await api.delete(`/answers/${answerId}`);
    return res.data;
  },
  setBestAnswer: async ({ questionId, answerId }) => {
    const res = await api.post(`/questions/${questionId}/best-answer`, { answerId });
    return res.data;
  },
  voteAnswer: async ({ answerId, value }) => {
    const res = await api.post(`/answers/${answerId}/vote`, { value });
    return res.data;
  }
};

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

// Components
const AnswerCard = ({ answer, isQuestionOwner, isBestAnswer, onVote, onSetBest, onDelete, currentUserId }) => {
  const author = answer.author || answer.user || {};
  const isOwner = currentUserId && author.id === currentUserId;
  const [showMenu, setShowMenu] = useState(false);
  const [userVote, setUserVote] = useState(answer.user_vote || 0);
  const [voteScore, setVoteScore] = useState(answer.vote_score || 0);

  const handleVote = useCallback((value) => {
    // Optimistic update
    const previousVote = userVote;
    const newVote = previousVote === value ? 0 : value; // Toggle vote
    const scoreDiff = newVote - previousVote;

    setUserVote(newVote);
    setVoteScore(prev => prev + scoreDiff);
    onVote(answer.id, newVote);
  }, [answer.id, userVote, onVote]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-2xl shadow-sm border mb-4 overflow-hidden hover:shadow-md transition-shadow duration-300 ${isBestAnswer ? 'border-green-400 ring-2 ring-green-100' : 'border-slate-200'}`}
    >
      <div className="p-5">
        {isBestAnswer && (
          <div className="flex items-center gap-2 text-green-600 font-bold text-sm mb-4 pb-3 border-b border-green-100">
            <Award size={18} />
            <span>Câu trả lời được chấp nhận</span>
          </div>
        )}

        <div className="flex gap-4">
          {/* Vote Column */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => handleVote(1)}
              className={`p-2 rounded-full transition-all hover:scale-110 active:scale-95 ${userVote === 1 ? 'bg-green-100 text-green-600' : 'hover:bg-slate-100 text-slate-400'}`}
            >
              <ThumbsUp size={20} className={userVote === 1 ? 'fill-current' : ''} />
            </button>

            <span className={`text-2xl font-black ${voteScore > 0 ? 'text-green-600' : voteScore < 0 ? 'text-red-500' : 'text-slate-400'}`}>
              {voteScore}
            </span>

            <button
              onClick={() => handleVote(-1)}
              className={`p-2 rounded-full transition-all hover:scale-110 active:scale-95 ${userVote === -1 ? 'bg-red-100 text-red-500' : 'hover:bg-slate-100 text-slate-400'}`}
            >
              <ThumbsDown size={20} className={userVote === -1 ? 'fill-current' : ''} />
            </button>

            {isQuestionOwner && !isBestAnswer && (
              <button
                onClick={() => onSetBest(answer.id)}
                className="p-2 mt-2 rounded-full text-green-600 hover:bg-green-50 transition-all hover:scale-110 active:scale-95"
                title="Chọn là câu trả lời tốt nhất"
              >
                <Check size={20} />
              </button>
            )}
          </div>

          {/* Content Column */}
          <div className="flex-1">
            <p className="text-slate-700 whitespace-pre-wrap mb-4 text-sm leading-relaxed">{answer.content}</p>

            {/* Author */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <img
                  src={author.avatar_url || `https://ui-avatars.com/api/?name=${author.full_name}&background=random`}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover border border-slate-100"
                  loading="lazy"
                />
                <div>
                  <span className="font-bold text-slate-800 text-sm">{author.full_name || 'Anonymous'}</span>
                  <p className="text-xs text-slate-400">
                    {formatTimeAgo(answer.created_at)}
                  </p>
                </div>
              </div>

              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                  <MoreHorizontal size={16} />
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
                            onClick={() => { onDelete(answer.id); setShowMenu(false); }}
                            className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 size={16} /> Xóa câu trả lời
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
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default function QuestionDetailPage() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [answerContent, setAnswerContent] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // Query
  const { data: question, isLoading, error } = useQuery({
    queryKey: ['question', questionId],
    queryFn: () => questionAPI.getQuestion(questionId),
    enabled: !!questionId
  });

  // Mutations
  const createAnswerMutation = useMutation({
    mutationFn: questionAPI.createAnswer,
    onSuccess: () => {
      setAnswerContent('');
      queryClient.invalidateQueries(['question', questionId]);
      toast.success('Đã gửi câu trả lời');
    },
    onError: () => toast.error('Lỗi khi gửi câu trả lời')
  });

  const deleteAnswerMutation = useMutation({
    mutationFn: questionAPI.deleteAnswer,
    onSuccess: () => {
      queryClient.invalidateQueries(['question', questionId]);
      toast.success('Đã xóa câu trả lời');
    },
    onError: () => toast.error('Lỗi khi xóa câu trả lời')
  });

  const setBestMutation = useMutation({
    mutationFn: questionAPI.setBestAnswer,
    onSuccess: () => {
      queryClient.invalidateQueries(['question', questionId]);
      toast.success('Đã chọn câu trả lời tốt nhất');
    },
    onError: () => toast.error('Lỗi khi chọn câu trả lời tốt nhất')
  });

  const voteMutation = useMutation({
    mutationFn: questionAPI.voteAnswer,
    onSuccess: () => {
      // Optimistic update already happened, just invalidate
      queryClient.invalidateQueries(['question', questionId]);
    },
    onError: () => {
      toast.error('Lỗi khi vote');
      // Re-fetch to revert optimistic update
      queryClient.invalidateQueries(['question', questionId]);
    }
  });

  const handleSubmitAnswer = useCallback((e) => {
    e.preventDefault();
    if (!answerContent.trim()) return;
    createAnswerMutation.mutate({ questionId, content: answerContent.trim() });
  }, [answerContent, questionId, createAnswerMutation]);

  const handleVote = useCallback((answerId, value) => {
    voteMutation.mutate({ answerId, value });
  }, [voteMutation]);

  const handleSetBest = useCallback((answerId) => {
    setBestMutation.mutate({ questionId, answerId });
  }, [questionId, setBestMutation]);

  const handleDeleteAnswer = useCallback((answerId) => {
    if (window.confirm('Bạn có chắc muốn xóa câu trả lời này?')) {
      deleteAnswerMutation.mutate(answerId);
    }
  }, [deleteAnswerMutation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !question) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 text-center py-16"
      >
        <HelpCircle size={64} className="mx-auto mb-4 text-red-300" />
        <h3 className="text-xl font-bold text-slate-600 mb-4">Không tìm thấy câu hỏi</h3>
        <ProButton variant="secondary" onClick={() => navigate('/questions')}>
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </ProButton>
      </motion.div>
    );
  }

  const author = question.author || question.user || {};
  const isQuestionOwner = question.author_id === user?.id;
  const answers = question.answers || [];
  const sortedAnswers = [...answers].sort((a, b) => {
    const aIsBest = a.id === question.best_answer_id;
    const bIsBest = b.id === question.best_answer_id;
    if (aIsBest) return -1;
    if (bIsBest) return 1;
    return (b.vote_score || 0) - (a.vote_score || 0);
  });

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <ProButton variant="ghost" onClick={() => navigate('/questions')}>
          <ArrowLeft size={18} />
          <span>Quay lại danh sách</span>
        </ProButton>
      </motion.div>

      {/* Question Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div className="p-6">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {question.best_answer_id && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                <Check size={12} /> Đã giải quyết
              </span>
            )}
            {question.tags?.map((tag, i) => (
              <span key={i} className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-bold rounded-full">
                #{tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl font-black text-slate-800 mb-4">{question.title}</h1>

          <p className="text-slate-700 whitespace-pre-wrap mb-6 text-sm leading-relaxed">{question.content}</p>

          {/* Attachment */}
          {question.attachment_url && (() => {
            const isImage = question.attachment_name?.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i);

            if (isImage) {
              return (
                <>
                  <button
                    onClick={() => setImageModalOpen(true)}
                    className="block mb-6 rounded-2xl overflow-hidden border border-slate-200 hover:border-primary-400 transition-all hover:shadow-xl cursor-zoom-in w-full"
                  >
                    <img
                      src={question.attachment_url}
                      alt={question.attachment_name}
                      className="w-full max-h-96 object-contain bg-slate-50"
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
                className="inline-flex items-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl mb-6 transition-colors font-medium"
              >
                <Upload size={18} />
                <span>{question.attachment_name || 'File đính kèm'}</span>
              </a>
            );
          })()}

          {/* Author & Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <img
                src={author.avatar_url || `https://ui-avatars.com/api/?name=${author.full_name}&background=random`}
                alt=""
                className="w-12 h-12 rounded-full object-cover border border-slate-100"
                loading="lazy"
              />
              <div>
                <span className="font-bold text-slate-800">{author.full_name || 'Anonymous'}</span>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock size={12} />
                  <span>{formatTimeAgo(question.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <MessageCircle size={16} />
                <span className="font-bold">{answers.length}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Answers Section */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-2">
          <MessageCircle size={24} />
          {answers.length} Câu trả lời
        </h2>

        {sortedAnswers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 text-center py-12"
          >
            <MessageCircle size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-400 mb-4">Chưa có câu trả lời. Hãy là người đầu tiên!</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {sortedAnswers.map(answer => (
              <AnswerCard
                key={answer.id}
                answer={answer}
                isQuestionOwner={isQuestionOwner}
                isBestAnswer={answer.id === question.best_answer_id}
                onVote={handleVote}
                onSetBest={handleSetBest}
                onDelete={handleDeleteAnswer}
                currentUserId={user?.id}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Answer Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div className="p-6">
          <h3 className="font-bold text-slate-800 mb-4 text-lg">Trả lời câu hỏi này</h3>
          <form onSubmit={handleSubmitAnswer}>
            <textarea
              placeholder="Viết câu trả lời của bạn..."
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all mb-4 text-sm"
            />
            <div className="flex justify-end">
              <ProButton
                type="submit"
                variant="primary"
                disabled={!answerContent.trim() || createAnswerMutation.isPending}
                className="hover:scale-105 active:scale-95 transition-transform"
              >
                {createAnswerMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                <span>Gửi câu trả lời</span>
              </ProButton>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
