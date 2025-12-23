import { Op } from 'sequelize';
import { Quiz, QuizQuestion, QuizAttempt, User } from '../models/index.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

// ==========================================
// QUIZ CRUD
// ==========================================
export const createQuiz = async (userId, { title, description, tags, visibility, timeLimit }) => {
  const quiz = await Quiz.create({
    owner_id: userId,
    title,
    description,
    tags: tags || [],
    visibility: visibility || 'private',
    time_limit: timeLimit
  });
  return quiz;
};

export const getQuizzes = async (userId) => {
  return Quiz.findAll({
    where: { owner_id: userId },
    include: [{ model: User, as: 'owner', attributes: ['id', 'full_name'] }],
    order: [['updated_at', 'DESC']]
  });
};

export const getPublicQuizzes = async ({ q, tags } = {}) => {
  const where = { visibility: 'public' };
  if (q) where.title = { [Op.iLike]: `%${q}%` };
  if (tags) where.tags = { [Op.overlap]: tags };

  return Quiz.findAll({
    where,
    include: [{ model: User, as: 'owner', attributes: ['id', 'full_name'] }],
    order: [['attempt_count', 'DESC']],
    limit: 50
  });
};

export const getQuizById = async (quizId, userId, includeAnswers = false) => {
  const quiz = await Quiz.findByPk(quizId, {
    include: [
      { model: User, as: 'owner', attributes: ['id', 'full_name'] },
      {
        model: QuizQuestion,
        as: 'questions',
        attributes: includeAnswers
          ? undefined
          : { exclude: ['correct_answer', 'explanation'] },
        order: [['position', 'ASC']]
      }
    ]
  });

  if (!quiz) throw new AppError(ErrorCodes.NOT_FOUND, 'Quiz not found');

  if (quiz.visibility !== 'public' && quiz.owner_id !== userId) {
    throw new AppError(ErrorCodes.FORBIDDEN, 'Cannot access this quiz');
  }

  return quiz;
};

export const updateQuiz = async (userId, quizId, updates) => {
  const quiz = await Quiz.findByPk(quizId);
  if (!quiz) throw new AppError(ErrorCodes.NOT_FOUND, 'Quiz not found');
  if (quiz.owner_id !== userId) throw new AppError(ErrorCodes.FORBIDDEN, 'Not your quiz');

  await quiz.update(updates);
  return quiz;
};

export const deleteQuiz = async (userId, quizId) => {
  const quiz = await Quiz.findByPk(quizId);
  if (!quiz) throw new AppError(ErrorCodes.NOT_FOUND, 'Quiz not found');
  if (quiz.owner_id !== userId) throw new AppError(ErrorCodes.FORBIDDEN, 'Not your quiz');

  await quiz.destroy();
  return { message: 'Quiz deleted' };
};

// ==========================================
// QUIZ QUESTIONS
// ==========================================
export const addQuestion = async (userId, quizId, { questionType, questionText, options, correctAnswer, explanation, points }) => {
  const quiz = await Quiz.findByPk(quizId);
  if (!quiz) throw new AppError(ErrorCodes.NOT_FOUND, 'Quiz not found');
  if (quiz.owner_id !== userId) throw new AppError(ErrorCodes.FORBIDDEN, 'Not your quiz');

  const position = await QuizQuestion.count({ where: { quiz_id: quizId } });

  const question = await QuizQuestion.create({
    quiz_id: quizId,
    question_type: questionType || 'mcq',
    question_text: questionText,
    options: options || [],
    correct_answer: correctAnswer,
    explanation,
    points: points || 1,
    position
  });

  await quiz.increment('question_count');
  return question;
};

export const updateQuestion = async (userId, questionId, updates) => {
  const question = await QuizQuestion.findByPk(questionId, {
    include: [{ model: Quiz, as: 'quiz' }]
  });
  if (!question) throw new AppError(ErrorCodes.NOT_FOUND, 'Question not found');
  if (question.quiz.owner_id !== userId) throw new AppError(ErrorCodes.FORBIDDEN, 'Not your question');

  await question.update(updates);
  return question;
};

export const deleteQuestion = async (userId, questionId) => {
  const question = await QuizQuestion.findByPk(questionId, {
    include: [{ model: Quiz, as: 'quiz' }]
  });
  if (!question) throw new AppError(ErrorCodes.NOT_FOUND, 'Question not found');
  if (question.quiz.owner_id !== userId) throw new AppError(ErrorCodes.FORBIDDEN, 'Not your question');

  await question.quiz.decrement('question_count');
  await question.destroy();
  return { message: 'Question deleted' };
};

// ==========================================
// QUIZ ATTEMPTS
// ==========================================
export const startAttempt = async (userId, quizId) => {
  const quiz = await getQuizById(quizId, userId);

  // Check for in-progress attempt
  const existing = await QuizAttempt.findOne({
    where: { quiz_id: quizId, user_id: userId, status: 'in_progress' }
  });
  if (existing) return existing;

  const attempt = await QuizAttempt.create({
    quiz_id: quizId,
    user_id: userId,
    max_score: quiz.questions.reduce((sum, q) => sum + q.points, 0)
  });

  await quiz.increment('attempt_count');
  return attempt;
};

export const submitAnswer = async (userId, attemptId, { questionId, answer }) => {
  const attempt = await QuizAttempt.findByPk(attemptId);
  if (!attempt) throw new AppError(ErrorCodes.NOT_FOUND, 'Attempt not found');
  if (attempt.user_id !== userId) throw new AppError(ErrorCodes.FORBIDDEN, 'Not your attempt');
  if (attempt.status !== 'in_progress') throw new AppError(ErrorCodes.CONFLICT, 'Attempt already completed');

  const answers = { ...attempt.answers };
  answers[questionId] = answer;
  await attempt.update({ answers });

  return attempt;
};

export const completeAttempt = async (userId, attemptId) => {
  const attempt = await QuizAttempt.findByPk(attemptId);
  if (!attempt) throw new AppError(ErrorCodes.NOT_FOUND, 'Attempt not found');
  if (attempt.user_id !== userId) throw new AppError(ErrorCodes.FORBIDDEN, 'Not your attempt');
  if (attempt.status !== 'in_progress') throw new AppError(ErrorCodes.CONFLICT, 'Already completed');

  // Calculate score
  const questions = await QuizQuestion.findAll({ where: { quiz_id: attempt.quiz_id } });
  let score = 0;

  questions.forEach(q => {
    const userAnswer = attempt.answers[q.id];

    // Normalize comparison
    const isEqual = (a, b) => {
      if (a === undefined || a === null || b === undefined || b === null) return false;
      return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
    };

    if (isEqual(userAnswer, q.correct_answer)) {
      score += q.points;
    }
  });

  await attempt.update({
    score,
    status: 'completed',
    completed_at: new Date()
  });

  return attempt;
};

export const getAttemptResults = async (userId, attemptId) => {
  const attempt = await QuizAttempt.findByPk(attemptId, {
    include: [{ model: Quiz, as: 'quiz', include: [{ model: QuizQuestion, as: 'questions' }] }]
  });

  if (!attempt) throw new AppError(ErrorCodes.NOT_FOUND, 'Attempt not found');
  if (attempt.user_id !== userId && attempt.quiz.owner_id !== userId) {
    throw new AppError(ErrorCodes.FORBIDDEN, 'Cannot view this attempt');
  }

  // Add correct/incorrect info to each question
  const results = attempt.quiz.questions.map(q => ({
    question: q.question_text,
    userAnswer: attempt.answers[q.id] || null,
    correctAnswer: q.correct_answer,
    isCorrect: (() => {
      const u = attempt.answers[q.id];
      const c = q.correct_answer;
      if (u === undefined || u === null || c === undefined || c === null) return false;
      return String(u).trim().toLowerCase() === String(c).trim().toLowerCase();
    })(),
    explanation: q.explanation,
    points: q.points
  }));

  return {
    attempt,
    results,
    score: attempt.score,
    maxScore: attempt.max_score,
    percentage: Math.round((attempt.score / attempt.max_score) * 100)
  };
};

export const getMyAttempts = async (userId, quizId) => {
  return QuizAttempt.findAll({
    where: { user_id: userId, quiz_id: quizId },
    order: [['created_at', 'DESC']]
  });
};

export const getCategories = async () => {
  // Aggregate distinct tags and their counts
  const quizzes = await Quiz.findAll({
    attributes: ['tags'],
    where: { visibility: 'public' }
  });

  const tagCounts = {};
  quizzes.forEach(q => {
    if (q.tags && Array.isArray(q.tags)) {
      q.tags.forEach(tag => {
        const normalized = tag.toLowerCase().trim();
        tagCounts[normalized] = (tagCounts[normalized] || 0) + 1;
      });
    }
  });

  return Object.entries(tagCounts).map(([name, count]) => ({
    id: name,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    count
  }));
};

export default {
  createQuiz, getQuizzes, getPublicQuizzes, getQuizById, updateQuiz, deleteQuiz,
  addQuestion, updateQuestion, deleteQuestion,
  startAttempt, submitAnswer, completeAttempt, getAttemptResults, getMyAttempts,
  getCategories
};
