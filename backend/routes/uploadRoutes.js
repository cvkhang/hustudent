import express from 'express';
import uploadController from '../controllers/uploadController.js';
import uploadMiddleware from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Avatar upload
router.post('/upload/avatar', uploadMiddleware.uploadAvatar, uploadController.uploadAvatar);

// Cover photo upload
router.post('/upload/cover', uploadMiddleware.uploadCover, uploadController.uploadCover);

// Post images upload
router.post('/upload/images', uploadMiddleware.uploadImages, uploadController.uploadPostImages);

// Chat attachment upload
router.post('/upload/attachment/:chatId', uploadMiddleware.uploadAttachment, uploadController.uploadAttachment);

export default router;
