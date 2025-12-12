import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { X, Play, Gamepad2, Zap } from 'lucide-react';

const GameModeModal = ({ isOpen, onClose, set }) => {
  const navigate = useNavigate();

  if (!isOpen || !set) return null;

  const handleModeSelect = (mode) => {
    onClose();
    navigate(`/flashcards/${set.id}/${mode}`);
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(15,23,42,0.4)_100%)] backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <Zap className="text-yellow-500" size={24} fill="currentColor" />
              Chọn chế độ luyện tập
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleModeSelect('study')}
            className="group relative flex flex-col items-center p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <Play size={28} fill="currentColor" />
            </div>
            <h4 className="font-bold text-slate-800 text-lg mb-1">Thẻ ghi nhớ</h4>
            <p className="text-xs text-slate-500 font-medium">Lật thẻ để ôn tập kiến thức của bạn</p>
          </button>

          <button
            onClick={() => handleModeSelect('match')}
            className="group relative flex flex-col items-center p-6 rounded-2xl border-2 border-slate-100 hover:border-purple-500 hover:bg-purple-50/50 transition-all text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <Gamepad2 size={28} />
            </div>
            <h4 className="font-bold text-slate-800 text-lg mb-1">Ghép thẻ</h4>
            <p className="text-xs text-slate-500 font-medium">Tìm cặp thẻ tương ứng trong thời gian ngắn nhất</p>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GameModeModal;
