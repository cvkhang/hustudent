import express from 'express';
import authController from '../controllers/authController.js';
import googleAuthService from '../services/googleAuthService.js';
import { authenticate } from '../middleware/auth.js';
import { loginLimiter, registerLimiter, passwordChangeLimiter } from '../middleware/rateLimits.js';
import {
  validateEmail,
  validatePasswordSimple,
  validateName,
  validateString,
  handleValidationErrors
} from '../middleware/security.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register',
  registerLimiter,
  validateEmail(),
  validatePasswordSimple(),
  validateName('fullName'),
  handleValidationErrors,
  authController.register
);

// POST /api/auth/login
router.post('/login',
  loginLimiter,
  validateEmail(),
  validatePasswordSimple(),
  handleValidationErrors,
  authController.login
);

// POST /api/auth/google
router.post('/google',
  loginLimiter,
  validateString('idToken', 1, 2000),
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { idToken } = req.body;
      const result = await googleAuthService.googleLogin(idToken);
      res.json({ data: result });
    } catch (e) { next(e); }
  }
);

// POST /api/auth/refresh
router.post('/refresh', authController.refresh);

// POST /api/auth/logout
router.post('/logout', authController.logout);

// POST /api/auth/change-password
router.post('/change-password',
  authenticate,
  passwordChangeLimiter,
  validatePasswordSimple('currentPassword'),
  validatePasswordSimple('newPassword'),
  handleValidationErrors,
  authController.changePassword
);

export default router;

