import express from 'express';
import * as quizController from '../controllers/quizController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public
router.get('/quizzes/public', quizController.getPublicQuizzes);

// Protected
router.use(authenticate);

// Quizzes
router.get('/quizzes', quizController.getMyQuizzes);
router.post('/quizzes', quizController.createQuiz);
router.get('/quizzes/categories', quizController.getCategories);
router.get('/quizzes/:quizId', quizController.getQuiz);
router.patch('/quizzes/:quizId', quizController.updateQuiz);
router.delete('/quizzes/:quizId', quizController.deleteQuiz);

// Questions
router.post('/quizzes/:quizId/questions', quizController.addQuestion);
router.patch('/quiz-questions/:questionId', quizController.updateQuestion);
router.delete('/quiz-questions/:questionId', quizController.deleteQuestion);

// Attempts
router.post('/quizzes/:quizId/attempt', quizController.startAttempt);
router.get('/quizzes/:quizId/my-attempts', quizController.getMyAttempts);
router.post('/quiz-attempts/:attemptId/answer', quizController.submitAnswer);
router.post('/quiz-attempts/:attemptId/complete', quizController.completeAttempt);
router.get('/quiz-attempts/:attemptId/results', quizController.getResults);

export default router;
