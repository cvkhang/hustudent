import express from 'express';
import { getStudyGroups, createGroup } from '../controllers/studyGroups.controller.js';

const router = express.Router();

// Study groups routes
router.get('/', getStudyGroups);
router.post('/create', createGroup);

export default router;