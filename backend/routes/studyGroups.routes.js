import express from 'express';
import { getStudyGroups, createGroup, joinGroup, leaveGroup } from '../controllers/studyGroups.controller.js';

const router = express.Router();

// Study groups routes
router.get('/', getStudyGroups);
router.post('/create', createGroup);
router.post('/:groupId/join', joinGroup);
router.post('/:groupId/leave', leaveGroup);

export default router;