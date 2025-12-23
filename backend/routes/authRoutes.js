const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const googleAuthService = require('../services/googleAuthService');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/google
router.post('/google', async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: { message: 'ID token required' } });
    }
    const result = await googleAuthService.googleLogin(idToken);
    res.json({ data: result });
  } catch (e) { next(e); }
});

// POST /api/auth/refresh
router.post('/refresh', authController.refresh);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// POST /api/auth/change-password
const { authenticate } = require('../middleware/auth');
router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;

