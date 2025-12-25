import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ClayCard from '@/components/ui/ClayCard';
import ProButton from '@/components/ui/ProButton';
import {
  BookOpen,
  Brain,
  FileText,
  Users,
  Target,
  Flame,
  ArrowRight,
  Sparkles,
  Search,
  HelpCircle,
  Zap,
  Layout,
  MessageSquare
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [suggestion, setSuggestion] = useState(null);
  const [stats, setStats] = useState({ total_activities: 0 });
  const [activeFeature, setActiveFeature] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [flashcardsRes, quizzesRes, questionsRes, postsRes, groupsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/flashcards`, config),
        axios.get(`${API_BASE_URL}/quizzes`, config),
        axios.get(`${API_BASE_URL}/questions`, config),
        axios.get(`${API_BASE_URL}/posts`, config),
        axios.get(`${API_BASE_URL}/groups`, config)
      ]);

      const flashcards = flashcardsRes.data || [];
      const quizzes = quizzesRes.data || [];

      const activityScore =
        flashcards.length * 10 +
        quizzes.length * 20 +
        (questionsRes.data?.length || 0) * 5 +
        (postsRes.data?.posts?.length || 0) * 15 +
        (groupsRes.data?.length || 0) * 10;

      setStats({ total_activities: activityScore });

      if (flashcards.length > 0) {
        setSuggestion({
          type: 'flashcard',
          title: flashcards[0].title,
          id: flashcards[0].id,
          subtitle: 'Tiếp tục học bộ thẻ này'
        });
      } else if (quizzes.length > 0) {
        setSuggestion({
          type: 'quiz',
          title: quizzes[0].title,
          id: quizzes[0].id,
          subtitle: 'Thử thách kiến thức ngay'
        });
      } else {
        setSuggestion({
          type: 'explore',
          title: 'Khám phá HUSTudent',
          subtitle: 'Bắt đầu hành trình của bạn'
        });
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setSuggestion({
        type: 'explore',
        title: 'Chào mừng trở lại',
        subtitle: 'Sẵn sàng học tập chưa?'
      });
    } finally {
      setLoading(false);
    }
  };

  // Memoize hero click handler
  const handleHeroClick = useCallback(() => {
    if (activeFeature) {
      navigate(activeFeature.path);
    } else {
      if (suggestion?.type === 'flashcard') navigate(`/flashcards/${suggestion.id}`);
      else if (suggestion?.type === 'quiz') navigate(`/quizzes/${suggestion.id}/take`);
      else navigate('/flashcards');
    }
  }, [activeFeature, suggestion, navigate]);

  // Memoize dock items configuration
  const dockItems = useMemo(() => [
    {
      id: 'flashcard',
      icon: Zap, // Matched with Sidebar
      label: 'Flashcards',
      path: '/flashcards',
      color: 'from-blue-400 to-indigo-500',
      heroTitle: 'Học từ vựng',
      heroSubtitle: 'Ôn tập thẻ ghi nhớ thông minh'
    },
    {
      id: 'quiz',
      icon: BookOpen, // Matched with Sidebar
      label: 'Quizzes',
      path: '/quizzes',
      color: 'from-purple-400 to-violet-500',
      heroTitle: 'Trắc nghiệm',
      heroSubtitle: 'Kiểm tra kiến thức của bạn'
    },
    {
      id: 'posts',
      icon: FileText,
      label: 'Tài liệu',
      path: '/posts',
      color: 'from-teal-400 to-emerald-500',
      heroTitle: 'Tài liệu & Bài viết',
      heroSubtitle: 'Chia sẻ kiến thức cộng đồng'
    },
    {
      id: 'questions',
      icon: HelpCircle,
      label: 'Hỏi đáp',
      path: '/questions',
      color: 'from-orange-400 to-amber-500',
      heroTitle: 'Hỏi đáp Q&A',
      heroSubtitle: 'Giải đáp thắc mắc cùng chuyên gia'
    },
    {
      id: 'groups',
      icon: Users,
      label: 'Nhóm',
      path: '/groups',
      color: 'from-rose-400 to-pink-500',
      heroTitle: 'Nhóm học tập',
      heroSubtitle: 'Học nhóm hiệu quả hơn'
    },
    {
      id: 'matching',
      icon: Search, // Matched with Sidebar
      label: 'Tìm bạn',
      path: '/matching',
      color: 'from-cyan-400 to-blue-500',
      heroTitle: 'Matching',
      heroSubtitle: 'Tìm bạn học cùng chí hướng'
    },
  ], []);

  // Memoize current hero calculation
  const currentHero = useMemo(() => activeFeature
    ? {
      title: activeFeature.heroTitle,
      subtitle: activeFeature.heroSubtitle,
      icon: activeFeature.icon,
      color: activeFeature.color,
    }
    : {
      title: suggestion?.title,
      subtitle: suggestion?.subtitle,
      icon: suggestion?.type === 'quiz' ? Brain : (suggestion?.type === 'explore' ? Sparkles : BookOpen),
      color: suggestion?.type === 'quiz' ? 'from-purple-400 to-pink-500' : 'from-blue-400 to-indigo-500',
    }, [activeFeature, suggestion]);

  return (
    <div className="h-[calc(100vh-8rem)] overflow-hidden flex flex-col font-sans relative space-y-6">

      {/* 1. Header Section - Matches ProfilePage Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2 pt-2">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Layout className="text-indigo-500" size={24} />
            Tổng quan
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Chào {user?.full_name?.split(' ').pop()}, chúc bạn một ngày học tập hiệu quả!
          </p>
        </div>

        {/* Activity Score as a Badge/Stat */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="p-1.5 rounded-lg bg-orange-50 text-orange-500">
            <Flame size={18} className="animate-pulse" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-800 leading-none">{loading ? '-' : stats.total_activities}</p>
            <p className="text-xs font-bold text-slate-400 uppercase">Điểm hoạt động</p>
          </div>
        </div>
      </div>

      {/* 2. Hero Section - Styled exactly like Profile Cards */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-4">
        <ClayCard
          onClick={handleHeroClick}
          className={`
                w-full max-w-2xl aspect-[16/9] md:aspect-[2/1] 
                flex flex-col items-center justify-center text-center p-8 
                group cursor-pointer 
                transition-all duration-300
                ${activeFeature ? 'scale-[1.02] shadow-clay-card-hover' : 'hover:scale-[1.01]'}
            `}
        >
          {/* Icon Container - Matches ProfilePage StatCard style */}
          <div className={`
                p-5 rounded-3xl bg-gradient-to-br ${currentHero.color} text-white shadow-xl mb-6
                transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
            `}>
            <currentHero.icon size={48} />
          </div>

          {/* Typography - Matches ProfilePage Section Headers */}
          <h2 className="text-3xl font-black text-slate-800 mb-2 transition-all">
            {loading ? 'Đang tải...' : currentHero.title}
          </h2>
          <p className="text-slate-500 font-bold mb-8 max-w-md">
            {loading ? '...' : currentHero.subtitle}
          </p>

          {/* Button - Uses ProButton standard */}
          {/* Button - Uses ProButton standard */}
          <ProButton
            onClick={(e) => {
              e.stopPropagation();
              handleHeroClick();
            }}
            variant="primary"
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
            className="transform transition-transform group-hover:scale-105"
          >
            {activeFeature ? 'Truy cập ngay' : 'Tiếp tục'}
          </ProButton>
        </ClayCard>
      </div>

      {/* 3. Dock Section - Synchronized Style */}
      <div className="w-full max-w-3xl mx-auto px-4 pb-4">
        <ClayCard className="!p-3 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          {dockItems.map((item) => {
            const isActive = activeFeature?.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setActiveFeature(item)}
                className={`
                        flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-2xl transition-all duration-300 min-w-[70px]
                        ${isActive ? 'bg-white shadow-clay-card scale-110 -translate-y-2' : 'hover:bg-white/50 hover:scale-105'}
                     `}
              >
                {/* 
                   Icon Container - STRICTLY MATCHES ProfilePage StatCard: 
                   p-3 rounded-2xl bg-gradient... text-white shadow-lg 
                */}
                <div className={`
                        p-3 rounded-2xl shadow-lg transition-all duration-300
                        bg-gradient-to-br ${item.color} text-white
                        ${isActive ? 'ring-4 ring-primary-100' : 'opacity-90 hover:opacity-100'}
                     `}>
                  <item.icon size={24} />
                </div>

                {/* Label - Keep consistent font */}
                <span className={`
                        text-[11px] font-black uppercase tracking-wide transition-colors
                        ${isActive ? 'text-slate-800' : 'text-slate-500'}
                     `}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </ClayCard>
      </div>

    </div>
  );
}
