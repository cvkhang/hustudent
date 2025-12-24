import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import {
  Clock,
  Target,
  ChevronRight,
  Star,
  Plus,
  Loader2,
  Search,
  LayoutGrid,
  Trash2,
  Edit2,
  Play
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ClayCard from '@/components/ui/ClayCard';
import ProButton from '@/components/ui/ProButton';
import QuizModal from '@/components/quizzes/QuizModal';
import { toast } from 'sonner';

// API
const quizAPI = {
  getQuizzes: async (params = {}) => {
    const res = await api.get('/quizzes', { params });
    return res.data.data || res.data;
  },
  getCategories: async () => {
    const res = await api.get('/quizzes/categories');
    return res.data.data || res.data;
  },
  createQuiz: async (data) => {
    const res = await api.post('/quizzes', data);
    return res.data.data || res.data;
  },
  updateQuiz: async ({ id, data }) => {
    const res = await api.patch(`/quizzes/${id}`, data);
    return res.data;
  },
  deleteQuiz: async (id) => {
    const res = await api.delete(`/quizzes/${id}`);
    return res.data;
  }
};

const QuizCard = ({ quiz, onDelete, onEdit }) => {
  const navigate = useNavigate();
  const author = quiz.owner || { full_name: 'Me' };

  return (
    <ClayCard
      onClick={() => navigate(`/quizzes/${quiz.id}/take`)}
      className="group cursor-pointer hover:border-primary-200 transition-all relative overflow-hidden h-full flex flex-col p-5 border-2 border-transparent hover:scale-[1.02]"
    >
      <div className="absolute top-3 right-3 flex items-center gap-1 z-10 bg-white/50 backdrop-blur-sm p-1 rounded-lg">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(quiz); }}
          className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(quiz.id); }}
          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <h3 className="text-lg font-black text-slate-800 mb-4 mt-2 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight pr-20">
        {quiz.title}
      </h3>

      <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mb-4 mt-auto">
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50">
          <Target size={14} className="text-primary-500" /> {quiz.question_count || quiz.questions?.length || 0} câu
        </span>
        <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50">
          <Clock size={14} className="text-secondary-500" /> {quiz.time_limit ? `${Math.round(quiz.time_limit / 60)}m` : '30m'}
        </span>
      </div>

      <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {author.avatar_url ? (
            <img src={author.avatar_url} alt="" className="w-4 h-4 rounded-full bg-slate-200 object-cover" />
          ) : (
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white text-[8px] font-bold">
              {author.full_name?.charAt(0) || '?'}
            </div>
          )}
          <span className="text-[10px] font-medium text-slate-400 truncate max-w-[80px]">
            {author.full_name || 'Admin'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400">
            {quiz.attempt_count || 0} lượt
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/quizzes/${quiz.id}/take`);
            }}
            className="w-7 h-7 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm hover:scale-110"
          >
            <Play size={12} className="ml-0.5" fill="currentColor" />
          </button>
        </div>
      </div>
    </ClayCard>
  );
};

export default function QuizDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Tất cả');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);

  // Queries
  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['quizzes'],
    queryFn: () => quizAPI.getQuizzes(),
    enabled: !!user
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: quizAPI.createQuiz,
    onSuccess: (newQuiz) => {
      queryClient.invalidateQueries(['quizzes']);
      setIsModalOpen(false);
      toast.success("Tạo Quiz thành công!");
      // Optionally navigate to edit logic if needed, but Modal handles that via "Soạn câu hỏi" button for edits. 
    },
    onError: () => toast.error("Lỗi khi tạo Quiz")
  });

  const updateMutation = useMutation({
    mutationFn: quizAPI.updateQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries(['quizzes']);
      setIsModalOpen(false);
      setEditingQuiz(null);
      toast.success("Cập nhật thành công!");
    },
    onError: () => toast.error("Lỗi khi cập nhật")
  });

  const deleteMutation = useMutation({
    mutationFn: quizAPI.deleteQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries(['quizzes']);
      toast.success("Đã xoá Quiz");
    },
    onError: () => toast.error("Không thể xoá Quiz")
  });

  // Handlers
  const handleEdit = (quiz) => {
    setEditingQuiz(quiz);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bài thi này? Hành động này không thể hoàn tác.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingQuiz(null);
  };

  const handleModalSubmit = (data) => {
    if (editingQuiz) {
      updateMutation.mutate({ id: editingQuiz.id, data });
    } else {
      createMutation.mutate(data);
    }
  };


  // Filter
  const filteredQuizzes = quizzes.filter(q =>
    q.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 h-full flex flex-col relative">

      <QuizModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={editingQuiz}
        isPending={createMutation.isPending || updateMutation.isPending}
        title={editingQuiz ? "Chỉnh sửa Quiz" : "Tạo Quiz Mới"}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Target className="text-primary-500" />
            Quizzes
          </h1>
          <p className="text-slate-500 text-sm font-medium">Kho đề thi trắc nghiệm</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <ProButton
            variant="primary"
            icon={Plus}
            className="shadow-glow-primary w-full sm:w-auto"
            onClick={() => setIsModalOpen(true)}
          >
            Tạo Quiz Mới
          </ProButton>
        </div>
      </div>

      {/* Tabs & Search */}
      <ClayCard className="!p-2 shrink-0 z-100">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex p-1 bg-slate-100 rounded-xl relative self-start whitespace-nowrap overflow-x-auto no-scrollbar max-w-full">
            {['Tất cả', 'Của tôi', 'Được chia sẻ'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all z-10 whitespace-nowrap ${activeTab === tab ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm đề thi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-medium"
            />
          </div>
        </div>
      </ClayCard>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto min-h-0 p-10">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">

            {/* Placeholder Create */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="min-h-[200px] rounded-[2rem] border-3 border-dashed border-slate-200 hover:border-primary-400 hover:bg-primary-50/50 flex flex-col items-center justify-center gap-3 transition-all group h-full"
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-primary-500 group-hover:scale-110 transition-all">
                <Plus size={32} />
              </div>
              <span className="font-bold text-slate-400 group-hover:text-primary-600">Tạo đề thi mới</span>
            </button>

            {filteredQuizzes.map(quiz => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}

            {filteredQuizzes.length === 0 && !isLoading && (
              <div className="col-span-full text-center py-10 text-slate-400 flex flex-col items-center">
                <LayoutGrid size={48} className="mb-4 opacity-20" />
                <p>Không tìm thấy đề thi nào</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
