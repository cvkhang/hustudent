import quizService from '../services/quizService.js';

// Quiz CRUD
export const createQuiz = async (req, res, next) => {
  try {
    const quiz = await quizService.createQuiz(req.userId, req.body);
    res.status(201).json({ data: quiz });
  } catch (e) { next(e); }
};

export const getMyQuizzes = async (req, res, next) => {
  try {
    const quizzes = await quizService.getQuizzes(req.userId);
    res.json({ data: quizzes });
  } catch (e) { next(e); }
};

export const getPublicQuizzes = async (req, res, next) => {
  try {
    const quizzes = await quizService.getPublicQuizzes(req.query);
    res.json({ data: quizzes });
  } catch (e) { next(e); }
};

export const getQuiz = async (req, res, next) => {
  try {
    const includeAnswers = req.query.includeAnswers === 'true';
    const quiz = await quizService.getQuizById(req.params.quizId, req.userId, includeAnswers);
    res.json({ data: quiz });
  } catch (e) { next(e); }
};

export const updateQuiz = async (req, res, next) => {
  try {
    const quiz = await quizService.updateQuiz(req.userId, req.params.quizId, req.body);
    res.json({ data: quiz });
  } catch (e) { next(e); }
};

export const deleteQuiz = async (req, res, next) => {
  try {
    const result = await quizService.deleteQuiz(req.userId, req.params.quizId);
    res.json({ data: result });
  } catch (e) { next(e); }
};

// Questions
export const addQuestion = async (req, res, next) => {
  try {
    const question = await quizService.addQuestion(req.userId, req.params.quizId, req.body);
    res.status(201).json({ data: question });
  } catch (e) { next(e); }
};

export const updateQuestion = async (req, res, next) => {
  try {
    const question = await quizService.updateQuestion(req.userId, req.params.questionId, req.body);
    res.json({ data: question });
  } catch (e) { next(e); }
};

export const deleteQuestion = async (req, res, next) => {
  try {
    const result = await quizService.deleteQuestion(req.userId, req.params.questionId);
    res.json({ data: result });
  } catch (e) { next(e); }
};

// Attempts
export const startAttempt = async (req, res, next) => {
  try {
    const attempt = await quizService.startAttempt(req.userId, req.params.quizId);
    res.status(201).json({ data: attempt });
  } catch (e) { next(e); }
};

export const submitAnswer = async (req, res, next) => {
  try {
    const attempt = await quizService.submitAnswer(req.userId, req.params.attemptId, req.body);
    res.json({ data: attempt });
  } catch (e) { next(e); }
};

export const completeAttempt = async (req, res, next) => {
  try {
    const attempt = await quizService.completeAttempt(req.userId, req.params.attemptId);
    res.json({ data: attempt });
  } catch (e) { next(e); }
};

export const getResults = async (req, res, next) => {
  try {
    const results = await quizService.getAttemptResults(req.userId, req.params.attemptId);
    res.json({ data: results });
  } catch (e) { next(e); }
};

export const getMyAttempts = async (req, res, next) => {
  try {
    const attempts = await quizService.getMyAttempts(req.userId, req.params.quizId);
    res.json({ data: attempts });
  } catch (e) { next(e); }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await quizService.getCategories();
    res.json({ data: categories });
  } catch (e) { next(e); }
};

export default {
  createQuiz, getMyQuizzes, getPublicQuizzes, getQuiz, updateQuiz, deleteQuiz,
  addQuestion, updateQuestion, deleteQuestion,
  startAttempt, submitAnswer, completeAttempt, getResults, getMyAttempts,
  getCategories
};
