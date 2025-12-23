import express from 'express';
import * as matchingController from '../controllers/matchingController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public: Subject catalog
router.get('/subjects', matchingController.getSubjects);
router.get('/subjects/:code', matchingController.getSubject);

// Protected routes below
router.use(authenticate);

// Study Profile
router.get('/me/study-profile', matchingController.getStudyProfile);
router.put('/me/study-profile', matchingController.updateStudyProfile);
router.put('/me/learning-status', matchingController.updateLearningStatus);

// User Subjects
router.get('/me/subjects', matchingController.getUserSubjects);
router.post('/me/subjects', matchingController.addUserSubject);
router.patch('/me/subjects/:code', matchingController.updateUserSubject);
router.delete('/me/subjects/:code', matchingController.removeUserSubject);

// Suggestions
router.get('/matching/suggestions', matchingController.getFriendSuggestions);
router.get('/groups/recommended', matchingController.getRecommendedGroups);

// Study Invitations
router.post('/study-invitations', matchingController.sendStudyInvitation);
router.get('/study-invitations', matchingController.getStudyInvitations);
router.post('/study-invitations/:id/accept', matchingController.acceptInvitation);
router.post('/study-invitations/:id/decline', matchingController.declineInvitation);

// Study Buddies
router.get('/me/buddies', matchingController.getStudyBuddies);

export default router;
