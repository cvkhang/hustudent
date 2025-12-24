import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ArrowLeft,
  RotateCw,
  Check,
  X,
  Settings,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Lightbulb,
  Trophy,
  MoreVertical,
  Volume2
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import api from '@/lib/api';
import ProButton from '@/components/ui/ProButton';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function FlashcardStudy() {
  const { id: setId } = useParams();
  const navigate = useNavigate();

  // Local State for Smart Queue
  const [studyQueue, setStudyQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({ known: 0, unknown: 0, reviews: 0 });

  // UI State
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [direction, setDirection] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const cardControls = useAnimation();
  const queryClient = useQueryClient();

  // API Fetch
  const fetchStudyCards = async () => {
    const res = await api.get(`/flashcards/${setId}/study`);
    return res.data.data;
  };

  const updateProgress = async ({ cardId, status }) => {
    const res = await api.post(`/cards/${cardId}/progress`, { status });
    return res.data;
  };

  const { data: initialCards = [], isLoading, isError } = useQuery({
    queryKey: ['study-cards', setId],
    queryFn: fetchStudyCards,
    refetchOnWindowFocus: false,
  });

  // Fetch Set Info
  const { data: setInfo } = useQuery({
    queryKey: ['flashcard-set', setId],
    queryFn: async () => {
      const res = await api.get(`/flashcards/${setId}`);
      return res.data.data || res.data;
    }
  });

  // Initialize Queue safely
  useEffect(() => {
    if (initialCards.length > 0 && studyQueue.length === 0) {
      setStudyQueue(initialCards);
    }
  }, [initialCards]); // Only runs when initialCards loads or changes significantly (e.g. Set ID change)

  const progressMutation = useMutation({
    mutationFn: updateProgress,
    onSuccess: (data, variables) => {
      // Fire and forget, we handle local state for seamless UX
      queryClient.invalidateQueries(['flashcard-stats', setId]);
    }
  });

  // Core Logic
  const totalUniqueCards = initialCards.length;
  const currentCard = studyQueue[currentIndex];

  // TTS Helper
  const handleSpeak = (text, e) => {
    e.stopPropagation();
    if (!text) return;

    // Cancel any current speaking
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // 1. Japanese (Priority)
    // Check for Hiragana, Katakana, Kanji
    const hasJapanese = /[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\uff00-\uff9f\u4e00-\u9faf\u3400-\u4dbf]/.test(text);

    // 2. English (Secondary)
    // Check if purely ASCII (English/Numbers/Symbol)
    const isEnglishOnly = /^[\x00-\x7F]*$/.test(text);

    let lang = 'vi-VN';
    if (hasJapanese) {
      lang = 'ja-JP';
    } else if (isEnglishOnly) {
      lang = 'en-US';
    }
    // Else (contains accented chars like 'ế', 'ì' but not Japanese) -> Default to 'vi-VN' used for "thuyết trình"

    utterance.lang = lang;

    // Explicitly find best voice
    const voices = window.speechSynthesis.getVoices();
    // Try exact match then loose match (e.g., 'vi-VN' matches 'vi_VN' or 'vi')
    const voice = voices.find(v => v.lang === lang) ||
      voices.find(v => v.lang.replace('_', '-').startsWith(lang.split('-')[0]));

    if (voice) utterance.voice = voice;

    // console.log(`Speaking: "${text}" | Detected: ${lang} | Voice: ${voice ? voice.name : 'Default'}`);

    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Cleanup TTS on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const handleNext = useCallback((dir = 0, status) => {
    if (!currentCard || isAnimating) return;

    // Capture card reference immediately
    const cardToProcess = currentCard;

    // Stop speaking when moving
    window.speechSynthesis.cancel();

    setIsAnimating(true);
    setDirection(dir);

    // 1. Update Stats
    setSessionStats(prev => ({
      ...prev,
      [status]: prev[status] + 1,
      reviews: status === 'unknown' ? prev.reviews + 1 : prev.reviews
    }));

    // 2. Animate
    cardControls.start({
      x: dir === 0 ? -50 : dir * 500,
      opacity: 0,
      rotate: dir * 20,
      transition: { duration: 0.3 }
    }).then(() => {
      setIsFlipped(false);
      setShowHint(false);

      // 3. Smart Queue Logic
      if (status === 'unknown') {
        setStreak(0);

        // Re-queue card at the end with a new unique retry timestamp/ID to act as a unique key if needed
        const retryCard = {
          ...cardToProcess,
          isRetry: true,
          _retryId: Date.now()
        };

        setStudyQueue(prev => [...prev, retryCard]);
        setCurrentIndex(prev => prev + 1); // Move to next

        toast.info("Thẻ đã được thêm vào cuối hàng đợi để ôn lại", { duration: 2000 });

        // Reset animation position
        cardControls.set({ x: 0, opacity: 1, rotate: 0 });
      } else {
        // Known
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > 0 && newStreak % 5 === 0) {
          triggerStreakConfetti();
          toast.success(`${newStreak} thẻ liên tiếp! Tuyệt vời! 🔥`);
        }

        // Check if done
        if (currentIndex === studyQueue.length - 1) {
          setIsCompleted(true);
          triggerBigConfetti();
        } else {
          setCurrentIndex(prev => prev + 1);
          cardControls.set({ x: 0, opacity: 1, rotate: 0 });
        }
      }
      setIsAnimating(false);
    });

    // 4. API Sync in background
    if (status) {
      handleRate(status);
    }
  }, [currentIndex, studyQueue, isAnimating, cardControls, streak]); // Added missing Deps

  const handleRate = (status) => {
    if (!currentCard) return;
    progressMutation.mutate({ cardId: currentCard.id, status });
  };

  const handleFlip = () => {
    if (!isAnimating) setIsFlipped(!isFlipped);
  };

  const handleRestart = () => {
    setIsCompleted(false);
    setStudyQueue(initialCards); // Reset to original
    setCurrentIndex(0);
    setStreak(0);
    setSessionStats({ known: 0, unknown: 0, reviews: 0 });
    cardControls.set({ x: 0, opacity: 1, rotate: 0 });
  };

  const handleReviewMissed = () => {
    // Filter only unknown cards from the last session for a focused review
    // For simplicity, we restart full set but in future we can filter
    handleRestart();
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isCompleted || isLoading || isAnimating) return;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handleFlip();
          break;
        case 'ArrowUp':
        case 'ArrowRight':
          e.preventDefault();
          handleNext(1, 'known');
          break;
        case 'ArrowDown':
        case 'ArrowLeft':
          e.preventDefault();
          handleNext(-1, 'unknown');
          break;
        case 'KeyH':
          e.preventDefault();
          setShowHint(prev => !prev);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCompleted, isLoading, isFlipped, currentCard, handleNext, isAnimating]);


  // --- Effects ---
  const triggerStreakConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#F59E0B', '#EF4444', '#EC4899']
    });
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

  // --- Render ---

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-transparent">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
        <p className="font-bold text-slate-400 animate-pulse">Đang tải biểu thức...</p>
      </div>
    );
  }

  if (isError || initialCards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-transparent text-center px-4">
        <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 max-w-sm w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">
            {isError ? 'Đã có lỗi xảy ra' : 'Bộ thẻ trống'}
          </h3>
          <p className="text-slate-500 mb-6 font-medium">Hiện không có thẻ nào để ôn tập.</p>
          <ProButton onClick={() => navigate('/flashcards')} className="w-full">Quay lại</ProButton>
        </div>
      </div>
    );
  }

  // --- Completed Screen ---
  if (isCompleted) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-lg bg-white/90 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white/60 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500" />

          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-32 h-32 mx-auto bg-gradient-to-tr from-green-100 to-emerald-200 rounded-full flex items-center justify-center mb-6 shadow-inner"
          >
            <Trophy size={64} className="text-green-600 drop-shadow-sm" />
          </motion.div>

          <h2 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">Hoàn thành!</h2>
          <div className="flex justify-center gap-8 my-6">
            <div className="text-center">
              <p className="text-3xl font-black text-slate-800">{initialCards.length}</p>
              <p className="text-xs font-bold text-slate-400 uppercase">Tổng thẻ</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-green-500">{sessionStats.known}</p>
              <p className="text-xs font-bold text-slate-400 uppercase">Đã thuộc</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-orange-500">{sessionStats.reviews}</p>
              <p className="text-xs font-bold text-slate-400 uppercase">Cần ôn lại</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ProButton variant="ghost" onClick={() => navigate('/flashcards')} className="bg-slate-100 hover:bg-slate-200 text-slate-600">
              Danh sách
            </ProButton>
            <ProButton variant="primary" onClick={handleRestart} icon={RotateCw} className="shadow-lg shadow-primary-200">
              Học lại
            </ProButton>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- Study Screen ---
  return (
    <div className="w-full h-full flex flex-col items-center overflow-hidden font-sans relative">

      {/* Top Bar */}
      <div className="w-full max-w-6xl mx-auto p-4 md:p-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/flashcards" className="group">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-slate-700 group-hover:border-slate-300 transition-all shadow-sm">
              <ArrowLeft size={20} />
            </div>
          </Link>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {currentCard?.isRetry ? '🔥 Ôn tập lại' : 'Đang học'}
            </span>
            <h1 className="text-sm md:text-xl font-black text-slate-800 line-clamp-1 max-w-[150px] md:max-w-md">
              {setInfo?.title || 'Flashcards'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <div className="hidden md:flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-slate-600">Tiến độ</span>
              <span className="text-sm font-black text-indigo-600">
                {Math.min(currentIndex + 1, studyQueue.length)}/{studyQueue.length}
              </span>
            </div>
            <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / studyQueue.length) * 100}%` }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Study Area */}
      <div className="flex-1 w-full max-w-4xl px-4 flex flex-col items-center justify-center relative perspective-container pb-20 md:pb-8">

        {/* Streak Badge */}
        <AnimatePresence>
          {streak > 1 && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-0 transform -translate-y-full mb-4 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 font-bold text-sm z-20"
            >
              <span>🔥 {streak} Streak</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Card */}
        <div className="relative w-full aspect-[4/5] md:aspect-[5/3] max-h-[500px]">

          {/* Local Progress (Mobile) */}
          <div className="md:hidden absolute -top-8 left-0 right-0 flex justify-center gap-1.5 mb-4 px-8">
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${((currentIndex + 1) / studyQueue.length) * 100}%` }}
                className="h-full bg-indigo-500"
              />
            </div>
          </div>

          <motion.div
            animate={cardControls}
            className="w-full h-full relative cursor-pointer"
            style={{ perspective: 1000 }}
            onClick={handleFlip}
          >
            <motion.div
              initial={false}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
              className="w-full h-full absolute inset-0 preserve-3d"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* FRONT */}
              <div className={`absolute inset-0 backface-hidden bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50 flex flex-col overflow-hidden ${currentCard?.isRetry ? 'ring-4 ring-orange-100' : ''}`}>

                {/* Status Bar */}
                <div className="px-8 py-6 flex justify-between items-start">
                  <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${currentCard?.isRetry ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                    {currentCard?.isRetry ? 'Ôn tập lại' : 'Mặt trước'}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleSpeak(currentCard?.front, e)}
                      className="p-2 rounded-full bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <Volume2 size={20} />
                    </button>
                    {currentCard?.hint && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowHint(!showHint); }}
                        className={`p-2 rounded-full transition-colors ${showHint ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                      >
                        <Lightbulb size={20} className={showHint ? "fill-current" : ""} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 text-center relative overflow-y-auto scrollbar-hide w-full">
                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-0 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl text-sm font-medium border border-yellow-100 shadow-sm z-10"
                      >
                        💡 {currentCard.hint}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <h3 className="text-2xl md:text-5xl font-black text-slate-800 leading-tight max-w-full break-words">
                    {currentCard?.front}
                  </h3>
                </div>

                {/* Footer Instruction */}
                <div className="pb-8 text-center">
                  <span className="text-slate-300 text-xs font-bold uppercase tracking-widest animate-pulse">
                    Chạm để lật
                  </span>
                </div>
              </div>

              {/* BACK */}
              <div
                className="absolute inset-0 backface-hidden bg-slate-900 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden"
                style={{ transform: 'rotateY(180deg)' }}
              >
                <div className="px-8 py-6 flex justify-between items-start">
                  <div className="bg-slate-800 text-slate-400 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                    Mặt sau
                  </div>
                  <button
                    onClick={(e) => handleSpeak(currentCard?.back, e)}
                    className="p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-indigo-500 hover:text-white transition-colors"
                  >
                    <Volume2 size={20} />
                  </button>
                </div>

                <div className="flex-1 flex items-center justify-center p-6 md:p-8 text-center overflow-y-auto scrollbar-hide w-full">
                  <h3 className="text-2xl md:text-5xl font-black text-indigo-300 leading-tight max-w-full break-words">
                    {currentCard?.back}
                  </h3>
                </div>
              </div>

            </motion.div>
          </motion.div>
        </div>

        {/* Floating Controls */}
        <div className="absolute bottom-8 left-0 right-0 md:static md:mt-12 flex items-center justify-center gap-8 z-20">

          {/* Unknown Button */}
          <div className="flex flex-col items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNext(-1, 'unknown')}
              disabled={progressMutation.isPending}
              className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-white border-2 border-slate-100 shadow-clay-btn flex items-center justify-center text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors"
            >
              <X size={32} strokeWidth={3} />
            </motion.button>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Quên</span>
          </div>

          {/* Main Navigation (Mobile Only or additional controls) */}
          <div className="hidden md:flex flex-col items-center justify-center -mb-8">
            <span className="text-[10px] font-bold text-slate-300 uppercase bg-white px-2 py-1 rounded-lg border border-slate-100">Spacebar</span>
          </div>

          {/* Known Button */}
          <div className="flex flex-col items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNext(1, 'known')}
              disabled={progressMutation.isPending}
              className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-white border-2 border-slate-100 shadow-clay-btn flex items-center justify-center text-green-500 hover:bg-green-50 hover:border-green-200 transition-colors"
            >
              <Check size={32} strokeWidth={3} />
            </motion.button>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Đã thuộc</span>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="hidden md:flex fixed bottom-6 right-6 items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-white shadow-lg text-xs font-bold text-slate-400 pointer-events-none">
        <span className="flex items-center gap-1"><kbd className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">Space</kbd> Lật</span>
        <span className="w-px h-3 bg-slate-200 mx-1"></span>
        <span className="flex items-center gap-1"><kbd className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">←</kbd> Quên</span>
        <span className="w-px h-3 bg-slate-200 mx-1"></span>
        <span className="flex items-center gap-1"><kbd className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-500">→</kbd> Thuộc</span>
      </div>

    </div>
  );
}
