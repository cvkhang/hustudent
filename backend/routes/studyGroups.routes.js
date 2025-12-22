import express from 'express';
import { getStudyGroups, createGroup, joinGroup, leaveGroup, getMyGroups, getGroupDetail, createSession, getSessionsByGroup, rsvpToSession } from '../controllers/studyGroups.controller.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Study groups routes
router.get('/', getStudyGroups);
router.post('/create', requireAuth, createGroup);
router.post('/:groupId/join', requireAuth, joinGroup);
router.post('/:groupId/leave', requireAuth, leaveGroup);
router.get('/my', requireAuth, getMyGroups);
router.get('/:groupId', getGroupDetail);
router.post('/:groupId/sessions', requireAuth, createSession);
router.get('/:groupId/sessions', getSessionsByGroup);
router.post('/sessions/:sessionId/rsvp', requireAuth, rsvpToSession);

export default router;