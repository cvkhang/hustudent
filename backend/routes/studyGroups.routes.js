import express from 'express';
import { getStudyGroups, createGroup, joinGroup, leaveGroup, getMyGroups, getGroupDetail } from '../controllers/studyGroups.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Study groups routes
router.get('/', getStudyGroups);
router.post('/create', requireAuth, createGroup);
router.post('/:groupId/join', requireAuth, joinGroup);
router.post('/:groupId/leave', requireAuth, leaveGroup);
router.get('/my', requireAuth, getMyGroups);
router.get('/:groupId', getGroupDetail);

export default router;