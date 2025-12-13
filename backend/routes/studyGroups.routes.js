import express from 'express';
import { getStudyGroups, createGroup, joinGroup, leaveGroup, getMyGroups, getGroupDetail } from '../controllers/studyGroups.controller.js';

const router = express.Router();

// Study groups routes
router.get('/', getStudyGroups);
router.post('/create', createGroup);
router.post('/:groupId/join', joinGroup);
router.post('/:groupId/leave', leaveGroup);
router.get('/my', getMyGroups);
router.get('/:groupId', getGroupDetail);

export default router;