import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Timer, Trophy, RotateCw, Loader2, Zap, Gamepad2 } from 'lucide-react';
import api from '@/lib/api';
import ProButton from '@/components/ui/ProButton';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export default function FlashcardMatch() {
  const { id: setId } = useParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]); // [id1, id2]
  const [matched, setMatched] = useState([]); // [id1, id2, ...]
  const [isCompleted, setIsCompleted] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // Fetch Set Info
  const { data: setInfo } = useQuery({
    queryKey: ['flashcard-set', setId],
    queryFn: async () => {
      const res = await api.get(`/flashcards/${setId}`);
      return res.data.data || res.data;
    }
  });

  // Fetch Cards
  const { data: setCardsData, isLoading, isError } = useQuery({
    queryKey: ['match-cards', setId],
    queryFn: async () => {
      const res = await api.get(`/flashcards/${setId}/study`); // Reuse study endpoint
      return res.data.data;
    },
    refetchOnWindowFocus: false,
  });

  // Initialize Game
  useEffect(() => {
    if (setCardsData?.length > 0) {
      startGame(setCardsData);
    }
  }, [setCardsData]);

  // Timer
  useEffect(() => {
    if (startTime && !isCompleted) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [startTime, isCompleted]);

  const startGame = (data) => {
    // Take up to 6 cards (12 items) for mobile, 8 (16 items) for desktop to prevent overcrowding
    // For now, let's take up to 8 cards random
    const shuffledSource = [...data].sort(() => 0.5 - Math.random()).slice(0, 8);

    // Create pair items
    const gameItems = shuffledSource.flatMap(card => [
      { id: `${card.id}-front`, content: card.front, type: 'front', pairId: card.id },
      { id: `${card.id}-back`, content: card.back, type: 'back', pairId: card.id }
    ]);

    // Shuffle grid
    setCards(gameItems.sort(() => 0.5 - Math.random()));
    setMatched([]);
    setSelected([]);
    setIsCompleted(false);
    setElapsed(0);
    setStartTime(Date.now());
  };

  const handleCardClick = (item) => {
    if (isCompleted || matched.includes(item.id) || selected.some(s => s.id === item.id)) return;

    if (selected.length >= 2) return; // Prevent clicking more than 2

    const newSelected = [...selected, item];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      // Check Match
      const [first, second] = newSelected;
      if (first.pairId === second.pairId) {
        // Match!
        setMatched(prev => [...prev, first.id, second.id]);
        setSelected([]);
        toast.success("Chính xác!", { duration: 500, position: 'top-center' });

        // Check Win
        if (matched.length + 2 === cards.length) {
          clearInterval(timerRef.current);
          setIsCompleted(true);
          triggerBigConfetti();
        }
      } else {
        // Mismatch
        setTimeout(() => {
          setSelected([]);
        }, 800);
      }
    }
  };

  const triggerBigConfetti = () => {
    var duration = 3000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    function randomInRange(min, max) { return Math.random() * (max - min) + min; }
    var interval = setInterval(function () {
      var timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      var particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) return <div className="flex justify-center items-center h-screen bg-white"><Loader2 className="animate-spin text-white w-10 h-10" /></div>;
  if (isError) return <div className="p-8 text-center text-white">Lỗi tải dữ liệu</div>;

  // Render Completed View
  if (isCompleted) {
    return (
      <div className="w-full h-screen min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg bg-white/90 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white/60 text-center relative overflow-hidden"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500" />

          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-32 h-32 mx-auto bg-gradient-to-tr from-yellow-100 to-orange-200 rounded-full flex items-center justify-center mb-6 shadow-inner"
          >
            <Trophy size={64} className="text-yellow-600 drop-shadow-sm" />
          </motion.div>

          <h2 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">Xuất sắc!</h2>
          <p className="text-slate-500 font-medium mb-8">Bạn đã hoàn thành ghép thẻ</p>

          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center p-4 bg-slate-50 rounded-2xl min-w-[120px]">
              <p className="text-3xl font-black text-indigo-600 font-mono">{formatTime(elapsed)}</p>
              <p className="text-xs font-bold text-slate-400 uppercase mt-1">Thời gian</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ProButton variant="ghost" onClick={() => navigate('/flashcards')} className="bg-slate-100 hover:bg-slate-200 text-slate-600">
              Thoát
            </ProButton>
            <ProButton variant="primary" onClick={() => startGame(setCardsData)} icon={RotateCw} className="shadow-lg shadow-orange-200 bg-gradient-to-r from-yellow-500 to-orange-600 border-none">
              Chơi lại
            </ProButton>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden">

      {/* Header */}
      <div className="w-full max-w-7xl mx-auto p-4 md:p-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/flashcards" className="group">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-slate-700 group-hover:border-slate-300 transition-all shadow-sm">
              <ArrowLeft size={20} />
            </div>
          </Link>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Gamepad2 size={12} />
              Ghép thẻ
            </span>
            <h1 className="text-sm md:text-xl font-black text-slate-800 line-clamp-1 max-w-[200px] md:max-w-md">
              {setInfo?.title || 'Flashcards'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-2.5 rounded-xl font-black tabular-nums shadow-sm">
            <Timer size={18} className="text-indigo-500" />
            <span className="text-lg">{formatTime(elapsed)}</span>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-5xl mx-auto pb-20">
          <AnimatePresence>
            {cards.map((item) => {
              const isSelected = selected.some(s => s.id === item.id);
              const isMatched = matched.includes(item.id);
              const isWrong = selected.length === 2 && isSelected && selected[0].pairId !== selected[1].pairId;

              // Matched cards visual handler
              if (isMatched) {
                return <div key={item.id} className="w-full aspect-[4/3]" />;
              }

              return (
                <motion.button
                  key={item.id}
                  layoutId={item.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: 1,
                    x: isWrong ? [0, -6, 6, -6, 6, 0] : 0,
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCardClick(item)}
                  className={`
                    relative w-full aspect-[4/3] rounded-[1.5rem] md:rounded-[2rem] p-4 
                    flex items-center justify-center text-center
                    transition-all duration-300
                    border-2
                    ${isSelected
                      ? isWrong
                        ? 'bg-red-50 border-red-200 shadow-none'
                        : 'bg-indigo-50 border-indigo-200 shadow-none'
                      : 'bg-white border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-200'
                    }
                  `}
                >
                  {/* Decorative Gradient Overlay for default state */}
                  {!isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-[1.5rem] md:rounded-[2rem] pointer-events-none" />
                  )}

                  <span className={`
                    font-bold text-sm md:text-lg line-clamp-4 leading-snug break-words
                    ${isSelected
                      ? isWrong ? 'text-red-600' : 'text-indigo-600'
                      : 'text-slate-700'
                    }
                  `}>
                    {item.content}
                  </span>

                  {/* Icon Indicator for Wrong */}
                  {isSelected && isWrong && (
                    <div className="absolute top-2 right-2 text-red-400">
                      <Zap size={16} fill="currentColor" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
