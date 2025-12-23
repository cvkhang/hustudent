const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friendController');
const { authenticate } = require('../middleware/auth');

// All friend routes require authentication
router.use(authenticate);

// Friend requests
router.post('/requests', friendController.sendFriendRequest);
router.get('/requests', friendController.getFriendRequests);
router.post('/requests/:requestId/accept', friendController.acceptFriendRequest);
router.post('/requests/:requestId/reject', friendController.rejectFriendRequest);
router.delete('/requests/:requestId', friendController.cancelFriendRequest);

// Friends list
router.get('/', friendController.getFriends);
router.get('/suggestions', friendController.getSuggestions); // New route
router.get('/blocked', friendController.getBlockedUsers);

// Friend actions
router.delete('/:userId', friendController.unfriend);
router.post('/:userId/block', friendController.blockUser);
router.post('/:userId/unblock', friendController.unblockUser);

module.exports = router;
