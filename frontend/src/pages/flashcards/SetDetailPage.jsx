import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Save,
  Play,
  Loader2,
  MoreVertical,
  Settings,
  Share2
} from 'lucide-react';
import ClayCard from '@/components/ui/ClayCard';
import ProButton from '@/components/ui/ProButton';
import SetModal from '@/components/flashcards/SetModal';
import GameModeModal from '@/components/flashcards/GameModeModal';
import { toast } from 'sonner';

// API
const setDetailAPI = {
  getSet: async (id) => {
    const res = await api.get(`/flashcards/${id}`);
    return res.data.data || res.data;
  },
  updateSet: async ({ id, data }) => {
    const res = await api.patch(`/flashcards/${id}`, data);
    return res.data.data;
  },
  addCard: async ({ setId, data }) => {
    const res = await api.post(`/flashcards/${setId}/cards`, data);
    return res.data.data;
  },
  updateCard: async ({ cardId, data }) => {
    const res = await api.patch(`/cards/${cardId}`, data);
    return res.data.data;
  },
  deleteCard: async (cardId) => {
    const res = await api.delete(`/cards/${cardId}`);
    return res.data;
  }
};

const CardItem = ({ card, index, onEdit, onDelete }) => (
  <ClayCard className="!p-4 md:!p-6 group relative hover:border-primary-200 transition-colors">
    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
      <button onClick={() => onEdit(card)} className="p-2 bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg">
        <Edit2 size={16} />
      </button>
      <button onClick={() => onDelete(card.id)} className="p-2 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg">
        <Trash2 size={16} />
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
        <span className="text-xs font-bold text-slate-300 uppercase block mb-1">Thuật ngữ (Mặt trước)</span>
        <p className="text-lg font-bold text-slate-700">{card.front}</p>
      </div>
      <div className="pl-0 md:pl-2">
        <span className="text-xs font-bold text-slate-300 uppercase block mb-1">Định nghĩa (Mặt sau)</span>
        <p className="text-lg font-medium text-slate-600">{card.back}</p>
        {card.hint && (
          <p className="text-sm text-slate-400 mt-2 italic flex items-center gap-1">
            <span className="font-bold not-italic bg-slate-100 px-1.5 rounded text-xs">Hint</span> {card.hint}
          </p>
        )}
      </div>
    </div>
  </ClayCard>
);

const CardForm = ({ initialData, onSubmit, onCancel, isPending }) => {
  const [form, setForm] = useState(initialData || { front: '', back: '', hint: '' });
  const frontInputRef = React.useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form, false); // false = close form
  };

  const handleSaveAndNext = (e) => {
    e.preventDefault();
    if (!form.front || !form.back) return;

    // Optimistic reset for UX speed
    onSubmit(form, true); // true = keep open
    setForm({ front: '', back: '', hint: '' });
    frontInputRef.current?.focus();
  };

  return (
    <ClayCard className="!p-6 border-2 border-primary-100 bg-primary-50/30">
      <h3 className="font-black text-slate-700 mb-4">{initialData ? 'Chỉnh sửa thẻ' : 'Thêm thẻ mới'}</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Mặt trước</label>
            <textarea
              ref={frontInputRef}
              className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none font-bold text-slate-700 resize-none h-24"
              placeholder="Nhập thuật ngữ..."
              value={form.front}
              onChange={(e) => setForm({ ...form, front: e.target.value })}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Mặt sau</label>
            <textarea
              className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none font-bold text-slate-700 resize-none h-24"
              placeholder="Nhập định nghĩa..."
              value={form.back}
              onChange={(e) => setForm({ ...form, back: e.target.value })}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Gợi ý (Tuỳ chọn)</label>
          <input
            className="w-full p-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none font-medium text-slate-600 text-sm"
            placeholder="Gợi ý giúp nhớ từ này..."
            value={form.hint || ''}
            onChange={(e) => setForm({ ...form, hint: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors">Huỷ</button>

          {!initialData && (
            <button
              type="button"
              onClick={handleSaveAndNext}
              disabled={isPending || !form.front || !form.back}
              className="px-4 py-2 rounded-xl font-bold text-primary-600 bg-white border border-primary-100 hover:bg-primary-50 transition-colors"
            >
              Lưu & Thêm tiếp
            </button>
          )}

          <button type="submit" disabled={isPending} className="px-6 py-2 rounded-xl font-bold bg-primary-600 text-white shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all flex items-center gap-2">
            {isPending && <Loader2 size={16} className="animate-spin" />}
            {initialData ? 'Lưu thay đổi' : 'Hoàn tất'}
          </button>
        </div>
      </form>
    </ClayCard>
  );
};

export default function SetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [isEditSetModalOpen, setIsEditSetModalOpen] = useState(false);
  const [isGameModeModalOpen, setIsGameModeModalOpen] = useState(false);

  // Fetch Set
  const { data: set, isLoading, isError } = useQuery({
    queryKey: ['flashcard-set', id],
    queryFn: () => setDetailAPI.getSet(id)
  });

  // Mutations
  const updateSetMutation = useMutation({
    mutationFn: (data) => setDetailAPI.updateSet({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries(['flashcard-set', id]);
      setIsEditSetModalOpen(false);
      toast.success("Cập nhật bộ thẻ thành công!");
    },
    onError: () => toast.error("Lỗi khi cập nhật bộ thẻ")
  });

  const addCardMutation = useMutation({
    mutationFn: ({ data, keepOpen }) => setDetailAPI.addCard({ setId: id, data }).then(() => keepOpen),
    onSuccess: (keepOpen) => {
      queryClient.invalidateQueries(['flashcard-set', id]);
      if (!keepOpen) setIsAdding(false);
      toast.success('Đã thêm thẻ mới');
    },
    onError: () => toast.error('Lỗi khi thêm thẻ')
  });

  const updateCardMutation = useMutation({
    mutationFn: ({ cardId, data }) => setDetailAPI.updateCard({ cardId, data }),
    onSuccess: () => {
      queryClient.invalidateQueries(['flashcard-set', id]);
      setEditingCard(null);
      toast.success('Đã cập nhật thẻ');
    },
    onError: () => toast.error('Lỗi cập nhật thẻ')
  });

  const deleteCardMutation = useMutation({
    mutationFn: setDetailAPI.deleteCard,
    onSuccess: () => {
      queryClient.invalidateQueries(['flashcard-set', id]);
      toast.success('Đã xoá thẻ');
    }
  });

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary-500" /></div>;
  if (isError || !set) return <div className="text-center py-20 font-bold text-slate-500">Không tìm thấy bộ thẻ</div>;

  return (
    <div className="h-full flex flex-col space-y-6">
      <SetModal
        isOpen={isEditSetModalOpen}
        onClose={() => setIsEditSetModalOpen(false)}
        onSubmit={updateSetMutation.mutate}
        initialData={set}
        isPending={updateSetMutation.isPending}
        title="Chỉnh sửa bộ thẻ"
      />

      {/* Header / Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/flashcards')} className="p-2 hover:bg-white rounded-xl text-slate-500 transition-colors">
            <ArrowLeft />
          </button>
          <div className="group flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-black text-slate-800">{set.title}</h1>
              <p className="text-slate-500 font-medium text-sm">{set.description}</p>
            </div>
            <button
              onClick={() => setIsEditSetModalOpen(true)}
              className="opacity-0 group-hover:opacity-100 p-2 hover:bg-slate-100 text-slate-400 hover:text-blue-500 rounded-lg transition-all"
            >
              <Edit2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Đã sao chép liên kết!", {
                description: set.visibility === 'private' ? 'Bộ thẻ đang để riêng tư' : 'Sẵn sàng chia sẻ'
              });
            }}
            className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors"
            title="Chia sẻ"
          >
            <Share2 size={20} />
          </button>

          <ProButton
            variant="primary"
            icon={Play}
            className="shadow-lg shadow-primary-200"
            onClick={() => setIsGameModeModalOpen(true)}
          >
            Luyện tập
          </ProButton>
        </div>
      </div>

      {/* Game Mode Modal */}
      <GameModeModal
        isOpen={isGameModeModalOpen}
        onClose={() => setIsGameModeModalOpen(false)}
        set={set}
      />

      {/* Stats */}
      <ClayCard className="!p-3 shrink-0 flex gap-4 items-center">
        <div className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
          {set.cards?.length || 0} thẻ
        </div>
        <div className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 capitalize">
          {set.visibility === 'public' ? 'Công khai' : 'Riêng tư'}
        </div>
        <div className="ml-auto text-xs font-bold text-slate-400">
          Tạo bởi {set.owner?.full_name || 'Me'}
        </div>
      </ClayCard>

      {/* Card List - Scrollable Area */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-6 pb-20 pr-1">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-700">Danh sách thẻ</h2>
          {!isAdding && (
            <button onClick={() => setIsAdding(true)} className="flex items-center gap-2 text-primary-600 font-bold hover:bg-primary-50 px-4 py-2 rounded-xl transition-colors text-sm">
              <Plus size={18} /> Thêm thẻ
            </button>
          )}
        </div>

        {isAdding && (
          <CardForm
            onSubmit={(data, keepOpen) => addCardMutation.mutate({ data, keepOpen })}
            onCancel={() => setIsAdding(false)}
            isPending={addCardMutation.isPending}
          />
        )}

        <div className="space-y-4">
          {set.cards?.map((card, idx) => (
            editingCard?.id === card.id ? (
              <CardForm
                key={card.id}
                initialData={card}
                onSubmit={(data) => updateCardMutation.mutate({ cardId: card.id, data })}
                onCancel={() => setEditingCard(null)}
                isPending={updateCardMutation.isPending}
              />
            ) : (
              <CardItem
                key={card.id}
                card={card}
                index={idx}
                onEdit={setEditingCard}
                onDelete={(id) => {
                  if (window.confirm('Xoá thẻ này?')) deleteCardMutation.mutate(id);
                }}
              />
            )
          ))}

          {(!set.cards || set.cards.length === 0) && !isAdding && (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400">
              Chưa có thẻ nào. Bấm "Thêm thẻ" để bắt đầu.
            </div>
          )}
        </div>
      </div>

    </div >
  );
}
