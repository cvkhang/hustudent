import express from 'express';
import flashcardController from '../controllers/flashcardController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public
router.get('/flashcards/public', flashcardController.getPublicSets);

// Protected
router.use(authenticate);

// Sets
router.get('/flashcards', flashcardController.getMySets);
router.post('/flashcards', flashcardController.createSet);
router.get('/flashcards/:setId', flashcardController.getSet);
router.patch('/flashcards/:setId', flashcardController.updateSet);
router.delete('/flashcards/:setId', flashcardController.deleteSet);

// Cards
router.post('/flashcards/:setId/cards', flashcardController.addCard);
router.patch('/cards/:cardId', flashcardController.updateCard);
router.delete('/cards/:cardId', flashcardController.deleteCard);

// Study mode
router.get('/flashcards/:setId/study', flashcardController.getStudyCards);
router.get('/flashcards/:setId/progress', flashcardController.getProgress);
router.post('/cards/:cardId/progress', flashcardController.updateProgress);

export default router;
