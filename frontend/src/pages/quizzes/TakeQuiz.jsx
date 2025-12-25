import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Flag,
  HelpCircle,
  Menu,
  Loader2,
  XCircle,
  Trophy,
  RotateCw,
  Timer,
  List,
  Check
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/api';
import ProButton from '@/components/ui/ProButton';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export default function TakeQuiz() {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // API Calls
  const fetchQuiz = async () => {
    const res = await api.get(`/quizzes/${quizId}`);
    return res.data.data;
  };

  const startAttempt = async () => {
    const res = await api.post(`/quizzes/${quizId}/attempt`);
    return res.data.data;
  };

  const submitAnswer = async ({ attemptId, questionId, answer }) => {
    const res = await api.post(`/quiz-attempts/${attemptId}/answer`, { questionId, answer });
    return res.data.data;
  };

  const completeQuiz = async (attemptId) => {
    const res = await api.post(`/quiz-attempts/${attemptId}/complete`);
    return res.data.data;
  };

  const fetchResults = async (attemptId) => {
    const res = await api.get(`/quiz-attempts/${attemptId}/results`);
    return res.data.data;
  };

  // Queries
  const { data: quiz, isLoading: isQuizLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: fetchQuiz,
    refetchOnWindowFocus: false
  });

  const { data: attempt, isLoading: isAttemptLoading } = useQuery({
    queryKey: ['quiz-attempt', quizId],
    queryFn: startAttempt,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity,
    enabled: !!quiz,
  });

  const isCompleted = attempt?.status === 'completed';

  const { data: results, isLoading: isResultsLoading } = useQuery({
    queryKey: ['quiz-results', attempt?.id],
    queryFn: () => fetchResults(attempt.id),
    enabled: isCompleted,
  });

  // Mutations
  const answerMutation = useMutation({
    mutationFn: submitAnswer,
    onError: () => toast.error('Không thể lưu câu trả lời')
  });

  const completeMutation = useMutation({
    mutationFn: () => completeQuiz(attempt.id),
    onSuccess: async (updatedAttempt) => {
      triggerBigConfetti();
      toast.success('Đã nộp bài!');
      // Set the completed attempt in cache
      queryClient.setQueryData(['quiz-attempt', quizId], updatedAttempt);
      // Fetch and set results immediately to prevent any refetch
      try {
        const resultsData = await fetchResults(updatedAttempt.id);
        queryClient.setQueryData(['quiz-results', updatedAttempt.id], resultsData);
      } catch (error) {
        console.error('Failed to fetch results:', error);
      }
    },
    onError: () => toast.error('Lỗi khi nộp bài')
  });

  // Timer Logic
  const [timeLeft, setTimeLeft] = useState(0);

  // Memoize confetti function
  const triggerBigConfetti = useCallback(() => {
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
  }, []);

  // Memoize time formatter
  const formatTime = useCallback((seconds) => {
    if (!seconds && seconds !== 0) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }, []);

  useEffect(() => {
    if (quiz && attempt && attempt.status === 'in_progress') {
      const startTime = new Date(attempt.created_at).getTime();
      const limitSeconds = quiz.time_limit || 0;

      if (limitSeconds > 0) {
        const endTime = startTime + limitSeconds * 1000;
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        setTimeLeft(remaining);

        const timer = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              completeMutation.mutate();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        return () => clearInterval(timer);
      }
    }
  }, [quiz, attempt, completeMutation]); // Fixed: added completeMutation dependency

  if (isQuizLoading || isAttemptLoading || (isCompleted && isResultsLoading && !results)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
        <p className="font-bold text-slate-400 animate-pulse">Đang tải bài thi...</p>
      </div>
    );
  }

  if (!quiz) return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-slate-100 max-w-sm w-full">
        <h3 className="text-xl font-black text-slate-800 mb-2">Không tìm thấy Quiz</h3>
        <ProButton onClick={() => navigate('/quizzes')} className="w-full mt-4">Quay lại</ProButton>
      </div>
    </div>
  );

  // --- Completed Screen (Matching FlashcardMatch style) ---
  if (isCompleted && results) {
    const { score, maxScore, percentage, results: questionResults } = results;

    return (
      <div className="w-full h-screen flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-2xl bg-white/90 backdrop-blur-xl p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white/60 text-center relative overflow-hidden my-10"
        >
          {/* Decorative Background */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-400 to-purple-500" />

          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="w-32 h-32 mx-auto bg-gradient-to-tr from-indigo-100 to-purple-200 rounded-full flex items-center justify-center mb-6 shadow-inner"
          >
            <Trophy size={64} className="text-indigo-600 drop-shadow-sm" />
          </motion.div>

          <h2 className="text-4xl font-black text-slate-800 mb-2 tracking-tight">Hoàn thành!</h2>
          <p className="text-slate-500 font-medium mb-8">
            Bạn đạt <span className="text-indigo-600 font-bold">{percentage}%</span> số điểm tối đa.
          </p>

          <div className="flex justify-center gap-4 md:gap-8 mb-8">
            <div className="text-center p-4 bg-slate-50 rounded-2xl min-w-[100px]">
              <p className="text-3xl font-black text-indigo-600 font-mono">{score}</p>
              <p className="text-xs font-bold text-slate-400 uppercase mt-1">Điểm số</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-2xl min-w-[100px]">
              <p className="text-3xl font-black text-green-500 font-mono">{maxScore}</p>
              <p className="text-xs font-bold text-slate-400 uppercase mt-1">Tổng điểm</p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-2xl min-w-[100px]">
              <p className="text-xl font-bold text-slate-700 mt-2">
                {percentage >= 80 ? 'Xuất sắc' : percentage >= 50 ? 'Đạt' : 'Cố gắng'}
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase mt-2">Đánh giá</p>
            </div>
          </div>

          <div className="space-y-4 mb-8 text-left max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {questionResults.map((q, idx) => (
              <div key={idx} className={`p-4 rounded-2xl border-l-4 ${q.isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                <h4 className="font-bold text-slate-800 text-sm mb-1">
                  Câu {idx + 1}: {q.question}
                </h4>
                <div className="text-xs space-y-1">
                  <p className={`${q.isCorrect ? 'text-green-700' : 'text-red-600'} font-medium flex items-center gap-2`}>
                    {q.isCorrect ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    Bạn chọn: {q.userAnswer || '(Bỏ trống)'}
                  </p>
                  {!q.isCorrect && (
                    <p className="text-green-700 font-medium flex items-center gap-2">
                      <CheckCircle2 size={14} />
                      Đáp án đúng: {q.correctAnswer}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ProButton variant="ghost" onClick={() => navigate('/quizzes')} className="bg-slate-100 hover:bg-slate-200 text-slate-600">
              Thoát
            </ProButton>
            <ProButton
              variant="primary"
              onClick={() => {
                queryClient.removeQueries({ queryKey: ['quiz-attempt', quizId] });
                window.location.reload();
              }}
              icon={RotateCw}
              className="shadow-lg shadow-indigo-200 bg-gradient-to-r from-indigo-500 to-purple-600 border-none"
            >
              Làm lại
            </ProButton>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- Taking Quiz Interface ---
  const question = quiz.questions[currentQuestionIdx];
  const userAnswers = attempt?.answers || {};
  const currentAnswer = userAnswers[question.id];

  return (
    <TakeQuizInterface
      quiz={quiz}
      attempt={attempt}
      question={question}
      currentQuestionIdx={currentQuestionIdx}
      setCurrentQuestionIdx={setCurrentQuestionIdx}
      timeLeft={timeLeft}
      setTimeLeft={setTimeLeft}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      onSubmit={() => completeMutation.mutate()}
      isSubmitting={completeMutation.isPending}
      onSelectAnswer={(ans) => {
        answerMutation.mutate({
          attemptId: attempt.id,
          questionId: question.id,
          answer: ans
        });
      }}
      formatTime={formatTime}
      localAnswer={currentAnswer}
    />
  );
}

// Subcomponent for Interface - Memoized to prevent re-renders
const TakeQuizInterface = React.memo(function TakeQuizInterface({
  quiz,
  question,
  currentQuestionIdx,
  setCurrentQuestionIdx,
  timeLeft,
  isSidebarOpen,
  setIsSidebarOpen,
  onSubmit,
  isSubmitting,
  onSelectAnswer,
  formatTime,
  attempt,
  localAnswer
}) {
  const [localAnswers, setLocalAnswers] = useState(attempt?.answers || {});

  useEffect(() => {
    if (attempt?.answers) {
      setLocalAnswers(prev => ({ ...prev, ...attempt.answers }));
    }
  }, [attempt]);

  const handleSelect = useCallback((val) => {
    setLocalAnswers(prev => ({ ...prev, [question.id]: val }));
    onSelectAnswer(val);
  }, [question.id, onSelectAnswer]);

  const nextQuestion = useCallback(() => {
    if (currentQuestionIdx < quiz.questions.length - 1) {
      setCurrentQuestionIdx(curr => curr + 1);
    }
  }, [currentQuestionIdx, quiz.questions.length, setCurrentQuestionIdx]);

  const prevQuestion = useCallback(() => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(curr => curr - 1);
    }
  }, [currentQuestionIdx, setCurrentQuestionIdx]);

  return (
    <div className="min-h-screen flex flex-col font-sans relative overflow-hidden">

      {/* Header */}
      <div className="w-full max-w-6xl mx-auto p-4 md:p-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/quizzes" className="group">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-slate-700 group-hover:border-slate-300 transition-all shadow-sm">
              <ArrowLeft size={20} />
            </div>
          </Link>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Flag size={12} />
              Đang làm bài
            </span>
            <h1 className="text-sm md:text-xl font-black text-slate-800 line-clamp-1 max-w-[200px] md:max-w-md">
              {quiz.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-black tabular-nums shadow-sm border ${timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-white text-slate-700 border-slate-200'}`}>
            <Timer size={18} className={timeLeft < 60 ? 'text-red-500' : 'text-slate-400'} />
            <span className="text-lg">{formatTime(timeLeft)}</span>
          </div>

          {/* Sidebar Toggle (Mobile) */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm"
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-6xl mx-auto flex gap-6 px-4 pb-8 relative">

        {/* Left: Sidebar / Question List */}
        <div className={`
          fixed inset-y-0 right-0 z-40 w-80 bg-white/90 backdrop-blur-xl shadow-2xl p-6 transform transition-transform duration-300 md:relative md:transform-none md:w-64 md:bg-transparent md:shadow-none md:p-0 flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}>
          <div className="flex items-center justify-between mb-6 md:hidden">
            <h3 className="font-bold text-slate-800">Câu hỏi</h3>
            <button onClick={() => setIsSidebarOpen(false)}><ArrowLeft className="text-slate-500" /></button>
          </div>

          <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex-1 flex flex-col h-full max-h-[Calc(100vh-140px)]">
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Tiến độ</p>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${Object.keys(localAnswers).length / quiz.questions.length * 100}%` }}
                />
              </div>
              <p className="text-right text-xs font-bold text-indigo-600 mt-1">
                {Object.keys(localAnswers).length}/{quiz.questions.length}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-4 md:grid-cols-3 gap-2 content-start pr-1 custom-scrollbar">
              {quiz.questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentQuestionIdx(i);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                      aspect-square rounded-xl font-bold text-sm flex items-center justify-center transition-all border-2
                      ${currentQuestionIdx === i
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg scale-105'
                      : localAnswers[q.id]
                        ? 'bg-indigo-50 border-indigo-100 text-indigo-600'
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                    }
                    `}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <ProButton
                variant="primary"
                className="w-full bg-slate-800 hover:bg-slate-900 shadow-lg shadow-slate-200"
                onClick={onSubmit}
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Nộp bài
              </ProButton>
            </div>
          </div>
        </div>

        {/* Right (or Center): Question Area */}
        <div className="flex-1 flex flex-col items-center">

          {/* The Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-3xl bg-white rounded-[2.5rem] p-6 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/60 relative"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold uppercase tracking-wider">
                  Câu hỏi {currentQuestionIdx + 1}
                </span>
                <div className="flex gap-2">
                  <button className="p-2 rounded-full text-slate-400 hover:bg-slate-50 transition-colors">
                    <HelpCircle size={20} />
                  </button>
                </div>
              </div>

              <h2 className="text-xl md:text-3xl font-black text-slate-800 leading-tight mb-8">
                {question.question_text}
              </h2>

              <div className="space-y-3">
                {question.question_type === 'short' ? (
                  <div className="w-full">
                    <textarea
                      value={localAnswers[question.id] || ''}
                      onChange={(e) => handleSelect(e.target.value)}
                      placeholder="Nhập câu trả lời của bạn..."
                      className="w-full p-5 rounded-2xl border-2 border-slate-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-slate-700 font-medium min-h-[150px] resize-none"
                    />
                  </div>
                ) : (
                  question.options && question.options.map((opt, idx) => {
                    const isSelected = localAnswers[question.id] === opt;
                    return (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleSelect(opt)}
                        className={`
                              w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between group relative overflow-hidden
                              ${isSelected
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md'
                            : 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50 text-slate-600'
                          }
                            `}
                      >
                        <span className="font-bold text-base md:text-lg relative z-10">{opt}</span>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-indigo-500 text-white rounded-full p-1 ml-4"
                          >
                            <CheckCircle2 size={16} strokeWidth={3} />
                          </motion.div>
                        )}
                      </motion.button>
                    );
                  })
                )}
              </div>

              {/* Navigation Buttons inside Card footer or outside? Inside feels cleaner like a wizard */}
              <div className="mt-10 flex justify-between items-center pt-6 border-t border-slate-100">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestionIdx === 0}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                >
                  <ArrowLeft size={18} /> Quay lại
                </button>

                {currentQuestionIdx === quiz.questions.length - 1 ? (
                  <ProButton
                    onClick={onSubmit}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    Hoàn thành
                  </ProButton>
                ) : (
                  <ProButton onClick={nextQuestion} icon={ChevronRight} className="flex-row-reverse bg-slate-900 hover:bg-slate-800 text-white px-8">
                    Tiếp theo
                  </ProButton>
                )}
              </div>

            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
});
