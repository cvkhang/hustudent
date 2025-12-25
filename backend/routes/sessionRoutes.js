import express from 'express';
import * as studySessionController from '../controllers/studySessionController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Static routes first
router.get('/schedule', studySessionController.getMySchedule);

// Parameterized routes
router.get('/:id/attendees', studySessionController.getSessionAttendees);
router.post('/:id/rsvp', studySessionController.rsvpSession);
router.delete('/:id', studySessionController.deleteSession);
router.patch('/:id', studySessionController.updateSession);

export default router;
