import express from 'express';
const router = express.Router();
import multer from 'multer';
import questionController from '../controllers/questionController.js';
import { authenticate } from '../middleware/auth.js';

const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.post('/', upload.single('file'), questionController.createQuestion);
router.get('/', questionController.getQuestions);
router.get('/:questionId', questionController.getQuestion);
router.patch('/:questionId', questionController.updateQuestion);
router.delete('/:questionId', questionController.deleteQuestion);
router.post('/:questionId/answers', questionController.createAnswer);
router.post('/:questionId/best-answer', questionController.setBestAnswer);

export default router;
