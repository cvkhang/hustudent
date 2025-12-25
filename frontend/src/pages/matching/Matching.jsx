import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Heart,
  X,
  MessageCircle,
  GraduationCap,
  Loader2,
  RefreshCw,
  BookOpen,
  Sparkles,
  Settings,
  HelpCircle,
  HandHelping,
  MapPin,
  Clock
} from 'lucide-react';
import ClayCard from '@/components/ui/ClayCard';
import ProButton from '@/components/ui/ProButton';
import SubjectManagerModal from './SubjectManagerModal';

// === API ===
const matchingAPI = {
  getSuggestions: async () => {
    const res = await api.get('/matching/suggestions');
    return res.data.data || [];
  },
  sendFriendRequest: async (userId) => {
    const res = await api.post('/friends/requests', { toUserId: userId });
    return res.data;
  }
};

// === COMPONENTS ===

/**
 * Swipeable Card Component
 */
const SwipeCard = ({ suggestion, onSwipe, index }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  // Background colors based on drag
  const bgLikeOpacity = useTransform(x, [0, 150], [0, 0.5]);
  const bgNopeOpacity = useTransform(x, [-150, 0], [0.5, 0]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      onSwipe('right'); // Like
    } else if (info.offset.x < -100) {
      onSwipe('left'); // Nope
    }
  };

  const { user: profile, commonSubjects = [], badges = [], compatibilityScore = 0 } = suggestion || { user: {} };

  return (
    <motion.div
      style={{ x, rotate, opacity, zIndex: 100 - index }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className={`absolute inset-0 bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 cursor-grab active:cursor-grabbing origin-bottom ${index === 0 ? 'top-0' : `top-${index * 2} scale-${100 - index * 5}`
        }`}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Overlay Indicators for Swipe */}
      <motion.div style={{ opacity: bgLikeOpacity }} className="absolute inset-0 bg-green-500 z-50 pointer-events-none flex items-center justify-center">
        <Heart size={100} className="text-white drop-shadow-lg" fill="currentColor" />
      </motion.div>
      <motion.div style={{ opacity: bgNopeOpacity }} className="absolute inset-0 bg-red-500 z-50 pointer-events-none flex items-center justify-center">
        <X size={100} className="text-white drop-shadow-lg" />
      </motion.div>

      {/* --- Card Content --- */}

      {/* Image / Avatar Header */}
      <div className="h-[55%] relative w-full bg-slate-200">
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.full_name}
            className="w-full h-full object-cover pointer-events-none select-none"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-7xl font-black select-none">
            {profile?.full_name?.charAt(0) || '?'}
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/80" />

        {/* Basic Info on Image */}
        <div className="absolute bottom-5 left-5 right-5 text-white select-none">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-3xl font-black drop-shadow-md truncate">{profile?.full_name}</h2>
            {compatibilityScore > 0 && (
              <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold shadow-sm border border-green-400">
                {compatibilityScore}% Match
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 opacity-95">
            <p className="font-medium flex items-center gap-1.5 text-sm">
              <GraduationCap size={16} className="text-yellow-300" />
              {profile?.major || profile?.university || 'HUST'}
            </p>
            {profile?.start_year && (
              <p className="font-medium flex items-center gap-1.5 text-sm text-slate-200">
                <Clock size={14} /> K{String(profile.start_year).slice(-2)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Details Scrollable Section */}
      <div className="h-[45%] bg-white p-5 flex flex-col gap-4 overflow-y-auto no-scrollbar select-none pb-24">

        {/* Summary Chips */}
        <div className="flex flex-wrap gap-2">
          {badges.map((badge, idx) => {
            // Handle both old string format and new object format
            const isObj = typeof badge === 'object';
            const text = isObj ? badge.text : badge;
            const type = isObj ? badge.type : 'default';

            let colorClass = "bg-slate-100 text-slate-700";
            let Icon = Sparkles;

            switch (type) {
              case 'help_me': // Họ giúp mình
                colorClass = "bg-blue-100 text-blue-700 border border-blue-200";
                Icon = HandHelping;
                break;
              case 'help_them': // Mình giúp họ
                colorClass = "bg-orange-100 text-orange-700 border border-orange-200";
                Icon = HelpCircle;
                break;
              case 'both_need': // Cùng cần
                colorClass = "bg-purple-100 text-purple-700 border border-purple-200";
                Icon = BookOpen;
                break;
              case 'same_level': // Cùng trình độ
                colorClass = "bg-green-100 text-green-700 border border-green-200";
                Icon = GraduationCap;
                break;
              case 'same_campus':
                colorClass = "bg-rose-100 text-rose-700 border border-rose-200";
                Icon = MapPin;
                break;
              // Fallback for old string matches (maintain backward compatibility if API returns old data)
              default:
                if (text.includes("help you")) { colorClass = "bg-blue-100 text-blue-700 border border-blue-200"; Icon = HandHelping; }
                else if (text.includes("your help")) { colorClass = "bg-orange-100 text-orange-700 border border-orange-200"; Icon = HelpCircle; }
                else if (text.includes("Same")) { colorClass = "bg-purple-100 text-purple-700 border border-purple-200"; Icon = MapPin; }
            }

            return (
              <span key={idx} className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 ${colorClass}`}>
                <Icon size={12} /> {text}
              </span>
            );
          })}
        </div>

        {/* Common Subjects */}
        {commonSubjects.length > 0 ? (
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen size={12} /> Cùng học môn này
            </h4>
            <div className="flex flex-wrap gap-2">
              {commonSubjects.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 w-full sm:w-auto">
                  <div className="w-8 h-8 rounded-lg bg-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700 shrink-0">
                    {item.code?.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{item.name}</p>
                    <p className="text-[10px] text-indigo-500 font-mono">{item.code}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center text-slate-500 text-sm italic">
            Chưa có môn học chung cụ thể, nhưng có thể cùng chuyên ngành!
          </div>
        )}
      </div>
    </motion.div>
  );
};


// === MAIN PAGE ===

export default function Matching() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [removedIds, setRemovedIds] = useState([]); // Local state to track swiped users

  // Fetch Suggestions
  const { data: suggestions = [], isLoading, refetch } = useQuery({
    queryKey: ['matching-suggestions'],
    queryFn: matchingAPI.getSuggestions,
    enabled: !!user,
    staleTime: 5 * 60 * 1000 // Cache 5 mins
  });

  // Calculate visible suggestions (exclude swiped ones)
  const visibleSuggestions = suggestions.filter(s => s?.user?.id && !removedIds.includes(s.user.id));
  const currentSuggestion = visibleSuggestions[0];

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: matchingAPI.sendFriendRequest,
    onSuccess: (_, userId) => {
      addToast('Đã gửi lời mời kết bạn!', 'success');
    },
    onError: () => {
      addToast('Có lỗi xảy ra, thử lại sau', 'error');
    }
  });

  const handleSwipe = async (direction, suggestion) => {
    const userId = suggestion.user.id;

    // Remove locally immediately for smooth UI
    setRemovedIds(prev => [...prev, userId]);

    if (direction === 'right') {
      sendRequestMutation.mutate(userId);
    }
    // 'left' just skips (no API call needed usually, or log it)
  };

  const handleManualSwipe = (direction) => {
    if (currentSuggestion) {
      handleSwipe(direction, currentSuggestion);
    }
  };

  const handleMessage = () => {
    if (currentSuggestion?.user) {
      navigate('/messages', { state: { selectedUser: currentSuggestion.user } });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
        <p className="text-slate-500 font-medium animate-pulse">Đang tìm bạn học phù hợp...</p>
      </div>
    );
  }

  // --- EMPTY STATE ---
  if (!currentSuggestion) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center p-4">
        <ClayCard className="max-w-md w-full py-12 px-6 flex flex-col items-center text-center relative overflow-hidden">
          {/* Decorative background blobs */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-50" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-100 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 opacity-50" />

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner rotate-3">
              <Sparkles size={40} className="text-indigo-400" />
            </div>

            <h3 className="text-2xl font-black text-slate-800 mb-2">Đã hết gợi ý!</h3>
            <p className="text-slate-500 mb-8 max-w-[280px]">
              Hãy thêm môn học mới hoặc quay lại sau để tìm thêm bạn bè match với profile của bạn.
            </p>

            <div className="flex flex-col gap-3 w-full max-w-xs">
              <ProButton
                variant="primary"
                size="lg"
                icon={BookOpen}
                onClick={() => setIsSubjectModalOpen(true)}
                className="w-full shadow-lg shadow-indigo-200"
              >
                Thêm môn học
              </ProButton>
              <ProButton
                variant="ghost"
                icon={RefreshCw}
                onClick={() => {
                  setRemovedIds([]);
                  refetch();
                }}
                className="w-full"
              >
                Tải lại danh sách
              </ProButton>
            </div>
          </div>
        </ClayCard>

        <SubjectManagerModal
          isOpen={isSubjectModalOpen}
          onClose={() => {
            setIsSubjectModalOpen(false);
            setRemovedIds([]); // Reset seen list to potentially show new matches
            refetch();
          }}
        />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-220px)] flex flex-col max-w-md mx-auto relative p-8 overflow-visible touch-none overscroll-none">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 shrink-0 px-2">
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Khám phá
          </h1>
          <p className="text-sm font-medium text-slate-400">Tìm bạn học cùng HUST</p>
        </div>

        <button
          onClick={() => setIsSubjectModalOpen(true)}
          className="w-10 h-10 bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-100 transition-all hover:rotate-90 active:scale-95"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Card Stack Area */}
      <div className="flex-1 w-full relative min-h-0">
        <AnimatePresence>
          {visibleSuggestions.slice(0, 2).map((suggestion, index) => (
            <SwipeCard
              key={suggestion.user.id}
              suggestion={suggestion}
              index={index}
              onSwipe={(dir) => handleSwipe(dir, suggestion)}
            />
          )).reverse()}
        </AnimatePresence>
        {/* Note: reversed to make sure index 0 is on top */}
      </div>

      {/* Manual Controls (Buttons) */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 z-[200] pointer-events-none">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleManualSwipe('left')}
          className="pointer-events-auto w-16 h-16 bg-white rounded-full shadow-xl shadow-slate-200/50 text-slate-400 border border-slate-100 flex items-center justify-center hover:text-red-500 hover:border-red-100 transition-colors backdrop-blur-sm bg-white/90"
        >
          <X size={32} strokeWidth={2.5} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleMessage}
          className="pointer-events-auto w-12 h-12 bg-white rounded-full shadow-lg shadow-indigo-100 text-indigo-500 border border-indigo-50 flex items-center justify-center -mt-8 backdrop-blur-sm bg-white/90"
        >
          <MessageCircle size={22} strokeWidth={2.5} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => handleManualSwipe('right')}
          className="pointer-events-auto w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full shadow-xl shadow-indigo-500/30 flex items-center justify-center border-4 border-white"
        >
          <Heart size={32} fill="currentColor" strokeWidth={0} />
        </motion.button>
      </div>

      {/* Modals */}
      <SubjectManagerModal
        isOpen={isSubjectModalOpen}
        onClose={() => {
          setIsSubjectModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
