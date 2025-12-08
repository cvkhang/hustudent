import express from 'express';
import { getStudyGroups } from '../controllers/studyGroups.controller.js';

const router = express.Router();

// Study groups routes stub
router.get('/', getStudyGroups);

export default router;