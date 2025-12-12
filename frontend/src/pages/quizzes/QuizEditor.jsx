import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  CheckCircle2,
  ListOrdered,
  Loader2,
  LayoutList,
  Eye,
  Trophy,
  HelpCircle,
  Copy,
  Table,
  AlignLeft,
  Edit2,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  ListChecks,
  ToggleLeft
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import ProButton from '@/components/ui/ProButton';
import ClayCard from '@/components/ui/ClayCard';

// API Wrappers
const fetchQuiz = async (id) => {
  const res = await api.get(`/quizzes/${id}?includeAnswers=true`);
  return res.data.data;
};

const addQuestionAPI = async ({ quizId, data }) => {
  // Service layer expects camelCase arguments (questionText, questionType, etc.)
  const payload = {
    questionText: data.questionText,
    questionType: data.questionType,
    options: data.options,
    correctAnswer: data.correctAnswer,
    points: data.points,
    explanation: data.explanation
  };
  const res = await api.post(`/quizzes/${quizId}/questions`, payload);
  return res.data.data;
};

const updateQuestionAPI = async ({ questionId, data }) => {
  // Service layer passes 'updates' directly to Sequelize model, so we must use snake_case here
  // Defensive payload: sending both snake_case (model) and camelCase to ensure backend compatibility
  const payload = {
    questionText: data.questionText,
    question_text: data.questionText,
    questionType: data.questionType,
    question_type: data.questionType,
    options: data.options,
    correctAnswer: data.correctAnswer,
    correct_answer: data.correctAnswer,
    points: data.points,
    explanation: data.explanation
  };
  const res = await api.patch(`/quiz-questions/${questionId}`, payload);
  return res.data.data;
};

const deleteQuestionAPI = async (questionId) => {
  const res = await api.delete(`/quiz-questions/${questionId}`);
  return res.data;
};

// Helper for CSV/TSV Import
const parseImportData = (text) => {
  const rows = text.trim().split('\n');
  const questions = [];
  rows.forEach(row => {
    let cells = row.split('\t');
    if (cells.length < 2) cells = row.split(',');

    if (cells.length >= 2) {
      const qText = cells[0]?.trim();
      const correct = cells[1]?.trim();
      const options = cells.slice(2).map(c => c.trim()).filter(c => c);

      if (qText) {
        questions.push({
          questionText: qText,
          questionType: 'mcq',
          correctAnswer: correct || '',
          options: options.length > 0 ? options : ['Đúng', 'Sai'],
          points: 1,
          explanation: ''
        });
      }
    }
  });
  return questions;
};

export default function QuizEditor() {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [editingId, setEditingId] = useState(null);

  const { data: quiz, isLoading } = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => fetchQuiz(quizId),
  });

  const addQuestionMutation = useMutation({
    mutationFn: addQuestionAPI,
    onSuccess: (newQuestion) => {
      queryClient.invalidateQueries(['quiz', quizId]);
      toast.success('Đã thêm câu hỏi mới');
      setEditingId(newQuestion.id);
      setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 100);
    },
    onError: () => toast.error('Lỗi khi thêm câu hỏi')
  });

  const updateQuestionMutation = useMutation({
    mutationFn: updateQuestionAPI,
    onSuccess: () => {
      queryClient.invalidateQueries(['quiz', quizId]);
      setEditingId(null);
      toast.success('Đã lưu câu hỏi');
    },
    onError: () => toast.error('Lỗi khi lưu câu hỏi')
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: deleteQuestionAPI,
    onSuccess: () => {
      queryClient.invalidateQueries(['quiz', quizId]);
      toast.success('Đã xoá câu hỏi');
    },
    onError: () => toast.error('Lỗi khi xoá câu hỏi')
  });

  const handleAddQuestion = () => {
    addQuestionMutation.mutate({
      quizId,
      data: {
        questionText: 'Câu hỏi mới',
        questionType: 'mcq',
        options: ['Lựa chọn 1', 'Lựa chọn 2', 'Lựa chọn 3', 'Lựa chọn 4'],
        correctAnswer: 'Lựa chọn 1',
        points: 1,
        explanation: ''
      }
    });
  };

  const handleDuplicate = (q) => {
    // Normalize types from potential legacy data
    let type = q.question_type;
    if (type === 'true_false') type = 'tf';
    if (type === 'text') type = 'short';

    addQuestionMutation.mutate({
      quizId,
      data: {
        questionText: `${q.question_text} (Copy)`,
        questionType: type,
        options: q.options || [],
        correctAnswer: q.correct_answer,
        points: q.points || 1,
        explanation: q.explanation || ''
      }
    });
  };

  const handleImport = async () => {
    const questions = parseImportData(importText);
    if (questions.length === 0) {
      toast.error('Không tìm thấy dữ liệu hợp lệ');
      return;
    }
    toast.info(`Đang import ${questions.length} câu hỏi...`);
    setIsImportModalOpen(false);
    for (const q of questions) {
      try { await addQuestionAPI({ quizId, data: q }); } catch (e) { console.error(e); }
    }
    queryClient.invalidateQueries(['quiz', quizId]);
    setImportText('');
    toast.success('Import thành công!');
  };

  const handleDeleteQuestion = (qId) => {
    if (confirm('Bạn có chắc chắn muốn xoá câu hỏi này?')) {
      deleteQuestionMutation.mutate(qId);
    }
  };

  if (isLoading) return (
    <div className="h-full flex items-center justify-center">
      <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header - Matches GroupList / SetDetail Standard */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/quizzes')} className="p-3 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl shadow-sm border border-slate-100 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider">Quiz Editor</span>
              <span className="text-slate-400 text-xs font-bold">{quiz.questions?.length || 0} câu hỏi</span>
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">{quiz.title}</h1>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <ProButton variant="ghost" icon={FileSpreadsheet} onClick={() => setIsImportModalOpen(true)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold shadow-sm">
            Import Excel
          </ProButton>
          <ProButton variant="ghost" icon={Eye} onClick={() => navigate(`/quizzes/${quizId}/take`)} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold shadow-sm">
            Minh hoạ
          </ProButton>
          <ProButton variant="primary" icon={Plus} onClick={handleAddQuestion} isLoading={addQuestionMutation.isPending} className="shadow-lg shadow-indigo-200">
            Thêm câu
          </ProButton>
        </div>
      </div>

      {/* Main Content Area - No custom bg, relies on global layout */}
      <div className="max-w-4xl mx-auto space-y-6">

        {(!quiz.questions || quiz.questions.length === 0) && (
          <ClayCard className="text-center py-16 flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 text-slate-300">
              <ListOrdered size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có câu hỏi nào</h3>
            <p className="text-slate-400 font-medium mb-8 max-w-sm">Tạo câu hỏi thủ công hoặc import nhanh từ file Excel của bạn.</p>
            <div className="flex justify-center gap-3">
              <ProButton onClick={() => setIsImportModalOpen(true)} variant="ghost" className="bg-slate-100 hover:bg-slate-200 text-slate-600">Import Excel</ProButton>
              <ProButton onClick={handleAddQuestion} variant="primary" icon={Plus}>Thêm câu hỏi đầu tiên</ProButton>
            </div>
          </ClayCard>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {quiz.questions?.map((q, idx) => (
            <div key={q.id}>
              {editingId === q.id ? (
                <QuestionForm
                  index={idx}
                  question={q}
                  onSubmit={(data) => updateQuestionMutation.mutate({ questionId: q.id, data })}
                  onCancel={() => setEditingId(null)}
                  onDelete={() => handleDeleteQuestion(q.id)}
                  isPending={updateQuestionMutation.isPending}
                />
              ) : (
                <QuestionItem
                  index={idx}
                  question={q}
                  onEdit={() => setEditingId(q.id)}
                  onDuplicate={() => handleDuplicate(q)}
                  onDelete={() => handleDeleteQuestion(q.id)}
                />
              )}
            </div>
          ))}
        </div>

        {quiz.questions?.length > 3 && !editingId && (
          <div className="flex justify-center pt-4">
            <button onClick={handleAddQuestion} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-dashed border-slate-300 text-slate-500 font-bold hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all w-full justify-center group">
              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-200 flex items-center justify-center transition-colors">
                <Plus size={16} className="text-slate-400 group-hover:text-indigo-600" />
              </div>
              Thêm câu hỏi tiếp theo
            </button>
          </div>
        )}
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsImportModalOpen(false)} />
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative bg-white rounded-[2rem] p-8 w-full max-w-2xl shadow-2xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">Import dữ liệu</h3>
                <p className="text-slate-500 text-sm font-bold mt-1">Hỗ trợ Excel copy/paste hoặc CSV</p>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="p-2"><Trash2 className="text-slate-300 hover:text-red-500" /></button>
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl mb-4 border border-indigo-100">
              <div className="flex gap-2 text-indigo-700 font-bold text-xs uppercase mb-2">
                <Table size={14} /> Định dạng mẫu
              </div>
              <div className="font-mono text-xs text-indigo-900/70 bg-indigo-100/50 p-2 rounded-lg">
                Câu hỏi [TAB] Đáp án đúng [TAB] Lựa chọn 1 [TAB] Lựa chọn 2 ...
              </div>
            </div>

            <textarea
              className="w-full h-64 p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none leading-relaxed transition-all focus:bg-white"
              placeholder={`Ví dụ:\nThủ đô của Việt Nam là gì?\tHà Nội\tHà Nội\tHuế\tĐà Nẵng`}
              value={importText}
              onChange={e => setImportText(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-6">
              <ProButton variant="ghost" onClick={() => setIsImportModalOpen(false)}>Huỷ</ProButton>
              <ProButton variant="primary" onClick={handleImport} disabled={!importText.trim()} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 border-none">
                Xử lý Import
              </ProButton>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// VIEW COMPONENT (Reverted to ClayCard for Layout Consistency)
// ----------------------------------------------------------------------
function QuestionItem({ index, question, onEdit, onDelete, onDuplicate }) {
  return (
    <ClayCard className="!p-5 group relative hover:border-indigo-300 transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-indigo-500" onClick={onEdit}>
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10" onClick={e => e.stopPropagation()}>
        <button onClick={(e) => { e.stopPropagation(); onDuplicate(); }} className="p-2 bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors" title="Nhân đôi">
          <Copy size={16} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-600 rounded-lg transition-colors" title="Xoá">
          <Trash2 size={16} />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600 rounded-lg transition-colors" title="Chỉnh sửa">
          <Edit2 size={16} />
        </button>
      </div>

      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 font-black flex items-center justify-center shrink-0 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
          {index + 1}
        </div>

        <div className="flex-1 min-w-0 pr-20">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${question.question_type === 'mcq' ? 'bg-blue-50 text-blue-600' :
              question.question_type === 'tf' ? 'bg-purple-50 text-purple-600' :
                'bg-orange-50 text-orange-600'
              }`}>
              {question.question_type === 'mcq' ? 'Trắc nghiệm' : question.question_type === 'tf' ? 'Đúng/Sai' : 'Tự luận'}
            </span>
            <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">
              {question.points} điểm
            </span>
          </div>

          <h3 className="text-lg font-bold text-slate-700 mb-2 line-clamp-2 group-hover:text-indigo-700 transition-colors">
            {question.question_text || <span className="text-slate-300 italic">Chưa có nội dung câu hỏi</span>}
          </h3>

          <div className="text-sm border-t border-slate-50 pt-2 mt-2 flex items-center gap-2 text-slate-500">
            <CheckCircle2 size={14} className="text-green-500" />
            <span className="font-bold text-slate-600 truncate max-w-[300px]">{question.correct_answer || '---'}</span>
            {question.options && question.options.length > 0 && question.question_type === 'mcq' && (
              <span className="text-slate-400 text-xs">(+ {question.options.length - 1} lựa chọn)</span>
            )}
          </div>
        </div>
      </div>
    </ClayCard>
  );
}

// ----------------------------------------------------------------------
// EDIT COMPONENT (Expanded Card)
// ----------------------------------------------------------------------

const QUESTION_TYPES = [
  { id: 'mcq', label: 'Trắc nghiệm (MCQ)', icon: ListChecks, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'tf', label: 'Đúng / Sai', icon: ToggleLeft, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'short', label: 'Tự luận (Điền từ)', icon: AlignLeft, color: 'text-orange-600', bg: 'bg-orange-50' }
];

function QuestionTypeSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = QUESTION_TYPES.find(t => t.id === value) || QUESTION_TYPES[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-left flex items-center justify-between transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg ${selected.bg} ${selected.color} flex items-center justify-center`}>
            <selected.icon size={18} />
          </div>
          <span className="font-bold text-slate-700 text-sm">{selected.label}</span>
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-50 overflow-hidden"
            >
              {QUESTION_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => { onChange(type.id); setIsOpen(false); }}
                  className={`w-full p-2.5 rounded-lg flex items-center gap-3 transition-colors ${value === type.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                >
                  <div className={`w-8 h-8 rounded-lg ${type.bg} ${type.color} flex items-center justify-center`}>
                    <type.icon size={18} />
                  </div>
                  <div className="text-left">
                    <div className={`text-sm font-bold ${value === type.id ? 'text-indigo-700' : 'text-slate-700'}`}>{type.label}</div>
                  </div>
                  {value === type.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuestionForm({ index, question, onSubmit, onCancel, onDelete, isPending }) {
  const [data, setData] = useState({
    questionText: question.question_text || '',
    questionType: question.question_type || 'mcq',
    options: question.options || [],
    correctAnswer: question.correct_answer || '',
    points: question.points || 1,
    explanation: question.explanation || ''
  });

  const handleSubmit = () => {
    let optionsToSave = data.options;
    if (data.questionType === 'tf') optionsToSave = ['Đúng', 'Sai'];
    if (data.questionType === 'short') optionsToSave = [];
    onSubmit({ ...data, options: optionsToSave });
  };

  const setOption = (idx, val) => {
    const newOpts = [...data.options];
    newOpts[idx] = val;
    if (data.options[idx] === data.correctAnswer) setData({ ...data, options: newOpts, correctAnswer: val });
    else setData({ ...data, options: newOpts });
  };

  return (
    <div className="py-2">
      <ClayCard className="!p-0 border-2 border-indigo-500/20 shadow-xl overflow-hidden relative ring-4 ring-indigo-50/50">
        {/* Header Section */}
        <div className="bg-indigo-50/50 p-6 border-b border-indigo-100 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-200 shrink-0">
            {index + 1}
          </div>
          <div className="flex-1">
            <h3 className="font-black text-indigo-900 text-lg mb-1">Chỉnh sửa câu hỏi</h3>
            <p className="text-xs font-bold text-indigo-400 uppercase">Đang chỉnh sửa nội dung và đáp án</p>
          </div>
          <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            <Trash2 size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 bg-white">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Loại câu hỏi</label>
              <QuestionTypeSelect
                value={data.questionType}
                onChange={(newType) => {
                  let newOptions = data.options;
                  let newCorrect = data.correctAnswer;
                  if (newType === 'tf') { newOptions = ['Đúng', 'Sai']; newCorrect = 'Đúng'; }
                  else if (newType === 'mcq' && (!data.options || data.options.length === 0)) { newOptions = ['Lựa chọn 1', 'Lựa chọn 2']; newCorrect = 'Lựa chọn 1'; }
                  setData({ ...data, questionType: newType, options: newOptions, correctAnswer: newCorrect });
                }}
              />
            </div>
            <div className="w-full sm:w-32">
              <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Điểm số</label>
              <div className="relative">
                <input
                  type="number" min="1" step="1"
                  className="w-full p-3 pl-10 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-bold text-slate-700 transition-all"
                  value={data.points}
                  onChange={(e) => setData({ ...data, points: parseInt(e.target.value) || 1 })}
                />
                <Trophy size={16} className="absolute left-3 top-3.5 text-amber-500" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Câu hỏi</label>
            <textarea
              className="w-full p-4 rounded-2xl border-2 border-slate-100 bg-white focus:border-indigo-500 focus:ring-0 outline-none text-slate-800 font-bold text-lg resize-none min-h-[100px]"
              placeholder="Nhập nội dung câu hỏi..."
              value={data.questionText}
              onChange={(e) => setData({ ...data, questionText: e.target.value })}
              autoFocus
            />
          </div>

          {/* Options Area */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <label className="block text-xs font-bold text-slate-400 mb-4 uppercase tracking-wide flex items-center gap-2">
              <CheckCircle2 size={14} />
              Cấu hình đáp án
            </label>

            {data.questionType === 'mcq' && (
              <div className="space-y-3">
                {data.options.map((opt, i) => {
                  const isCorrect = data.correctAnswer === opt;
                  return (
                    <div key={i} className="flex items-center gap-3 group">
                      <button onClick={() => setData({ ...data, correctAnswer: opt })} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${isCorrect ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-200' : 'border-slate-300 bg-white text-transparent hover:border-green-400'}`}>
                        <CheckCircle2 size={16} strokeWidth={4} />
                      </button>
                      <div className="flex-1 relative">
                        <input
                          className={`w-full px-4 py-3 rounded-xl border text-sm font-bold transition-all ${isCorrect ? 'bg-white border-green-500 ring-4 ring-green-500/10 text-slate-800' : 'bg-white border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10'}`}
                          value={opt}
                          onChange={(e) => setOption(i, e.target.value)}
                          placeholder={`Lựa chọn ${i + 1}`}
                        />
                      </div>
                      <button onClick={() => { const newOpts = data.options.filter((_, idx) => idx !== i); setData({ ...data, options: newOpts }); }} className="p-2 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg transition-colors"><Trash2 size={18} /></button>
                    </div>
                  );
                })}
                <button onClick={() => setData({ ...data, options: [...data.options, `Lựa chọn ${data.options.length + 1}`] })} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mt-2 w-fit">
                  <Plus size={16} /> Thêm lựa chọn khác
                </button>
              </div>
            )}

            {data.questionType === 'tf' && (
              <div className="flex gap-4">
                {['Đúng', 'Sai'].map(opt => (
                  <button key={opt} onClick={() => setData({ ...data, correctAnswer: opt })} className={`flex-1 py-4 rounded-xl border-2 font-black text-sm transition-all shadow-sm ${data.correctAnswer === opt ? 'border-indigo-500 bg-indigo-600 text-white shadow-indigo-200' : 'border-slate-200 bg-white text-slate-400 hover:border-indigo-200'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {data.questionType === 'short' && (
              <div className="relative">
                <div className="flex items-center w-full rounded-xl border border-slate-200 bg-white focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all overflow-hidden">
                  <div className="pl-4 pr-2 text-slate-400 flex items-center justify-center">
                    <AlignLeft size={18} />
                  </div>
                  <input
                    className="w-full py-3 pr-4 outline-none font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium border-none focus:ring-0 bg-transparent"
                    placeholder="Nhập đáp án chính xác..."
                    value={data.correctAnswer}
                    onChange={(e) => setData({ ...data, correctAnswer: e.target.value })}
                  />
                </div>
                <p className="mt-2 text-xs font-medium text-slate-400 ml-1">Hệ thống sẽ so sánh chính xác với từ khoá này.</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Giải thích đáp án</label>
            <input className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-sm font-medium text-slate-600 transition-all" placeholder="Nhập giải thích chi tiết (hiện khi xem đáp án)..." value={data.explanation} onChange={(e) => setData({ ...data, explanation: e.target.value })} />
          </div>
        </div>

        <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onCancel} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors">Huỷ bỏ</button>
          <button onClick={handleSubmit} disabled={isPending} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all">
            {isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Lưu câu hỏi
          </button>
        </div>
      </ClayCard>
    </div>
  );
}
