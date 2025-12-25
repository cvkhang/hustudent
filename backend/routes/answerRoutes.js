import express from 'express';
import questionController from '../controllers/questionController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.patch('/:answerId', questionController.updateAnswer);
router.delete('/:answerId', questionController.deleteAnswer);
router.post('/:answerId/vote', questionController.voteAnswer);

export default router;
