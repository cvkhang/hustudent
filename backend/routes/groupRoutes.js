import express from 'express';
import { getStudyGroups, createGroup, joinGroup, leaveGroup, getMyGroups, getGroupDetail, createSession, getSessionsByGroup, rsvpToSession } from '../controllers/groupController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Study groups routes
router.get('/', getStudyGroups);
router.post('/create', authenticate, createGroup);
router.post('/:groupId/join', authenticate, joinGroup);
router.post('/:groupId/leave', authenticate, leaveGroup);
router.get('/my', authenticate, getMyGroups);
router.get('/:groupId', getGroupDetail);
router.post('/:groupId/sessions', authenticate, createSession);
router.get('/:groupId/sessions', getSessionsByGroup);
router.post('/sessions/:sessionId/rsvp', authenticate, rsvpToSession);

export default router;