import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import {
  Plus,
  Search,
  Zap,
  Loader2,
  Trash2,
  Play,
  LayoutGrid,
  Edit2
} from 'lucide-react';
import ClayCard from '@/components/ui/ClayCard';
import ProButton from '@/components/ui/ProButton';
import SetModal from '@/components/flashcards/SetModal';
import GameModeModal from '@/components/flashcards/GameModeModal';
import { toast } from 'sonner';

// API
const flashcardAPI = {
  getSets: async () => {
    const res = await api.get('/flashcards');
    return res.data.data || res.data;
  },
  createSet: async (data) => {
    const res = await api.post('/flashcards', data);
    return res.data.data;
  },
  updateSet: async ({ id, data }) => {
    const res = await api.patch(`/flashcards/${id}`, data);
    return res.data.data;
  },
  deleteSet: async (setId) => {
    const res = await api.delete(`/flashcards/${setId}`);
    return res.data;
  }
};

const SET_COLORS = [
  'from-blue-400 to-indigo-600',
  'from-emerald-400 to-teal-600',
  'from-rose-400 to-red-600',
  'from-orange-400 to-amber-600',
  'from-purple-400 to-violet-600',
  'from-pink-400 to-fuchsia-600'
];

const FlashcardSetCard = ({ set, onDelete, onEdit, onPlay }) => {
  const colorIndex = (set.id || 0) % SET_COLORS.length;
  const author = set.owner || {};
  const cardCount = set.card_count || set.Flashcards?.length || 0;
  const navigate = useNavigate();

  return (
    <ClayCard
      onClick={() => navigate(`/flashcards/${set.id}`)}
      className="group cursor-pointer hover:border-primary-200 transition-all relative overflow-hidden h-full flex flex-col"
    >
      <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${SET_COLORS[colorIndex]}`} />

      <div className="p-5 pl-7 flex flex-col h-full relative">
        <div className="absolute top-3 right-3 flex items-center gap-1 z-10 bg-white/50 backdrop-blur-sm p-1 rounded-lg">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(set); }}
            className="text-slate-400 hover:text-blue-500 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(set.id); }}
            className="text-slate-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <h3 className="text-lg font-black text-slate-800 mb-2 mt-1 group-hover:text-primary-600 transition-colors line-clamp-2 leading-tight pr-20">
          {set.title}
        </h3>

        <div className="mb-4 mt-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg">
              <Zap size={12} className="text-yellow-500" fill="currentColor" /> {cardCount} thẻ
            </span>
          </div>

          <div className="w-full">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
              <span>Đã thuộc</span>
              <span>{Math.round(set.progress || 0)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${SET_COLORS[colorIndex]}`} style={{ width: `${set.progress || 0}%` }} />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {author.avatar_url ? (
              <img src={author.avatar_url} alt="" className="w-4 h-4 rounded-full bg-slate-200 object-cover" />
            ) : (
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white text-[8px] font-bold">
                {author.full_name?.charAt(0) || '?'}
              </div>
            )}
            <span className="text-[10px] font-medium text-slate-400 truncate max-w-[80px]">
              {author.full_name || 'Admin'}
            </span>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onPlay(set); }}
            className="w-7 h-7 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all shadow-sm hover:scale-110"
          >
            <Play size={12} fill="currentColor" className="ml-0.5" />
          </button>
        </div>
      </div>
    </ClayCard>
  );
};

export default function FlashcardDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  const [activeTab, setActiveTab] = useState('My Sets');
  const [selectedSetForGame, setSelectedSetForGame] = useState(null);
  const navigate = useNavigate();

  const handlePlayClick = (set) => {
    setSelectedSetForGame(set);
  };

  // Query
  const { data: sets = [], isLoading } = useQuery({
    queryKey: ['flashcard-sets'],
    queryFn: flashcardAPI.getSets,
    enabled: !!user
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: flashcardAPI.createSet,
    onSuccess: (newSet) => {
      queryClient.invalidateQueries(['flashcard-sets']);
      setIsModalOpen(false);
      toast.success("Tạo bộ thẻ thành công!");
      if (newSet?.id) {
        navigate(`/flashcards/${newSet.id}`);
      }
    },
    onError: () => toast.error("Có lỗi xảy ra khi tạo bộ thẻ")
  });

  const updateMutation = useMutation({
    mutationFn: flashcardAPI.updateSet,
    onSuccess: () => {
      queryClient.invalidateQueries(['flashcard-sets']);
      setIsModalOpen(false);
      setEditingSet(null);
      toast.success("Cập nhật thành công!");
    },
    onError: () => toast.error("Lỗi khi cập nhật")
  });

  const deleteMutation = useMutation({
    mutationFn: flashcardAPI.deleteSet,
    onSuccess: () => {
      queryClient.invalidateQueries(['flashcard-sets']);
      toast.success("Đã xoá bộ thẻ");
    },
    onError: () => toast.error("Không thể xoá bộ thẻ")
  });

  const handleDelete = (setId) => {
    if (window.confirm('Bạn có chắc muốn xóa bộ thẻ này?')) {
      deleteMutation.mutate(setId);
    }
  };

  const handleEdit = (set) => {
    setEditingSet(set);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSet(null);
  };

  const handleModalSubmit = (data) => {
    if (editingSet) {
      updateMutation.mutate({ id: editingSet.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Filter by search
  const filteredSets = sets.filter(set =>
    set.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 h-full flex flex-col relative">
      <GameModeModal
        isOpen={!!selectedSetForGame}
        onClose={() => setSelectedSetForGame(null)}
        set={selectedSetForGame}
      />

      {/* Create/Edit Modal */}
      <SetModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={editingSet}
        isPending={createMutation.isPending || updateMutation.isPending}
        title={editingSet ? "Chỉnh sửa bộ thẻ" : "Tạo bộ thẻ mới"}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Zap className="text-yellow-500" fill="currentColor" />
            Flashcards
          </h1>
          <p className="text-slate-500 text-sm font-medium">Quản lý và ôn tập các bộ thẻ ghi nhớ</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <ProButton variant="primary" icon={Plus} className="shadow-glow-primary w-full sm:w-auto" onClick={() => setIsModalOpen(true)}>
            Tạo bộ thẻ mới
          </ProButton>
        </div>
      </div>

      {/* Tabs & Search */}
      <ClayCard className="!p-2 shrink-0 z-10">
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
              placeholder="Tìm kiếm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all text-sm font-medium"
            />
          </div>
        </div>
      </ClayCard>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto min-h-0 p-10">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
            {/* Create New Card Placeholder */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="min-h-[200px] rounded-[2rem] border-3 border-dashed border-slate-200 hover:border-yellow-400 hover:bg-yellow-50/50 flex flex-col items-center justify-center gap-3 transition-all group h-full"
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-yellow-500 group-hover:scale-110 transition-all">
                <Plus size={32} />
              </div>
              <span className="font-bold text-slate-400 group-hover:text-yellow-600">Tạo bộ thẻ mới</span>
            </button>

            {filteredSets.map(set => (
              <FlashcardSetCard key={set.id} set={set} onDelete={handleDelete} onEdit={handleEdit} onPlay={handlePlayClick} />
            ))}

            {filteredSets.length === 0 && !isLoading && (
              <div className="col-span-full text-center py-10 text-slate-400 flex flex-col items-center">
                <LayoutGrid size={48} className="mb-4 opacity-20" />
                <p>Không tìm thấy bộ thẻ nào</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
